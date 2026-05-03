# Implementation Plan: Donor Dashboard & Food Listing System

## Overview

This implementation plan breaks down the donor dashboard and food listing system into discrete, sequential coding tasks. The system includes a real-time dashboard with impact statistics, a 5-step listing creation wizard with photo upload and map integration, listing management capabilities, and a claim queue system with auto-rejection.

**Feature**: donor-dashboard-listing-system  
**Language**: TypeScript  
**Framework**: Express.js + PostgreSQL + Redis + Socket.IO  
**Testing**: Jest + fast-check (property-based testing)

## Tasks

- [x] 1. Set up database schema and migrations
  - Create `food_listings` table with all fields (title, description, food_types, quantity, dietary flags, allergens, photos, location, timing, status)
  - Create `claims` table with status tracking and pickup codes
  - Create `donor_stats` table for aggregated statistics
  - Create `listing_drafts` table for wizard state persistence
  - Add PostGIS extension for geography points
  - Create indexes for performance (donor_id, status, pickup_by, location GIST, created_at)
  - Add constraints (valid_time_window, valid_coordinates, unique_pending_claim)
  - Write migration files in `backend/migrations/`
  - _Requirements: US-1.1, US-1.2, US-1.3, US-2.1-2.6, US-3.1-3.3, US-4.1-4.4_

- [x] 2. Implement core data models and validation
  - [x] 2.1 Create TypeScript interfaces and types
    - Define `Listing`, `Claim`, `DonorStats`, `Draft` interfaces
    - Define enums: `FoodType`, `QuantityUnit`, `Allergen`, `ListingStatus`, `ClaimStatus`
    - Define DTOs: `CreateListingDTO`, `UpdateListingDTO`, `ListingFilters`
    - Create type guards and validation helpers
    - _Requirements: US-2.2, US-2.3, US-2.4_

  - [ ]* 2.2 Write property test for data model validation
    - **Property 15: Title Length Constraint** - Title must be 1-100 characters
    - **Property 16: Description Length Constraint** - Description must be ≤500 characters
    - **Property 17: Quantity Positivity** - Quantity must be > 0
    - **Property 18: Food Type Selection** - At least one food type required
    - **Property 19: Dietary Consistency** - Vegan listings cannot have dairy/eggs allergens
    - **Property 20: Coordinate Validity** - Lat: -90 to 90, Lng: -180 to 180
    - **Validates: Requirements US-2.2.1, US-2.2.2, US-2.2.3, US-2.2.4, US-2.2.5, US-2.3.1**

  - [x] 2.3 Implement validation middleware
    - Create Joi schemas for listing creation, update, claim actions
    - Implement validation middleware using Joi
    - Add custom validators for time windows, dietary consistency, coordinates
    - Create error response formatter
    - _Requirements: US-2.2, US-2.3, US-2.4_

- [x] 3. Implement Photo Service
  - [x] 3.1 Create photo upload and compression logic
    - Implement multer configuration for file uploads
    - Create Sharp-based image compression (max 1920px width, quality 85%)
    - Generate thumbnails (300x300)
    - Implement S3 upload with proper folder structure
    - Return photo URLs and metadata
    - _Requirements: US-2.1.1, US-2.1.2, US-2.1.3, US-2.1.6_

  - [ ]* 3.2 Write property tests for photo validation
    - **Property 10: Photo Count Limit** - Max 6 photos per listing
    - **Property 11: Photo Size Limit** - Each photo ≤10MB
    - **Property 12: Photo Format Validation** - Only jpg, jpeg, png, heic
    - **Property 13: Cover Photo Assignment** - Exactly one cover photo if photos exist
    - **Property 14: Photo Compression** - Compressed width ≤1920px
    - **Validates: Requirements US-2.1.1, US-2.1.2, US-2.1.3, US-2.1.5, US-2.1.6**

  - [x] 3.2 Implement photo management endpoints
    - POST `/api/v1/listings/:id/photos` - Upload photos
    - DELETE `/api/v1/listings/:id/photos/:photoId` - Delete photo
    - PUT `/api/v1/listings/:id/photos/reorder` - Reorder photos
    - Add error handling for upload failures with retry logic
    - _Requirements: US-2.1.4, US-2.1.7_

