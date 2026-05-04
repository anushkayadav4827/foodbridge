# Firebase Migration - Requirements

## Overview

Migrate the FoodBridge backend from PostgreSQL + Express (deployed on Render) to Firebase Realtime Database + Cloud Functions for simpler deployment and management.

## Business Requirements

### BR-1: Maintain All Existing Functionality
**Priority**: Critical  
**Description**: All current features must continue to work after migration
- User authentication (OTP-based login)
- Listing management (create, read, update, delete)
- Claim system
- Dashboard statistics
- Photo uploads
- Real-time notifications

### BR-2: Simplify Deployment
**Priority**: Critical  
**Description**: Eliminate deployment complexity
- No separate backend server deployment needed
- Single Firebase project for frontend + backend
- Automatic scaling and availability
- No database server management

### BR-3: Maintain API Compatibility
**Priority**: High  
**Description**: Frontend should work with minimal changes
- Keep same API endpoint structure
- Maintain request/response formats
- Preserve authentication flow

## Technical Requirements

### TR-1: Firebase Realtime Database Schema
**Priority**: Critical  
**Description**: Design NoSQL schema for all data

**Data Structure**:
```
/users/{userId}
  - phone: string
  - name: string
  - email: string
  - role: string
  - createdAt: timestamp
  - karma: number
  - streak: number

/listings/{listingId}
  - donorId: string
  - title: string
  - description: string
  - foodType: string
  - quantity: number
  - expiryDate: timestamp
  - status: string
  - location: object
  - photos: array
  - createdAt: timestamp

/claims/{claimId}
  - listingId: string
  - recipientId: string
  - status: string
  - createdAt: timestamp
  - respondedAt: timestamp

/otps/{phone}
  - code: string
  - expiresAt: timestamp
  - attempts: number
```

### TR-2: Firebase Cloud Functions
**Priority**: Critical  
**Description**: Migrate Express routes to Cloud Functions

**Functions to create**:
- `api` - Main HTTP function handling all API routes
- `autoRejectExpiredClaims` - Scheduled function (cron job)
- `updateKarmaOnClaim` - Triggered function on claim creation

### TR-3: Authentication Migration
**Priority**: Critical  
**Description**: Migrate JWT-based auth to Firebase

**Options**:
- Keep JWT tokens (simpler migration)
- OR migrate to Firebase Authentication custom tokens

**Decision**: Keep JWT for now (less migration work)

### TR-4: File Upload Migration
**Priority**: High  
**Description**: Migrate photo uploads to Firebase Storage

- Replace AWS S3 with Firebase Storage
- Update upload endpoints
- Maintain same file structure

### TR-5: Real-time Features
**Priority**: Medium  
**Description**: Leverage Firebase real-time capabilities

- Replace Socket.io with Firebase Realtime Database listeners
- Automatic updates for listings and claims
- Simpler implementation

## Migration Strategy

### Phase 1: Setup Firebase Services
1. Enable Firebase Realtime Database
2. Enable Firebase Cloud Functions
3. Enable Firebase Storage
4. Configure security rules

### Phase 2: Create Database Layer
1. Create Firebase database service
2. Implement CRUD operations for all entities
3. Test database operations

### Phase 3: Migrate API Endpoints
1. Convert Express routes to Cloud Functions
2. Update controllers to use Firebase DB
3. Test all endpoints

### Phase 4: Deploy and Test
1. Deploy Cloud Functions
2. Update frontend API URL
3. Test end-to-end functionality

### Phase 5: Cleanup
1. Remove PostgreSQL dependencies
2. Remove unused code
3. Update documentation

## Success Criteria

- ✅ All existing features work correctly
- ✅ Frontend requires minimal changes (only API URL)
- ✅ Backend deployed to Firebase Cloud Functions
- ✅ Database uses Firebase Realtime Database
- ✅ File uploads use Firebase Storage
- ✅ No separate backend server needed
- ✅ Deployment is simple (single command)

## Out of Scope

- Migrating existing production data (fresh start)
- Changing frontend architecture
- Adding new features during migration
- Performance optimization (can be done later)

## Risks and Mitigation

### Risk 1: Data Model Complexity
**Impact**: High  
**Mitigation**: Design schema carefully, use denormalization where needed

### Risk 2: Query Limitations
**Impact**: Medium  
**Mitigation**: Restructure data for common queries, use indexes

### Risk 3: Cold Start Latency
**Impact**: Low  
**Mitigation**: Firebase Cloud Functions have minimal cold starts on free tier

## Timeline Estimate

- Phase 1: 30 minutes
- Phase 2: 2 hours
- Phase 3: 2 hours
- Phase 4: 30 minutes
- Phase 5: 30 minutes

**Total**: ~5-6 hours of implementation

## Dependencies

- Firebase project already created: `foodbridge-app-51332`
- Firebase CLI installed
- Node.js and npm installed
- Existing backend code in `backend/` folder

## Notes

- This migration will make deployment much simpler
- No more database server management
- No more backend server deployment issues
- Everything in one Firebase project
- Free tier is generous for testing/hobby projects
