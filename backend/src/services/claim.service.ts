import { Pool } from 'pg';
import { getPool } from '../database/connection';
import { Claim } from '../types/listing.types';
import logger from '../utils/logger';
import { getDistance } from 'geolib';

export class ClaimService {
  private get pool(): Pool {
    return getPool();
  }

  /**
   * Accept a claim - atomic transaction with auto-rejection of other pending claims
   * Requirements: US-4.2.1, US-4.2.2, US-4.2.3, US-4.2.4
   */
  async acceptClaim(claimId: string, donorId: string): Promise<{
    claim: Claim;
    pickupCode: string;
    rejectedClaimIds: string[];
  }> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Get claim with listing details and verify ownership
      const claimResult = await client.query(
        `SELECT c.*, l.donor_id, l.status as listing_status
         FROM claims c
         JOIN food_listings l ON c.listing_id = l.id
         WHERE c.id = $1
         FOR UPDATE`,
        [claimId]
      );

      if (claimResult.rows.length === 0) {
        throw new Error('Claim not found');
      }

      const claim = claimResult.rows[0];

      // Verify donor ownership
      if (claim.donor_id !== donorId) {
        throw new Error('Unauthorized: You do not own this listing');
      }

      // Verify claim is pending
      if (claim.status !== 'pending') {
        throw new Error(`Cannot accept claim with status: ${claim.status}`);
      }

      // Verify listing is available
      if (claim.listing_status !== 'available') {
        throw new Error(`Cannot accept claim for listing with status: ${claim.listing_status}`);
      }

      // 2. Generate 6-digit pickup code
      const pickupCode = this.generatePickupCode();

      // 3. Accept the claim
      await client.query(
        `UPDATE claims
         SET status = 'accepted',
             pickup_code = $1,
             responded_at = NOW()
         WHERE id = $2`,
        [pickupCode, claimId]
      );

      // 4. Auto-reject all other pending claims for this listing
      const rejectedResult = await client.query(
        `UPDATE claims
         SET status = 'auto_rejected',
             rejection_reason = 'Another claim was accepted',
             responded_at = NOW()
         WHERE listing_id = $1
           AND id != $2
           AND status = 'pending'
         RETURNING id`,
        [claim.listing_id, claimId]
      );

      const rejectedClaimIds = rejectedResult.rows.map((row) => row.id);

      // 5. Update listing status to 'claimed'
      await client.query(
        `UPDATE food_listings
         SET status = 'claimed',
             updated_at = NOW()
         WHERE id = $1`,
        [claim.listing_id]
      );

      await client.query('COMMIT');

      logger.info('Claim accepted successfully', {
        claimId,
        listingId: claim.listing_id,
        donorId,
        rejectedCount: rejectedClaimIds.length,
      });

      // Get updated claim
      const updatedClaim = await this.getClaimById(claimId);