- [x] 4. Implement Listing Service
  - [x] 4.1 Create listing CRUD operations
    - Implement `createListing(donorId, data)` with transaction support
    - Implement `updateListing(listingId, donorId, data)` with edit permission check
    - Implement `cancelListing(listingId, donorId, reason)` with claim rejection
    - Implement `getListing(listingId)` with computed fields (timeRemaining, isUrgent)
    - Implement `getListings(filters)` with pagination and sorting
    - Add PostGIS queries for location-based filtering
    - _Requirements: US-2.2, US-2.3, US-2.4, US-3.1, US-3.2, US-3.3_

  - [ ]* 4.2 Write property tests for listing business rules
    - **Property 22: Time Window Ordering** - pickup_by > ready_from
    - **Property 23: Minimum Time Window** - pickup_by - ready_from ≥1 hour
    - **Property 24: Maximum Time Window for Cooked Food** - Cooked food ≤24 hours
    - **Property 21: Address Completeness** - Address has street, city, postal code
    - **Property 32: Edit Permission** - Can edit only if no accepted claims
    - **Property 33: Immutable Fields on Edit** - id, donor_id, created_at unchanged
    - **Validates: Requirements US-2.4.2, US-2.4.3, US-2.4.4, US-2.3.3, US-3.2.1, US-3.2.3**

  - [x] 4.3 Implement draft save/resume functionality
    - Implement `saveDraft(donorId, data, currentStep)` with JSONB storage
    - Implement `resumeDraft(draftId)` with expiration check (7 days)
    - Implement `deleteDraft(draftId)` on listing creation
    - Add one-draft-per-donor constraint enforcement
    - _Requirements: US-2.6.6, US-2.6.7, US-2.6.9_

  - [ ]* 4.4 Write property tests for listing filters and sorting
    - **Property 29: Listing Filter Correctness** - Filtered results match criteria
    - **Property 30: Listing Sort Order** - Results ordered by sort criteria
    - **Property 31: Listing Ownership** - Only show donor's own listings
    - **Validates: Requirements US-3.1.1, US-3.1.2, US-3.1.4**

- [x] 5. Checkpoint - Ensure listing service tests pass
  - Run all unit tests and property tests for listing service
  - Verify database migrations applied successfully
  - Test photo upload and compression manually
  - Ensure all tests pass, ask the user if questions arise

- [x] 6. Implement Claim Service
  - [x] 6.1 Create claim management operations
    - Implement `acceptClaim(claimId, donorId)` with atomic transaction
    - Auto-reject other pending claims on same listing
    - Generate 6-digit pickup code
    - Update listing status to 'claimed'
    - Implement `rejectClaim(claimId, donorId, reason)` with notification
    - Implement `getPendingClaims(donorId)` with receiver details
    - Implement `getClaimDetails(claimId)` with distance calculation
    - _Requirements: US-4.1, US-4.2, US-4.3_

  - [ ]* 6.2 Write property tests for claim state machine
    - **Property 40: Single Accepted Claim Per Listing** - Max 1 accepted claim
    - **Property 41: Auto-Rejection on Claim Acceptance** - Other pending → rejected
    - **Property 42: Pickup Code Format** - 6-digit numeric code
    - **Property 43: Listing Status on Claim Acceptance** - Listing → 'claimed'
    - **Property 44: Claim State Transition Constraints** - Prohibited transitions
    - **Validates: Requirements US-4.2.1, US-4.2.2, US-4.2.3, US-4.2.4, US-4.3.2, US-4.3.3**

  - [x] 6.3 Implement auto-rejection cron job
    - Create node-cron job running every 1 minute
    - Query claims with `status='pending' AND created_at < NOW() - 15 minutes`
    - Batch update claims to 'auto_rejected' with reason
    - Trigger notifications for affected receivers and donors
    - Add job monitoring and error handling
    - _Requirements: US-4.4.1, US-4.4.2_

  - [ ]* 6.4 Write property tests for auto-rejection
    - **Property 9: Auto-Rejection Timeout** - Claims >15min → auto_rejected
    - **Property 45: Auto-Rejection Reason** - Reason is "Donor did not respond in time"
    - **Property 6: Time Remaining Accuracy** - time_remaining = deadline - now
    - **Validates: Requirements US-4.4.1, US-4.4.2, US-4.4.3**

  - [x] 6.5 Implement claim validation properties
    - Add database-level locking (SELECT FOR UPDATE) for race conditions
    - Implement optimistic locking with version field
    - Add idempotency keys for claim acceptance
    - _Requirements: US-4.2.1_

  - [ ]* 6.6 Write property tests for claim details
    - **Property 37: Claimant Rating Range** - Rating 0-5
    - **Property 38: Claimant Reliability Score Range** - Score 0-100
    - **Property 39: Distance Calculation Accuracy** - Haversine distance
    - **Validates: Requirements US-4.1.1, US-4.1.2, US-4.1.3**

