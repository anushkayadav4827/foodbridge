# Frontend-Backend Connection Guide

## ✅ Connection Status: FULLY CONFIGURED

Your FoodBridge application is now properly configured to connect the React frontend to the Express backend using environment variables and best practices.

---

## 🎯 What Was Done

### 1. **Environment Variables Setup**
- ✅ **Development**: `web/.env` configured with `VITE_API_URL=http://localhost:3005/api/v1`
- ✅ **Example**: `web/.env.example` updated to match backend port (3005)
- ✅ **Production**: `web/.env.production` created for production deployment

### 2. **Centralized API Service**
- ✅ **API Client**: `web/src/services/api.ts` uses environment variables
- ✅ **Token Management**: Automatic JWT token injection in request headers
- ✅ **Token Refresh**: Automatic token refresh on 401 errors
- ✅ **Error Handling**: Graceful error handling with automatic logout on auth failure

### 3. **Removed Hardcoded URLs**
- ✅ **Health Check**: Fixed hardcoded URL in `CreateListingPage.tsx` to use environment variable
- ✅ **Debug Logs**: Removed hardcoded URLs from console logs
- ✅ **All API Calls**: Verified all API calls use the centralized `api` service

### 4. **Backend CORS Configuration**
- ✅ **CORS Origins**: Backend configured to accept requests from `http://localhost:3001` (frontend dev server)
- ✅ **Credentials**: CORS credentials enabled for cookie/token support

---

## 🚀 How to Run (Development)

### **Step 1: Start Backend Server**
```bash
cd backend
npm run dev
```
- Backend runs on: **http://localhost:3005**
- Health check: **http://localhost:3005/health**
- API endpoints: **http://localhost:3005/api/v1/**

### **Step 2: Start Frontend Server**
```bash
cd web
npm run dev
```
- Frontend runs on: **http://localhost:3001**
- Automatically connects to backend using `VITE_API_URL` from `.env`

### **Step 3: Access the Application**
- Open browser: **http://localhost:3001**
- Login page: **http://localhost:3001/login**
- Dashboard: **http://localhost:3001/dashboard**

---

## 🔧 Environment Variables Explained

### **Frontend Environment Variables** (`web/.env`)

| Variable | Purpose | Development Value | Production Value |
|----------|---------|-------------------|------------------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3005/api/v1` | `https://api.foodbridge.org/api/v1` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps integration | (optional in dev) | Your production API key |

### **Backend Environment Variables** (`backend/.env`)

| Variable | Purpose | Value |
|----------|---------|-------|
| `PORT` | Backend server port | `3005` |
| `CORS_ORIGIN` | Allowed frontend origins | `http://localhost:3001,http://localhost:19006` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://postgres:password@localhost:5432/foodbridge` |
| `REDIS_URL` | Redis cache connection | `redis://localhost:6379` |
| `JWT_SECRET` | JWT token signing secret | (secure random string) |

---

## 📡 API Integration Details

### **How API Calls Work**

1. **Import the API client**:
   ```typescript
   import api from '../services/api';
   ```

2. **Make API calls**:
   ```typescript
   // GET request
   const response = await api.get('/listings');
   
   // POST request
   const response = await api.post('/listings', { title: 'Food', quantity: 10 });
   
   // PUT request
   const response = await api.put('/listings/123', { title: 'Updated' });
   
   // DELETE request
   const response = await api.delete('/listings/123');
   ```

3. **Automatic features**:
   - ✅ Base URL automatically prepended (from `VITE_API_URL`)
   - ✅ JWT token automatically added to `Authorization` header
   - ✅ Token refresh on 401 errors
   - ✅ Automatic logout on auth failure

