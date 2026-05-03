# Design: Donor Dashboard & Food Listing System

## Overview

This design document specifies the technical implementation of the donor dashboard and food listing system for FoodBridge. The system enables donors to create detailed food listings through a multi-step wizard, track their impact through a personalized dashboard, and manage incoming claim requests from receivers.

**Feature Name**: `donor-dashboard-listing-system`  
**Design Version**: 1.0  
**Last Updated**: 2026-05-01  
**Status**: Ready for Implementation

### Key Capabilities

1. **Donor Dashboard**: Real-time impact statistics, active listings overview, pending claims queue
2. **Multi-Step Listing Wizard**: 5-step guided flow (photos → details → location → timing → AI prediction)
3. **Listing Management**: View, edit, cancel listings with appropriate permissions
4. **Claim Queue**: Accept/reject claims with 15-minute auto-rejection timeout

### Design Principles

- **Progressive Disclosure**: Complex listing creation broken into digestible steps
- **Real-Time Feedback**: Immediate updates via WebSocket for claims and statistics
- **Fail-Safe Defaults**: Auto-save drafts, graceful degradation for optional features
- **Mobile-First**: Touch-optimized UI with responsive layouts
- **Performance**: Aggressive caching, optimistic UI updates, lazy loading

---

## Architecture

### System Context

```
┌─────────────────────────────────────────────────────────────────┐
│                      DONOR EXPERIENCE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │  Donor Dashboard │  │  Listing Wizard  │  │ Claim Queue   │ │
│  │                  │  │                  │  │               │ │
│  │  • Statistics    │  │  • Step 1: Photo │  │ • View Claims │ │
│  │  • Active Lists  │  │  • Step 2: Detail│  │ • Accept      │ │
│  │  • Pending Claims│  │  • Step 3: Map   │  │ • Reject      │ │
│  │                  │  │  • Step 4: Time  │  │ • Auto-reject │ │
│  │                  │  │  • Step 5: AI    │  │               │ │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬───────┘ │
│           │                     │                     │          │
└───────────┼─────────────────────┼─────────────────────┼──────────┘
            │                     │                     │
            └─────────────────────┴─────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │      API Gateway           │
                    │   (Express.js Routes)      │
                    └─────────────┬──────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼────────┐    ┌──────────▼──────────┐    ┌────────▼────────┐
│  Listing       │    │   Claim             │    │  Dashboard      │
│  Service       │    │   Service           │    │  Service        │
│                │    │                     │    │                 │
│ • Create       │    │ • Accept/Reject     │    │ • Stats Calc    │
│ • Update       │    │ • Auto-reject Job   │    │ • Active Lists  │
│ • Cancel       │    │ • Notifications     │    │ • Pending Queue │
│ • Validation   │    │ • State Machine     │    │ • Real-time     │
└───────┬────────┘    └──────────┬──────────┘    └────────┬────────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌───────▼────────┐    ┌─────────▼─────────┐    ┌────────▼────────┐
│  Photo         │    │   Prediction      │    │  Notification   │
│  Service       │    │   Service         │    │  Service        │
│                │    │                   │    │                 │
│ • Upload S3    │    │ • ML Model        │    │ • Push (FCM)    │
│ • Compress     │    │ • Factors         │    │ • SMS (Twilio)  │
│ • Validate     │    │ • Confidence      │    │ • WebSocket     │
└───────┬────────┘    └─────────┬─────────┘    └────────┬────────┘
        │                       │                        │
        └───────────────────────┼────────────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │   Data Layer           │
                    │                        │
                    │  • PostgreSQL          │
                    │  • Redis Cache         │
                    │  • S3 Storage          │
                    └────────────────────────┘
```

### Component Interaction Flow

**Dashboard Load**:
```
Client → GET /api/v1/donors/me/dashboard
      → Dashboard Service
      → [Parallel Queries]
         ├─ Stats Service (cached 5min)
         ├─ Listing Service (active listings)
         └─ Claim Service (pending claims)
      ← Aggregated Response
```

**Listing Creation**:
```
Client → POST /api/v1/listings (step-by-step)
      → Listing Service
      → Validation Middleware
      → Photo Service (if photos)
      → Prediction Service (step 5)
      → PostgreSQL (insert)
      → Redis (cache invalidation)
      → WebSocket (notify dashboard)
      ← Created Listing
```

**Claim Acceptance**:
```
Client → PUT /api/v1/claims/:id/accept
      → Claim Service
      → State Validation
      → [Atomic Transaction]
         ├─ Update claim status
         ├─ Reject other pending claims
         ├─ Update listing status
         └─ Generate pickup code
      → Notification Service
         ├─ Push to accepted receiver
         └─ Push to rejected receivers
      → WebSocket (update dashboard)
      ← Accepted Claim + Pickup Code
```

---

## Components and Interfaces

### 1. Dashboard Service

**Responsibility**: Aggregate and serve donor dashboard data

**Interface**:
```typescript
interface DashboardService {
  getDashboardData(donorId: string): Promise<DashboardData>;
  getStatistics(donorId: string): Promise<DonorStats>;
  getActiveListings(donorId: string, limit: number): Promise<Listing[]>;
  getPendingClaims(donorId: string, limit: number): Promise<Claim[]>;
  subscribeToUpdates(donorId: string, callback: (event: DashboardEvent) => void): void;
}

interface DashboardData {
  statistics: DonorStats;
  activeListings: Listing[];
  pendingClaims: ClaimWithReceiver[];
  urgentListings: Listing[];
}

interface DonorStats {
  totalMealsDonated: number;
  totalKgSaved: number;
  totalCO2Prevented: number;
  uniqueReceiversHelped: number;
  currentStreak: number;
  longestStreak: number;
  lastDonationDate: Date | null;
}
```

**Key Methods**:

- `calculateStatistics(donorId)`: Aggregate lifetime statistics from completed listings
- `calculateStreak(donorId)`: Compute consecutive days with active listings
- `getUrgentListings(donorId)`: Filter listings with < 2 hours remaining
- `cacheStatistics(donorId, stats)`: Cache stats in Redis (5min TTL)

**Caching Strategy**:
- Statistics: 5 minutes TTL (updated on listing completion)
- Active listings: 2 minutes TTL (updated on status change)
- Pending claims: No cache (real-time via WebSocket)

