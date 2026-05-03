# Requirements: Donor Dashboard & Food Listing System

## Overview

This specification defines the complete donor experience for the FoodBridge platform, including a personalized dashboard with impact statistics, a multi-step food listing creation wizard, listing management capabilities, and a claim queue system for managing incoming requests from receivers.

**Feature Name**: `donor-dashboard-listing-system`  
**Spec Type**: Feature (New)  
**Workflow**: Requirements-First  
**Priority**: High (Step 2 of 10-step platform)

---

## Business Context

### Problem Statement

Donors need an intuitive, efficient way to:
1. Share surplus food with detailed information and photos
2. Track their social impact and contribution
3. Manage incoming claim requests from receivers
4. Monitor the status of their active and past donations

The current implementation has only a basic single-page form that lacks:
- Photo upload capability
- Location selection with maps
- Impact tracking dashboard
- Claim management system
- AI-powered predictions

### Success Criteria

1. **Adoption**: 80% of authenticated donors create at least one listing within first session
2. **Completion Rate**: 90% of donors who start the listing wizard complete it
3. **Time to Create**: Average listing creation time < 3 minutes
4. **Claim Response**: 95% of claims are responded to within 15-minute window
5. **User Satisfaction**: Dashboard NPS score > 8/10

---

## User Stories

### Epic 1: Donor Dashboard

#### US-1.1: View Impact Statistics
**As a** donor  
**I want to** see my cumulative impact statistics on my dashboard  
**So that** I feel motivated and can track my contribution to reducing food waste

**Acceptance Criteria**:
- [ ] Dashboard displays total meals donated (lifetime count)
- [ ] Dashboard shows kilograms of food saved (calculated from quantities)
- [ ] Dashboard displays CO₂ equivalent prevented (calculated: 1 meal = 2.5kg CO₂)
- [ ] Dashboard shows number of unique organizations/receivers helped
- [ ] Dashboard displays current donation streak (consecutive days with active listings)
- [ ] All statistics update in real-time when new listing is completed
- [ ] Statistics are visually appealing with icons and color coding
- [ ] Mobile-responsive layout (stacks vertically on small screens)

**Correctness Properties**:
```
Property: Statistics Accuracy
∀ donor d, meals_donated(d) = count(listings where donor_id = d AND status = 'completed')

Property: CO2 Calculation
∀ listing l, co2_saved(l) = quantity_value(l) * 2.5

Property: Streak Calculation
∀ donor d, streak(d) = consecutive_days_with_active_listings(d, today)
```

---

#### US-1.2: View Active Listings
**As a** donor  
**I want to** see all my currently active listings on my dashboard  
**So that** I can quickly monitor their status and pending claims

**Acceptance Criteria**:
- [ ] Dashboard shows list of active listings (status: available, claimed, in_progress)
- [ ] Each listing card displays: title, photo thumbnail, quantity, status badge, time remaining
- [ ] Status badges are color-coded (green=available, orange=claimed, blue=in_progress)
- [ ] Listings show countdown timer for pickup deadline
- [ ] Urgent listings (< 2 hours remaining) are highlighted in red
- [ ] Click on listing card navigates to listing detail page
- [ ] Empty state shown when no active listings ("Create your first listing!")
- [ ] Maximum 10 listings shown, with "View All" link for more

**Correctness Properties**:
```
Property: Active Listings Filter
∀ listing l shown on dashboard, status(l) ∈ {'available', 'claimed', 'in_progress'}

Property: Time Remaining Accuracy
∀ listing l, time_remaining(l) = pickup_by(l) - current_time()
AND time_remaining(l) ≥ 0

Property: Urgency Classification
∀ listing l, is_urgent(l) ⟺ time_remaining(l) < 2 hours
```

---

#### US-1.3: View Pending Claim Requests
**As a** donor  
**I want to** see incoming claim requests on my dashboard  
**So that** I can quickly accept or reject them