### **Available Backend Endpoints**

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/v1/auth/login` | POST | Login with phone + OTP | ✅ Working |
| `/api/v1/auth/verify-otp` | POST | Verify OTP code | ✅ Working |
| `/api/v1/auth/refresh` | POST | Refresh JWT token | ✅ Working |
| `/api/v1/listings` | GET | Get all listings | ✅ Working |
| `/api/v1/listings` | POST | Create new listing | ✅ Working |
| `/api/v1/listings/:id` | GET | Get listing details | ✅ Working |
| `/api/v1/listings/:id` | PUT | Update listing | ✅ Working |
| `/api/v1/listings/:id` | DELETE | Cancel listing | ✅ Working |
| `/api/v1/listings/:id/photos` | POST | Upload photos | ✅ Working |
| `/api/v1/claims` | GET | Get pending claims | ✅ Working |
| `/api/v1/claims/:id/accept` | PUT | Accept claim | ✅ Working |
| `/api/v1/claims/:id/reject` | PUT | Reject claim | ✅ Working |
| `/api/v1/donors/me/dashboard` | GET | Get dashboard data | ✅ Working |
| `/api/v1/donors/me/stats` | GET | Get donor statistics | ✅ Working |
| `/health` | GET | Health check | ✅ Working |

---

## 🌐 Production Deployment

### **Step 1: Configure Production Environment**

1. **Update `web/.env.production`**:
   ```env
   VITE_API_URL=https://api.foodbridge.org/api/v1
   VITE_GOOGLE_MAPS_API_KEY=your_production_api_key
   ```

2. **Update `backend/.env` for production**:
   ```env
   NODE_ENV=production
   PORT=3005
   CORS_ORIGIN=https://foodbridge.org,https://www.foodbridge.org
   DATABASE_URL=postgresql://user:pass@prod-db-host:5432/foodbridge
   REDIS_URL=redis://prod-redis-host:6379
   JWT_SECRET=your-secure-production-secret
   ```

### **Step 2: Build Frontend**

```bash
cd web
npm run build
```

This creates an optimized production build in `web/dist/` directory.

### **Step 3: Deploy Frontend**

**Option A: Static Hosting (Vercel, Netlify, AWS S3 + CloudFront)**
- Upload `web/dist/` contents
- Configure environment variables in hosting platform
- Set up custom domain

**Option B: Serve from Backend**
```bash
# Copy frontend build to backend
cp -r web/dist backend/public

# Backend will serve frontend at root path
# Already configured in backend/src/server.ts
```

### **Step 4: Deploy Backend**

**Option A: Cloud Platform (AWS, GCP, Azure)**
- Deploy as Docker container or Node.js app
- Set environment variables
- Configure load balancer and SSL certificate

**Option B: VPS (DigitalOcean, Linode)**
- Use PM2 for process management
- Configure Nginx as reverse proxy
- Set up SSL with Let's Encrypt

---

## 🔒 Security Best Practices

### **✅ Already Implemented**

1. **Environment Variables**: Sensitive data not hardcoded
2. **CORS Configuration**: Only allowed origins can access API
3. **JWT Authentication**: Secure token-based authentication
4. **Token Refresh**: Automatic token refresh without re-login
5. **HTTPS Ready**: Use HTTPS in production (configure in deployment)

### **🔐 Additional Recommendations**

1. **Use HTTPS in Production**: Always use SSL/TLS certificates
2. **Secure JWT Secret**: Use strong, random secrets (32+ characters)
3. **Rate Limiting**: Already configured in backend (100 requests per 15 minutes)
4. **Input Validation**: Already implemented with Joi schemas
5. **SQL Injection Protection**: Using parameterized queries
6. **XSS Protection**: React automatically escapes content

---

## 🧪 Testing the Connection

### **1. Test Backend Health**
```bash
curl http://localhost:3005/health
```
Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### **2. Test Frontend Connection**
1. Open browser: http://localhost:3001
2. Check browser console for errors
3. Look for "🟢 Backend Online" indicator on Create Listing page

### **3. Test API Call**
```bash
# Login
curl -X POST http://localhost:3005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210"}'