---

### 2. Listing Service

**Responsibility**: Manage food listing lifecycle (CRUD operations)

**Interface**:
```typescript
interface ListingService {
  createListing(donorId: string, data: CreateListingDTO): Promise<Listing>;
  updateListing(listingId: string, donorId: string, data: UpdateListingDTO): Promise<Listing>;
  cancelListing(listingId: string, donorId: string, reason: CancellationReason): Promise<void>;
  getListing(listingId: string): Promise<Listing>;
  getListings(filters: ListingFilters): Promise<PaginatedListings>;
  saveDraft(donorId: string, data: Partial<CreateListingDTO>): Promise<Draft>;
  resumeDraft(draftId: string): Promise<Draft>;
}

interface CreateListingDTO {
  title: string;
  description?: string;
  foodTypes: FoodType[];
  quantityValue: number;
  quantityUnit: QuantityUnit;
  dietaryFlags: DietaryFlags;
  allergens: Allergen[];
  photoUrls: string[];
  coverPhotoUrl: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupInstructions?: string;
  readyFrom: Date;
  pickupBy: Date;
  bestBefore?: Date;
  preparationNotes?: string;
}

interface ListingFilters {
  donorId?: string;
  status?: ListingStatus[];
  sortBy?: 'newest' | 'oldest' | 'expiring_soon' | 'most_claims';
  page: number;
  limit: number;
}
```

**Validation Rules**:
- Title: 1-100 characters, no special characters except `-`, `'`, `,`
- Quantity: > 0, max 10000
- Food types: At least 1 selected
- Photos: Max 6, each < 10MB, formats: jpg, png, heic
- Coordinates: Valid lat/lng within service area
- Time window: `readyFrom < pickupBy`, minimum 1 hour, maximum 24 hours for cooked food
- Allergen consistency: Vegan listings cannot have dairy/eggs allergens

**State Transitions**:
```
draft → available → claimed → in_progress → completed
                  ↓         ↓
                expired   cancelled
```

**Edit Permissions**:
- Can edit if: `status === 'available'` AND `acceptedClaimsCount === 0`
- Cannot edit: `id`, `donorId`, `createdAt`, `status`
- Edit triggers notification to pending claimants

---

### 3. Photo Service

**Responsibility**: Handle photo uploads, compression, and storage

**Interface**:
```typescript
interface PhotoService {
  uploadPhotos(files: File[], listingId: string): Promise<PhotoUploadResult[]>;
  compressPhoto(file: File): Promise<Buffer>;
  validatePhoto(file: File): Promise<ValidationResult>;
  deletePhoto(photoUrl: string, listingId: string): Promise<void>;
  reorderPhotos(listingId: string, photoUrls: string[]): Promise<void>;
}

interface PhotoUploadResult {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  size: number;
}
```

**Processing Pipeline**:
1. **Validation**: Check format, size, dimensions
2. **Compression**: Resize to max 1920px width, quality 85%, convert to JPEG
3. **Thumbnail**: Generate 300x300 thumbnail
4. **Upload**: S3 bucket `foodbridge-photos/{listingId}/{uuid}.jpg`
5. **CDN**: CloudFront URL returned

**Storage Structure**:
```
s3://foodbridge-photos/
  ├─ {listing-id}/
  │   ├─ {uuid}-original.jpg
  │   ├─ {uuid}-compressed.jpg
  │   └─ {uuid}-thumbnail.jpg
```

---

### 4. Claim Service

**Responsibility**: Manage claim lifecycle and state transitions

**Interface**:
```typescript
interface ClaimService {
  acceptClaim(claimId: string, donorId: string): Promise<AcceptedClaim>;
  rejectClaim(claimId: string, donorId: string, reason?: string): Promise<void>;
  autoRejectExpiredClaims(): Promise<number>;
  getPendingClaims(donorId: string): Promise<ClaimWithReceiver[]>;
  getClaimDetails(claimId: string): Promise<ClaimDetails>;
}

interface AcceptedClaim {
  claim: Claim;
  pickupCode: string;
  rejectedClaimIds: string[];
}

interface ClaimWithReceiver {
  claim: Claim;
  receiver: {
    id: string;
    name: string;
    photoUrl: string;
    rating: number;
    reliabilityScore: number;
    completedPickups: number;
    distance: number;
    isVerified: boolean;
  };
  timeRemaining: number; // seconds
}
```

**State Machine**:
```
pending → accepted → completed
       ↓         ↓
    rejected  cancelled
       ↓
  auto_rejected
```

**Business Rules**:
- Only 1 claim can be `accepted` per listing
- When claim accepted, all other `pending` claims → `rejected`
- Claims `pending` for > 15 minutes → `auto_rejected`
- Cannot accept/reject if listing status is `expired` or `cancelled`
- Pickup code: 6-digit numeric, unique per claim

**Auto-Rejection Job**:
```typescript
// Runs every 1 minute via node-cron
async function autoRejectExpiredClaims() {
  const expiredClaims = await db.query(`
    SELECT id FROM claims
    WHERE status = 'pending'
    AND created_at < NOW() - INTERVAL '15 minutes'
  `);
  
  for (const claim of expiredClaims) {
    await rejectClaim(claim.id, 'auto_rejected');
    await notifyReceiver(claim.receiverId, 'claim_expired');
    await notifyDonor(claim.listing.donorId, 'claim_expired');
  }
  
  return expiredClaims.length;
}
```

---

### 5. Prediction Service

**Responsibility**: Predict claim volume using ML model

**Interface**:
```typescript
interface PredictionService {
  predictClaims(listing: Partial<Listing>): Promise<ClaimPrediction>;
  getContributingFactors(listing: Partial<Listing>): Promise<PredictionFactor[]>;
}

interface ClaimPrediction {
  minClaims: number;
  maxClaims: number;
  confidence: 'high' | 'medium' | 'low';
  factors: PredictionFactor[];
  historicalAverage: number;
}

interface PredictionFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}
```

**Model Inputs**:
- Location (lat/lng) → demand density
- Food type → popularity score
- Quantity → capacity match
- Time of day → peak hours (12-2pm, 6-8pm)
- Day of week → weekend vs weekday
- Historical data → similar listings