**Acceptance Criteria**:
- [ ] Dashboard shows "Pending Claims" section with count badge
- [ ] Each claim request shows: claimant name, profile photo, rating, time submitted
- [ ] Accept and Reject buttons are prominently displayed
- [ ] 15-minute countdown timer shown for each claim
- [ ] Claims auto-reject after 15 minutes with notification
- [ ] Real-time updates when new claims arrive (WebSocket or polling)
- [ ] Empty state when no pending claims
- [ ] Maximum 5 claims shown, with "View All Claims" link

**Correctness Properties**:
```
Property: Claim Timeout
∀ claim c, if current_time() - created_at(c) > 15 minutes
THEN status(c) = 'auto_rejected'

Property: Claim Uniqueness
∀ listing l, ∀ receiver r, count(claims where listing_id = l AND receiver_id = r AND status = 'pending') ≤ 1

Property: Claim Visibility
∀ claim c shown on dashboard, status(c) = 'pending' AND listing.donor_id = current_user.id
```

---

### Epic 2: Multi-Step Listing Creation Wizard

#### US-2.1: Upload Food Photos
**As a** donor  
**I want to** upload multiple photos of my food  
**So that** receivers can see exactly what I'm offering

**Acceptance Criteria**:
- [ ] Step 1 of wizard shows photo upload interface
- [ ] Drag-and-drop area for uploading photos
- [ ] Click to browse file system
- [ ] Support for JPG, PNG, HEIC formats
- [ ] Maximum 6 photos per listing
- [ ] Each photo max size: 10MB
- [ ] Photo preview thumbnails with remove button
- [ ] Photos can be reordered by drag-and-drop
- [ ] First photo is marked as "Cover Photo"
- [ ] Image compression before upload (max 1920px width)
- [ ] Progress indicator during upload
- [ ] Error handling for failed uploads with retry option
- [ ] "Skip" button to proceed without photos (optional)

**Correctness Properties**:
```
Property: Photo Count Limit
∀ listing l, count(photos(l)) ≤ 6

Property: Photo Size Limit
∀ photo p, size(p) ≤ 10MB

Property: Photo Format Validation
∀ photo p, format(p) ∈ {'jpg', 'jpeg', 'png', 'heic'}

Property: Cover Photo Existence
∀ listing l, if count(photos(l)) > 0 THEN ∃ photo p where is_cover(p) = true
```

---

#### US-2.2: Enter Food Details
**As a** donor  
**I want to** provide detailed information about my food  
**So that** receivers can make informed decisions

**Acceptance Criteria**:
- [ ] Step 2 shows food details form
- [ ] Title field (required, max 100 characters)
- [ ] Description field (optional, max 500 characters, multiline)
- [ ] Quantity value (required, number input)
- [ ] Quantity unit dropdown (meals, kg, portions, servings, plates)
- [ ] Food type multi-select chips (cooked_hot, cooked_cold, raw, packaged, baked, beverages)
- [ ] Dietary flags checkboxes (vegetarian, vegan, halal, kosher, gluten-free)
- [ ] Allergen warnings multi-select (nuts, dairy, eggs, soy, shellfish, wheat, fish)
- [ ] Best before date/time picker (optional, for packaged food)
- [ ] Preparation notes field (optional, e.g., "needs reheating")
- [ ] All required fields validated before proceeding
- [ ] Character count shown for text fields
- [ ] Form state persists if user goes back

**Correctness Properties**:
```
Property: Title Length
∀ listing l, 1 ≤ length(title(l)) ≤ 100

Property: Quantity Positive
∀ listing l, quantity_value(l) > 0

Property: Food Type Selection
∀ listing l, count(food_types(l)) ≥ 1

Property: Allergen Consistency
∀ listing l, if is_vegan(l) = true THEN 'dairy' ∉ allergens(l) AND 'eggs' ∉ allergens(l)
```

---

#### US-2.3: Select Pickup Location
**As a** donor  
**I want to** specify the exact pickup location on a map  
**So that** receivers know where to collect the food