- [ ] 7. Implement Dashboard Service
  - [ ] 7.1 Create statistics calculation logic
    - Implement `calculateStatistics(donorId)` aggregating from completed listings
    - Calculate total meals donated (sum of quantities)
    - Calculate total kg saved (convert quantities to kg)
    - Calculate CO₂ prevented (meals * 2.5 kg)
    - Calculate unique receivers helped (distinct receiver IDs)
    - Calculate current streak (consecutive days with active listings)
    - Calculate longest streak from historical data
    - _Requirements: US-1.1.1, US-1.1.2, US-1.1.3, US-1.1.4, US-1.1.5_

  - [ ]* 7.2 Write property tests for statistics accuracy
    - **Property 1: Statistics Accuracy - Meals Donated** - Sum of completed listings
    - **Property 2: Statistics Accuracy - CO₂ Calculation** - meals * 2.5
    - **Property 3: Statistics Accuracy - Unique Receivers** - Distinct receiver count
    - **Property 4: Streak Calculation Correctness** - Consecutive days algorithm
    - **Validates: Requirements US-1.1.1, US-1.1.2, US-1.1.3, US-1.1.4, US-1.1.5**

  - [ ] 7.3 Implement dashboard data aggregation
    - Implement `getDashboardData(donorId)` with parallel queries
    - Fetch statistics (with 5min Redis cache)
    - Fetch active listings (status: available, claimed, in_progress)
    - Fetch pending claims with receiver details
    - Identify urgent listings (< 2 hours remaining)
    - Return aggregated `DashboardData` object
    - _Requirements: US-1.2, US-1.3_

  - [ ]* 7.4 Write property tests for dashboard data
    - **Property 5: Active Listings Filter** - Status in {available, claimed, in_progress}
    - **Property 7: Urgency Classification** - Urgent if <2 hours remaining
    - **Property 8: Pending Claims Count Accuracy** - Count of pending claims
    - **Validates: Requirements US-1.2.1, US-1.2.5, US-1.3.1**

  - [ ] 7.5 Implement caching strategy
    - Cache statistics in Redis with 5min TTL
    - Cache active listings with 2min TTL
    - Invalidate caches on listing completion/cancellation
    - No cache for pending claims (real-time)
    - _Requirements: US-1.1.6_

- [ ] 8. Implement Prediction Service
  - [ ] 8.1 Create claim prediction logic
    - Implement `predictClaims(listing)` with ML model integration
    - Extract features: location density, food type popularity, quantity, time of day, day of week
    - Query historical data for similar listings
    - Calculate prediction range (min/max claims)
    - Determine confidence level (high/medium/low)
    - Identify contributing factors
    - Implement fallback to generic message if model unavailable
    - _Requirements: US-2.5.1, US-2.5.2, US-2.5.3, US-2.5.4_

  - [ ]* 8.2 Write property tests for predictions
    - **Property 25: Prediction Range Validity** - min ≥0, max ≥min
    - **Property 26: Prediction Confidence Values** - Confidence in {high, medium, low}
    - **Validates: Requirements US-2.5.1, US-2.5.2**

- [ ] 9. Checkpoint - Ensure all services tests pass
  - Run all unit tests and property tests for claim, dashboard, and prediction services
  - Verify cron job executes correctly
  - Test statistics calculations with sample data
  - Ensure all tests pass, ask the user if questions arise

- [ ] 10. Implement API routes and controllers
  - [ ] 10.1 Create listing routes
    - POST `/api/v1/listings` - Create listing (with auth middleware)
    - GET `/api/v1/listings` - Get listings with filters
    - GET `/api/v1/listings/:id` - Get listing details
    - PUT `/api/v1/listings/:id` - Update listing
    - DELETE `/api/v1/listings/:id` - Cancel listing
    - Add rate limiting (10 listings per hour per donor)
    - Add validation middleware for all routes
    - _Requirements: US-2.1-2.6, US-3.1-3.3_

  - [ ] 10.2 Create claim routes
    - GET `/api/v1/listings/:id/claims` - Get claims for listing
    - PUT `/api/v1/claims/:id/accept` - Accept claim
    - PUT `/api/v1/claims/:id/reject` - Reject claim
    - Add authorization checks (only listing owner can accept/reject)
    - _Requirements: US-4.1-4.3_

  - [ ] 10.3 Create dashboard routes
    - GET `/api/v1/donors/me/dashboard` - Get complete dashboard data
    - GET `/api/v1/donors/me/stats` - Get statistics only
    - GET `/api/v1/donors/me/listings` - Get donor's listings
    - GET `/api/v1/donors/me/claims/pending` - Get pending claims
    - Add caching headers for appropriate routes
    - _Requirements: US-1.1, US-1.2, US-1.3_

  - [ ] 10.4 Create prediction routes
    - POST `/api/v1/predictions/claims` - Get claim prediction
    - Add request body validation
    - Handle prediction service failures gracefully
    - _Requirements: US-2.5_

  - [ ] 10.5 Create draft routes
    - POST `/api/v1/drafts` - Save draft
    - GET `/api/v1/drafts/:id` - Resume draft
    - DELETE `/api/v1/drafts/:id` - Delete draft
    - _Requirements: US-2.6.6, US-2.6.7_