**Fallback Strategy**:
- If ML model unavailable: Show generic message "Based on similar listings, expect 5-10 claims"
- If no historical data: Use global average
- Never block listing creation on prediction failure

---

### 6. Notification Service

**Responsibility**: Multi-channel notifications (push, SMS, WebSocket)

**Interface**:
```typescript
interface NotificationService {
  sendClaimNotification(donorId: string, claim: Claim): Promise<void>;
  sendClaimAccepted(receiverId: string, claim: Claim): Promise<void>;
  sendClaimRejected(receiverId: string, claim: Claim): Promise<void>;
  sendClaimExpired(receiverId: string, claim: Claim): Promise<void>;
  sendListingUpdated(receiverIds: string[], listing: Listing): Promise<void>;
  sendRealTimeUpdate(userId: string, event: DashboardEvent): Promise<void>;
}

interface DashboardEvent {
  type: 'claim_created' | 'claim_accepted' | 'claim_rejected' | 'listing_updated' | 'stats_updated';
  payload: any;
  timestamp: Date;
}
```

**Channel Priority**:
1. **WebSocket** (instant, if connected)
2. **Push Notification** (FCM, 3-5 seconds)
3. **SMS** (Twilio, fallback for critical events)

**Event Types**:
- `claim:created` → Donor dashboard
- `claim:accepted` → Receiver + other pending receivers (rejected)
- `claim:expired` → Receiver + donor
- `listing:updated` → Pending claimants
- `stats:updated` → Donor dashboard

---

## Data Models

### Listing Entity

```typescript
interface Listing {
  // Identity
  id: string; // UUID
  donorId: string; // FK to users
  
  // Content
  title: string; // 1-100 chars
  description: string | null; // 0-500 chars
  foodTypes: FoodType[]; // ['cooked_hot', 'packaged']
  quantityValue: number; // > 0
  quantityUnit: QuantityUnit; // 'meals' | 'kg' | 'portions' | 'servings' | 'plates'
  
  // Dietary
  isVegetarian: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isKosher: boolean;
  isGlutenFree: boolean;
  allergens: Allergen[]; // ['nuts', 'dairy']
  
  // Photos
  photoUrls: string[]; // Max 6, S3 URLs
  coverPhotoUrl: string; // First photo or explicitly set
  
  // Location
  pickupAddress: string;
  pickupLatitude: number; // -90 to 90
  pickupLongitude: number; // -180 to 180
  pickupLocation: Point; // PostGIS geography point
  pickupInstructions: string | null;
  
  // Timing
  readyFrom: Date; // >= now
  pickupBy: Date; // > readyFrom, < readyFrom + 24h for cooked
  bestBefore: Date | null; // For packaged food
  preparationNotes: string | null;
  
  // Status
  status: ListingStatus; // 'draft' | 'available' | 'claimed' | 'in_progress' | 'completed' | 'expired' | 'cancelled'
  
  // Metrics
  claimCount: number; // Total claims received
  viewCount: number; // Total views
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  
  // Computed (not stored)
  timeRemaining?: number; // pickupBy - now (seconds)
  isUrgent?: boolean; // timeRemaining < 2 hours
}

type FoodType = 'cooked_hot' | 'cooked_cold' | 'raw' | 'packaged' | 'baked' | 'beverages';
type QuantityUnit = 'meals' | 'kg' | 'portions' | 'servings' | 'plates';
type Allergen = 'nuts' | 'dairy' | 'eggs' | 'soy' | 'shellfish' | 'wheat' | 'fish';
type ListingStatus = 'draft' | 'available' | 'claimed' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
```

**Database Schema**:
```sql
CREATE TABLE food_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  title VARCHAR(100) NOT NULL,
  description TEXT,
  food_types TEXT[] NOT NULL,
  quantity_value DECIMAL(10,2) NOT NULL CHECK (quantity_value > 0),
  quantity_unit VARCHAR(20) NOT NULL,
  
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_halal BOOLEAN DEFAULT FALSE,
  is_kosher BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  allergens TEXT[],
  
  photo_urls TEXT[],
  cover_photo_url TEXT,
  
  pickup_address TEXT NOT NULL,
  pickup_latitude DECIMAL(10,8) NOT NULL,
  pickup_longitude DECIMAL(11,8) NOT NULL,
  pickup_location GEOGRAPHY(POINT, 4326) NOT NULL,
  pickup_instructions TEXT,
  
  ready_from TIMESTAMP WITH TIME ZONE NOT NULL,
  pickup_by TIMESTAMP WITH TIME ZONE NOT NULL,
  best_before TIMESTAMP WITH TIME ZONE,
  preparation_notes TEXT,
  
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  claim_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  
  CONSTRAINT valid_time_window CHECK (pickup_by > ready_from),
  CONSTRAINT valid_ready_time CHECK (ready_from >= created_at),
  CONSTRAINT valid_coordinates CHECK (
    pickup_latitude BETWEEN -90 AND 90 AND
    pickup_longitude BETWEEN -180 AND 180
  )
);

CREATE INDEX idx_listings_donor ON food_listings(donor_id);
CREATE INDEX idx_listings_status ON food_listings(status);
CREATE INDEX idx_listings_pickup_by ON food_listings(pickup_by);
CREATE INDEX idx_listings_location ON food_listings USING GIST(pickup_location);
CREATE INDEX idx_listings_created_at ON food_listings(created_at DESC);
```

---

### Claim Entity

```typescript
interface Claim {
  // Identity
  id: string; // UUID
  listingId: string; // FK to food_listings
  receiverId: string; // FK to users
  
  // Content
  message: string | null; // Optional message from receiver
  
  // Status
  status: ClaimStatus; // 'pending' | 'accepted' | 'rejected' | 'auto_rejected' | 'completed' | 'cancelled'
  pickupCode: string | null; // 6-digit code, set when accepted
  
  // Timestamps
  createdAt: Date;
  respondedAt: Date | null; // When donor accepted/rejected
  completedAt: Date | null; // When pickup completed
  
  // Rejection
  rejectionReason: string | null;
  
  // Computed
  timeRemaining?: number; // 15min - (now - createdAt)
  isExpired?: boolean; // timeRemaining <= 0
}

type ClaimStatus = 'pending' | 'accepted' | 'rejected' | 'auto_rejected' | 'completed' | 'cancelled';
```