**Acceptance Criteria**:
- [ ] Step 3 shows interactive map (Google Maps or Mapbox)
- [ ] Map centered on user's current location (with permission)
- [ ] Address search/autocomplete field
- [ ] Draggable pin to adjust exact location
- [ ] Address fields auto-populate from pin location (street, city, postal code)
- [ ] Manual address entry option if map unavailable
- [ ] Latitude and longitude captured from pin position
- [ ] "Use My Current Location" button
- [ ] Map zoom controls
- [ ] Pickup instructions field (e.g., "Ring doorbell", "Side entrance")
- [ ] Location preview shows on subsequent steps
- [ ] Validation: location must be within service area (configurable radius)

**Correctness Properties**:
```
Property: Coordinates Validity
∀ listing l, -90 ≤ latitude(l) ≤ 90 AND -180 ≤ longitude(l) ≤ 180

Property: Address Completeness
∀ listing l, address(l) contains street AND city AND postal_code

Property: Service Area Constraint
∀ listing l, distance(location(l), service_center) ≤ max_service_radius
```

---

#### US-2.4: Set Pickup Deadline
**As a** donor  
**I want to** specify when the food will be ready and when it must be picked up  
**So that** receivers know the time window for collection

**Acceptance Criteria**:
- [ ] Step 4 shows pickup timing form
- [ ] "Ready From" date-time picker (cannot be in the past)
- [ ] "Pickup By" date-time picker (must be after "Ready From")
- [ ] Minimum 1-hour window between ready and deadline
- [ ] Maximum 24-hour window for cooked food (configurable by food type)
- [ ] Quick select buttons (Ready Now, Ready in 1 hour, Ready in 2 hours)
- [ ] Quick deadline buttons (+2 hours, +4 hours, +6 hours from ready time)
- [ ] Visual timeline showing the pickup window
- [ ] Warning if deadline is very short (< 2 hours)
- [ ] Timezone displayed and handled correctly
- [ ] Validation prevents invalid time ranges

**Correctness Properties**:
```
Property: Time Ordering
∀ listing l, ready_from(l) < pickup_by(l)

Property: Future Ready Time
∀ listing l, ready_from(l) ≥ current_time()

Property: Minimum Window
∀ listing l, pickup_by(l) - ready_from(l) ≥ 1 hour

Property: Maximum Window for Cooked Food
∀ listing l, if 'cooked_hot' ∈ food_types(l) OR 'cooked_cold' ∈ food_types(l)
THEN pickup_by(l) - ready_from(l) ≤ 24 hours
```

---

#### US-2.5: View AI Prediction
**As a** donor  
**I want to** see a prediction of how many claims I might receive  
**So that** I can adjust my listing if needed

**Acceptance Criteria**:
- [ ] Step 5 shows AI prediction summary
- [ ] Prediction displays expected claim range (e.g., "6-10 claims")
- [ ] Prediction based on: location, food type, quantity, time of day, day of week
- [ ] Confidence indicator (high, medium, low)
- [ ] Factors contributing to prediction shown (e.g., "High demand area", "Peak dinner time")
- [ ] Historical data reference (e.g., "Similar listings received 8 claims on average")
- [ ] Option to edit listing if prediction is too high/low
- [ ] "Looks good, post it!" confirmation button
- [ ] Prediction updates if user goes back and changes details
- [ ] Fallback to generic message if ML model unavailable

**Correctness Properties**:
```
Property: Prediction Range Validity
∀ prediction p, min_claims(p) ≥ 0 AND max_claims(p) ≥ min_claims(p)

Property: Confidence Levels
∀ prediction p, confidence(p) ∈ {'high', 'medium', 'low'}

Property: Prediction Factors
∀ prediction p, factors(p) includes location_demand AND time_of_day AND food_type_popularity
```

---

#### US-2.6: Navigate Wizard Steps
**As a** donor  
**I want to** easily navigate between wizard steps  
**So that** I can review and edit information before submitting