- [ ] 11. Implement WebSocket real-time updates
  - [ ] 11.1 Set up Socket.IO server
    - Initialize Socket.IO with Express server
    - Implement authentication middleware for WebSocket connections
    - Create room-based architecture (donor rooms, listing rooms)
    - _Requirements: US-1.2.6, US-1.3.6_

  - [ ] 11.2 Implement dashboard event emitters
    - Emit `claim:created` when new claim arrives
    - Emit `claim:accepted` when claim accepted
    - Emit `claim:rejected` when claim rejected
    - Emit `claim:expired` when claim auto-rejected
    - Emit `listing:updated` when listing edited
    - Emit `stats:updated` when statistics change
    - Join donors to their personal rooms on connection
    - _Requirements: US-1.1.6, US-1.3.6_

  - [ ] 11.3 Integrate WebSocket with services
    - Add WebSocket emit calls in claim service (accept, reject, auto-reject)
    - Add WebSocket emit calls in listing service (create, update, cancel)
    - Add WebSocket emit calls in dashboard service (stats update)
    - _Requirements: US-1.2.6, US-1.3.6_

- [ ] 12. Implement Notification Service
  - [ ] 12.1 Create multi-channel notification system
    - Implement push notification via Firebase Cloud Messaging (FCM)
    - Implement SMS notification via Twilio (fallback for critical events)
    - Create notification templates for each event type
    - Implement notification priority and channel selection logic
    - _Requirements: US-4.2.2, US-4.2.3, US-4.3.2, US-4.4.2_

  - [ ] 12.2 Integrate notifications with claim service
    - Send notification on claim acceptance (to accepted receiver)
    - Send notification on claim rejection (to rejected receivers)
    - Send notification on claim expiration (to receiver and donor)
    - Send notification on listing update (to pending claimants)
    - _Requirements: US-3.2.4, US-4.2.2, US-4.2.3, US-4.3.2, US-4.4.2_

- [ ] 13. Implement error handling and logging
  - [ ] 13.1 Create comprehensive error handling
    - Implement error classes (ValidationError, AuthorizationError, NotFoundError, ConflictError)
    - Create global error handler middleware
    - Implement error response formatter with proper status codes
    - Add retry logic for external service failures (S3, ML model)
    - Implement circuit breaker for external services
    - _Requirements: All user stories (error handling)_

  - [ ] 13.2 Set up logging infrastructure
    - Configure Winston logger with multiple transports
    - Log all errors with context (user ID, request ID, stack trace)
    - Log critical operations (claim acceptance, listing creation)
    - Add request/response logging with Morgan
    - Create log rotation policy
    - _Requirements: All user stories (observability)_

- [ ] 14. Implement cancellation business logic
  - [ ] 14.1 Create cancellation workflow
    - Implement cancellation permission check (not in_progress, not completed)
    - Store cancellation reason and timestamp
    - Auto-reject all pending claims with notifications
    - Notify accepted claim holder immediately
    - Update listing status to 'cancelled'
    - Track cancellation count per donor
    - _Requirements: US-3.3.1, US-3.3.2, US-3.3.3, US-3.3.4_

  - [ ]* 14.2 Write property tests for cancellation
    - **Property 34: Cancellation Permission** - Can cancel if not in_progress/completed
    - **Property 35: Claim Rejection on Cancellation** - Pending claims → rejected
    - **Property 36: Cancellation Status Transition** - Listing → 'cancelled'
    - **Validates: Requirements US-3.3.1, US-3.3.2, US-3.3.3**

- [ ] 15. Checkpoint - Ensure API integration tests pass
  - Write integration tests for complete flows (listing creation, claim acceptance, cancellation)
  - Test WebSocket events are emitted correctly
  - Test notifications are sent via all channels
  - Verify error handling for all edge cases
  - Ensure all tests pass, ask the user if questions arise

