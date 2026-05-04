# Firebase Migration - Implementation Tasks

## Phase 1: Firebase Setup

### Task 1.1: Enable Firebase Services
- [x] 1.1.1 Enable Firebase Realtime Database in Firebase Console
- [x] 1.1.2 Enable Firebase Cloud Functions
- [x] 1.1.3 Enable Firebase Storage
- [x] 1.1.4 Install Firebase Admin SDK in backend

### Task 1.2: Configure Firebase Security Rules
- [ ] 1.2.1 Create Realtime Database security rules
- [ ] 1.2.2 Create Storage security rules
- [ ] 1.2.3 Deploy security rules

## Phase 2: Database Layer Migration

### Task 2.1: Create Firebase Database Service
- [x] 2.1.1 Create `backend/src/database/firebase.ts` with Firebase Admin initialization
- [ ] 2.1.2 Create database helper functions (get, set, update, delete, query)
- [x] 2.1.3 Add TypeScript interfaces for data models

### Task 2.2: Migrate User Operations
- [x] 2.2.1 Create `backend/src/services/firebase/user.service.ts`
- [ ] 2.2.2 Implement createUser, getUser, updateUser, deleteUser
- [ ] 2.2.3 Implement getUserByPhone

### Task 2.3: Migrate Listing Operations
- [x] 2.3.1 Create `backend/src/services/firebase/listing.service.ts`
- [ ] 2.3.2 Implement createListing, getListing, updateListing, deleteListing
- [ ] 2.3.3 Implement getListings with filtering (status, foodType, location)
- [ ] 2.3.4 Implement getDonorListings

### Task 2.4: Migrate Claim Operations
- [x] 2.4.1 Create `backend/src/services/firebase/claim.service.ts`
- [ ] 2.4.2 Implement createClaim, getClaim, updateClaim
- [ ] 2.4.3 Implement getClaimsByListing, getClaimsByRecipient
- [ ] 2.4.4 Implement autoRejectExpiredClaims logic

### Task 2.5: Migrate OTP Operations
- [x] 2.5.1 Create `backend/src/services/firebase/otp.service.ts`
- [ ] 2.5.2 Implement storeOTP, verifyOTP, deleteOTP
- [ ] 2.5.3 Implement OTP expiry and attempt tracking

## Phase 3: Cloud Functions Migration

### Task 3.1: Setup Cloud Functions Project
- [x] 3.1.1 Initialize Firebase Functions in `functions/` directory
- [ ] 3.1.2 Copy necessary backend code to functions
- [ ] 3.1.3 Update package.json with dependencies
- [ ] 3.1.4 Configure TypeScript for Cloud Functions

### Task 3.2: Create Main API Function
- [ ] 3.2.1 Create `functions/src/index.ts` with Express app
- [ ] 3.2.2 Import all routes from backend
- [ ] 3.2.3 Export `api` HTTP function
- [ ] 3.2.4 Configure CORS for Firebase Hosting

### Task 3.3: Migrate Authentication Endpoints
- [ ] 3.3.1 Migrate POST /auth/send-otp
- [ ] 3.3.2 Migrate POST /auth/verify-otp
- [ ] 3.3.3 Migrate POST /auth/refresh-token
- [ ] 3.3.4 Test authentication flow

### Task 3.4: Migrate Listing Endpoints
- [ ] 3.4.1 Migrate GET /listings
- [ ] 3.4.2 Migrate GET /listings/:id
- [ ] 3.4.3 Migrate POST /listings
- [ ] 3.4.4 Migrate PATCH /listings/:id
- [ ] 3.4.5 Migrate DELETE /listings/:id
- [ ] 3.4.6 Test all listing endpoints

### Task 3.5: Migrate Claim Endpoints
- [ ] 3.5.1 Migrate POST /listings/:id/claims
- [ ] 3.5.2 Migrate GET /claims/:id
- [ ] 3.5.3 Migrate PATCH /claims/:id/accept
- [ ] 3.5.4 Migrate PATCH /claims/:id/reject
- [ ] 3.5.5 Test all claim endpoints