**Acceptance Criteria**:
- [ ] Progress indicator shows all 5 steps with current step highlighted
- [ ] "Next" button proceeds to next step (disabled if current step invalid)
- [ ] "Back" button returns to previous step (preserves entered data)
- [ ] Step numbers clickable to jump to completed steps
- [ ] Cannot skip ahead to incomplete steps
- [ ] "Save as Draft" button on every step
- [ ] Draft saved to local storage and backend
- [ ] "Exit" button with confirmation dialog
- [ ] Keyboard navigation support (Tab, Enter, Escape)
- [ ] Mobile-friendly navigation (swipe gestures optional)

**Correctness Properties**:
```
Property: Step Progression
∀ step s, can_proceed_to(s+1) ⟺ is_valid(s)

Property: Data Persistence
∀ step s, if user navigates back from step s+1 to s, data(s) is preserved

Property: Draft Completeness
∀ draft d, can_resume(d) ⟺ ∃ step s where is_valid(s) AND s < 5
```

---

### Epic 3: Listing Management

#### US-3.1: View All Listings
**As a** donor  
**I want to** see all my listings (past and present)  
**So that** I can track my donation history

**Acceptance Criteria**:
- [ ] "My Listings" page shows all listings
- [ ] Filter tabs: All, Active, Completed, Expired, Cancelled
- [ ] Sort options: Newest, Oldest, Most Claims, Expiring Soon
- [ ] Each listing card shows: photo, title, status, quantity, created date, claim count
- [ ] Pagination (20 listings per page)
- [ ] Search by title or description
- [ ] Click listing card to view details
- [ ] Quick actions: Edit (if no claims), Cancel, View Claims
- [ ] Empty state for each filter tab
- [ ] Loading skeleton while fetching

**Correctness Properties**:
```
Property: Listing Ownership
∀ listing l shown on page, donor_id(l) = current_user.id

Property: Filter Correctness
∀ listing l in "Active" tab, status(l) ∈ {'available', 'claimed', 'in_progress'}
∀ listing l in "Completed" tab, status(l) = 'completed'
∀ listing l in "Expired" tab, status(l) = 'expired'
∀ listing l in "Cancelled" tab, status(l) = 'cancelled'

Property: Sort Order
If sort = 'Newest', ∀ i < j, created_at(listing[i]) ≥ created_at(listing[j])
```

---

#### US-3.2: Edit Listing
**As a** donor  
**I want to** edit my listing before anyone claims it  
**So that** I can correct mistakes or update information

**Acceptance Criteria**:
- [ ] "Edit" button visible only if listing has no accepted claims
- [ ] Edit opens the same multi-step wizard with pre-filled data
- [ ] All fields editable except listing ID and creation date
- [ ] Changes saved immediately or on "Update Listing" button
- [ ] Confirmation message after successful update
- [ ] Cannot change status to 'completed' or 'expired' manually
- [ ] Edit history tracked (timestamp, field changed, old value, new value)
- [ ] Receivers with pending claims notified of changes
- [ ] Validation same as creation wizard

**Correctness Properties**:
```
Property: Edit Permission
∀ listing l, can_edit(l) ⟺ count(claims where listing_id = l AND status = 'accepted') = 0

Property: Immutable Fields
∀ listing l, after edit: id(l) unchanged AND created_at(l) unchanged AND donor_id(l) unchanged

Property: Edit Notification
∀ claim c, if status(c) = 'pending' AND listing(c) is edited
THEN notification sent to receiver(c)
```

---

#### US-3.3: Cancel Listing
**As a** donor  
**I want to** cancel my listing if plans change  
**So that** receivers don't show up for unavailable food

**Acceptance Criteria**:
- [ ] "Cancel" button visible on active listings
- [ ] Confirmation dialog with reason selection (dropdown: Plans changed, Food spoiled, No longer available, Other)
- [ ] Optional text field for additional details
- [ ] Cannot cancel if pickup is in progress (status = 'in_progress')
- [ ] All pending claims auto-rejected with notification
- [ ] Accepted claim holder notified immediately
- [ ] Cancellation reason stored for analytics
- [ ] Listing status changed to 'cancelled'
- [ ] Cancellation count tracked per donor (for trust score)
- [ ] Warning if donor has cancelled > 3 listings this month