- [ ] 16. Implement wizard step validation and navigation
  - [ ] 16.1 Create step validation logic
    - Implement validation for Step 1 (photos): optional but max 6, valid formats
    - Implement validation for Step 2 (details): required fields, constraints
    - Implement validation for Step 3 (location): valid coordinates, address completeness
    - Implement validation for Step 4 (timing): time window constraints
    - Implement validation for Step 5 (prediction): no validation, display only
    - _Requirements: US-2.1-2.5, US-2.6.1_

  - [ ]* 16.2 Write property tests for wizard navigation
    - **Property 27: Wizard Step Progression** - Can proceed if step valid
    - **Property 28: Wizard Data Preservation** - Data preserved on back navigation
    - **Validates: Requirements US-2.6.1, US-2.6.2**

- [ ] 17. Implement performance optimizations
  - [ ] 17.1 Add database query optimizations
    - Create composite indexes for common query patterns
    - Implement query result pagination with cursor-based pagination
    - Add database connection pooling configuration
    - Optimize PostGIS queries with spatial indexes
    - _Requirements: Performance NFR_

  - [ ] 17.2 Implement caching strategy
    - Cache dashboard statistics (5min TTL)
    - Cache active listings (2min TTL)
    - Cache prediction results (10min TTL per listing)
    - Implement cache invalidation on data changes
    - Use Redis for all caching
    - _Requirements: Performance NFR_

  - [ ] 17.3 Add API response compression
    - Enable gzip compression for all API responses
    - Implement response size monitoring
    - _Requirements: Performance NFR_

- [ ] 18. Implement security measures
  - [ ] 18.1 Add authentication and authorization
    - Verify JWT tokens on all protected routes
    - Implement role-based access control (donor vs receiver)
    - Add ownership checks (donors can only edit their own listings)
    - _Requirements: Security NFR_

  - [ ] 18.2 Add input sanitization and validation
    - Sanitize all text inputs to prevent XSS
    - Validate file uploads (type, size, content)
    - Add CSRF token validation for state-changing operations
    - Implement rate limiting (10 listings/hour, 100 claims/hour)
    - _Requirements: Security NFR_

  - [ ] 18.3 Add security headers
    - Configure Helmet.js for security headers
    - Set up CORS with whitelist
    - Add Content Security Policy
    - _Requirements: Security NFR_

- [ ] 19. Write integration tests for complete flows
  - [ ]* 19.1 Test complete listing creation flow
    - Test 5-step wizard completion with all validations
    - Test photo upload and compression
    - Test draft save and resume
    - Test listing appears on dashboard after creation
    - _Requirements: US-2.1-2.6_

  - [ ]* 19.2 Test claim management flow
    - Test claim acceptance with auto-rejection of others
    - Test claim rejection with notification
    - Test auto-rejection cron job
    - Test pickup code generation
    - _Requirements: US-4.1-4.4_

  - [ ]* 19.3 Test dashboard real-time updates
    - Test statistics update on listing completion
    - Test active listings update on status change
    - Test pending claims update via WebSocket
    - _Requirements: US-1.1-1.3_

  - [ ]* 19.4 Test listing management flow
    - Test listing edit with permission check
    - Test listing cancellation with claim rejection
    - Test listing filters and sorting
    - _Requirements: US-3.1-3.3_

- [ ] 20. Final checkpoint - Complete system verification
  - Run full test suite (unit, property, integration)
  - Verify all 45 correctness properties pass
  - Test all API endpoints with Postman/Insomnia
  - Verify WebSocket events work correctly
  - Test cron job execution
  - Verify database constraints and indexes
  - Test error handling for all edge cases
  - Verify caching and performance optimizations
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Integration tests validate end-to-end flows
- Checkpoints ensure incremental validation at key milestones
- All code should follow TypeScript best practices and existing project conventions
- Use existing services (auth, SMS, Redis) where available
- Follow the existing project structure in `backend/src/`

## Testing Summary

**Property-Based Tests**: 45 properties covering:
- Statistics accuracy (4 properties)
- Data validation (11 properties)
- Time constraints (4 properties)
- Claim state machine (7 properties)
- Listing management (6 properties)
- Wizard navigation (2 properties)
- Dashboard data (3 properties)
- Predictions (2 properties)
- Cancellation (3 properties)
- Claim details (3 properties)

**Integration Tests**: 4 major flows:
- Complete listing creation (5-step wizard)
- Claim management (accept, reject, auto-reject)
- Dashboard real-time updates
- Listing management (edit, cancel, filter)

**Unit Tests**: All business logic functions in services

---

**Implementation Language**: TypeScript  
**Total Tasks**: 20 top-level tasks (with 50+ sub-tasks)  
**Estimated Effort**: 3-4 weeks for full implementation  
**Status**: Ready for execution