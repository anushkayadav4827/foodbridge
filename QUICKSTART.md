# FoodBridge - Quick Start Guide

Get FoodBridge running locally in under 10 minutes.

## Prerequisites

Install these first:
- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 15+](https://www.postgresql.org/download/)
- [Redis 7+](https://redis.io/download/)

## Step 1: Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd foodbridge

# Install backend dependencies
cd backend
npm install
```

## Step 2: Database Setup

```bash
# Start PostgreSQL (if not running)
# On macOS with Homebrew:
brew services start postgresql@15

# On Windows, start from Services or:
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start

# Create database
createdb foodbridge

# Or using psql:
psql -U postgres
CREATE DATABASE foodbridge;
\q

# Enable PostGIS extension and run migrations
psql foodbridge -c "CREATE EXTENSION postgis;"
psql foodbridge < migrations/001_initial_schema.sql
```

## Step 3: Redis Setup

```bash
# Start Redis
redis-server

# Or on macOS with Homebrew:
brew services start redis

# Or on Windows, start from Services or:
redis-server.exe
```

## Step 4: Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
# Minimum required for local development:
```

Edit `.env`:
```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=foodbridge
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (generate random strings for production)
JWT_SECRET=dev-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production

# For development, Twilio is optional (OTPs will be logged to console)
# TWILIO_ACCOUNT_SID=your_sid
# TWILIO_AUTH_TOKEN=your_token
# TWILIO_PHONE_NUMBER=+1234567890
```

## Step 5: Start the Server

```bash
# Development mode with hot reload
npm run dev

# You should see:
# [info]: Database connected successfully
# [info]: Redis connected successfully
# [info]: Socket.IO initialized
# [info]: FoodBridge API server running on port 3000
```

## Step 6: Test the API

### Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 5.123,
  "environment": "development"
}
```

### Send OTP (Development Mode)
```bash
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210",
    "countryCode": "+91"
  }'
```

**In development mode**, the OTP will be logged to the console instead of sending SMS:
```
[info]: [DEV MODE] OTP for +919876543210: 123456
```

### Verify OTP
```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210",
    "otpCode": "123456",
    "countryCode": "+91"
  }'
```

Expected response:
```json
{
  "success": true,
  "isNewUser": true,
  "user": {
    "id": "uuid-here",
    "phoneNumber": "+919876543210",
    "roles": ["donor"],
    "verificationTier": "tier0_phone"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Account created successfully. Please complete onboarding."
}
```

### Complete Onboarding
```bash
# Save the token from previous response
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/api/v1/auth/onboarding \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fullName": "Raj Kumar",
    "role": "donor",
    "donorData": {
      "donorType": "restaurant",
      "businessName": "Raj'\''s Dhaba",
      "address": "123 MG Road, Bengaluru, Karnataka",
      "latitude": 12.9716,
      "longitude": 77.5946,
      "typicalFoodTypes": ["cooked_hot"],
      "landmark": "Near City Mall"
    }
  }'
```

### Get Current User
```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## Common Issues & Solutions

### Issue: "Database connection failed"
**Solution:**
- Ensure PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Verify database exists: `psql -l | grep foodbridge`

### Issue: "Redis connection failed"
**Solution:**
- Ensure Redis is running: `redis-cli ping` (should return "PONG")
- Check Redis port in `.env` (default: 6379)

### Issue: "PostGIS extension not found"
**Solution:**
```bash
# Install PostGIS
# On macOS:
brew install postgis

# On Ubuntu:
sudo apt-get install postgresql-15-postgis-3

# Then enable in database:
psql foodbridge -c "CREATE EXTENSION postgis;"
```

### Issue: "Port 3000 already in use"
**Solution:**
- Change PORT in `.env` to another port (e.g., 3001)
- Or kill the process using port 3000:
  ```bash
  # On macOS/Linux:
  lsof -ti:3000 | xargs kill -9
  
  # On Windows:
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Issue: "OTP not received" (in production)
**Solution:**
- Verify Twilio credentials in `.env`
- Check Twilio account balance
- Verify phone number format (must include country code)
- Check Twilio logs in dashboard

## Development Tools

### Database GUI
- [pgAdmin](https://www.pgadmin.org/) - PostgreSQL admin tool
- [DBeaver](https://dbeaver.io/) - Universal database tool
- [Postico](https://eggerapps.at/postico/) - macOS PostgreSQL client

### Redis GUI
- [RedisInsight](https://redis.com/redis-enterprise/redis-insight/) - Official Redis GUI
- [Medis](https://getmedis.com/) - macOS Redis client

### API Testing
- [Postman](https://www.postman.com/) - API testing tool
- [Insomnia](https://insomnia.rest/) - API client
- [HTTPie](https://httpie.io/) - Command-line HTTP client

### Recommended VS Code Extensions
- ESLint
- Prettier
- PostgreSQL (by Chris Kolkman)
- Thunder Client (API testing)
- GitLens

## Next Steps

1. **Explore the Database**
   ```bash
   psql foodbridge
   \dt  # List all tables
   \d users  # Describe users table
   SELECT * FROM users;
   ```

2. **Review the Code**
   - Start with `backend/src/server.ts`
   - Review `backend/src/services/auth.service.ts`
   - Check database schema in `backend/migrations/001_initial_schema.sql`

3. **Read Documentation**
   - [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Current status and roadmap
   - [backend/README.md](./backend/README.md) - Backend documentation
   - [README.md](./README.md) - Project overview

4. **Start Building**
   - Pick a feature from Phase 1 in PROJECT_STATUS.md
   - Create a new branch
   - Implement the feature
   - Test thoroughly
   - Submit a pull request

## Useful Commands

```bash
# Backend development
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm start            # Start production build
npm test             # Run tests
npm run lint         # Lint code
npm run format       # Format code with Prettier

# Database
psql foodbridge                              # Connect to database
psql foodbridge < migrations/001_initial_schema.sql  # Run migrations
pg_dump foodbridge > backup.sql              # Backup database
psql foodbridge < backup.sql                 # Restore database

# Redis
redis-cli                    # Connect to Redis
redis-cli FLUSHALL          # Clear all Redis data (careful!)
redis-cli KEYS "otp:*"      # List all OTP keys
redis-cli GET "session:uuid" # Get session data
```

## Production Deployment

For production deployment, see:
- [DEPLOYMENT.md](./DEPLOYMENT.md) (to be created)
- Ensure all environment variables are properly set
- Use strong JWT secrets
- Enable SSL/TLS
- Set up monitoring and logging
- Configure backups
- Set up CI/CD pipeline

## Getting Help

- **Documentation**: Check PROJECT_STATUS.md and backend/README.md
- **Issues**: Create an issue on GitHub
- **Questions**: Contact the development team

---

**You're all set!** 🎉

The FoodBridge backend is now running locally. Start building amazing features to help redistribute food and fight hunger.
