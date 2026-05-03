# 🌐 Make Your FoodBridge App Live 24/7 - Complete Guide

## 🎯 Goal

Make your FoodBridge application available online 24/7 so anyone can access it from anywhere.

---

## 📋 What You Need to Deploy

Your FoodBridge app has **2 parts** that need to be deployed separately:

1. **Frontend** (React app) → Firebase Hosting
2. **Backend** (Node.js API + PostgreSQL) → Railway/Render/Cloud Run

---

## 🚀 Quick Start - Deploy in 30 Minutes

### **Phase 1: Deploy Frontend (10 minutes)**

#### **Step 1: Install Firebase CLI**

```bash
npm install -g firebase-tools
```

#### **Step 2: Login to Firebase**

```bash
firebase login
```

#### **Step 3: Create Firebase Project**

1. Go to: https://console.firebase.google.com/
2. Click "Add project"
3. Name: `foodbridge-app`
4. Disable Google Analytics
5. Click "Create project"

#### **Step 4: Initialize Firebase**

```bash
firebase init hosting
```

**Answers**:
- Use existing project: **Yes**
- Select: **foodbridge-app**
- Public directory: **web/dist**
- Single-page app: **Yes**
- GitHub deploys: **No**

#### **Step 5: Build and Deploy**

```bash
cd web
npm run build
cd ..
firebase deploy --only hosting
```