**Database Schema**:
```sql
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES food_listings(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  pickup_code VARCHAR(6),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  CONSTRAINT unique_pending_claim UNIQUE (listing_id, receiver_id, status) 
    WHERE status = 'pending',
  CONSTRAINT valid_pickup_code CHECK (pickup_code ~ '^[0-9]{6}$')
);

CREATE INDEX idx_claims_listing ON claims(listing_id);
CREATE INDEX idx_claims_receiver ON claims(receiver_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_created_at ON claims(created_at);
CREATE INDEX idx_claims_pending_timeout ON claims(created_at) 
  WHERE status = 'pending';
```

---

### DonorStats Entity

```typescript
interface DonorStats {
  donorId: string; // FK to users
  
  // Lifetime metrics
  totalMealsDonated: number; // Sum of completed listing quantities
  totalKgSaved: number; // Sum of kg (converted from quantities)
  totalCO2Prevented: number; // totalMealsDonated * 2.5
  uniqueReceiversHelped: number; // Distinct receivers from completed claims
  
  // Streaks
  currentStreak: number; // Consecutive days with active listings
  longestStreak: number; // Historical max streak
  
  // Counts
  totalListings: number;
  completedListings: number;
  cancelledListings: number;
  
  // Rating
  averageRating: number; // From ratings table
  
  // Timestamps
  lastDonationDate: Date | null; // Last completed listing
  updatedAt: Date;
}
```

**Database Schema**:
```sql
CREATE TABLE donor_stats (
  donor_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  total_meals_donated INTEGER DEFAULT 0,
  total_kg_saved DECIMAL(10,2) DEFAULT 0,
  total_co2_prevented DECIMAL(10,2) DEFAULT 0,
  unique_receivers_helped INTEGER DEFAULT 0,
  
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  
  total_listings INTEGER DEFAULT 0,
  completed_listings INTEGER DEFAULT 0,
  cancelled_listings INTEGER DEFAULT 0,
  
  average_rating DECIMAL(3,2) DEFAULT 0,
  
  last_donation_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_donor_stats_updated ON donor_stats(updated_at);
```

**Update Triggers**:
- On listing completion: Increment `totalMealsDonated`, `totalKgSaved`, `totalCO2Prevented`, `completedListings`
- On listing cancellation: Increment `cancelledListings`
- On new unique receiver: Increment `uniqueReceiversHelped`
- Daily cron job: Recalculate `currentStreak` for all donors

---

### Draft Entity

```typescript
interface Draft {
  id: string;
  donorId: string;
  data: Partial<CreateListingDTO>; // JSONB
  currentStep: number; // 1-5
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date; // 7 days from creation
}
```

