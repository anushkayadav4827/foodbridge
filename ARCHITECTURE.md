# FoodBridge - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │   Mobile App     │  │   Web Dashboard  │  │  Admin Panel  │ │
│  │  (React Native)  │  │     (React)      │  │    (React)    │ │
│  │                  │  │                  │  │               │ │
│  │  • Donors        │  │  • NGO Dashboard │  │  • User Mgmt  │ │
│  │  • Receivers     │  │  • Corporate     │  │  • Reports    │ │
│  │  • Volunteers    │  │  • Analytics     │  │  • Analytics  │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
│           │                     │                     │          │
└───────────┼─────────────────────┼─────────────────────┼──────────┘
            │                     │                     │
            └─────────────────────┴─────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │      Load Balancer         │
                    │         (AWS ALB)          │
                    └─────────────┬──────────────┘
                                  │
┌─────────────────────────────────▼─────────────────────────────────┐
│                         API LAYER                                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │              Express.js API Server (Node.js)                 │ │
│  │                                                              │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │ │
│  │  │   Auth     │  │  Listings  │  │   Claims           │   │ │
│  │  │  Service   │  │  Service   │  │   Service          │   │ │
│  │  └────────────┘  └────────────┘  └────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │ │
│  │  │  Matching  │  │   Rating   │  │   Notification     │   │ │
│  │  │  Engine    │  │  Service   │  │   Service          │   │ │
│  │  └────────────┘  └────────────┘  └────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │ │
│  │  │   Report   │  │   Impact   │  │   Gamification     │   │ │
│  │  │  Service   │  │  Service   │  │   Service          │   │ │
│  │  └────────────┘  └────────────┘  └────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    Socket.IO Server                          │ │
│  │  • Real-time location tracking                              │ │
│  │  • Live claim updates                                       │ │
│  │  • In-app messaging                                         │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
┌───────────────────▼──────────┐  ┌──────────────▼─────────────────┐
│      DATA LAYER              │  │    CACHE LAYER                 │
├──────────────────────────────┤  ├────────────────────────────────┤
│                              │  │                                │
│  ┌────────────────────────┐  │  │  ┌──────────────────────────┐ │
│  │   PostgreSQL 15+       │  │  │  │      Redis 7+            │ │
│  │   with PostGIS         │  │  │  │                          │ │
│  │                        │  │  │  │  • Session cache         │ │
│  │  • Users               │  │  │  │  • OTP cache             │ │
│  │  • Listings            │  │  │  │  • Query cache           │ │
│  │  • Claims              │  │  │  │  • Rate limiting         │ │
│  │  • Ratings             │  │  │  └──────────────────────────┘ │
│  │  • Geospatial data     │  │  │                                │
│  └────────────────────────┘  │  └────────────────────────────────┘
│                              │
│  (AWS RDS)                   │  (AWS ElastiCache)
└──────────────────────────────┘
```

## External Services Integration

```
┌────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Twilio     │  │   Firebase   │  │      AWS S3          │ │
│  │              │  │     FCM      │  │                      │ │
│  │  • SMS/OTP   │  │  • Push      │  │  • Photo uploads     │ │
│  │  • Fallback  │  │    Notifs    │  │  • Documents         │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Google Maps  │  │    Sentry    │  │   CloudWatch         │ │
│  │              │  │              │  │                      │ │
│  │  • Geocoding │  │  • Error     │  │  • Logs              │ │
│  │  • Directions│  │    Tracking  │  │  • Metrics           │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## Data Flow: Food Listing to Delivery

