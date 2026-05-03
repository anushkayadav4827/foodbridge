// Types and interfaces for Food Listings (Donor Dashboard System)

export type FoodType = 
  | 'cooked_hot' 
  | 'cooked_cold' 
  | 'raw' 
  | 'packaged' 
  | 'baked' 
  | 'beverages';

export type QuantityUnit = 
  | 'meals' 
  | 'kg' 
  | 'portions' 
  | 'servings' 
  | 'plates';

export type Allergen = 
  | 'nuts' 
  | 'dairy' 
  | 'eggs' 
  | 'soy' 
  | 'shellfish' 
  | 'wheat' 
  | 'fish';

export type ListingStatus = 
  | 'draft' 
  | 'available' 
  | 'claimed' 
  | 'in_progress' 
  | 'completed' 
  | 'expired' 
  | 'cancelled';

export type ClaimStatus = 
  | 'pending' 
  | 'accepted' 
  | 'rejected' 
  | 'auto_rejected' 
  | 'completed' 
  | 'cancelled';

export interface Listing {
  // Identity
  id: string;
  donorId: string;
  
  // Content
  title: string;
  description: string | null;
  foodTypes: FoodType[];
  quantityValue: number;
  quantityUnit: QuantityUnit;
  
  // Dietary
  isVegetarian: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isKosher: boolean;
  isGlutenFree: boolean;
  allergens: Allergen[];
  
  // Photos
  photoUrls: string[];
  coverPhotoUrl: string | null;
  
  // Location
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupInstructions: string | null;
  
  // Timing
  readyFrom: Date;
  pickupBy: Date;
  bestBefore: Date | null;
  preparationNotes: string | null;
  
  // Status
  status: ListingStatus;
  
  // Metrics
  claimCount: number;
  viewCount: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  
  // Computed (not stored in DB)
  timeRemaining?: number; // seconds
  isUrgent?: boolean;
}

export interface Claim {
  // Identity
  id: string;
  listingId: string;
  receiverId: string;
  
  // Content
  message: string | null;
  
  // Status
  status: ClaimStatus;
  pickupCode: string | null;
  
  // Timestamps
  createdAt: Date;
  respondedAt: Date | null;
  completedAt: Date | null;
  
  // Rejection
  rejectionReason: string | null;
  
  // Computed
  timeRemaining?: number; // seconds until auto-rejection
  isExpired?: boolean;
}

export interface DonorStats {
  donorId: string;
  
  // Lifetime metrics
  totalMealsDonated: number;
  totalKgSaved: number;
  totalCO2Prevented: number;
  uniqueReceiversHelped: number;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  
  // Counts
  totalListings: number;
  completedListings: number;
  cancelledListings: number;
  
  // Rating
  averageRating: number;
  
  // Timestamps
  lastDonationDate: Date | null;
  updatedAt: Date;
}

export interface Draft {
  id: string;
  donorId: string;
  data: Partial<CreateListingDTO>;
  currentStep: number; // 1-5
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface CreateListingDTO {
  title: string;
  description?: string;
  foodTypes: FoodType[];
  quantityValue: number;
  quantityUnit: QuantityUnit;
  
  // Dietary flags
  isVegetarian?: boolean;
  isVegan?: boolean;
  isHalal?: boolean;
  isKosher?: boolean;
  isGlutenFree?: boolean;
  allergens?: Allergen[];
  
  // Photos
  photoUrls?: string[];
  coverPhotoUrl?: string;
  
  // Location
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupInstructions?: string;
  
  // Timing
  readyFrom: Date;
  pickupBy: Date;
  bestBefore?: Date;
  preparationNotes?: string;
}

export interface UpdateListingDTO {
  title?: string;
  description?: string;
  foodTypes?: FoodType[];
  quantityValue?: number;
  quantityUnit?: QuantityUnit;
  
  // Dietary flags
  isVegetarian?: boolean;
  isVegan?: boolean;
  isHalal?: boolean;
  isKosher?: boolean;
  isGlutenFree?: boolean;
  allergens?: Allergen[];
  
  // Photos
  photoUrls?: string[];
  coverPhotoUrl?: string;
  
  // Location
  pickupAddress?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  pickupInstructions?: string;
  