**Database Schema**:
```sql
CREATE TABLE listing_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  current_step INTEGER NOT NULL CHECK (current_step BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
  
  CONSTRAINT one_draft_per_donor UNIQUE (donor_id)
);

CREATE INDEX idx_drafts_donor ON listing_drafts(donor_id);
CREATE INDEX idx_drafts_expires ON listing_drafts(expires_at);
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before writing correctness properties, I need to analyze the acceptance criteria to determine which are testable as properties.


### Property Reflection

After analyzing all acceptance criteria, I've identified the following areas of potential redundancy:

**Redundancy Analysis**:

1. **Time Calculations**: Multiple properties test time_remaining calculations (1.2.4, 1.3.4, 4.4.3). These can be consolidated into a single comprehensive time calculation property.

2. **Data Completeness**: Properties 1.2.2 and 1.3.2 both test that data structures contain required fields. These can be combined into a general data completeness property.

3. **Pagination**: Properties 1.2.8 and 1.3.8 both test pagination limits. These can be combined into a single pagination property.

4. **State Transitions**: Multiple properties test claim state transitions (4.2.1, 4.2.2, 4.3.2, 4.3.3). These can be consolidated into a comprehensive state machine property.

5. **Validation Constraints**: Multiple properties test field length constraints (2.2.1, 2.2.2). These can be combined into a general validation property.

**Consolidated Properties**:
After reflection, I've reduced 50+ testable criteria to 25 core properties that provide unique validation value without logical redundancy.

---

### Property 1: Statistics Accuracy - Meals Donated

*For any* donor, the total meals donated SHALL equal the sum of quantity values from all completed listings where the donor is the owner.

**Validates: Requirements US-1.1.1**

---

### Property 2: Statistics Accuracy - CO₂ Calculation

*For any* donor, the total CO₂ prevented SHALL equal the total meals donated multiplied by 2.5 kg per meal.

**Validates: Requirements US-1.1.3**

---

### Property 3: Statistics Accuracy - Unique Receivers

*For any* donor, the count of unique receivers helped SHALL equal the count of distinct receiver IDs from all completed claims on the donor's listings.

**Validates: Requirements US-1.1.4**

---

### Property 4: Streak Calculation Correctness

*For any* donor and any date, the current streak SHALL equal the number of consecutive days (ending today) where the donor had at least one active listing.

**Validates: Requirements US-1.1.5**

---

### Property 5: Active Listings Filter

*For any* listing shown in the active listings section, the listing status SHALL be one of {available, claimed, in_progress}.

**Validates: Requirements US-1.2.1**

---

### Property 6: Time Remaining Accuracy

*For any* listing or claim with a deadline, the time remaining SHALL equal the deadline timestamp minus the current timestamp, and SHALL be non-negative for active items.

**Validates: Requirements US-1.2.4, US-1.3.4, US-4.4.3**

---

### Property 7: Urgency Classification

*For any* listing, the listing SHALL be classified as urgent if and only if the time remaining until pickup deadline is less than 2 hours.

**Validates: Requirements US-1.2.5**

---

### Property 8: Pending Claims Count Accuracy

*For any* donor, the pending claims count badge SHALL equal the number of claims with status 'pending' on the donor's listings.

**Validates: Requirements US-1.3.1**

---

### Property 9: Auto-Rejection Timeout

*For any* claim with status 'pending', if the current time minus the claim creation time exceeds 15 minutes, the claim status SHALL automatically transition to 'auto_rejected'.

**Validates: Requirements US-1.3.5, US-4.4.1**

---

### Property 10: Photo Count Limit

*For any* listing, the number of photos SHALL be less than or equal to 6.

**Validates: Requirements US-2.1.1**

---

### Property 11: Photo Size Limit

*For any* photo uploaded to a listing, the file size SHALL be less than or equal to 10 MB.

**Validates: Requirements US-2.1.2**

---

### Property 12: Photo Format Validation

*For any* photo uploaded to a listing, the file format SHALL be one of {jpg, jpeg, png, heic}.

**Validates: Requirements US-2.1.3**

---

### Property 13: Cover Photo Assignment

*For any* listing with at least one photo, exactly one photo SHALL be designated as the cover photo, and it SHALL be the first photo in the photo array if not explicitly set.

**Validates: Requirements US-2.1.5**

---

### Property 14: Photo Compression

*For any* photo uploaded to a listing, after compression the image width SHALL be less than or equal to 1920 pixels.

**Validates: Requirements US-2.1.6**

---

### Property 15: Title Length Constraint

*For any* listing, the title length SHALL be greater than or equal to 1 character and less than or equal to 100 characters.

**Validates: Requirements US-2.2.1**

---

### Property 16: Description Length Constraint

*For any* listing with a description, the description length SHALL be less than or equal to 500 characters.

**Validates: Requirements US-2.2.2**

---

### Property 17: Quantity Positivity

*For any* listing, the quantity value SHALL be greater than 0.

**Validates: Requirements US-2.2.3**

---

### Property 18: Food Type Selection

*For any* listing, at least one food type SHALL be selected.

**Validates: Requirements US-2.2.4**

---

### Property 19: Dietary Consistency - Vegan Allergens

*For any* listing where the vegan flag is true, the allergens array SHALL NOT contain 'dairy' AND SHALL NOT contain 'eggs'.

**Validates: Requirements US-2.2.5**

---

### Property 20: Coordinate Validity

*For any* listing, the pickup latitude SHALL be between -90 and 90 (inclusive), and the pickup longitude SHALL be between -180 and 180 (inclusive).

**Validates: Requirements US-2.3.1**

---

### Property 21: Address Completeness

*For any* listing, the pickup address SHALL contain a street component, a city component, and a postal code component.

**Validates: Requirements US-2.3.3**

---

### Property 22: Time Window Ordering

*For any* listing, the pickup deadline (pickup_by) SHALL be strictly greater than the ready time (ready_from).

**Validates: Requirements US-2.4.2**

---

### Property 23: Minimum Time Window

*For any* listing, the time difference between pickup deadline and ready time SHALL be greater than or equal to 1 hour.

**Validates: Requirements US-2.4.3**

---

### Property 24: Maximum Time Window for Cooked Food

*For any* listing where the food types include 'cooked_hot' OR 'cooked_cold', the time difference between pickup deadline and ready time SHALL be less than or equal to 24 hours.

**Validates: Requirements US-2.4.4**

---

### Property 25: Prediction Range Validity

*For any* claim prediction, the minimum claims value SHALL be greater than or equal to 0, and the maximum claims value SHALL be greater than or equal to the minimum claims value.

**Validates: Requirements US-2.5.1**

---

### Property 26: Prediction Confidence Values

*For any* claim prediction, the confidence level SHALL be one of {high, medium, low}.

**Validates: Requirements US-2.5.2**

---

### Property 27: Wizard Step Progression

*For any* wizard step s, the user SHALL be able to proceed to step s+1 if and only if step s is valid (all required fields completed and validated).

**Validates: Requirements US-2.6.1**

---

### Property 28: Wizard Data Preservation

*For any* wizard step s, if the user navigates from step s to step s+1 and then back to step s, the data entered in step s SHALL be unchanged.

**Validates: Requirements US-2.6.2**

---

### Property 29: Listing Filter Correctness

*For any* filter applied to the listings view (Active, Completed, Expired, Cancelled), all returned listings SHALL have a status that matches the filter criteria.

**Validates: Requirements US-3.1.1**

---

### Property 30: Listing Sort Order

*For any* sort option applied to the listings view, the returned listings SHALL be ordered according to the sort criteria (newest: created_at DESC, oldest: created_at ASC, expiring_soon: pickup_by ASC, most_claims: claim_count DESC).

**Validates: Requirements US-3.1.2**

---

### Property 31: Listing Ownership

*For any* listing shown in a donor's listings view, the listing's donor_id SHALL equal the current user's ID.

**Validates: Requirements US-3.1.4**

---

### Property 32: Edit Permission

*For any* listing, the listing SHALL be editable if and only if the count of accepted claims on that listing equals 0.

**Validates: Requirements US-3.2.1**

---

### Property 33: Immutable Fields on Edit

*For any* listing edit operation, the following fields SHALL remain unchanged: id, donor_id, created_at.

**Validates: Requirements US-3.2.3**

---

### Property 34: Cancellation Permission

*For any* listing, the listing SHALL be cancellable if and only if the listing status is not 'in_progress' AND not 'completed'.

**Validates: Requirements US-3.3.1**

---

### Property 35: Claim Rejection on Cancellation

*For any* listing that is cancelled, all claims with status 'pending' on that listing SHALL transition to status 'rejected'.

**Validates: Requirements US-3.3.2**

---

### Property 36: Cancellation Status Transition

*For any* listing that undergoes a cancellation operation, the listing status SHALL transition to 'cancelled'.

**Validates: Requirements US-3.3.3**

---

### Property 37: Claimant Rating Range

*For any* claimant shown in a claim card, the rating SHALL be greater than or equal to 0 and less than or equal to 5.

**Validates: Requirements US-4.1.1**

---

### Property 38: Claimant Reliability Score Range

*For any* claimant shown in a claim card, the reliability score SHALL be greater than or equal to 0 and less than or equal to 100.

**Validates: Requirements US-4.1.2**

---

### Property 39: Distance Calculation Accuracy

*For any* claim, the distance shown SHALL equal the Haversine distance between the claimant's location and the listing's pickup location.

**Validates: Requirements US-4.1.3**

---

### Property 40: Single Accepted Claim Per Listing

*For any* listing, the count of claims with status 'accepted' on that listing SHALL be less than or equal to 1.

**Validates: Requirements US-4.2.1**

---

### Property 41: Auto-Rejection on Claim Acceptance

*For any* claim that transitions to status 'accepted', all other claims on the same listing with status 'pending' SHALL transition to status 'rejected'.

**Validates: Requirements US-4.2.2**

---

### Property 42: Pickup Code Format

*For any* claim with status 'accepted', the pickup code SHALL match the regular expression /^[0-9]{6}$/ (exactly 6 digits).

**Validates: Requirements US-4.2.3**

---

### Property 43: Listing Status on Claim Acceptance

*For any* claim that transitions to status 'accepted', the associated listing's status SHALL transition to 'claimed'.

**Validates: Requirements US-4.2.4**

---

### Property 44: Claim State Transition Constraints

*For any* claim, the following state transitions SHALL be prohibited:
- From 'accepted' to 'rejected'
- From 'rejected' to 'accepted'
- From 'auto_rejected' to 'accepted'

**Validates: Requirements US-4.3.2, US-4.3.3**

---

### Property 45: Auto-Rejection Reason

*For any* claim with status 'auto_rejected', the rejection reason SHALL be "Donor did not respond in time".

**Validates: Requirements US-4.4.2**

---


## Error Handling

### Error Categories

**1. Validation Errors (400 Bad Request)**
- Invalid input data (title too long, negative quantity, invalid coordinates)
- Missing required fields
- Format violations (photo size, file type)
- Business rule violations (time window constraints, allergen consistency)

**Response Format**:
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title must be between 1 and 100 characters",
      "value": ""
    }
  ]
}
```