```
1. LISTING CREATION
   ┌─────────────┐
   │   Donor     │
   │  (Mobile)   │
   └──────┬──────┘
          │ POST /api/v1/listings
          │ {title, photos, quantity, location, pickup_window}
          ▼
   ┌──────────────────┐
   │  Listing Service │
   │                  │
   │  • Validate      │──────► Upload photos to S3
   │  • Compress      │
   │  • Calculate     │
   │    urgency       │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │   PostgreSQL     │
   │  food_listings   │
   │  (with location) │
   └──────────────────┘

2. DISCOVERY
   ┌─────────────┐
   │  Receiver   │
   │  (Mobile)   │
   └──────┬──────┘
          │ GET /api/v1/listings?lat=12.97&lng=77.59&radius=5
          ▼
   ┌──────────────────┐
   │ Matching Engine  │
   │                  │
   │  • Geospatial    │◄──── PostGIS query
   │    search        │      ST_DWithin()
   │  • Calculate     │
   │    match score   │
   │  • Sort & filter │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │  Sorted listings │
   │  with match      │
   │  scores          │
   └──────────────────┘

3. CLAIM CREATION
   ┌─────────────┐
   │  Receiver   │
   └──────┬──────┘
          │ POST /api/v1/claims {listing_id}
          ▼
   ┌──────────────────┐
   │  Claim Service   │
   │                  │
   │  • Check race    │
   │    condition     │
   │  • Generate      │
   │    pickup code   │
   │  • Create claim  │
   └────────┬─────────┘
            │
            ├──────► PostgreSQL (claims table)
            │
            ├──────► Socket.IO emit to donor
            │        "claim:created"
            │
            └──────► Notification Service
                     Push + SMS to donor

4. CLAIM ACCEPTANCE
   ┌─────────────┐
   │   Donor     │
   └──────┬──────┘
          │ PUT /api/v1/claims/:id/accept
          ▼
   ┌──────────────────┐
   │  Claim Service   │
   │                  │
   │  • Update status │
   │  • Start timer   │
   └────────┬─────────┘
            │
            ├──────► PostgreSQL (update claim)
            │
            ├──────► Socket.IO emit to receiver
            │        "claim:accepted"
            │
            └──────► Notification Service
                     "Claim accepted! Here's how to pick up"

5. COORDINATION
   ┌─────────────┐        ┌─────────────┐
   │   Donor     │◄──────►│  Receiver   │
   └──────┬──────┘        └──────┬──────┘
          │                      │
          │  Socket.IO: claim room
          │  • Messages          │
          │  • Status updates    │
          │  • Location (if volunteer)
          │                      │
          └──────────┬───────────┘
                     │
                     ▼
            ┌────────────────┐
            │  Coordination  │
            │   Interface    │
            │                │
            │  • Pickup code │
            │  • Directions  │
            │  • Chat        │
            └────────────────┘

6. PICKUP CONFIRMATION
   ┌─────────────┐
   │  Receiver   │
   └──────┬──────┘
          │ Shows pickup code: "123456"
          ▼
   ┌─────────────┐
   │   Donor     │
   └──────┬──────┘
          │ PUT /api/v1/claims/:id/pickup {code: "123456"}
          ▼
   ┌──────────────────┐
   │  Claim Service   │
   │                  │
   │  • Verify code   │
   │  • Update status │
   │  • Log event     │
   └────────┬─────────┘
            │
            ├──────► PostgreSQL (status: picked_up)
            │
            ├──────► Socket.IO emit
            │        "claim:picked_up"
            │
            └──────► Notification Service
                     "Pickup confirmed"

7. DELIVERY CONFIRMATION
   ┌─────────────┐
   │  Receiver   │
   └──────┬──────┘
          │ PUT /api/v1/claims/:id/deliver
          │ {photo: delivery_proof.jpg}
          ▼
   ┌──────────────────┐
   │  Claim Service   │
   │                  │
   │  • Upload photo  │──────► S3
   │  • Update status │
   │  • Calculate     │
   │    impact        │
   └────────┬─────────┘
            │
            ├──────► PostgreSQL (status: completed)
            │
            ├──────► Update donor/receiver stats
            │
            ├──────► Award karma points
            │
            ├──────► Socket.IO emit
            │        "claim:completed"
            │
            └──────► Notification Service
                     "Delivery complete! Rate your experience"

8. RATING
   ┌─────────────┐        ┌─────────────┐
   │   Donor     │        │  Receiver   │
   └──────┬──────┘        └──────┬──────┘
          │                      │
          │ POST /api/v1/ratings │
          │ {claim_id, rating}   │
          │                      │
          └──────────┬───────────┘
                     │
                     ▼
            ┌────────────────┐
            │ Rating Service │
            │                │
            │  • Store rating│
            │  • Calculate   │
            │    average     │
            │  • Update      │
            │    profile     │
            └────────┬───────┘
                     │
                     ├──────► PostgreSQL (ratings table)
                     │
                     ├──────► Update user average_rating
                     │
                     └──────► Notification Service
                              "You received a 5-star rating!"
```

## Authentication Flow