  // Timing
  readyFrom?: Date;
  pickupBy?: Date;
  bestBefore?: Date;
  preparationNotes?: string;
}

export interface ListingFilters {
  donorId?: string;
  status?: ListingStatus[];
  sortBy?: 'newest' | 'oldest' | 'expiring_soon' | 'most_claims';
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedListings {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClaimWithReceiver extends Claim {
  receiver: {
    id: string;
    name: string;
    photoUrl: string | null;
    rating: number;
    reliabilityScore: number;
    completedPickups: number;
    distance: number;
    isVerified: boolean;
  };
}

export interface AcceptedClaim {
  claim: Claim;
  pickupCode: string;
  rejectedClaimIds: string[];
}

export interface DashboardData {
  statistics: DonorStats;
  activeListings: Listing[];
  pendingClaims: ClaimWithReceiver[];
  urgentListings: Listing[];
}

export interface CancellationReason {
  reason: 'plans_changed' | 'food_spoiled' | 'no_longer_available' | 'other';
  details?: string;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isValidFoodType(value: string): value is FoodType {
  return ['cooked_hot', 'cooked_cold', 'raw', 'packaged', 'baked', 'beverages'].includes(value);
}

export function isValidQuantityUnit(value: string): value is QuantityUnit {
  return ['meals', 'kg', 'portions', 'servings', 'plates'].includes(value);
}

export function isValidAllergen(value: string): value is Allergen {
  return ['nuts', 'dairy', 'eggs', 'soy', 'shellfish', 'wheat', 'fish'].includes(value);
}

export function isValidListingStatus(value: string): value is ListingStatus {
  return ['draft', 'available', 'claimed', 'in_progress', 'completed', 'expired', 'cancelled'].includes(value);
}

export function isValidClaimStatus(value: string): value is ClaimStatus {
  return ['pending', 'accepted', 'rejected', 'auto_rejected', 'completed', 'cancelled'].includes(value);
}

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function validateTimeWindow(readyFrom: Date, pickupBy: Date): {
  valid: boolean;
  error?: string;
} {
  const now = new Date();
  const oneHour = 60 * 60 * 1000;
  
  // Ready time must be in the future or now
  if (readyFrom < now) {
    return { valid: false, error: 'Ready time must be in the future' };
  }
  
  // Pickup must be after ready
  if (pickupBy <= readyFrom) {
    return { valid: false, error: 'Pickup time must be after ready time' };
  }
  
  // Minimum 1 hour window
  const windowMs = pickupBy.getTime() - readyFrom.getTime();
  if (windowMs < oneHour) {
    return { valid: false, error: 'Minimum 1 hour window required between ready and pickup times' };
  }
  
  return { valid: true };
}

export function validateCookedFoodTimeWindow(
  readyFrom: Date, 
  pickupBy: Date, 
  foodTypes: FoodType[]
): {
  valid: boolean;
  error?: string;
} {
  const twentyFourHours = 24 * 60 * 60 * 1000;
  const hasCookedFood = foodTypes.some(type => type === 'cooked_hot' || type === 'cooked_cold');
  
  if (hasCookedFood) {
    const windowMs = pickupBy.getTime() - readyFrom.getTime();
    if (windowMs > twentyFourHours) {
      return { 
        valid: false, 
        error: 'Cooked food must be picked up within 24 hours' 
      };
    }
  }
  
  return { valid: true };
}

export function validateDietaryConsistency(
  isVegan: boolean, 
  allergens: Allergen[]
): {
  valid: boolean;
  error?: string;
} {
  if (isVegan) {
    const hasNonVeganAllergens = allergens.some(a => a === 'dairy' || a === 'eggs');
    if (hasNonVeganAllergens) {
      return { 
        valid: false, 
        error: 'Vegan listings cannot contain dairy or eggs allergens' 
      };
    }
  }
  
  return { valid: true };
}

export function calculateTimeRemaining(deadline: Date): number {
  const now = new Date();
  const remainingMs = deadline.getTime() - now.getTime();
  return Math.max(0, Math.floor(remainingMs / 1000)); // seconds
}

export function isListingUrgent(pickupBy: Date): boolean {
  const twoHours = 2 * 60 * 60 * 1000;
  const now = new Date();
  const remainingMs = pickupBy.getTime() - now.getTime();
  return remainingMs > 0 && remainingMs < twoHours;
}

export function calculateReliabilityScore(
  completedPickups: number,
  totalClaims: number,
  averageRating: number
): number {
  if (totalClaims === 0) return 0;
  
  const completionRate = (completedPickups / totalClaims) * 100;
  const ratingScore = (averageRating / 5) * 100;
  
  // Weighted average: 60% completion rate, 40% rating
  return Math.round((completionRate * 0.6) + (ratingScore * 0.4));
}