**Correctness Properties**:
```
Property: Cancellation Permission
∀ listing l, can_cancel(l) ⟺ status(l) ≠ 'in_progress' AND status(l) ≠ 'completed'

Property: Claim Rejection on Cancel
∀ claim c, if listing(c) is cancelled AND status(c) = 'pending'
THEN status(c) becomes 'rejected' AND notification sent to receiver(c)

Property: Cancellation Limit Warning
∀ donor d, if count(cancelled_listings(d, current_month)) ≥ 3
THEN show_warning(d) = true
```

---

### Epic 4: Claim Queue Management

#### US-4.1: View Claim Details
**As a** donor  
**I want to** see detailed information about each claim request  
**So that** I can make an informed decision

**Acceptance Criteria**:
- [ ] Claim card shows claimant profile photo
- [ ] Claim card shows claimant full name
- [ ] Claim card shows claimant rating (stars out of 5)
- [ ] Claim card shows claimant reliability score (percentage)
- [ ] Claim card shows claim submission time
- [ ] Claim card shows optional message from claimant
- [ ] Claim card shows claimant's distance from pickup location
- [ ] Claim card shows claimant's past pickup history (completed count)
- [ ] Click claimant name to view full profile (optional)
- [ ] Verified badge shown for verified organizations

**Correctness Properties**:
```
Property: Rating Range
∀ claimant c, 0 ≤ rating(c) ≤ 5

Property: Reliability Score Range
∀ claimant c, 0 ≤ reliability_score(c) ≤ 100

Property: Distance Accuracy
∀ claim c, distance(c) = haversine_distance(claimant_location(c), listing_location(c))
```

---

#### US-4.2: Accept Claim
**As a** donor  
**I want to** accept a claim request  
**So that** the receiver can proceed to pickup

**Acceptance Criteria**:
- [ ] "Accept" button prominently displayed on claim card
- [ ] Confirmation dialog before accepting
- [ ] Only one claim can be accepted per listing
- [ ] All other pending claims auto-rejected when one is accepted
- [ ] Accepted claimant notified immediately (push notification + email)
- [ ] Rejected claimants notified with reason
- [ ] Listing status changes to 'claimed'
- [ ] Pickup code generated (6-digit) and shown to donor
- [ ] Accepted claim moves to "Active Pickups" section
- [ ] Cannot accept if listing expired

**Correctness Properties**:
```
Property: Single Acceptance
∀ listing l, count(claims where listing_id = l AND status = 'accepted') ≤ 1

Property: Auto-Rejection on Accept
∀ claim c1, if status(c1) becomes 'accepted'
THEN ∀ claim c2 where listing_id(c2) = listing_id(c1) AND c2 ≠ c1 AND status(c2) = 'pending'
status(c2) becomes 'rejected'

Property: Pickup Code Generation
∀ claim c, if status(c) = 'accepted' THEN ∃ pickup_code(c) where length(pickup_code(c)) = 6
```

---

#### US-4.3: Reject Claim
**As a** donor  
**I want to** reject a claim request  
**So that** I can choose the most suitable receiver

**Acceptance Criteria**:
- [ ] "Reject" button displayed on claim card
- [ ] Optional reason selection (dropdown: Prefer local receiver, Prefer organization, Low reliability, Other)
- [ ] Claim status changes to 'rejected'
- [ ] Claimant notified of rejection (polite message, no specific reason shown)
- [ ] Rejected claim removed from pending queue
- [ ] Rejection count tracked per donor (for analytics)
- [ ] Cannot reject after accepting
- [ ] Can reject multiple claims before accepting one