**2. Authorization Errors (403 Forbidden)**
- Attempting to edit listing with accepted claims
- Attempting to cancel in-progress listing
- Attempting to access another donor's listing

**Response Format**:
```json
{
  "error": "FORBIDDEN",
  "message": "Cannot edit listing with accepted claims"
}
```

**3. Not Found Errors (404 Not Found)**
- Listing ID does not exist
- Claim ID does not exist
- Draft ID does not exist

**Response Format**:
```json
{
  "error": "NOT_FOUND",
  "message": "Listing not found",
  "resourceId": "listing-uuid"
}
```

**4. Conflict Errors (409 Conflict)**
- Race condition: Claim already accepted by another donor
- Listing already cancelled
- Claim already expired

**Response Format**:
```json
{
  "error": "CONFLICT",
  "message": "This claim has already been accepted",
  "currentStatus": "accepted"
}
```

**5. External Service Errors (502 Bad Gateway)**
- S3 upload failure
- Map API unavailable
- ML prediction service timeout

**Response Format**:
```json
{
  "error": "EXTERNAL_SERVICE_ERROR",
  "message": "Photo upload failed. Please try again.",
  "service": "S3",
  "retryable": true
}
```

**6. Rate Limit Errors (429 Too Many Requests)**
- Exceeded listing creation limit (10 per hour)
- Exceeded photo upload limit

**Response Format**:
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "You can create up to 10 listings per hour",
  "retryAfter": 3600,
  "limit": 10,
  "remaining": 0
}
```

### Error Handling Strategies

**Client-Side**:
- **Optimistic UI**: Show immediate feedback, rollback on error
- **Retry Logic**: Automatic retry for network errors (max 3 attempts with exponential backoff)
- **Graceful Degradation**: 
  - If map unavailable → manual address entry
  - If prediction unavailable → generic message
  - If photo upload fails → allow listing without photos
- **User-Friendly Messages**: Translate technical errors to actionable messages
- **Validation Feedback**: Real-time validation as user types

**Server-Side**:
- **Transaction Rollback**: Use database transactions for multi-step operations (claim acceptance)
- **Idempotency**: Use idempotency keys for critical operations (listing creation, claim acceptance)
- **Circuit Breaker**: Disable external services temporarily if failure rate > 50%
- **Fallback Values**: Use cached data or defaults when external services fail
- **Logging**: Log all errors with context (user ID, request ID, stack trace)

### Critical Error Scenarios

**Scenario 1: Race Condition on Claim Acceptance**
```
Problem: Two donors try to accept different claims on same listing simultaneously
Solution: Use database-level locking (SELECT FOR UPDATE) + optimistic locking (version field)
```

**Scenario 2: Photo Upload Failure Mid-Creation**
```
Problem: User uploads 3 photos, 4th fails, wizard stuck
Solution: Store uploaded photo URLs in draft, allow retry or skip, don't block wizard progression
```

**Scenario 3: Auto-Rejection Job Failure**
```
Problem: Cron job crashes, claims not auto-rejected
Solution: Job idempotency + dead letter queue + monitoring alerts
```

**Scenario 4: WebSocket Disconnection**
```
Problem: User doesn't receive real-time claim notification
Solution: Fallback to polling every 30 seconds + push notification
```

---

## Testing Strategy

### Unit Tests

**Target**: Individual functions and business logic

**Coverage Areas**:
- **Validation Logic**: Title length, quantity positivity, coordinate validity, time window constraints
- **Calculation Logic**: Statistics (meals, CO₂, streak), time remaining, distance calculation
- **State Transitions**: Listing status changes, claim status changes
- **Utility Functions**: Photo compression, pickup code generation, date/time utilities

**Example Tests**:
```typescript
describe('Listing Validation', () => {
  test('rejects title longer than 100 characters', () => {
    const longTitle = 'a'.repeat(101);
    expect(() => validateTitle(longTitle)).toThrow('Title must be <= 100 characters');
  });
  
  test('rejects negative quantity', () => {
    expect(() => validateQuantity(-5)).toThrow('Quantity must be positive');
  });
  
  test('rejects vegan listing with dairy allergen', () => {
    const listing = { isVegan: true, allergens: ['dairy'] };
    expect(() => validateDietaryConsistency(listing)).toThrow('Vegan listings cannot contain dairy');
  });
});