      return {
        claim: updatedClaim,
        pickupCode,
        rejectedClaimIds,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error accepting claim:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Reject a claim with reason
   * Requirements: US-4.3.1, US-4.3.2, US-4.3.3
   */
  async rejectClaim(
    claimId: string,
    donorId: string,
    reason: string
  ): Promise<Claim> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Get claim with listing details and verify ownership
      const claimResult = await client.query(
        `SELECT c.*, l.donor_id
         FROM claims c
         JOIN food_listings l ON c.listing_id = l.id
         WHERE c.id = $1
         FOR UPDATE`,
        [claimId]
      );

      if (claimResult.rows.length === 0) {
        throw new Error('Claim not found');
      }

      const claim = claimResult.rows[0];

      // Verify donor ownership
      if (claim.donor_id !== donorId) {
        throw new Error('Unauthorized: You do not own this listing');
      }

      // Verify claim is pending
      if (claim.status !== 'pending') {
        throw new Error(`Cannot reject claim with status: ${claim.status}`);
      }

      // 2. Reject the claim
      await client.query(
        `UPDATE claims
         SET status = 'rejected',
             rejection_reason = $1,
             responded_at = NOW()
         WHERE id = $2`,
        [reason, claimId]
      );

      await client.query('COMMIT');

      logger.info('Claim rejected successfully', {
        claimId,
        listingId: claim.listing_id,
        donorId,
        reason,
      });

      // Get updated claim
      const updatedClaim = await this.getClaimById(claimId);

      return updatedClaim;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error rejecting claim:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get pending claims for a donor's listings
   * Requirements: US-4.1.1, US-4.1.2, US-4.1.3
   */
  async getPendingClaims(donorId: string): Promise<Array<Claim & {
    receiverName: string;
    receiverRating: number;
    receiverReliabilityScore: number;
    distance: number;
    listingTitle: string;
  }>> {
    const result = await this.pool.query(
      `SELECT 
        c.*,
        u.name as receiver_name,
        u.rating as receiver_rating,
        u.reliability_score as receiver_reliability_score,
        l.title as listing_title,
        l.pickup_latitude,
        l.pickup_longitude,
        u.latitude as receiver_latitude,
        u.longitude as receiver_longitude
       FROM claims c
       JOIN food_listings l ON c.listing_id = l.id
       JOIN users u ON c.receiver_id = u.id
       WHERE l.donor_id = $1
         AND c.status = 'pending'
       ORDER BY c.created_at ASC`,
      [donorId]
    );

    return result.rows.map((row) => {
      // Calculate distance using Haversine formula
      const distance = getDistance(
        { latitude: row.pickup_latitude, longitude: row.pickup_longitude },
        { latitude: row.receiver_latitude, longitude: row.receiver_longitude }
      );

      // Calculate time remaining until auto-rejection (15 minutes)
      const createdAt = new Date(row.created_at);
      const expiresAt = new Date(createdAt.getTime() + 15 * 60 * 1000);
      const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

      return {
        id: row.id,
        listingId: row.listing_id,
        receiverId: row.receiver_id,
        message: row.message,
        status: row.status,
        pickupCode: row.pickup_code,
        createdAt: row.created_at,
        respondedAt: row.responded_at,
        completedAt: row.completed_at,
        rejectionReason: row.rejection_reason,
        timeRemaining,
        isExpired: timeRemaining === 0,
        receiverName: row.receiver_name,
        receiverRating: parseFloat(row.receiver_rating) || 0,
        receiverReliabilityScore: parseInt(row.receiver_reliability_score) || 0,
        distance: Math.round(distance), // meters
        listingTitle: row.listing_title,
      };
    });
  }

  /**
   * Get claim details by ID
   * Requirements: US-4.1.1, US-4.1.2, US-4.1.3
   */
  async getClaimDetails(claimId: string): Promise<Claim & {
    receiverName: string;
    receiverRating: number;
    receiverReliabilityScore: number;
    distance: number;
    listingTitle: string;
  }> {
    const result = await this.pool.query(
      `SELECT 
        c.*,
        u.name as receiver_name,
        u.rating as receiver_rating,
        u.reliability_score as receiver_reliability_score,
        l.title as listing_title,
        l.pickup_latitude,
        l.pickup_longitude,
        u.latitude as receiver_latitude,
        u.longitude as receiver_longitude
       FROM claims c
       JOIN food_listings l ON c.listing_id = l.id
       JOIN users u ON c.receiver_id = u.id
       WHERE c.id = $1`,
      [claimId]
    );

    if (result.rows.length === 0) {
      throw new Error('Claim not found');
    }

    const row = result.rows[0];

    // Calculate distance using Haversine formula
    const distance = getDistance(
      { latitude: row.pickup_latitude, longitude: row.pickup_longitude },
      { latitude: row.receiver_latitude, longitude: row.receiver_longitude }
    );

    // Calculate time remaining until auto-rejection (15 minutes)
    const createdAt = new Date(row.created_at);
    const expiresAt = new Date(createdAt.getTime() + 15 * 60 * 1000);
    const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

    return {
      id: row.id,
      listingId: row.listing_id,
      receiverId: row.receiver_id,
      message: row.message,
      status: row.status,
      pickupCode: row.pickup_code,
      createdAt: row.created_at,
      respondedAt: row.responded_at,
      completedAt: row.completed_at,
      rejectionReason: row.rejection_reason,
      timeRemaining,
      isExpired: timeRemaining === 0,
      receiverName: row.receiver_name,
      receiverRating: parseFloat(row.receiver_rating) || 0,
      receiverReliabilityScore: parseInt(row.receiver_reliability_score) || 0,
      distance: Math.round(distance), // meters
      listingTitle: row.listing_title,
    };
  }

  /**
   * Get claim by ID (basic info)
   */
  private async getClaimById(claimId: string): Promise<Claim> {
    const result = await this.pool.query(
      `SELECT * FROM claims WHERE id = $1`,
      [claimId]
    );

    if (result.rows.length === 0) {
      throw new Error('Claim not found');
    }

    const row = result.rows[0];

    // Calculate time remaining until auto-rejection (15 minutes)
    const createdAt = new Date(row.created_at);
    const expiresAt = new Date(createdAt.getTime() + 15 * 60 * 1000);
    const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

    return {
      id: row.id,
      listingId: row.listing_id,
      receiverId: row.receiver_id,
      message: row.message,
      status: row.status,
      pickupCode: row.pickup_code,
      createdAt: row.created_at,
      respondedAt: row.responded_at,
      completedAt: row.completed_at,
      rejectionReason: row.rejection_reason,
      timeRemaining,
      isExpired: timeRemaining === 0,
    };
  }

  /**
   * Generate a 6-digit pickup code
   * Requirements: US-4.2.3
   */
  private generatePickupCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Auto-reject expired claims (called by cron job)
   * Requirements: US-4.4.1, US-4.4.2, US-4.4.3
   */
  async autoRejectExpiredClaims(): Promise<{
    rejectedCount: number;
    rejectedClaimIds: string[];
  }> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Find claims that are pending and older than 15 minutes
      const result = await client.query(
        `UPDATE claims
         SET status = 'auto_rejected',
             rejection_reason = 'Donor did not respond in time',
             responded_at = NOW()
         WHERE status = 'pending'
           AND created_at < NOW() - INTERVAL '15 minutes'
         RETURNING id, listing_id, receiver_id`,
        []
      );

      await client.query('COMMIT');

      const rejectedClaimIds = result.rows.map((row) => row.id);

      if (rejectedClaimIds.length > 0) {
        logger.info('Auto-rejected expired claims', {
          count: rejectedClaimIds.length,
          claimIds: rejectedClaimIds,
        });
      }

      return {
        rejectedCount: rejectedClaimIds.length,
        rejectedClaimIds,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error auto-rejecting expired claims:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get claims for a specific listing
   */
  async getClaimsForListing(listingId: string): Promise<Claim[]> {
    const result = await this.pool.query(
      `SELECT * FROM claims
       WHERE listing_id = $1
       ORDER BY created_at DESC`,
      [listingId]
    );

    return result.rows.map((row) => {
      // Calculate time remaining until auto-rejection (15 minutes)
      const createdAt = new Date(row.created_at);
      const expiresAt = new Date(createdAt.getTime() + 15 * 60 * 1000);
      const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

      return {
        id: row.id,
        listingId: row.listing_id,
        receiverId: row.receiver_id,
        message: row.message,
        status: row.status,
        pickupCode: row.pickup_code,
        createdAt: row.created_at,
        respondedAt: row.responded_at,
        completedAt: row.completed_at,
        rejectionReason: row.rejection_reason,
        timeRemaining,
        isExpired: timeRemaining === 0,
      };
    });
  }
}

let claimServiceInstance: ClaimService | null = null;

export function getClaimService(): ClaimService {
  if (!claimServiceInstance) {
    claimServiceInstance = new ClaimService();
  }
  return claimServiceInstance;
}

// For backward compatibility
export const claimService = {
  get instance() {
    return getClaimService();
  },
  acceptClaim: (...args: Parameters<ClaimService['acceptClaim']>) => getClaimService().acceptClaim(...args),
  rejectClaim: (...args: Parameters<ClaimService['rejectClaim']>) => getClaimService().rejectClaim(...args),
  getPendingClaims: (...args: Parameters<ClaimService['getPendingClaims']>) => getClaimService().getPendingClaims(...args),
  getClaimDetails: (...args: Parameters<ClaimService['getClaimDetails']>) => getClaimService().getClaimDetails(...args),
  autoRejectExpiredClaims: (...args: Parameters<ClaimService['autoRejectExpiredClaims']>) => getClaimService().autoRejectExpiredClaims(...args),
  getClaimsForListing: (...args: Parameters<ClaimService['getClaimsForListing']>) => getClaimService().getClaimsForListing(...args),
};
