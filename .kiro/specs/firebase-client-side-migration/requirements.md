# Requirements Document: Firebase Client-Side Migration

## Introduction

This document specifies the requirements for migrating the FoodBridge application from a Node.js/Express backend with PostgreSQL to a client-side architecture using Firebase services directly from the React frontend. The migration must maintain all existing features while staying within Firebase's FREE Spark plan limits (no Cloud Functions, no credit card required).

The current architecture consists of:
- React frontend deployed to Firebase Hosting (https://foodbridge-app-51332.web.app)
- Node.js/Express backend with PostgreSQL database
- REST API endpoints for authentication, listings, claims, and photos

The target architecture will:
- React frontend with Firebase Client SDK
- Firebase Authentication for phone OTP login
- Firebase Realtime Database for data storage
- Firebase Storage for photo uploads
- Firebase Security Rules for data protection
- No backend server or Cloud Functions

## Glossary

- **FoodBridge_App**: The React web application running in the user's browser
- **Firebase_Auth**: Firebase Authentication service for phone number OTP verification
- **Firebase_Database**: Firebase Realtime Database for storing users, listings, and claims
- **Firebase_Storage**: Firebase Cloud Storage for storing food listing photos
- **Security_Rules**: Firebase Security Rules that enforce access control at the database and storage level
- **Firebase_SDK**: Firebase JavaScript Client SDK integrated into the React application
- **Auth_Service**: Frontend service layer that wraps Firebase Authentication operations
- **Database_Service**: Frontend service layer that wraps Firebase Realtime Database operations
- **Storage_Service**: Frontend service layer that wraps Firebase Storage operations
- **User**: A person using the FoodBridge application (donor or recipient)
- **Donor**: A user who creates food listings to donate
- **Recipient**: A user who claims food listings
- **Listing**: A food donation post created by a donor
- **Claim**: A request from a recipient to receive a specific listing
- **OTP**: One-Time Password sent via SMS for authentication
- **Pickup_Code**: A 6-digit code generated when a claim is accepted, used to verify pickup
- **Dashboard**: The donor's view showing their listings, claims, and statistics
- **Session**: An authenticated user session maintained by Firebase Authentication
- **Spark_Plan**: Firebase's free tier with no credit card required

## Requirements

### Requirement 1: Firebase Client SDK Integration

**User Story:** As a developer, I want to integrate the Firebase Client SDK into the React application, so that the frontend can communicate directly with Firebase services.

#### Acceptance Criteria

1. THE FoodBridge_App SHALL install the Firebase JavaScript SDK (firebase package version 9 or higher)
2. THE FoodBridge_App SHALL initialize Firebase with the project configuration (API key, project ID, database URL, storage bucket)
3. THE FoodBridge_App SHALL create an Auth_Service module that wraps Firebase Authentication operations
4. THE FoodBridge_App SHALL create a Database_Service module that wraps Firebase Realtime Database operations
5. THE FoodBridge_App SHALL create a Storage_Service module that wraps Firebase Storage operations
6. THE FoodBridge_App SHALL use environment variables for Firebase configuration values

### Requirement 2: Phone Number Authentication

**User Story:** As a user, I want to log in using my phone number with OTP verification, so that I can access the application securely without a password.

#### Acceptance Criteria

1. WHEN a User enters a phone number, THE Auth_Service SHALL send an OTP via Firebase Authentication
2. WHEN a User enters the OTP code, THE Auth_Service SHALL verify the code with Firebase Authentication
3. IF the OTP verification succeeds, THEN THE Auth_Service SHALL create or retrieve the User record from Firebase_Database
4. IF the OTP verification succeeds, THEN THE Auth_Service SHALL establish an authenticated Session
5. THE Auth_Service SHALL store the authentication token in browser local storage
6. WHEN a User refreshes the page, THE Auth_Service SHALL restore the Session from the stored token
7. WHEN a User logs out, THE Auth_Service SHALL clear the Session and remove the stored token
8. IF the OTP verification fails, THEN THE Auth_Service SHALL display an error message to the User

### Requirement 3: User Data Management

**User Story:** As a user, I want my profile information stored securely, so that I can maintain my identity across sessions.

#### Acceptance Criteria

1. WHEN a new User completes OTP verification, THE Database_Service SHALL create a User record in Firebase_Database at path `/users/{userId}`
2. THE User record SHALL contain fields: id, phoneNumber, fullName, profilePhotoUrl, roles, activeRole, verificationTier, createdAt, lastActiveAt
3. WHEN a User completes onboarding, THE Database_Service SHALL update the User record with fullName and other profile details
4. WHEN a User updates their profile, THE Database_Service SHALL update the User record in Firebase_Database
5. THE Database_Service SHALL retrieve User data by userId
6. THE Security_Rules SHALL allow a User to read and write only their own User record

### Requirement 4: Food Listing Creation

**User Story:** As a donor, I want to create food listings with details about the food, location, and timing, so that recipients can find and claim my donations.

#### Acceptance Criteria

1. WHEN a Donor submits a new Listing, THE Database_Service SHALL create a Listing record in Firebase_Database at path `/listings/{listingId}`
2. THE Listing record SHALL contain fields: id, donorId, title, description, foodTypes, quantityValue, quantityUnit, isVegetarian, isVegan, isHalal, isKosher, isGlutenFree, allergens, photoUrls, coverPhotoUrl, pickupAddress, pickupLatitude, pickupLongitude, pickupInstructions, readyFrom, pickupBy, bestBefore, preparationNotes, status, claimCount, viewCount, createdAt, updatedAt
3. THE Database_Service SHALL set the Listing status to "available" upon creation
4. THE Database_Service SHALL generate a unique listingId using Firebase push key generation
5. THE Database_Service SHALL set createdAt and updatedAt timestamps to the current server timestamp
6. THE Security_Rules SHALL allow only authenticated Users to create Listings
7. THE Security_Rules SHALL set the donorId field to the authenticated User's userId

### Requirement 5: Food Listing Retrieval

**User Story:** As a user, I want to view available food listings, so that I can find donations to claim or review my own listings.

#### Acceptance Criteria

1. WHEN a User requests all Listings, THE Database_Service SHALL query Firebase_Database at path `/listings` with filter `status == "available"`
2. WHEN a Donor requests their own Listings, THE Database_Service SHALL query Firebase_Database at path `/listings` with filter `donorId == {userId}`
3. WHEN a User requests a specific Listing, THE Database_Service SHALL retrieve the Listing from Firebase_Database at path `/listings/{listingId}`
4. THE Database_Service SHALL order Listings by createdAt timestamp in descending order (newest first)
5. THE Database_Service SHALL calculate computed fields (timeRemaining, isUrgent) on the client side after retrieval
6. THE Security_Rules SHALL allow all authenticated Users to read Listings with status "available"
7. THE Security_Rules SHALL allow a Donor to read all their own Listings regardless of status

### Requirement 6: Food Listing Updates

**User Story:** As a donor, I want to update my food listings, so that I can correct information or change details before pickup.

#### Acceptance Criteria

1. WHEN a Donor updates a Listing, THE Database_Service SHALL update the Listing record in Firebase_Database at path `/listings/{listingId}`
2. THE Database_Service SHALL update the updatedAt timestamp to the current server timestamp
3. THE Database_Service SHALL allow updates to fields: title, description, foodTypes, quantityValue, quantityUnit, dietary flags, allergens, photoUrls, coverPhotoUrl, pickupAddress, pickupLatitude, pickupLongitude, pickupInstructions, readyFrom, pickupBy, bestBefore, preparationNotes
4. THE Security_Rules SHALL allow a Donor to update only their own Listings
5. THE Security_Rules SHALL prevent updates to fields: id, donorId, status, claimCount, viewCount, createdAt
6. IF the Listing status is not "available" or "draft", THEN THE Database_Service SHALL reject the update

### Requirement 7: Food Listing Cancellation

**User Story:** As a donor, I want to cancel my food listings, so that I can remove donations that are no longer available.

#### Acceptance Criteria

1. WHEN a Donor cancels a Listing, THE Database_Service SHALL update the Listing status to "cancelled"
2. THE Database_Service SHALL set the cancelledAt timestamp to the current server timestamp
3. THE Database_Service SHALL store the cancellationReason provided by the Donor
4. THE Security_Rules SHALL allow a Donor to cancel only their own Listings
5. IF the Listing has accepted Claims, THEN THE Database_Service SHALL reject the cancellation

### Requirement 8: Photo Upload

**User Story:** As a donor, I want to upload photos of my food, so that recipients can see what the donation looks like.

#### Acceptance Criteria

1. WHEN a Donor selects a photo file, THE Storage_Service SHALL upload the file to Firebase_Storage at path `/listings/{donorId}/{timestamp}_{filename}`
2. THE Storage_Service SHALL resize images to a maximum width of 1200 pixels on the client side before upload
3. THE Storage_Service SHALL compress images to reduce file size while maintaining quality
4. WHEN the upload completes, THE Storage_Service SHALL retrieve the download URL from Firebase_Storage
5. THE Storage_Service SHALL return the download URL to the FoodBridge_App
6. THE Security_Rules SHALL allow only authenticated Users to upload files to their own folder path `/listings/{userId}/*`
7. THE Security_Rules SHALL restrict file uploads to image types (image/jpeg, image/png, image/webp)
8. THE Security_Rules SHALL restrict file size to maximum 5MB per file

### Requirement 9: Claim Creation

**User Story:** As a recipient, I want to claim food listings, so that I can request to receive donations.

#### Acceptance Criteria

1. WHEN a Recipient claims a Listing, THE Database_Service SHALL create a Claim record in Firebase_Database at path `/claims/{claimId}`
2. THE Claim record SHALL contain fields: id, listingId, receiverId, message, status, pickupCode, createdAt, respondedAt, completedAt, rejectionReason
3. THE Database_Service SHALL set the Claim status to "pending" upon creation
4. THE Database_Service SHALL increment the Listing claimCount by 1
5. THE Database_Service SHALL generate a unique claimId using Firebase push key generation
6. THE Security_Rules SHALL allow only authenticated Users to create Claims
7. THE Security_Rules SHALL set the receiverId field to the authenticated User's userId
8. THE Security_Rules SHALL prevent a User from creating multiple Claims for the same Listing

### Requirement 10: Claim Acceptance

**User Story:** As a donor, I want to accept claims on my listings, so that I can confirm which recipient will receive the donation.

#### Acceptance Criteria

1. WHEN a Donor accepts a Claim, THE Database_Service SHALL update the Claim status to "accepted"
2. THE Database_Service SHALL generate a 6-digit Pickup_Code and store it in the Claim record
3. THE Database_Service SHALL set the respondedAt timestamp to the current server timestamp
4. THE Database_Service SHALL update the Listing status to "claimed"
5. THE Database_Service SHALL auto-reject all other pending Claims for the same Listing
6. THE Security_Rules SHALL allow a Donor to accept only Claims on their own Listings
7. IF the Claim status is not "pending", THEN THE Database_Service SHALL reject the acceptance

### Requirement 11: Claim Rejection

**User Story:** As a donor, I want to reject claims on my listings, so that I can decline recipients who are not suitable.

#### Acceptance Criteria

1. WHEN a Donor rejects a Claim, THE Database_Service SHALL update the Claim status to "rejected"
2. THE Database_Service SHALL store the rejectionReason provided by the Donor
3. THE Database_Service SHALL set the respondedAt timestamp to the current server timestamp
4. THE Database_Service SHALL decrement the Listing claimCount by 1
5. THE Security_Rules SHALL allow a Donor to reject only Claims on their own Listings
6. IF the Claim status is not "pending", THEN THE Database_Service SHALL reject the rejection

### Requirement 12: Auto-Reject Expired Claims

**User Story:** As a donor, I want claims to be automatically rejected after 24 hours if I don't respond, so that recipients are not left waiting indefinitely.

#### Acceptance Criteria

1. WHEN the FoodBridge_App loads the Dashboard, THE Database_Service SHALL query all pending Claims for the Donor's Listings
2. FOR EACH pending Claim, THE Database_Service SHALL calculate the time elapsed since createdAt
3. IF the elapsed time exceeds 24 hours, THEN THE Database_Service SHALL update the Claim status to "auto_rejected"
4. IF the elapsed time exceeds 24 hours, THEN THE Database_Service SHALL set the respondedAt timestamp to the current server timestamp
5. IF the elapsed time exceeds 24 hours, THEN THE Database_Service SHALL decrement the Listing claimCount by 1
6. THE Database_Service SHALL perform this check on the client side when the Dashboard loads

### Requirement 13: Dashboard Statistics

**User Story:** As a donor, I want to see statistics about my donations, so that I can track my impact.

#### Acceptance Criteria

1. WHEN a Donor views the Dashboard, THE Database_Service SHALL query all Listings where donorId equals the Donor's userId
2. THE Database_Service SHALL calculate totalListings as the count of all Listings
3. THE Database_Service SHALL calculate activeListings as the count of Listings with status "available"
4. THE Database_Service SHALL calculate completedListings as the count of Listings with status "completed"
5. THE Database_Service SHALL calculate totalMealsDonated by summing quantityValue for completed Listings
6. THE Database_Service SHALL perform all calculations on the client side after retrieving the data

### Requirement 14: Realtime Updates

**User Story:** As a user, I want to see updates in real-time when data changes, so that I always have the latest information.

#### Acceptance Criteria

1. WHEN a User views a Listing, THE Database_Service SHALL listen for changes to the Listing at path `/listings/{listingId}` using Firebase realtime listeners
2. WHEN the Listing data changes, THE Database_Service SHALL update the UI automatically
3. WHEN a Donor views pending Claims, THE Database_Service SHALL listen for changes to Claims at path `/claims` filtered by listingId
4. WHEN a Claim is created, accepted, or rejected, THE Database_Service SHALL update the UI automatically
5. WHEN a User navigates away from a view, THE Database_Service SHALL detach the realtime listeners to prevent memory leaks

### Requirement 15: Database Security Rules

**User Story:** As a developer, I want to implement Firebase Security Rules, so that user data is protected from unauthorized access.

#### Acceptance Criteria

1. THE Security_Rules SHALL deny all read and write operations by default for unauthenticated users
2. THE Security_Rules SHALL allow authenticated Users to read their own User record at path `/users/{userId}` where userId matches auth.uid
3. THE Security_Rules SHALL allow authenticated Users to write their own User record at path `/users/{userId}` where userId matches auth.uid
4. THE Security_Rules SHALL allow authenticated Users to read all Listings with status "available"
5. THE Security_Rules SHALL allow authenticated Users to create Listings with donorId set to auth.uid
6. THE Security_Rules SHALL allow Donors to read, update, and delete only their own Listings
7. THE Security_Rules SHALL allow authenticated Users to read Claims where receiverId matches auth.uid
8. THE Security_Rules SHALL allow Donors to read Claims where the Claim's listingId corresponds to a Listing owned by the Donor
9. THE Security_Rules SHALL allow authenticated Users to create Claims with receiverId set to auth.uid
10. THE Security_Rules SHALL allow Donors to update Claims (accept/reject) where the Claim's listingId corresponds to a Listing owned by the Donor
11. THE Security_Rules SHALL validate data types and required fields for all write operations
12. THE Security_Rules SHALL prevent modification of system-generated fields (id, createdAt, timestamps)

### Requirement 16: Storage Security Rules

**User Story:** As a developer, I want to implement Firebase Storage Security Rules, so that photo uploads are protected from unauthorized access.

#### Acceptance Criteria

1. THE Security_Rules SHALL deny all read and write operations by default for unauthenticated users
2. THE Security_Rules SHALL allow authenticated Users to upload files to path `/listings/{userId}/*` where userId matches auth.uid
3. THE Security_Rules SHALL allow all authenticated Users to read files from any path in `/listings/*`
4. THE Security_Rules SHALL validate that uploaded files are image types (image/jpeg, image/png, image/webp)
5. THE Security_Rules SHALL validate that uploaded files do not exceed 5MB in size
6. THE Security_Rules SHALL prevent deletion of files by any user (files are immutable once uploaded)

### Requirement 17: Offline Support

**User Story:** As a user, I want the app to work when I have poor connectivity, so that I can still view cached data.

#### Acceptance Criteria

1. THE Firebase_Database SHALL enable offline persistence for the Realtime Database
2. WHEN a User loses internet connectivity, THE Database_Service SHALL serve data from the local cache
3. WHEN a User regains internet connectivity, THE Database_Service SHALL synchronize local changes with the server
4. THE FoodBridge_App SHALL display a visual indicator when the User is offline
5. THE FoodBridge_App SHALL disable write operations (create, update, delete) when the User is offline

### Requirement 18: Error Handling

**User Story:** As a user, I want to see clear error messages when something goes wrong, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. WHEN a Firebase operation fails, THE FoodBridge_App SHALL catch the error and display a user-friendly message
2. IF the error is due to permission denied, THEN THE FoodBridge_App SHALL display "You don't have permission to perform this action"
3. IF the error is due to network failure, THEN THE FoodBridge_App SHALL display "Network error. Please check your connection and try again"
4. IF the error is due to invalid data, THEN THE FoodBridge_App SHALL display the specific validation error message
5. THE FoodBridge_App SHALL log all errors to the browser console for debugging purposes

### Requirement 19: Migration from Backend API

**User Story:** As a developer, I want to replace all backend API calls with Firebase SDK calls, so that the app no longer depends on the backend server.

#### Acceptance Criteria

1. THE FoodBridge_App SHALL remove all HTTP requests to the backend API endpoints
2. THE FoodBridge_App SHALL replace authentication API calls (POST /auth/send-otp, POST /auth/verify-otp) with Auth_Service methods
3. THE FoodBridge_App SHALL replace listing API calls (GET /listings, POST /listings, PATCH /listings/:id, DELETE /listings/:id) with Database_Service methods
4. THE FoodBridge_App SHALL replace claim API calls (POST /listings/:id/claims, PATCH /claims/:id/accept, PATCH /claims/:id/reject) with Database_Service methods
5. THE FoodBridge_App SHALL replace photo upload API calls (POST /photos/upload) with Storage_Service methods
6. THE FoodBridge_App SHALL remove the VITE_API_URL environment variable
7. THE FoodBridge_App SHALL remove all API client code (axios, fetch wrappers)

### Requirement 20: Free Tier Compliance

**User Story:** As a developer, I want to ensure the app stays within Firebase Spark plan limits, so that the app remains free to operate.

#### Acceptance Criteria

1. THE FoodBridge_App SHALL NOT use Firebase Cloud Functions (requires Blaze plan)
2. THE FoodBridge_App SHALL NOT use Firebase Cloud Firestore (Realtime Database is used instead)
3. THE Database_Service SHALL implement client-side pagination to limit the number of records retrieved per query
4. THE Database_Service SHALL limit query results to maximum 50 records per request
5. THE Storage_Service SHALL compress images before upload to reduce storage usage
6. THE FoodBridge_App SHALL display a warning to Donors if they attempt to upload more than 10 photos per listing
7. THE FoodBridge_App SHALL implement client-side caching to reduce database reads

### Requirement 21: Data Migration

**User Story:** As a developer, I want to migrate existing data from PostgreSQL to Firebase, so that users can continue using the app without losing their data.

#### Acceptance Criteria

1. THE migration script SHALL export all User records from PostgreSQL
2. THE migration script SHALL import User records into Firebase_Database at path `/users/{userId}`
3. THE migration script SHALL export all Listing records from PostgreSQL
4. THE migration script SHALL import Listing records into Firebase_Database at path `/listings/{listingId}`
5. THE migration script SHALL export all Claim records from PostgreSQL
6. THE migration script SHALL import Claim records into Firebase_Database at path `/claims/{claimId}`
7. THE migration script SHALL preserve all relationships between Users, Listings, and Claims
8. THE migration script SHALL log any errors or data inconsistencies during migration

### Requirement 22: Testing and Validation

**User Story:** As a developer, I want to test the migrated app thoroughly, so that I can ensure all features work correctly.

#### Acceptance Criteria

1. THE developer SHALL test user registration and login with phone OTP
2. THE developer SHALL test listing creation with all fields and photo uploads
3. THE developer SHALL test listing retrieval with filters (status, donorId)
4. THE developer SHALL test listing updates and cancellation
5. THE developer SHALL test claim creation, acceptance, and rejection
6. THE developer SHALL test dashboard statistics calculation
7. THE developer SHALL test realtime updates by opening the app in two browser windows
8. THE developer SHALL test offline support by disabling network and verifying cached data loads
9. THE developer SHALL test security rules by attempting unauthorized operations
10. THE developer SHALL verify that no backend API calls are made by checking browser network tab

### Requirement 23: Documentation

**User Story:** As a developer, I want comprehensive documentation, so that I can understand and maintain the migrated codebase.

#### Acceptance Criteria

1. THE developer SHALL create a FIREBASE_CLIENT_MIGRATION.md document explaining the new architecture
2. THE developer SHALL document all Firebase service modules (Auth_Service, Database_Service, Storage_Service)
3. THE developer SHALL document the Firebase Realtime Database schema with paths and data structures
4. THE developer SHALL document the Firebase Security Rules with explanations for each rule
5. THE developer SHALL update the README.md with Firebase setup instructions
6. THE developer SHALL document the data migration process and script usage
7. THE developer SHALL create a troubleshooting guide for common Firebase errors

## Special Requirements Guidance

### Firebase Realtime Database Schema

The database schema must be documented with all paths and data structures:

```
/users/{userId}
  - id: string
  - phoneNumber: string
  - fullName: string
  - profilePhotoUrl: string
  - roles: array
  - activeRole: string
  - verificationTier: string
  - createdAt: timestamp
  - lastActiveAt: timestamp

/listings/{listingId}
  - id: string
  - donorId: string
  - title: string
  - description: string
  - foodTypes: array
  - quantityValue: number
  - quantityUnit: string
  - isVegetarian: boolean
  - isVegan: boolean
  - isHalal: boolean
  - isKosher: boolean
  - isGlutenFree: boolean
  - allergens: array
  - photoUrls: array
  - coverPhotoUrl: string
  - pickupAddress: string
  - pickupLatitude: number
  - pickupLongitude: number
  - pickupInstructions: string
  - readyFrom: timestamp
  - pickupBy: timestamp
  - bestBefore: timestamp
  - preparationNotes: string
  - status: string
  - claimCount: number
  - viewCount: number
  - createdAt: timestamp
  - updatedAt: timestamp
  - completedAt: timestamp
  - cancelledAt: timestamp
  - cancellationReason: string

/claims/{claimId}
  - id: string
  - listingId: string
  - receiverId: string
  - message: string
  - status: string
  - pickupCode: string
  - createdAt: timestamp
  - respondedAt: timestamp
  - completedAt: timestamp
  - rejectionReason: string
```

### Security Rules Implementation

Security rules must be implemented for both Realtime Database and Storage. The rules must:
- Deny all access by default
- Allow authenticated users to read/write their own data
- Validate data types and required fields
- Prevent modification of system fields
- Enforce business logic (e.g., only donors can update their listings)

### Client-Side Service Layer

The service layer must provide a clean abstraction over Firebase SDK:
- Auth_Service: sendOTP, verifyOTP, logout, onAuthStateChanged
- Database_Service: create, read, update, delete, query, listen
- Storage_Service: uploadFile, getDownloadURL

All services must handle errors gracefully and return consistent response formats.