### Task 3.6: Migrate Photo Upload
- [ ] 3.6.1 Create Firebase Storage service
- [ ] 3.6.2 Migrate POST /photos/upload to use Firebase Storage
- [ ] 3.6.3 Update photo URL generation
- [ ] 3.6.4 Test photo upload

### Task 3.7: Create Scheduled Functions
- [ ] 3.7.1 Create `autoRejectExpiredClaims` scheduled function (runs every 1 minute)
- [ ] 3.7.2 Test scheduled function locally
- [ ] 3.7.3 Deploy and verify scheduled function

## Phase 4: Deployment and Testing

### Task 4.1: Deploy Cloud Functions
- [x] 4.1.1 Build Cloud Functions: `npm run build`
- [x] 4.1.2 Deploy functions: `firebase deploy --only functions`
- [ ] 4.1.3 Verify deployment in Firebase Console
- [ ] 4.1.4 Get Cloud Function URL

### Task 4.2: Update Frontend Configuration
- [ ] 4.2.1 Update `web/.env.production` with Cloud Function URL
- [ ] 4.2.2 Rebuild frontend: `npm run build`
- [ ] 4.2.3 Redeploy frontend: `firebase deploy --only hosting`

### Task 4.3: End-to-End Testing
- [ ] 4.3.1 Test user registration and login
- [ ] 4.3.2 Test listing creation
- [ ] 4.3.3 Test listing retrieval and filtering
- [ ] 4.3.4 Test claim creation and management
- [ ] 4.3.5 Test photo upload
- [ ] 4.3.6 Test dashboard statistics
- [ ] 4.3.7 Verify scheduled function runs correctly

### Task 4.4: Performance Testing
- [ ] 4.4.1 Test API response times
- [ ] 4.4.2 Test with multiple concurrent users
- [ ] 4.4.3 Verify cold start times are acceptable

## Phase 5: Cleanup and Documentation

### Task 5.1: Remove PostgreSQL Dependencies
- [ ] 5.1.1 Remove `pg` and `pg-pool` from package.json
- [ ] 5.1.2 Remove PostgreSQL connection code
- [ ] 5.1.3 Remove database migrations folder
- [ ] 5.1.4 Remove PostgreSQL-related environment variables

### Task 5.2: Update Documentation
- [ ] 5.2.1 Update README.md with Firebase setup instructions
- [ ] 5.2.2 Create FIREBASE_DEPLOYMENT.md guide
- [ ] 5.2.3 Update ARCHITECTURE.md with new architecture
- [ ] 5.2.4 Document Firebase database schema

### Task 5.3: Code Cleanup
- [ ] 5.3.1 Remove unused imports
- [ ] 5.3.2 Remove commented-out PostgreSQL code
- [ ] 5.3.3 Update TypeScript types
- [ ] 5.3.4 Run linter and fix issues

## Success Criteria Checklist

- [ ] All API endpoints work correctly
- [ ] Frontend connects to Cloud Functions successfully
- [ ] User authentication works (OTP login)
- [ ] Listings can be created, read, updated, deleted
- [ ] Claims can be created and managed
- [ ] Photos can be uploaded
- [ ] Dashboard shows correct statistics
- [ ] Scheduled function auto-rejects expired claims
- [ ] No PostgreSQL dependencies remain
- [ ] Documentation is updated
- [ ] Code is clean and well-organized

## Estimated Time per Phase

- Phase 1: 30 minutes
- Phase 2: 2 hours
- Phase 3: 2 hours
- Phase 4: 30 minutes
- Phase 5: 30 minutes

**Total**: ~5-6 hours

## Notes

- Test each phase thoroughly before moving to the next
- Keep the old backend code as backup until migration is complete
- Deploy incrementally to catch issues early
- Monitor Firebase usage to stay within free tier limits