**✅ Frontend is now live!** (but won't work yet - needs backend)

---

### **Phase 2: Deploy Backend (20 minutes)**

#### **Option A: Railway (Recommended - Easiest)**

**Step 1: Create Account**
1. Go to: https://railway.app/
2. Sign up with GitHub

**Step 2: Push Code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/foodbridge.git
git push -u origin main
```

**Step 3: Deploy on Railway**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Railway will auto-deploy

**Step 4: Add PostgreSQL**
1. Click "New" → "Database" → "PostgreSQL"
2. Railway will auto-create database

**Step 5: Configure Environment Variables**
1. Click your backend service
2. Go to "Variables"
3. Add:
```env
NODE_ENV=production
PORT=3005
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=change-this-to-random-string
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
REDIS_URL=redis://localhost:6379
```

**Step 6: Generate Domain**
1. Go to "Settings" → "Domains"
2. Click "Generate Domain"
3. Copy your URL (e.g., `https://foodbridge-backend.up.railway.app`)

**Step 7: Run Migrations**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link
railway login
railway link

# Run migrations
railway run node backend/create-database.js
```

**✅ Backend is now live!**

---

#### **Option B: Render (Free Tier)**

**Step 1: Create Account**
1. Go to: https://render.com/
2. Sign up with GitHub

**Step 2: Create PostgreSQL Database**
1. Click "New +" → "PostgreSQL"
2. Name: `foodbridge-db`
3. Plan: **Free**
4. Click "Create Database"
5. Copy "Internal Database URL"

**Step 3: Create Web Service**
1. Click "New +" → "Web Service"
2. Connect your GitHub repo
3. Configure:
   - Name: `foodbridge-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Plan: **Free**

**Step 4: Add Environment Variables**
```env
NODE_ENV=production
PORT=3005
DATABASE_URL=your-internal-database-url
JWT_SECRET=change-this-to-random-string
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
REDIS_URL=redis://localhost:6379
```

**Step 5: Deploy**
1. Click "Create Web Service"
2. Wait 3-5 minutes
3. Your URL: `https://foodbridge-backend.onrender.com`

**Step 6: Run Migrations**
1. Go to "Shell" tab
2. Run: `cd backend && node create-database.js`

**✅ Backend is now live!**

---

### **Phase 3: Connect Frontend to Backend (5 minutes)**

#### **Step 1: Update Frontend Environment**

Edit `web/.env.production`:

```env
# Replace with your actual backend URL
VITE_API_URL=https://your-backend-url.up.railway.app/api/v1
```

**Examples**:
- Railway: `https://foodbridge-backend-production.up.railway.app/api/v1`
- Render: `https://foodbridge-backend.onrender.com/api/v1`

#### **Step 2: Rebuild and Redeploy Frontend**

```bash
cd web
npm run build
cd ..
firebase deploy --only hosting
```

**✅ Your app is now fully live 24/7!**

---

## 🎉 Your App is Live!

### **Access Your App**

**Frontend URL**: `https://foodbridge-app.web.app`  
**Backend URL**: `https://your-backend-url.com`

### **Test Your App**

1. Visit your Firebase URL
2. Try logging in with phone number
3. Enter OTP: `123456` (in development mode)
4. Create a test listing
5. Check if everything works

---

## 💰 Cost Breakdown

### **Option 1: Railway**

| Service | Cost |
|---------|------|
| Frontend (Firebase Hosting) | **FREE** (within free tier) |
| Backend (Railway) | **$5 credit/month** (free for small apps) |
| Database (PostgreSQL) | **Included** |
| **Total** | **~$0-5/month** |

### **Option 2: Render**

| Service | Cost |
|---------|------|
| Frontend (Firebase Hosting) | **FREE** |
| Backend (Render Free) | **FREE** (spins down after inactivity) |
| Database (PostgreSQL) | **FREE** |
| **Total** | **$0/month** |

**Note**: Render free tier spins down after 15 minutes of inactivity and takes 30-60 seconds to wake up.

### **Option 3: Render Paid**

| Service | Cost |
|---------|------|
| Frontend (Firebase Hosting) | **FREE** |
| Backend (Render Starter) | **$7/month** (no spin-down) |
| Database (PostgreSQL) | **Included** |
| **Total** | **$7/month** |

---

## 🔄 How to Update Your App

### **Update Frontend**

```bash
# Make your changes in web/src/...
cd web
npm run build
cd ..
firebase deploy --only hosting
```

### **Update Backend**

**Railway**: Just push to GitHub
```bash
git add .
git commit -m "Update backend"
git push
# Railway auto-deploys
```

**Render**: Just push to GitHub
```bash
git add .
git commit -m "Update backend"
git push
# Render auto-deploys
```

---

## 🐛 Troubleshooting

### **Issue: Frontend shows blank page**

**Solution**: Check browser console (F12)
- Look for API connection errors
- Verify `VITE_API_URL` is correct
- Make sure backend is running

### **Issue: API calls fail with CORS error**

**Solution**: Update CORS in `backend/src/server.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://foodbridge-app.web.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

Then redeploy backend.

### **Issue: Database connection failed**

**Solution**: 
1. Check `DATABASE_URL` format
2. Verify database is running
3. Check database credentials
4. Run migrations: `railway run node backend/create-database.js`

### **Issue: OTP not working**

**Solution**: 
1. Check Twilio credentials in environment variables
2. For testing, OTP is always `123456` in development
3. Check backend logs for errors

### **Issue: Render free tier is slow**

**Solution**: 
- This is expected (spins down after inactivity)
- First request takes 30-60 seconds to wake up
- Upgrade to paid tier ($7/month) for instant response

---

## 📊 Firebase Hosting Free Tier Limits

| Resource | Free Tier Limit |
|----------|-----------------|
| Storage | 10 GB |
| Bandwidth | 360 MB/day (~10 GB/month) |
| SSL Certificate | ✅ Included |
| Custom Domain | ✅ Included |
| CDN | ✅ Global |

**This is enough for**:
- ~1,000 users/day
- ~30,000 page views/month
- Small to medium apps

---

## 🌐 Add Custom Domain (Optional)

### **Step 1: Buy Domain**

Buy from:
- Namecheap: https://www.namecheap.com/
- Google Domains: https://domains.google/
- GoDaddy: https://www.godaddy.com/

### **Step 2: Add to Firebase**

1. Go to Firebase Console
2. Select your project
3. Go to "Hosting" → "Add custom domain"
4. Enter your domain (e.g., `foodbridge.com`)
5. Follow verification steps
6. Update DNS records (provided by Firebase)

### **Step 3: Wait for DNS Propagation**

- Takes 24-48 hours
- Firebase will automatically provision SSL certificate

### **Step 4: Update CORS**

Add your custom domain to CORS in `backend/src/server.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://foodbridge-app.web.app',
    'https://foodbridge.com',
    'https://www.foodbridge.com'
  ],
  credentials: true
}));
```

---

## 🚀 Advanced: Set Up CI/CD (Auto-Deploy)

### **Auto-Deploy Frontend on Git Push**

Create `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [ main ]
    paths:
      - 'web/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - name: Build
        run: |
          cd web
          npm ci
          npm run build
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: foodbridge-app
```

### **Auto-Deploy Backend**

Railway and Render automatically deploy when you push to GitHub!

---

## ✅ Deployment Checklist

### **Frontend Deployment**
- [ ] Firebase CLI installed
- [ ] Firebase project created
- [ ] Firebase initialized
- [ ] React app built
- [ ] Deployed to Firebase Hosting
- [ ] Frontend URL obtained

### **Backend Deployment**
- [ ] Code pushed to GitHub
- [ ] Platform account created (Railway/Render)
- [ ] PostgreSQL database created
- [ ] Environment variables configured
- [ ] Backend deployed
- [ ] Database migrations run
- [ ] Backend URL obtained

### **Integration**
- [ ] `web/.env.production` updated with backend URL
- [ ] Frontend rebuilt and redeployed
- [ ] CORS configured correctly
- [ ] App tested end-to-end

### **Optional**
- [ ] Custom domain added
- [ ] CI/CD set up
- [ ] Monitoring configured
- [ ] Analytics added

---

## 📚 Detailed Guides

For more detailed instructions, see:

- **Frontend Deployment**: `DEPLOY_FRONTEND_NOW.md`
- **Backend Deployment**: `DEPLOY_BACKEND_GUIDE.md`
- **Firebase Setup**: `FIREBASE_DEPLOYMENT_GUIDE.md`

---

## 🎯 Quick Commands

### **Deploy Frontend**
```bash
cd web && npm run build && cd .. && firebase deploy --only hosting
```

### **Deploy Backend (Railway)**
```bash
git add . && git commit -m "Update" && git push
```

### **Deploy Backend (Render)**
```bash
git add . && git commit -m "Update" && git push
```

### **Run Migrations (Railway)**
```bash
railway run node backend/create-database.js
```

### **Run Migrations (Render)**
```bash
# Use Render Shell in dashboard
cd backend && node create-database.js
```

---

## 🆘 Need Help?

If you encounter any issues:

1. **Check the detailed guides** (listed above)
2. **Check platform documentation**:
   - Firebase: https://firebase.google.com/docs/hosting
   - Railway: https://docs.railway.app/
   - Render: https://render.com/docs
3. **Check deployment logs** in your platform dashboard
4. **Ask me for help** - I can guide you through any step!

---

## 🎉 Success!

Once deployed, your app will be:

- ✅ **Available 24/7** from anywhere in the world
- ✅ **Secure** with HTTPS encryption
- ✅ **Fast** with global CDN
- ✅ **Scalable** to handle more users
- ✅ **Professional** with custom domain (optional)

**Your FoodBridge app is now live!** 🚀

---

**Ready to deploy? Start with Phase 1 (Frontend) above!**
