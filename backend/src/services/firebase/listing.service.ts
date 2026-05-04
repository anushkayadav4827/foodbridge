import { db, generateId } from '../../database/firebase';
import { FirebaseListing, CreateFirebaseListing, DB_PATHS } from '../../types/firebase.types';

export class FirebaseListingService {
  private listingsRef = db.ref(DB_PATHS.LISTINGS);

  /**
   * Create a new listing
   */
  async createListing(listingData: CreateFirebaseListing): Promise<FirebaseListing> {
    const listingId = generateId();
    const now = Date.now();

    const listing: FirebaseListing = {
      id: listingId,
      ...listingData,
      status: 'available',
      createdAt: now,
      updatedAt: now
    };

    await this.listingsRef.child(listingId).set(listing);
    return listing;
  }

  /**
   * Get listing by ID
   */
  async getListingById(listingId: string): Promise<FirebaseListing | null> {
    const snapshot = await this.listingsRef.child(listingId).once('value');
    return snapshot.val();
  }

  /**
   * Update listing
   */
  async updateListing(listingId: string, updates: Partial<FirebaseListing>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: Date.now()
    };

    await this.listingsRef.child(listingId).update(updateData);
  }

  /**
   * Delete listing
   */
  async deleteListing(listingId: string): Promise<void> {
    await this.listingsRef.child(listingId).remove();
  }

  /**
   * Get all listings with filters
   */
  async getListings(filters?: {
    status?: string;
    foodType?: string;
    donorId?: string;
    limit?: number;
  }): Promise<FirebaseListing[]> {
    let query: any = this.listingsRef;

    // Apply filters
    if (filters?.status) {
      query = query.orderByChild('status').equalTo(filters.status);
    } else if (filters?.foodType) {
      query = query.orderByChild('foodType').equalTo(filters.foodType);
    } else if (filters?.donorId) {
      query = query.orderByChild('donorId').equalTo(filters.donorId);
    } else {
      query = query.orderByChild('createdAt');
    }

    if (filters?.limit) {
      query = query.limitToLast(filters.limit);
    }

    const snapshot = await query.once('value');
    const listings: FirebaseListing[] = [];

    snapshot.forEach((childSnapshot: any) => {
      listings.push(childSnapshot.val());
    });

    return listings.reverse(); // Newest first
  }

  /**
   * Get available listings
   */
  async getAvailableListings(limit?: number): Promise<FirebaseListing[]> {
    return this.getListings({ status: 'available', limit });
  }

  /**
   * Get listings by donor
   */
  async getDonorListings(donorId: string): Promise<FirebaseListing[]> {
    return this.getListings({ donorId });
  }

  /**
   * Get listings by food type
   */
  async getListingsByFoodType(foodType: string): Promise<FirebaseListing[]> {
    return this.getListings({ foodType });
  }

  /**
   * Update listing status
   */
  async updateListingStatus(
    listingId: string,
    status: 'available' | 'claimed' | 'completed' | 'expired' | 'cancelled'
  ): Promise<void> {
    await this.updateListing(listingId, { status });
  }

  /**
   * Mark listing as claimed
   */
  async markAsClaimed(listingId: string): Promise<void> {
    await this.updateListingStatus(listingId, 'claimed');
  }

  /**
   * Mark listing as completed
   */
  async markAsCompleted(listingId: string): Promise<void> {
    await this.updateListingStatus(listingId, 'completed');
  }

  /**
   * Mark listing as expired
   */
  async markAsExpired(listingId: string): Promise<void> {
    await this.updateListingStatus(listingId, 'expired');
  }

  /**
   * Cancel listing
   */
  async cancelListing(listingId: string): Promise<void> {
    await this.updateListingStatus(listingId, 'cancelled');
  }

  /**
   * Get expired listings
   */
  async getExpiredListings(): Promise<FirebaseListing[]> {
    const now = Date.now();
    const allListings = await this.getAvailableListings();
    
    return allListings.filter(listing => listing.expiryDate < now);
  }

  /**
   * Search listings by title or description
   */
  async searchListings(searchTerm: string): Promise<FirebaseListing[]> {
    const allListings = await this.getAvailableListings();
    const lowerSearchTerm = searchTerm.toLowerCase();

    return allListings.filter(listing => 
      listing.title.toLowerCase().includes(lowerSearchTerm) ||
      listing.description.toLowerCase().includes(lowerSearchTerm)
    );
  }

  /**
   * Get listings count by status
   */
  async getListingsCountByStatus(): Promise<Record<string, number>> {
    const snapshot = await this.listingsRef.once('value');
    const counts: Record<string, number> = {
      available: 0,
      claimed: 0,
      completed: 0,
      expired: 0,
      cancelled: 0
    };

    snapshot.forEach((childSnapshot) => {
      const listing = childSnapshot.val() as FirebaseListing;
      if (listing.status in counts) {
        counts[listing.status]++;
      }
    });

    return counts;
  }

  /**
   * Get total listings count
   */
  async getTotalListingsCount(): Promise<number> {
    const snapshot = await this.listingsRef.once('value');
    return snapshot.numChildren();
  }
}

// Export singleton instance
export const firebaseListingService = new FirebaseListingService();
