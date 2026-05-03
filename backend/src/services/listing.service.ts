// Listing Service - CRUD operations for food listings
import { query, transaction } from '../database/connection';
import {
  Listing,
  CreateListingDTO,
  UpdateListingDTO,
  ListingFilters,
  PaginatedListings,
  CancellationReason,
  calculateTimeRemaining,
  isListingUrgent,
} from '../types/listing.types';
import logger from '../utils/logger';

export class ListingService {
  /**
   * Create a new listing
   * @param donorId - ID of the donor creating the listing
   * @param data - Listing data
   * @returns Created listing
   */
  static async createListing(
    donorId: string,
    data: CreateListingDTO
  ): Promise<Listing> {
    return await transaction(async (client) => {
      // Insert listing
      const result = await client.query(
        `INSERT INTO food_listings (
          donor_id, title, description, food_types, quantity_value, quantity_unit,
          is_vegetarian, is_vegan, is_halal, is_kosher, is_gluten_free, allergens,
          photo_urls, cover_photo_url,
          pickup_address, pickup_latitude, pickup_longitude, pickup_instructions,
          pickup_location,
          ready_from, pickup_by, best_before, preparation_notes,
          status
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12,
          $13, $14,
          $15, $16, $17, $18,
          ST_SetSRID(ST_MakePoint($17, $16), 4326)::geography,
          $19, $20, $21, $22,
          'available'
        ) RETURNING *`,
        [
          donorId,
          data.title,
          data.description || null,
          data.foodTypes,
          data.quantityValue,
          data.quantityUnit,
          data.isVegetarian || false,
          data.isVegan || false,
          data.isHalal || false,
          data.isKosher || false,
          data.isGlutenFree || false,
          data.allergens || [],
          data.photoUrls || [],
          data.coverPhotoUrl || null,
          data.pickupAddress,
          data.pickupLatitude,
          data.pickupLongitude,
          data.pickupInstructions || null,
          data.readyFrom,
          data.pickupBy,
          data.bestBefore || null,
          data.preparationNotes || null,
        ]
      );

      const listing = this.mapRowToListing(result.rows[0]);
      
      logger.info(`Listing created: ${listing.id} by donor ${donorId}`);
      
      return listing;
    });
  }