```
┌─────────────┐
│    User     │
│  (Mobile)   │
└──────┬──────┘
       │
       │ 1. POST /auth/send-otp
       │    {phoneNumber: "9876543210"}
       ▼
┌──────────────────┐
│  Auth Service    │
│                  │
│  • Generate OTP  │
│  • Store in DB   │
│  • Cache in      │
│    Redis         │
└────────┬─────────┘
         │
         ├──────► PostgreSQL (otp_verifications)
         │
         ├──────► Redis (otp:+919876543210)
         │        {code: "123456", attempts: 0}
         │
         └──────► Twilio SMS
                  "Your FoodBridge code: 123456"

┌─────────────┐
│    User     │
│  (Mobile)   │
└──────┬──────┘
       │
       │ 2. POST /auth/verify-otp
       │    {phoneNumber: "9876543210", otpCode: "123456"}
       ▼
┌──────────────────┐
│  Auth Service    │
│                  │
│  • Verify code   │
│  • Check expiry  │
│  • Check         │
│    attempts      │
└────────┬─────────┘
         │
         ├──────► Redis (get cached OTP)
         │
         ├──────► PostgreSQL (check/create user)
         │
         ├──────► Generate JWT tokens
         │        • Access token (7 days)
         │        • Refresh token (30 days)
         │
         ├──────► Redis (cache session)
         │        session:user-id
         │
         └──────► Return tokens + user data

┌─────────────┐
│    User     │
│  (Mobile)   │
└──────┬──────┘
       │
       │ 3. All subsequent requests
       │    Authorization: Bearer <token>
       ▼
┌──────────────────┐
│  Auth Middleware │
│                  │
│  • Verify JWT    │
│  • Check session │
│  • Load user     │
└────────┬─────────┘
         │
         ├──────► JWT verify (in-memory)
         │
         ├──────► Redis (check session)
         │
         ├──────► PostgreSQL (load user)
         │
         └──────► Attach user to request
                  req.user = {...}
```

## Real-Time Architecture (Socket.IO)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Donor     │     │  Volunteer  │     │  Receiver   │
│  (Mobile)   │     │  (Mobile)   │     │  (Mobile)   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ Socket.IO connect with JWT token      │
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │  Socket.IO     │
                  │  Server        │
                  │                │
                  │  • Authenticate│
                  │  • Join rooms  │
                  └────────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │  user:   │ │  user:   │ │  user:   │
       │  donor-  │ │volunteer-│ │receiver- │
       │  id      │ │  id      │ │  id      │
       └──────────┘ └──────────┘ └──────────┘
              │            │            │
              └────────────┼────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  claim:      │
                    │  claim-id    │
                    │              │
                    │  All parties │
                    │  in this room│
                    └──────────────┘

Events:
• location:update → Volunteer sends location
• location:updated → Broadcast to donor & receiver
• message:send → Send message in claim
• message:received → Broadcast to claim room
• typing:start/stop → Typing indicators
• claim:status → Status updates
```

## Geospatial Query Architecture

```
┌─────────────┐
│  Receiver   │
│  Location:  │
│  12.97, 77.59│
└──────┬──────┘
       │
       │ GET /listings?lat=12.97&lng=77.59&radius=5
       ▼
┌──────────────────────────────────────────┐
│         Matching Engine                  │
│                                          │
│  1. Geospatial Query (PostGIS)          │
│     SELECT * FROM food_listings          │
│     WHERE ST_DWithin(                    │
│       pickup_location,                   │
│       ST_SetSRID(                        │
│         ST_MakePoint(77.59, 12.97),     │
│         4326                             │
│       )::geography,                      │
│       5000  -- 5km in meters             │
│     )                                    │
│     AND status = 'available'             │
│     AND pickup_by > NOW()                │
│                                          │
│  2. Calculate Match Score                │
│     For each listing:                    │
│     • Proximity score (40%)              │
│       = 40 * (1 - distance/max_distance) │
│     • Urgency score (30%)                │
│       = 30 * urgency_factor              │
│     • Preference score (20%)             │
│       = 20 * preference_match            │
│     • Capacity score (10%)               │
│       = 10 * capacity_match              │
│                                          │
│  3. Sort by match score DESC             │
│                                          │
│  4. Apply filters                        │
│     • Food type                          │
│     • Dietary restrictions               │
│     • Quantity                           │
│                                          │
│  5. Paginate (20 per page)               │
└──────────────────────────────────────────┘
       │
       ▼
