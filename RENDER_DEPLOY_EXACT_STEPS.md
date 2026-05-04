# EXACT RENDER DEPLOYMENT STEPS

## Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Fix Render deployment"
git push origin main
```

## Step 2: Create Render Account
1. Go to: https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repository

## Step 3: Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Name: `foodbridge-db`
3. Database: `foodbridge`
4. User: `foodbridge`
5. Region: Oregon (US West)
6. Plan: **Free**
7. Click "Create Database"
8. **WAIT 2-3 minutes** for database to be ready
9. Copy the **Internal Database URL** (starts with `postgresql://`)

## Step 4: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `anushkayadav4827/foodbridge`
3. Configure:
   - **Name**: `foodbridge-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

## Step 5: Add Environment Variables
Click "Environment" tab and add these EXACT variables:

```
NODE_ENV=production
PORT=10000
API_VERSION=v1
DATABASE_URL=<paste-internal-database-url-from-step-3>
JWT_SECRET=foodbridge-prod-jwt-secret-2024-change-this
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=foodbridge-prod-refresh-secret-2024-change-this
JWT_REFRESH_EXPIRES_IN=30d
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=3
OTP_LOCKOUT_MINUTES=10
CORS_ORIGIN=https://foodbridge-app-51332.web.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE_MB=10
MAX_PHOTOS_PER_LISTING=6
DEFAULT_SEARCH_RADIUS_KM=5
MAX_SEARCH_RADIUS_KM=25
CLAIM_ACCEPT_TIMEOUT_MINUTES=15
PICKUP_CODE_EXPIRY_HOURS=1
MAX_ACTIVE_CLAIMS_PER_USER=5
MIN_RATING_THRESHOLD=2.5
AUTO_SUSPEND_RATING=2.5
AUTO_SUSPEND_MIN_RATINGS=10
MAX_CANCELLATIONS_PER_MONTH=3
LOG_LEVEL=info
ADMIN_EMAIL=admin@foodbridge.org
ADMIN_PHONE=+919876543210
```

## Step 6: Deploy
1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Check logs for errors
4. Your backend URL will be: `https://foodbridge-backend.onrender.com`

## Step 7: Run Database Migrations
1. Go to Render Dashboard → foodbridge-backend → Shell
2. Run:
```bash
cd backend
npm run migrate:up
```

## Step 8: Update Frontend
1. Edit `web/.env.production`:
```
VITE_API_URL=https://foodbridge-backend.onrender.com/api/v1
```

2. Rebuild and redeploy frontend:
```bash
cd web
npm run build
firebase deploy --only hosting
```

## Step 9: Test
1. Open: https://foodbridge-app-51332.web.app
2. Try login with phone number
3. Check browser console for errors
4. Check Render logs if API calls fail

---

## Common Errors and Fixes

### Error: "ECONNREFUSED"
**Fix**: Database not ready yet. Wait 2-3 minutes and redeploy.

### Error: "relation does not exist"
**Fix**: Run migrations in Render Shell:
```bash
cd backend && npm run migrate:up
```

### Error: "CORS error"
**Fix**: Check CORS_ORIGIN in Render environment variables matches your Firebase URL exactly.

### Error: "502 Bad Gateway"
**Fix**: Check Render logs. Usually means:
- Build failed (check build command)
- Start command wrong (should be `cd backend && npm start`)
- Port not set to 10000

---

## Architecture After Deployment

```
Frontend (Firebase Hosting)
https://foodbridge-app-51332.web.app
         ↓
         ↓ API calls
         ↓
Backend (Render Web Service)
https://foodbridge-backend.onrender.com
         ↓
         ↓ Database queries
         ↓
PostgreSQL (Render Database)
Internal URL: postgresql://...
```

---

## Important Notes

1. **Free tier limitations**:
   - Backend sleeps after 15 min inactivity
   - First request after sleep takes 30-60 seconds
   - Database has 1GB storage limit

2. **Database URL**:
   - Use **Internal Database URL** (faster, free)
   - NOT External Database URL (slower, costs money)

3. **Logs**:
   - Check Render logs if deployment fails
   - Check browser console if API calls fail

4. **Redeployment**:
   - Push to GitHub triggers auto-redeploy
   - Or click "Manual Deploy" in Render dashboard
