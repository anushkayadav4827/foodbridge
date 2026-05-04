// Firebase Database Models

export interface FirebaseUser {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  role: 'donor' | 'recipient' | 'admin';
  createdAt: number;
  updatedAt: number;
  karma?: number;
  streak?: number;
  lastActiveAt?: number;
}

export interface FirebaseListing {
  id: string;
  donorId: string;
  title: string;
  description: string;
  foodType: 'cooked' | 'raw' | 'packaged' | 'produce' | 'bakery' | 'other';
  quantity: number;
  unit: string;
  expiryDate: number;
  status: 'available' | 'claimed' | 'completed' | 'expired' | 'cancelled';
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  photos?: string[];
  dietaryInfo?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    nutFree?: boolean;
    dairyFree?: boolean;
  };
  pickupInstructions?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FirebaseClaim {
  id: string;
  listingId: string;
  recipientId: string;
  donorId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled' | 'expired';
  message?: string;
  pickupCode?: string;
  pickupTime?: number;
  createdAt: number;
  respondedAt?: number;
  completedAt?: number;
}

export interface FirebaseOTP {
  phone: string;
  code: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

export interface FirebasePhoto {
  id: string;
  userId: string;
  listingId?: string;
  url: string;
  storagePath: string;
  uploadedAt: number;
}

export interface FirebaseNotification {
  id: string;
  userId: string;
  type: 'claim_received' | 'claim_accepted' | 'claim_rejected' | 'listing_claimed' | 'pickup_reminder';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: number;
}

export interface FirebaseKarmaTransaction {
  id: string;
  userId: string;
  type: 'donation' | 'claim' | 'completion' | 'cancellation' | 'bonus';
  amount: number;
  reason: string;
  relatedId?: string; // listing or claim ID
  createdAt: number;
}

export interface FirebaseBadge {
  id: string;
  userId: string;
  badgeType: string;
  earnedAt: number;
}

// Database paths
export const DB_PATHS = {
  USERS: 'users',
  LISTINGS: 'listings',
  CLAIMS: 'claims',
  OTPS: 'otps',
  PHOTOS: 'photos',
  NOTIFICATIONS: 'notifications',
  KARMA_TRANSACTIONS: 'karmaTransactions',
  BADGES: 'badges',
  STATS: 'stats'
};

// Helper type for creating new documents (without id and timestamps)
export type CreateFirebaseUser = Omit<FirebaseUser, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateFirebaseListing = Omit<FirebaseListing, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateFirebaseClaim = Omit<FirebaseClaim, 'id' | 'createdAt'>;
export type CreateFirebaseOTP = Omit<FirebaseOTP, 'createdAt'>;
