import { db, generateId } from '../../database/firebase';
import { FirebaseClaim, CreateFirebaseClaim, DB_PATHS } from '../../types/firebase.types';

export class FirebaseClaimService {
  private claimsRef = db.ref(DB_PATHS.CLAIMS);

  /**
   * Create a new claim
   */
  async createClaim(claimData: CreateFirebaseClaim): Promise<FirebaseClaim> {
    const claimId = generateId();
    const now = Date.now();

    const claim: FirebaseClaim = {
      id: claimId,
      ...claimData,
      status: 'pending',
      createdAt: now
    };

    await this.claimsRef.child(claimId).set(claim);
    return claim;
  }

  /**
   * Get claim by ID
   */
  async getClaimById(claimId: string): Promise<FirebaseClaim | null> {
    const snapshot = await this.claimsRef.child(claimId).once('value');
    return snapshot.val();
  }

  /**
   * Update claim
   */
  async updateClaim(claimId: string, updates: Partial<FirebaseClaim>): Promise<void> {
    await this.claimsRef.child(claimId).update(updates);
  }

  /**
   * Get claims by listing
   */
  async getClaimsByListing(listingId: string): Promise<FirebaseClaim[]> {
    const snapshot = await this.claimsRef
      .orderByChild('listingId')
      .equalTo(listingId)
      .once('value');

    const claims: FirebaseClaim[] = [];
    snapshot.forEach((childSnapshot) => {
      claims.push(childSnapshot.val());
    });

    return claims;
  }

  /**
   * Get claims by recipient
   */
  async getClaimsByRecipient(recipientId: string): Promise<FirebaseClaim[]> {
    const snapshot = await this.claimsRef
      .orderByChild('recipientId')
      .equalTo(recipientId)
      .once('value');

    const claims: FirebaseClaim[] = [];
    snapshot.forEach((childSnapshot) => {
      claims.push(childSnapshot.val());
    });

    return claims;
  }

  /**
   * Get claims by donor
   */
  async getClaimsByDonor(donorId: string): Promise<FirebaseClaim[]> {
    const snapshot = await this.claimsRef
      .orderByChild('donorId')
      .equalTo(donorId)
      .once('value');

    const claims: FirebaseClaim[] = [];
    snapshot.forEach((childSnapshot) => {
      claims.push(childSnapshot.val());
    });

    return claims;
  }

  /**
   * Accept a claim
   */
  async acceptClaim(claimId: string, pickupCode?: string): Promise<void> {
    const updates: Partial<FirebaseClaim> = {
      status: 'accepted',
      respondedAt: Date.now()
    };

    if (pickupCode) {
      updates.pickupCode = pickupCode;
    }

    await this.updateClaim(claimId, updates);
  }

  /**
   * Reject a claim
   */
  async rejectClaim(claimId: string): Promise<void> {
    await this.updateClaim(claimId, {
      status: 'rejected',
      respondedAt: Date.now()
    });
  }

  /**
   * Complete a claim
   */
  async completeClaim(claimId: string): Promise<void> {
    await this.updateClaim(claimId, {
      status: 'completed',
      completedAt: Date.now()
    });
  }

  /**
   * Cancel a claim
   */
  async cancelClaim(claimId: string): Promise<void> {
    await this.updateClaim(claimId, {
      status: 'cancelled'
    });
  }

  /**
   * Mark claim as expired
   */
  async expireClaim(claimId: string): Promise<void> {
    await this.updateClaim(claimId, {
      status: 'expired'
    });
  }

  /**
   * Get pending claims
   */
  async getPendingClaims(): Promise<FirebaseClaim[]> {
    const snapshot = await this.claimsRef
      .orderByChild('status')
      .equalTo('pending')
      .once('value');

    const claims: FirebaseClaim[] = [];
    snapshot.forEach((childSnapshot) => {
      claims.push(childSnapshot.val());
    });

    return claims;
  }

  /**
   * Get expired pending claims (older than 15 minutes)
   */
  async getExpiredPendingClaims(timeoutMinutes: number = 15): Promise<FirebaseClaim[]> {
    const now = Date.now();
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const pendingClaims = await this.getPendingClaims();

    return pendingClaims.filter(claim => {
      const claimAge = now - claim.createdAt;
      return claimAge > timeoutMs;
    });
  }

  /**
   * Auto-reject expired claims
   */
  async autoRejectExpiredClaims(timeoutMinutes: number = 15): Promise<number> {
    const expiredClaims = await this.getExpiredPendingClaims(timeoutMinutes);
    
    for (const claim of expiredClaims) {
      await this.expireClaim(claim.id);
    }

    return expiredClaims.length;
  }

  /**
   * Get claims count by status
   */
  async getClaimsCountByStatus(): Promise<Record<string, number>> {
    const snapshot = await this.claimsRef.once('value');
    const counts: Record<string, number> = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0,
      expired: 0
    };

    snapshot.forEach((childSnapshot) => {
      const claim = childSnapshot.val() as FirebaseClaim;
      if (claim.status in counts) {
        counts[claim.status]++;
      }
    });

    return counts;
  }

  /**
   * Get total claims count
   */
  async getTotalClaimsCount(): Promise<number> {
    const snapshot = await this.claimsRef.once('value');
    return snapshot.numChildren();
  }

  /**
   * Check if user has already claimed a listing
   */
  async hasUserClaimedListing(recipientId: string, listingId: string): Promise<boolean> {
    const snapshot = await this.claimsRef
      .orderByChild('recipientId')
      .equalTo(recipientId)
      .once('value');

    let hasClaimed = false;
    snapshot.forEach((childSnapshot) => {
      const claim = childSnapshot.val() as FirebaseClaim;
      if (claim.listingId === listingId && claim.status !== 'rejected' && claim.status !== 'cancelled') {
        hasClaimed = true;
        return true; // Stop iteration
      }
    });

    return hasClaimed;
  }
}

// Export singleton instance
export const firebaseClaimService = new FirebaseClaimService();