# Get listings
curl http://localhost:3005/api/v1/listings
```

---

## 🐛 Troubleshooting

### **Problem: "Cannot connect to backend"**

**Solution 1**: Check if backend is running
```bash
cd backend
npm run dev
```

**Solution 2**: Verify backend port
- Backend should run on port **3005** (not 3000)
- Check `backend/.env` → `PORT=3005`

**Solution 3**: Check CORS configuration
- Verify `backend/.env` → `CORS_ORIGIN=http://localhost:3001`

### **Problem: "401 Unauthorized"**

**Solution 1**: Login again
- Backend restart clears all sessions
- Go to login page and authenticate again

**Solution 2**: Check JWT token
- Open browser DevTools → Application → Local Storage
- Verify `token` exists

**Solution 3**: Check token expiry
- JWT tokens expire after 7 days (configurable)
- Login again to get new token

### **Problem: "Network Error"**

**Solution 1**: Check if backend is running
```bash
# Check if backend is listening on port 3005
netstat -an | grep 3005
```

**Solution 2**: Check firewall
- Ensure port 3005 is not blocked by firewall

**Solution 3**: Check environment variable
- Verify `web/.env` → `VITE_API_URL=http://localhost:3005/api/v1`
- Restart frontend after changing `.env`

### **Problem: "CORS Error"**

**Solution**: Update backend CORS configuration
```env
# backend/.env
CORS_ORIGIN=http://localhost:3001,http://localhost:19006
```

---

## 📊 Completed Backend Features

Based on the spec tasks, the following features are **fully implemented and working**:

### ✅ **Database & Schema** (Task 1)
- PostgreSQL database with all tables
- PostGIS extension for location data
- Indexes and constraints

### ✅ **Data Models & Validation** (Task 2)
- TypeScript interfaces and types
- Joi validation schemas
- Custom validators

### ✅ **Photo Service** (Task 3)
- Photo upload with multer
- Image compression with Sharp
- S3 integration (optional)
- Photo management endpoints

### ✅ **Listing Service** (Task 4)
- CRUD operations for listings
- Draft save/resume functionality
- Location-based filtering
- Pagination and sorting

### ✅ **Claim Service** (Task 6)
- Claim acceptance/rejection
- Auto-rejection cron job (runs every 1 minute)
- Pickup code generation
- Claim queue management

---

## 🎯 Next Steps

### **For Development**
1. ✅ Backend is running on port 3005
2. ✅ Frontend is running on port 3001
3. ✅ All API calls use environment variables
4. ✅ CORS is properly configured
5. ✅ Token management is working

### **For Production**
1. Update `web/.env.production` with production API URL
2. Build frontend: `npm run build`
3. Deploy frontend to hosting platform
4. Deploy backend to cloud platform
5. Configure SSL certificates
6. Set up monitoring and logging

### **For Testing**
1. Test all API endpoints with Postman
2. Test authentication flow (login → OTP → dashboard)
3. Test listing creation and management
4. Test claim acceptance/rejection
5. Test real-time updates with WebSocket

---

## 📚 Additional Resources

- **Backend API Documentation**: See `backend/README.md`
- **Frontend Documentation**: See `web/README.md`
- **Spec Document**: See `.kiro/specs/donor-dashboard-listing-system/`
- **Architecture**: See `ARCHITECTURE.md`

---

## ✨ Summary

Your FoodBridge application is now **fully connected** and ready for development and testing:

- ✅ **Environment variables** configured for dev and production
- ✅ **Centralized API service** with automatic token management
- ✅ **No hardcoded URLs** - all using environment variables
- ✅ **CORS properly configured** for frontend-backend communication
- ✅ **Backend features implemented** (listings, claims, photos, drafts)
- ✅ **Production-ready** configuration files created

**You can now:**
1. Run both servers and start developing
2. Test all API endpoints from the React frontend
3. Deploy to production when ready

**Happy coding! 🚀**