┌──────────────────┐
│  Sorted listings │
│  with distances  │
│  and scores      │
└──────────────────┘
```

## Caching Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    REDIS CACHE                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Session Cache (7 days TTL)                            │
│  ├─ session:{user_id} → {userId, roles, phone}         │
│  └─ Used by: Auth middleware                           │
│                                                         │
│  OTP Cache (10 minutes TTL)                            │
│  ├─ otp:{phone} → {code, attempts, expiresAt}          │
│  └─ Used by: Auth service                              │
│                                                         │
│  OTP Lockout (10 minutes TTL)                          │
│  ├─ otp:lockout:{phone} → true                         │
│  └─ Used by: Auth service                              │
│                                                         │
│  User Profile Cache (1 hour TTL)                       │
│  ├─ user:{user_id} → {full user object}                │
│  └─ Used by: User service                              │
│                                                         │
│  Listing Cache (5 minutes TTL)                         │
│  ├─ listing:{listing_id} → {listing object}            │
│  └─ Used by: Listing service                           │
│                                                         │
│  Discovery Cache (2 minutes TTL)                       │
│  ├─ discovery:{lat}:{lng}:{radius} → [listings]        │
│  └─ Used by: Matching engine                           │
│                                                         │
│  Rate Limiting (15 minutes window)                     │
│  ├─ ratelimit:{ip}:{endpoint} → request_count          │
│  └─ Used by: Rate limiter middleware                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Deployment Architecture (AWS)

```
                    ┌──────────────────┐
                    │   CloudFront     │
                    │   (CDN)          │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Route 53        │
                    │  (DNS)           │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Application     │
                    │  Load Balancer   │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼────────┐ ┌──▼──────┐ ┌────▼────────┐
     │   ECS/EC2       │ │ ECS/EC2 │ │  ECS/EC2    │
     │   Instance 1    │ │Instance2│ │  Instance 3 │
     │                 │ │         │ │             │
     │  • API Server   │ │• API    │ │  • API      │
     │  • Socket.IO    │ │• Socket │ │  • Socket   │
     └────────┬────────┘ └──┬──────┘ └────┬────────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼────────┐ ┌──▼──────────┐ ┌▼────────────┐
     │  RDS PostgreSQL │ │ ElastiCache │ │   S3        │
     │  (Multi-AZ)     │ │   Redis     │ │  Buckets    │
     │                 │ │             │ │             │
     │  • Primary      │ │  • Session  │ │  • Photos   │
     │  • Standby      │ │  • Cache    │ │  • Docs     │
     │  • Read Replica │ │             │ │  • Backups  │
     └─────────────────┘ └─────────────┘ └─────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Layer 1: Network Security                             │
│  ├─ VPC with private subnets                           │
│  ├─ Security groups                                    │
│  ├─ WAF (Web Application Firewall)                     │
│  └─ DDoS protection                                    │
│                                                         │
│  Layer 2: Application Security                         │
│  ├─ HTTPS/TLS 1.3 only                                │
│  ├─ CORS configuration                                 │
│  ├─ Helmet.js security headers                         │
│  ├─ Rate limiting                                      │
│  └─ Input validation (Joi)                             │
│                                                         │
│  Layer 3: Authentication & Authorization               │
│  ├─ JWT token verification                             │
│  ├─ Role-based access control                          │
│  ├─ Verification tier enforcement                      │
│  ├─ Session management                                 │
│  └─ Account suspension                                 │
│                                                         │
│  Layer 4: Data Security                                │
│  ├─ Parameterized queries (SQL injection protection)   │
│  ├─ Data encryption at rest                            │
│  ├─ Data encryption in transit                         │
│  ├─ Sensitive data masking                             │
│  └─ Secure file upload validation                      │
│                                                         │
│  Layer 5: Monitoring & Auditing                        │
│  ├─ CloudWatch logs                                    │
│  ├─ Sentry error tracking                              │
│  ├─ Audit trail for sensitive operations               │
│  ├─ Anomaly detection                                  │
│  └─ Security alerts                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Scalability Strategy

```
┌─────────────────────────────────────────────────────────┐
│                  HORIZONTAL SCALING                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  API Servers (Stateless)                               │
│  ├─ Auto-scaling group (2-10 instances)                │
│  ├─ Scale on CPU > 70%                                 │
│  ├─ Scale on request count > 1000/min                  │
│  └─ Health checks every 30s                            │
│                                                         │
│  Socket.IO (Sticky Sessions)                           │
│  ├─ Redis adapter for multi-instance                   │
│  ├─ Shared message bus                                 │
│  └─ Session affinity on load balancer                  │
│                                                         │
│  Database (Vertical + Read Replicas)                   │
│  ├─ Primary for writes                                 │
│  ├─ Read replicas for queries (2-5)                    │
│  ├─ Connection pooling                                 │
│  └─ Query optimization                                 │
│                                                         │
│  Cache (Redis Cluster)                                 │
│  ├─ Cluster mode enabled                               │
│  ├─ Multiple shards                                    │
│  └─ Automatic failover                                 │
│                                                         │
│  Storage (S3)                                          │
│  ├─ Unlimited scalability                              │
│  ├─ CloudFront CDN                                     │
│  └─ Lifecycle policies                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

**This architecture is designed for:**
- ✅ High availability (99.9% uptime)
- ✅ Horizontal scalability (10K → 1M users)
- ✅ Low latency (<2s on 3G)
- ✅ Real-time capabilities
- ✅ Security & compliance
- ✅ Cost optimization