describe('Statistics Calculation', () => {
  test('calculates CO2 prevented correctly', () => {
    const meals = 100;
    expect(calculateCO2Prevented(meals)).toBe(250); // 100 * 2.5
  });
  
  test('calculates streak correctly for consecutive days', () => {
    const listings = [
      { createdAt: '2026-05-01', status: 'available' },
      { createdAt: '2026-05-02', status: 'available' },
      { createdAt: '2026-05-03', status: 'available' }
    ];
    expect(calculateStreak(listings, '2026-05-03')).toBe(3);
  });
});
```

**Tools**: Jest, ts-jest

---

### Property-Based Tests

**Target**: Universal properties across all valid inputs

**Library**: fast-check (JavaScript/TypeScript property-based testing library)

**Configuration**: Minimum 100 iterations per property test

**Coverage Areas**:
- **Statistics Properties**: Meals donated accuracy, CO₂ calculation, unique receivers count
- **Validation Properties**: Title length, quantity positivity, coordinate validity, time window constraints
- **State Machine Properties**: Claim state transitions, listing status transitions
- **Business Rule Properties**: Single accepted claim per listing, auto-rejection timeout, dietary consistency

**Example Property Tests**:
```typescript
import fc from 'fast-check';

describe('Property: Statistics Accuracy - Meals Donated', () => {
  test('total meals equals sum of completed listing quantities', () => {
    // Feature: donor-dashboard-listing-system, Property 1: For any donor, total meals donated equals sum of completed listings
    fc.assert(
      fc.property(
        fc.array(fc.record({
          quantityValue: fc.integer({ min: 1, max: 1000 }),
          status: fc.constantFrom('completed', 'available', 'cancelled')
        })),
        (listings) => {
          const completedListings = listings.filter(l => l.status === 'completed');
          const expectedMeals = completedListings.reduce((sum, l) => sum + l.quantityValue, 0);
          const actualMeals = calculateTotalMeals(listings);
          return actualMeals === expectedMeals;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property: Time Window Ordering', () => {
  test('pickup_by is always greater than ready_from', () => {
    // Feature: donor-dashboard-listing-system, Property 22: pickup_by > ready_from
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2026-01-01'), max: new Date('2027-01-01') }),
        fc.integer({ min: 1, max: 48 }), // hours to add
        (readyFrom, hoursToAdd) => {
          const pickupBy = new Date(readyFrom.getTime() + hoursToAdd * 60 * 60 * 1000);
          const listing = { readyFrom, pickupBy };
          return validateTimeWindow(listing) && pickupBy > readyFrom;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property: Single Accepted Claim Per Listing', () => {
  test('at most one claim can be accepted per listing', () => {
    // Feature: donor-dashboard-listing-system, Property 40: count(accepted claims) <= 1
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.uuid(),
          listingId: fc.constantFrom('listing-1', 'listing-2', 'listing-3'),
          status: fc.constantFrom('pending', 'accepted', 'rejected')
        })),
        (claims) => {
          const claimsByListing = groupBy(claims, 'listingId');
          return Object.values(claimsByListing).every(listingClaims => {
            const acceptedCount = listingClaims.filter(c => c.status === 'accepted').length;
            return acceptedCount <= 1;
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property: Auto-Rejection Timeout', () => {
  test('claims pending > 15 minutes are auto-rejected', () => {
    // Feature: donor-dashboard-listing-system, Property 9: pending > 15min → auto_rejected
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2026-01-01'), max: new Date('2026-12-31') }),
        fc.integer({ min: 0, max: 30 }), // minutes elapsed
        (createdAt, minutesElapsed) => {
          const now = new Date(createdAt.getTime() + minutesElapsed * 60 * 1000);
          const claim = { createdAt, status: 'pending' };
          const shouldBeRejected = minutesElapsed > 15;
          const actualStatus = processAutoRejection(claim, now);
          return shouldBeRejected ? actualStatus === 'auto_rejected' : actualStatus === 'pending';
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property: Dietary Consistency - Vegan Allergens', () => {
  test('vegan listings cannot have dairy or eggs allergens', () => {
    // Feature: donor-dashboard-listing-system, Property 19: vegan → no dairy/eggs
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.array(fc.constantFrom('nuts', 'dairy', 'eggs', 'soy', 'shellfish', 'wheat', 'fish')),
        (isVegan, allergens) => {
          const listing = { isVegan, allergens };
          if (isVegan) {
            return !allergens.includes('dairy') && !allergens.includes('eggs');
          }
          return true; // Non-vegan listings can have any allergens
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Tools**: fast-check, Jest

---

### Integration Tests

**Target**: Component interactions and external services

**Coverage Areas**:
- **API Endpoints**: Full request/response cycle for all endpoints
- **Database Operations**: CRUD operations with PostgreSQL
- **Photo Upload**: S3 upload and compression pipeline
- **WebSocket Events**: Real-time updates for claims and dashboard
- **Cron Jobs**: Auto-rejection job execution
- **Cache Invalidation**: Redis cache updates on data changes

**Example Integration Tests**:
```typescript
describe('Listing Creation Flow', () => {
  test('creates listing with photos and returns complete listing object', async () => {
    const donorId = 'donor-123';
    const photos = [mockPhotoFile1, mockPhotoFile2];
    const listingData = {
      title: 'Fresh Biryani',
      foodTypes: ['cooked_hot'],
      quantityValue: 10,
      quantityUnit: 'meals',
      // ... other fields
    };
    
    // Upload photos
    const photoUrls = await photoService.uploadPhotos(photos, 'temp-id');
    
    // Create listing
    const listing = await listingService.createListing(donorId, {
      ...listingData,
      photoUrls: photoUrls.map(p => p.url),
      coverPhotoUrl: photoUrls[0].url
    });
    
    expect(listing.id).toBeDefined();
    expect(listing.status).toBe('available');
    expect(listing.photoUrls).toHaveLength(2);
    
    // Verify database
    const dbListing = await db.query('SELECT * FROM food_listings WHERE id = $1', [listing.id]);
    expect(dbListing.rows[0].title).toBe('Fresh Biryani');
    
    // Verify cache invalidation
    const cachedStats = await redis.get(`donor:${donorId}:stats`);
    expect(cachedStats).toBeNull(); // Should be invalidated
  });
});

describe('Claim Acceptance Flow', () => {
  test('accepts claim, rejects others, generates pickup code, sends notifications', async () => {
    const listing = await createTestListing();
    const claim1 = await createTestClaim(listing.id, 'receiver-1');
    const claim2 = await createTestClaim(listing.id, 'receiver-2');
    const claim3 = await createTestClaim(listing.id, 'receiver-3');
    
    // Accept claim1
    const result = await claimService.acceptClaim(claim1.id, listing.donorId);
    
    // Verify claim1 accepted
    expect(result.claim.status).toBe('accepted');
    expect(result.pickupCode).toMatch(/^\d{6}$/);
    
    // Verify other claims rejected
    expect(result.rejectedClaimIds).toContain(claim2.id);
    expect(result.rejectedClaimIds).toContain(claim3.id);
    
    // Verify listing status updated
    const updatedListing = await listingService.getListing(listing.id);
    expect(updatedListing.status).toBe('claimed');
    
    // Verify notifications sent
    expect(notificationService.sendClaimAccepted).toHaveBeenCalledWith('receiver-1', expect.any(Object));
    expect(notificationService.sendClaimRejected).toHaveBeenCalledTimes(2);
  });
});

describe('Auto-Rejection Cron Job', () => {
  test('auto-rejects claims older than 15 minutes', async () => {
    // Create claims with different ages
    const oldClaim = await createTestClaim(listing.id, 'receiver-1', { 
      createdAt: new Date(Date.now() - 20 * 60 * 1000) // 20 minutes ago
    });
    const recentClaim = await createTestClaim(listing.id, 'receiver-2', {
      createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
    });
    
    // Run auto-rejection job
    const rejectedCount = await claimService.autoRejectExpiredClaims();
    
    expect(rejectedCount).toBe(1);
    
    // Verify old claim rejected
    const updatedOldClaim = await claimService.getClaimDetails(oldClaim.id);
    expect(updatedOldClaim.status).toBe('auto_rejected');
    expect(updatedOldClaim.rejectionReason).toBe('Donor did not respond in time');
    
    // Verify recent claim still pending
    const updatedRecentClaim = await claimService.getClaimDetails(recentClaim.id);
    expect(updatedRecentClaim.status).toBe('pending');
  });
});
```

**Tools**: Jest, Supertest, testcontainers (for PostgreSQL/Redis)

---

### End-to-End Tests

**Target**: Complete user journeys

**Coverage Areas**:
- **Complete Donor Journey**: Login → Dashboard → Create Listing (5 steps) → Accept Claim → Complete Pickup
- **Mobile Responsive Behavior**: Test on different screen sizes
- **Photo Upload and Preview**: Full photo upload flow with compression
- **Map Interaction**: Location selection and address auto-fill
- **Real-Time Updates**: WebSocket events reflected in UI

**Example E2E Tests**:
```typescript
describe('Complete Listing Creation Journey', () => {
  test('donor creates listing through 5-step wizard', async () => {
    // Login
    await page.goto('/login');
    await page.fill('[name="phone"]', '+919876543210');
    await page.click('button:text("Send OTP")');
    await page.fill('[name="otp"]', '123456');
    await page.click('button:text("Verify")');
    
    // Navigate to create listing
    await page.click('button:text("Create Listing")');
    
    // Step 1: Upload photos
    await page.setInputFiles('input[type="file"]', ['test-photo1.jpg', 'test-photo2.jpg']);
    await page.waitForSelector('.photo-preview', { count: 2 });
    await page.click('button:text("Next")');
    
    // Step 2: Enter details
    await page.fill('[name="title"]', 'Fresh Biryani');
    await page.fill('[name="description"]', 'Delicious chicken biryani');
    await page.fill('[name="quantityValue"]', '10');
    await page.selectOption('[name="quantityUnit"]', 'meals');
    await page.click('[data-food-type="cooked_hot"]');
    await page.click('button:text("Next")');
    
    // Step 3: Select location
    await page.click('.map-container'); // Click on map
    await page.fill('[name="pickupInstructions"]', 'Ring doorbell');
    await page.click('button:text("Next")');
    
    // Step 4: Set timing
    await page.click('button:text("Ready Now")');
    await page.click('button:text("+4 hours")');
    await page.click('button:text("Next")');
    
    // Step 5: View prediction and submit
    await page.waitForSelector('.prediction-summary');
    await page.click('button:text("Post Listing")');
    
    // Verify success
    await page.waitForSelector('.success-message');
    expect(await page.textContent('.success-message')).toContain('Listing created successfully');
    
    // Verify listing appears on dashboard
    await page.goto('/dashboard');
    await page.waitForSelector('.listing-card:has-text("Fresh Biryani")');
  });
});
```

**Tools**: Playwright, Cypress

---

### Performance Tests

**Target**: Load and stress testing

**Scenarios**:
- **Dashboard Load**: 1000 concurrent users loading dashboard
- **Listing Creation**: 100 listings created per minute
- **Photo Upload**: 50 concurrent photo uploads
- **Claim Acceptance**: 500 claim acceptances per minute (race condition testing)
- **WebSocket Connections**: 5000 concurrent WebSocket connections

**Metrics**:
- Response time < 2 seconds (p95)
- Dashboard load < 2 seconds on 4G
- Photo upload < 5 seconds per photo
- WebSocket latency < 100ms

**Tools**: k6, Artillery

---

### Accessibility Tests

**Target**: WCAG 2.1 Level AA compliance

**Coverage Areas**:
- **Keyboard Navigation**: All wizard steps navigable via keyboard
- **Screen Reader Support**: All interactive elements have proper ARIA labels
- **Color Contrast**: All text meets 4.5:1 contrast ratio
- **Focus Indicators**: Visible focus indicators on all interactive elements

**Tools**: axe-core, Pa11y, manual testing with NVDA/JAWS

---

## Summary

This design document provides a comprehensive technical specification for the donor dashboard and food listing system. The architecture is built on proven patterns (Express.js, PostgreSQL, Redis, Socket.IO) and emphasizes:

- **Correctness**: 45 property-based tests ensure universal properties hold across all inputs
- **Reliability**: Comprehensive error handling with graceful degradation
- **Performance**: Aggressive caching and real-time updates via WebSocket
- **Usability**: Progressive disclosure through 5-step wizard, mobile-first design
- **Testability**: Multi-layered testing strategy (unit, property, integration, E2E)

The system is ready for implementation with clear interfaces, data models, and validation rules.

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-01  
**Status**: Ready for Implementation