**Correctness Properties**:
```
Property: Rejection Permission
∀ claim c, can_reject(c) ⟺ status(c) = 'pending'

Property: Rejection Notification
∀ claim c, if status(c) becomes 'rejected'
THEN notification sent to receiver(c)

Property: Rejection Finality
∀ claim c, if status(c) = 'rejected' THEN status(c) cannot change to 'accepted'
```

---

#### US-4.4: Auto-Reject Expired Claims
**As a** system  
**I want to** automatically reject claims after 15 minutes  
**So that** donors don't have stale requests

**Acceptance Criteria**:
- [ ] Background job checks claims every 1 minute
- [ ] Claims pending for > 15 minutes auto-rejected
- [ ] Auto-rejection reason: "Donor did not respond in time"
- [ ] Claimant notified of auto-rejection
- [ ] Donor notified that claim expired
- [ ] Auto-rejected claims don't count against donor's rejection count
- [ ] Countdown timer visible on claim card
- [ ] Warning at 5 minutes remaining
- [ ] Sound/vibration alert at 2 minutes remaining (optional)

**Correctness Properties**:
```
Property: Auto-Rejection Timing
∀ claim c, if current_time() - created_at(c) > 15 minutes AND status(c) = 'pending'
THEN status(c) becomes 'auto_rejected'

Property: Auto-Rejection Notification
∀ claim c, if status(c) = 'auto_rejected'
THEN notification sent to receiver(c) AND notification sent to donor(listing(c))

Property: Timer Accuracy
∀ claim c, time_remaining(c) = 15 minutes - (current_time() - created_at(c))
```

---

## Non-Functional Requirements

### Performance
- Dashboard loads in < 2 seconds on 4G connection
- Wizard step transitions in < 300ms
- Photo upload completes in < 5 seconds per photo (on average connection)
- Real-time claim updates delivered within 3 seconds
- Map loads and becomes interactive in < 2 seconds

### Scalability
- Support 10,000 concurrent donors
- Handle 1,000 listing creations per minute
- Process 5,000 claim requests per minute
- Store up to 1 million photos (with CDN)

### Security
- All API endpoints require authentication
- Photo uploads validated for file type and size
- XSS protection on all text inputs
- CSRF tokens on all forms
- Rate limiting: 10 listing creations per hour per donor

### Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation for entire wizard
- Screen reader support for all interactive elements
- Color contrast ratio ≥ 4.5:1
- Focus indicators visible on all interactive elements

### Usability
- Mobile-first responsive design
- Touch targets ≥ 44x44px
- Error messages clear and actionable
- Success feedback immediate and visible
- Loading states for all async operations

---

## Data Model

### Listing Entity
```typescript
interface Listing {
  id: string;
  donorId: string;
  title: string;
  description?: string;
  foodTypes: FoodType[];
  quantityValue: number;
  quantityUnit: QuantityUnit;
  isVegetarian: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isKosher: boolean;
  isGlutenFree: boolean;
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
  status: ListingStatus;
  claimCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

type FoodType = 'cooked_hot' | 'cooked_cold' | 'raw' | 'packaged' | 'baked' | 'beverages';
type QuantityUnit = 'meals' | 'kg' | 'portions' | 'servings' | 'plates';
type Allergen = 'nuts' | 'dairy' | 'eggs' | 'soy' | 'shellfish' | 'wheat' | 'fish';
type ListingStatus = 'draft' | 'available' | 'claimed' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
```

### Claim Entity
```typescript
interface Claim {
  id: string;
  listingId: string;
  receiverId: string;
  message?: string;
  status: ClaimStatus;
  pickupCode?: string;
  createdAt: Date;
  respondedAt?: Date;
  completedAt?: Date;
  rejectionReason?: string;
}

type ClaimStatus = 'pending' | 'accepted' | 'rejected' | 'auto_rejected' | 'completed' | 'cancelled';
```

### DonorStats Entity
```typescript
interface DonorStats {
  donorId: string;
  totalMealsDonated: number;
  totalKgSaved: number;
  totalCO2Prevented: number;
  uniqueReceiversHelped: number;
  currentStreak: number;
  longestStreak: number;
  totalListings: number;
  completedListings: number;
  cancelledListings: number;
  averageRating: number;
  lastDonationDate?: Date;
}
```

