# FoodBridge Backend API

Node.js/Express backend for the FoodBridge platform.

## Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ with PostGIS extension
- Redis 7+
- Twilio account (for SMS)
- AWS account (for S3 storage)
- Firebase project (for push notifications)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up PostgreSQL database:
```bash
# Create database
createdb foodbridge

# Enable PostGIS extension
psql foodbridge -c "CREATE EXTENSION postgis;"

# Run migrations
psql foodbridge < migrations/001_initial_schema.sql
```

4. Start Redis:
```bash
redis-server
```

### Development

Start the development server with hot reload:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Production

Build and start:
```bash
npm run build
npm start
```

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### Send OTP
```http
POST /auth/send-otp
Content-Type: application/json

{
  "phoneNumber": "9876543210",
  "countryCode": "+91"
}
```

#### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "9876543210",
  "otpCode": "123456",
  "countryCode": "+91"
}
```

Response:
```json
{
  "success": true,
  "isNewUser": true,
  "user": {
    "id": "uuid",
    "phoneNumber": "+919876543210",
    "roles": ["donor"],
    "verificationTier": "tier0_phone"
  },
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

#### Complete Onboarding
```http
POST /auth/onboarding
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Raj Kumar",
  "role": "donor",
  "donorData": {
    "donorType": "restaurant",
    "businessName": "Raj's Dhaba",
    "address": "123 MG Road, Bengaluru",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "typicalFoodTypes": ["cooked_hot"]
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

### Health Check
```http
GET /health
```

## Database Schema

The database schema is defined in `migrations/001_initial_schema.sql` and includes:

- **users** - Core user accounts
- **donor_profiles** - Donor-specific information
- **receiver_profiles** - Receiver-specific information
- **volunteer_profiles** - Volunteer-specific information
- **food_listings** - Food donation listings
- **claims** - Claim/coordination records
- **ratings** - User ratings
- **reports** - Trust & safety reports
- **messages** - In-app messaging
- **notifications** - Notification history
- **karma_transactions** - Gamification points
- **badges** - Achievement badges
- **otp_verifications** - OTP verification records
- **tracking_events** - Live tracking data
- **impact_metrics** - Aggregated impact data

## Architecture

### Core Services
- **AuthService** - Authentication and OTP verification
- **SMSService** - Twilio SMS integration
- **NotificationService** - Push notifications via FCM
- **MatchingService** - Smart listing-receiver matching
- **GeoService** - Geospatial queries and distance calculations

### Middleware
- **authenticate** - JWT token verification
- **requireRole** - Role-based access control
- **requireVerificationTier** - Verification tier enforcement
- **rateLimiter** - Rate limiting
- **errorHandler** - Global error handling
- **validateRequest** - Request validation with Joi

### Real-time Features
- Socket.IO for live tracking
- Location updates during delivery
- In-app messaging
- Typing indicators
- Real-time claim status updates

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Deployment

### Environment Variables
Ensure all required environment variables are set in production:
- Database credentials
- Redis connection
- Twilio credentials
- AWS S3 credentials
- Firebase credentials
- JWT secrets (use strong, random values)

### Database Migrations
Run migrations on production database:
```bash
psql $DATABASE_URL < migrations/001_initial_schema.sql
```

### Monitoring
- Logs are written to `logs/` directory
- Use CloudWatch for production monitoring
- Sentry for error tracking (configure SENTRY_DSN)

## Security

- All passwords are hashed with bcrypt
- JWT tokens for authentication
- Rate limiting on all endpoints
- Input validation with Joi
- SQL injection protection via parameterized queries
- CORS configuration
- Helmet.js for security headers

## Performance

- Redis caching for frequently accessed data
- Database connection pooling
- Geospatial indexing with PostGIS
- Query optimization with proper indexes
- Compression middleware

## Next Steps

The following features need to be implemented:

### Phase 1 (MVP)
- [ ] Food listing creation and management
- [ ] Discovery with geospatial search
- [ ] Smart matching engine
- [ ] Claim workflow (create, accept, reject, pickup, deliver)
- [ ] Rating system
- [ ] Basic notifications
- [ ] File upload to S3
- [ ] Push notifications via FCM

### Phase 2
- [ ] Volunteer management
- [ ] NGO advanced tools
- [ ] Corporate dashboard
- [ ] Impact tracking and analytics
- [ ] Gamification (karma points, badges, streaks)
- [ ] In-app messaging
- [ ] Report system

### Phase 3
- [ ] AI features (demand prediction, smart reminders)
- [ ] Emergency mode
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] API for third-party integrations

## License

Proprietary - All Rights Reserved