  /**
   * Update an existing listing
   * @param listingId - ID of the listing to update
   * @param donorId - ID of the donor (for permission check)
   * @param data - Updated listing data
   * @returns Updated listing
   */
  static async updateListing(
    listingId: string,
    donorId: string,
    data: UpdateListingDTO
  ): Promise<Listing> {
    return await transaction(async (client) => {
      // Check if listing exists and belongs to donor
      const existingResult = await client.query(
        `SELECT * FROM food_listings WHERE id = $1 AND donor_id = $2 AND deleted_at IS NULL`,
        [listingId, donorId]
      );

      if (existingResult.rows.length === 0) {
        throw new Error('Listing not found or you do not have permission to edit it');
      }

      const existing = existingResult.rows[0];

      // Check if listing can be edited (no accepted claims)
      const acceptedClaimsResult = await client.query(
        `SELECT COUNT(*) as count FROM claims 
         WHERE listing_id = $1 AND status = 'accepted'`,
        [listingId]
      );

      if (parseInt(acceptedClaimsResult.rows[0].count) > 0) {
        throw new Error('Cannot edit listing with accepted claims');
      }

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.title !== undefined) {
        updates.push(`title = $${paramIndex++}`);
        values.push(data.title);
      }
      if (data.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(data.description);
      }
      if (data.foodTypes !== undefined) {
        updates.push(`food_types = $${paramIndex++}`);
        values.push(data.foodTypes);
      }
      if (data.quantityValue !== undefined) {
        updates.push(`quantity_value = $${paramIndex++}`);
        values.push(data.quantityValue);
      }
      if (data.quantityUnit !== undefined) {
        updates.push(`quantity_unit = $${paramIndex++}`);
        values.push(data.quantityUnit);
      }
      if (data.isVegetarian !== undefined) {
        updates.push(`is_vegetarian = $${paramIndex++}`);
        values.push(data.isVegetarian);
      }
      if (data.isVegan !== undefined) {
        updates.push(`is_vegan = $${paramIndex++}`);
        values.push(data.isVegan);
      }
      if (data.isHalal !== undefined) {
        updates.push(`is_halal = $${paramIndex++}`);
        values.push(data.isHalal);
      }
      if (data.isKosher !== undefined) {
        updates.push(`is_kosher = $${paramIndex++}`);
        values.push(data.isKosher);
      }
      if (data.isGlutenFree !== undefined) {
        updates.push(`is_gluten_free = $${paramIndex++}`);
        values.push(data.isGlutenFree);
      }
      if (data.allergens !== undefined) {
        updates.push(`allergens = $${paramIndex++}`);
        values.push(data.allergens);
      }
      if (data.photoUrls !== undefined) {
        updates.push(`photo_urls = $${paramIndex++}`);
        values.push(data.photoUrls);
      }
      if (data.coverPhotoUrl !== undefined) {
        updates.push(`cover_photo_url = $${paramIndex++}`);
        values.push(data.coverPhotoUrl);
      }
      if (data.pickupAddress !== undefined) {
        updates.push(`pickup_address = $${paramIndex++}`);
        values.push(data.pickupAddress);
      }
      if (data.pickupLatitude !== undefined && data.pickupLongitude !== undefined) {
        updates.push(`pickup_latitude = $${paramIndex++}`);
        values.push(data.pickupLatitude);
        updates.push(`pickup_longitude = $${paramIndex++}`);
        values.push(data.pickupLongitude);
        updates.push(`pickup_location = ST_SetSRID(ST_MakePoint($${paramIndex - 1}, $${paramIndex - 2}), 4326)::geography`);
      }
      if (data.pickupInstructions !== undefined) {
        updates.push(`pickup_instructions = $${paramIndex++}`);
        values.push(data.pickupInstructions);
      }
      if (data.readyFrom !== undefined) {
        updates.push(`ready_from = $${paramIndex++}`);
        values.push(data.readyFrom);
      }
      if (data.pickupBy !== undefined) {
        updates.push(`pickup_by = $${paramIndex++}`);
        values.push(data.pickupBy);
      }
      if (data.bestBefore !== undefined) {
        updates.push(`best_before = $${paramIndex++}`);
        values.push(data.bestBefore);
      }
      if (data.preparationNotes !== undefined) {
        updates.push(`preparation_notes = $${paramIndex++}`);
        values.push(data.preparationNotes);
      }

      // Always update updated_at
      updates.push(`updated_at = NOW()`);

      if (updates.length === 1) {
        // Only updated_at, no actual changes
        return this.mapRowToListing(existing);
      }

      // Add WHERE clause parameters
      values.push(listingId);
      values.push(donorId);

      const updateQuery = `
        UPDATE food_listings 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex++} AND donor_id = $${paramIndex++}
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);
      const listing = this.mapRowToListing(result.rows[0]);

      logger.info(`Listing updated: ${listingId} by donor ${donorId}`);

      return listing;
    });
  }

  /**
   * Cancel a listing
   * @param listingId - ID of the listing to cancel
   * @param donorId - ID of the donor (for permission check)
   * @param reason - Cancellation reason
   * @returns Cancelled listing
   */
  static async cancelListing(
    listingId: string,
    donorId: string,
    reason: CancellationReason
  ): Promise<Listing> {
    return await transaction(async (client) => {
      // Check if listing exists and belongs to donor
      const existingResult = await client.query(
        `SELECT * FROM food_listings WHERE id = $1 AND donor_id = $2 AND deleted_at IS NULL`,
        [listingId, donorId]
      );

      if (existingResult.rows.length === 0) {
        throw new Error('Listing not found or you do not have permission to cancel it');
      }

      const existing = existingResult.rows[0];

      // Check if listing can be cancelled (not in_progress or completed)
      if (existing.status === 'in_progress' || existing.status === 'completed') {
        throw new Error(`Cannot cancel listing with status: ${existing.status}`);
      }

      // Update listing status to cancelled
      const result = await client.query(
        `UPDATE food_listings 
         SET status = 'cancelled', 
             cancelled_at = NOW(),
             cancellation_reason = $1,
             updated_at = NOW()
         WHERE id = $2 AND donor_id = $3
         RETURNING *`,
        [
          reason.details || reason.reason,
          listingId,
          donorId,
        ]
      );

      // Auto-reject all pending claims
      await client.query(
        `UPDATE claims 
         SET status = 'rejected',
             rejection_reason = 'Listing cancelled by donor',
             responded_at = NOW()
         WHERE listing_id = $1 AND status = 'pending_accept'`,
        [listingId]
      );

      // TODO: Send notifications to rejected claimants

      const listing = this.mapRowToListing(result.rows[0]);

      logger.info(`Listing cancelled: ${listingId} by donor ${donorId}, reason: ${reason.reason}`);

      return listing;
    });
  }

  /**
   * Get a single listing by ID
   * @param listingId - ID of the listing
   * @returns Listing with computed fields
   */
  static async getListing(listingId: string): Promise<Listing | null> {
    const result = await query(
      `SELECT * FROM food_listings WHERE id = $1`,
      [listingId]
    );

    if (result.length === 0) {
      return null;
    }

    return this.mapRowToListing(result[0]);
  }

  /**
   * Get listings with filters, pagination, and sorting
   * @param filters - Filter criteria
   * @returns Paginated listings
   */
  static async getListings(filters: ListingFilters): Promise<PaginatedListings> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Filter by donor
    if (filters.donorId) {
      conditions.push(`donor_id = $${paramIndex++}`);
      values.push(filters.donorId);
    }

    // Filter by status
    if (filters.status && filters.status.length > 0) {
      conditions.push(`status = ANY($${paramIndex++})`);
      values.push(filters.status);
    }

    // Search by title or description
    if (filters.search) {
      conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      values.push(`%${filters.search}%`);
      paramIndex++;
    }

    // Build WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Determine sort order
    let orderBy = 'created_at DESC'; // default: newest first
    if (filters.sortBy === 'oldest') {
      orderBy = 'created_at ASC';
    } else if (filters.sortBy === 'expiring_soon') {
      orderBy = 'pickup_by ASC';
    } else if (filters.sortBy === 'most_claims') {
      orderBy = 'claim_count DESC';
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM food_listings ${whereClause}`,
      values
    );
    const total = parseInt(countResult[0].total);

    // Get paginated results
    const offset = (filters.page - 1) * filters.limit;
    values.push(filters.limit);
    values.push(offset);

    const listingsResult = await query(
      `SELECT * FROM food_listings 
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      values
    );

    const listings = listingsResult.map(row => this.mapRowToListing(row));

    return {
      listings,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  /**
   * Map database row to Listing object with computed fields
   */
  private static mapRowToListing(row: any): Listing {
    const listing: Listing = {
      id: row.id,
      donorId: row.donor_id,
      title: row.title,
      description: row.description,
      foodTypes: row.food_types,
      quantityValue: row.quantity_value,
      quantityUnit: row.quantity_unit,
      isVegetarian: row.is_vegetarian,
      isVegan: row.is_vegan,
      isHalal: row.is_halal,
      isKosher: row.is_kosher,
      isGlutenFree: row.is_gluten_free,
      allergens: row.allergens,
      photoUrls: row.photo_urls,
      coverPhotoUrl: row.cover_photo_url,
      pickupAddress: row.pickup_address,
      pickupLatitude: parseFloat(row.pickup_latitude),
      pickupLongitude: parseFloat(row.pickup_longitude),
      pickupInstructions: row.pickup_instructions,
      readyFrom: new Date(row.ready_from),
      pickupBy: new Date(row.pickup_by),
      bestBefore: row.best_before ? new Date(row.best_before) : null,
      preparationNotes: row.preparation_notes,
      status: row.status,
      claimCount: row.claim_count || 0,
      viewCount: row.view_count || 0,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : null,
      cancelledAt: row.cancelled_at ? new Date(row.cancelled_at) : null,
      cancellationReason: row.cancellation_reason,
    };

    // Add computed fields
    listing.timeRemaining = calculateTimeRemaining(listing.pickupBy);
    listing.isUrgent = isListingUrgent(listing.pickupBy);

    return listing;
  }
}


// ============================================================================
// DRAFT MANAGEMENT
// ============================================================================

export class DraftService {
  /**
   * Save a draft listing
   * @param donorId - ID of the donor
   * @param data - Partial listing data
   * @param currentStep - Current wizard step (1-5)
   * @returns Saved draft
   */
  static async saveDraft(
    donorId: string,
    data: Partial<CreateListingDTO>,
    currentStep: number
  ): Promise<any> {
    return await transaction(async (client) => {
      // Check if draft already exists for this donor
      const existingResult = await client.query(
        `SELECT id FROM listing_drafts WHERE donor_id = $1`,
        [donorId]
      );

      if (existingResult.rows.length > 0) {
        // Update existing draft
        const result = await client.query(
          `UPDATE listing_drafts 
           SET data = $1, 
               current_step = $2, 
               updated_at = NOW(),
               expires_at = NOW() + INTERVAL '7 days'
           WHERE donor_id = $3
           RETURNING *`,
          [JSON.stringify(data), currentStep, donorId]
        );

        logger.info(`Draft updated for donor ${donorId}, step ${currentStep}`);
        return this.mapRowToDraft(result.rows[0]);
      } else {
        // Create new draft
        const result = await client.query(
          `INSERT INTO listing_drafts (donor_id, data, current_step)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [donorId, JSON.stringify(data), currentStep]
        );

        logger.info(`Draft created for donor ${donorId}, step ${currentStep}`);
        return this.mapRowToDraft(result.rows[0]);
      }
    });
  }

  /**
   * Resume a draft listing
   * @param draftId - ID of the draft
   * @returns Draft data or null if expired/not found
   */
  static async resumeDraft(draftId: string): Promise<any | null> {
    const result = await query(
      `SELECT * FROM listing_drafts WHERE id = $1`,
      [draftId]
    );

    if (result.length === 0) {
      return null;
    }

    const draft = this.mapRowToDraft(result[0]);

    // Check if expired
    if (new Date(draft.expiresAt) < new Date()) {
      // Delete expired draft
      await this.deleteDraft(draftId);
      return null;
    }

    return draft;
  }

  /**
   * Get draft by donor ID
   * @param donorId - ID of the donor
   * @returns Draft data or null if not found/expired
   */
  static async getDraftByDonor(donorId: string): Promise<any | null> {
    const result = await query(
      `SELECT * FROM listing_drafts WHERE donor_id = $1`,
      [donorId]
    );

    if (result.length === 0) {
      return null;
    }

    const draft = this.mapRowToDraft(result[0]);

    // Check if expired
    if (new Date(draft.expiresAt) < new Date()) {
      // Delete expired draft
      await this.deleteDraft(draft.id);
      return null;
    }

    return draft;
  }

  /**
   * Delete a draft
   * @param draftId - ID of the draft to delete
   */
  static async deleteDraft(draftId: string): Promise<void> {
    await query(
      `DELETE FROM listing_drafts WHERE id = $1`,
      [draftId]
    );

    logger.info(`Draft deleted: ${draftId}`);
  }

  /**
   * Delete draft by donor ID (called after listing creation)
   * @param donorId - ID of the donor
   */
  static async deleteDraftByDonor(donorId: string): Promise<void> {
    await query(
      `DELETE FROM listing_drafts WHERE donor_id = $1`,
      [donorId]
    );

    logger.info(`Draft deleted for donor: ${donorId}`);
  }

  /**
   * Map database row to Draft object
   */
  private static mapRowToDraft(row: any): any {
    return {
      id: row.id,
      donorId: row.donor_id,
      data: row.data,
      currentStep: row.current_step,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      expiresAt: new Date(row.expires_at),
    };
  }
}