---

## API Endpoints

### Listings
- `POST /api/v1/listings` - Create new listing
- `GET /api/v1/listings` - Get all listings (with filters)
- `GET /api/v1/listings/:id` - Get listing details
- `PUT /api/v1/listings/:id` - Update listing
- `DELETE /api/v1/listings/:id` - Cancel listing
- `POST /api/v1/listings/:id/photos` - Upload photos
- `DELETE /api/v1/listings/:id/photos/:photoId` - Delete photo

### Claims
- `GET /api/v1/listings/:id/claims` - Get claims for listing
- `PUT /api/v1/claims/:id/accept` - Accept claim
- `PUT /api/v1/claims/:id/reject` - Reject claim

### Dashboard
- `GET /api/v1/donors/me/stats` - Get donor statistics
- `GET /api/v1/donors/me/listings` - Get donor's listings
- `GET /api/v1/donors/me/claims/pending` - Get pending claims

### Predictions
- `POST /api/v1/predictions/claims` - Get claim prediction for listing

---

## Testing Strategy

### Unit Tests
- Form validation logic
- Date/time calculations
- Photo upload utilities
- Claim timeout logic
- Statistics calculations

### Integration Tests
- Wizard flow (all 5 steps)
- Listing creation end-to-end
- Claim acceptance/rejection flow
- Auto-rejection cron job

### Property-Based Tests
- Listing data invariants (see correctness properties above)
- Claim state transitions
- Time-based constraints
- Statistics accuracy

### E2E Tests
- Complete donor journey (login → dashboard → create listing → accept claim)
- Mobile responsive behavior
- Photo upload and preview
- Map interaction

---

## Dependencies

### Frontend
- `react-dropzone` - Photo upload
- `@googlemaps/react-wrapper` or `react-map-gl` - Map integration
- `date-fns` - Date/time utilities
- `react-hook-form` - Form management
- `zod` - Schema validation
- `framer-motion` - Animations

### Backend
- `multer` or `busboy` - File upload handling
- `sharp` - Image compression
- `aws-sdk` - S3 upload (or local storage for demo)
- `node-cron` - Claim timeout job

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Photo upload failures | High | Medium | Retry logic, fallback to URL input, allow listing without photos |
| Map API quota exceeded | High | Low | Implement caching, fallback to manual address entry |
| Claim notification delays | Medium | Medium | Use WebSocket for real-time updates, fallback to polling |
| AI prediction model unavailable | Low | Medium | Show generic message, don't block listing creation |
| Wizard abandonment | Medium | High | Save drafts automatically, allow resuming later |

---

## Future Enhancements

1. **Recurring Listings**: Template system for donors who donate regularly
2. **Bulk Upload**: Create multiple listings at once
3. **QR Code Pickup**: Generate QR code for contactless pickup confirmation
4. **Live Chat**: Real-time messaging between donor and receiver
5. **Calendar Integration**: Sync pickup times with Google Calendar
6. **Voice Input**: Dictate listing details instead of typing
7. **Smart Suggestions**: Auto-fill based on past listings

---

## Acceptance Checklist

- [ ] All user stories implemented with acceptance criteria met
- [ ] Dashboard displays accurate real-time statistics
- [ ] Multi-step wizard completes successfully with all validations
- [ ] Photos upload and display correctly
- [ ] Map integration works with location selection
- [ ] Claim queue updates in real-time
- [ ] Accept/reject claim flow works correctly
- [ ] Auto-rejection after 15 minutes functions properly
- [ ] All correctness properties validated with property-based tests
- [ ] Mobile responsive on iOS and Android
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Performance benchmarks met (< 2s dashboard load)
- [ ] Security audit passed (no XSS, CSRF vulnerabilities)

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-01  
**Status**: Ready for Design Phase
