# 🚀 Deploy Backend API - Complete Guide

## 📋 Overview

Your backend needs to be deployed to a cloud service so your deployed frontend can connect to it. This guide covers the **3 best options** for deploying your Node.js + PostgreSQL backend.

---

## 🎯 Choose Your Deployment Platform

| Platform | Free Tier | Ease | Best For |
|----------|-----------|------|----------|
| **Railway** | ✅ Yes ($5 credit/month) | ⭐⭐⭐ Easiest | Quick deployment, small apps |
| **Render** | ✅ Yes (limited) | ⭐⭐ Easy | Free hosting, hobby projects |
| **Google Cloud Run** | ⚠️ Pay-as-you-go | ⭐ Advanced | Professional apps, scales well |

**Recommendation**: Start with **Railway** (easiest) or **Render** (free tier).

---

## 🚂 Option 1: Railway (Recommended - Easiest)

### **Why Railway?**
- ✅ Easiest deployment (literally 5 clicks)
- ✅ Automatic PostgreSQL database
- ✅ Free $5 credit/month (enough for small apps)
- ✅ Automatic HTTPS
- ✅ Environment variables management
- ✅ Automatic deployments from GitHub

### **Cost**
- **Free tier**: $5 credit/month (renews monthly)
- **Typical usage**: $3-5/month for small apps
- **After free credit**: Pay-as-you-go (~$5-10/month)

### **Step-by-Step Deployment**

#### **1. Create Railway Account**

1. Go to: **https://railway.app/**
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (recommended) or email
4. Verify your email

#### **2. Create New Project**

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Connect your GitHub account (if not already connected)
4. Select your repository (you'll need to push your code to GitHub first)

**Don't have GitHub repo yet?** See "Prepare Your Code" section below.

#### **3. Add PostgreSQL Database**

1. In your Railway project, click **"New"**
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Railway will automatically create a database

#### **4. Configure Environment Variables**

1. Click on your **backend service** (not the database)
2. Go to **"Variables"** tab
3. Add these variables:

```env
NODE_ENV=production
PORT=3005
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
REDIS_URL=redis://localhost:6379
```

**Important**: 
- `DATABASE_URL` will auto-populate from your PostgreSQL service
- Change `JWT_SECRET` to a random string
- Add your Twilio credentials if you want SMS to work

#### **5. Deploy**

1. Railway will automatically deploy your app
2. Wait for deployment (2-3 minutes)
3. You'll see a **"Deployment successful"** message

#### **6. Get Your Backend URL**

1. Click on your backend service
2. Go to **"Settings"** tab
3. Scroll to **"Domains"**
4. Click **"Generate Domain"**
5. Copy your URL (e.g., `https://foodbridge-backend-production.up.railway.app`)

#### **7. Run Database Migrations**

Railway doesn't automatically run migrations. You need to:

**Option A: Use Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run node backend/migrations/run-all-migrations.js
```

**Option B: Connect to database manually**

1. Get database credentials from Railway dashboard
2. Use a PostgreSQL client (e.g., pgAdmin, DBeaver)
3. Run migration files manually

#### **8. Update Frontend**

Update `web/.env.production`:

```env
VITE_API_URL=https://your-railway-url.up.railway.app/api/v1
```

Then rebuild and redeploy frontend:

```bash
cd web
npm run build
cd ..
firebase deploy --only hosting
```

---

## 🎨 Option 2: Render (Free Tier Available)

### **Why Render?**
- ✅ True free tier (no credit card required)
- ✅ PostgreSQL included
- ✅ Easy deployment
- ✅ Automatic HTTPS
- ⚠️ Free tier has limitations (spins down after inactivity)

### **Cost**
- **Free tier**: Completely free (with limitations)
- **Paid tier**: $7/month (no spin-down)

### **Free Tier Limitations**
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ Takes 30-60 seconds to wake up
- ⚠️ 750 hours/month (enough for 24/7 if only one service)

**Good for**: Testing, hobby projects, low-traffic apps

### **Step-by-Step Deployment**

#### **1. Create Render Account**

1. Go to: **https://render.com/**
2. Click **"Get Started"**
3. Sign up with **GitHub** (recommended)

#### **2. Create PostgreSQL Database**

1. Click **"New +"** → **"PostgreSQL"**
2. Enter database name: `foodbridge-db`
3. Select **"Free"** plan
4. Click **"Create Database"**
5. Wait for database creation (1-2 minutes)
6. Copy the **"Internal Database URL"**

#### **3. Create Web Service**

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `foodbridge-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: `Free`

#### **4. Add Environment Variables**

In the **"Environment"** tab, add:

```env
NODE_ENV=production
PORT=3005
DATABASE_URL=your-internal-database-url-from-step-2
JWT_SECRET=your-super-secret-jwt-key-change-this
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
REDIS_URL=redis://localhost:6379
```

#### **5. Deploy**

1. Click **"Create Web Service"**
2. Render will automatically deploy
3. Wait for deployment (3-5 minutes)
4. You'll see **"Live"** status when ready

#### **6. Get Your Backend URL**

Your URL will be: `https://foodbridge-backend.onrender.com`

#### **7. Run Database Migrations**

Use Render Shell:

1. Go to your web service dashboard
2. Click **"Shell"** tab
3. Run:
```bash
cd backend
node migrations/run-all-migrations.js
```

#### **8. Update Frontend**

Update `web/.env.production`:

```env
VITE_API_URL=https://foodbridge-backend.onrender.com/api/v1
```

Then rebuild and redeploy frontend.

---

## ☁️ Option 3: Google Cloud Run (Advanced)

### **Why Cloud Run?**
- ✅ Integrates perfectly with Firebase
- ✅ Automatic scaling (0 to millions)
- ✅ Pay only for what you use
- ✅ Professional solution
- ⚠️ More complex setup

### **Cost**
- **Free tier**: 2 million requests/month
- **Typical cost**: $1-5/month for small apps
- **Pay-as-you-go**: $0.00002400/request

### **Prerequisites**
- Google Cloud account
- gcloud CLI installed
- Docker installed

### **Step-by-Step Deployment**

#### **1. Install gcloud CLI**

Download from: https://cloud.google.com/sdk/docs/install

#### **2. Create Dockerfile**

Create `backend/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3005

CMD ["npm", "start"]
```

#### **3. Create Cloud SQL PostgreSQL**

```bash
# Create instance
gcloud sql instances create foodbridge-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create foodbridge --instance=foodbridge-db

# Create user
gcloud sql users create foodbridge-user \
  --instance=foodbridge-db \
  --password=your-secure-password
```

#### **4. Build and Deploy**

```bash
# Build container
gcloud builds submit --tag gcr.io/YOUR-PROJECT-ID/foodbridge-backend

# Deploy to Cloud Run
gcloud run deploy foodbridge-backend \
  --image gcr.io/YOUR-PROJECT-ID/foodbridge-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances YOUR-PROJECT-ID:us-central1:foodbridge-db \
  --set-env-vars DATABASE_URL=postgresql://foodbridge-user:password@/foodbridge?host=/cloudsql/YOUR-PROJECT-ID:us-central1:foodbridge-db
```

#### **5. Get Your Backend URL**

Cloud Run will output your URL: `https://foodbridge-backend-xxxxx-uc.a.run.app`

---

## 📦 Prepare Your Code for Deployment

Before deploying to any platform, you need to:

### **1. Push Code to GitHub**

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Create GitHub repo (go to github.com and create new repo)

# Add remote
git remote add origin https://github.com/yourusername/foodbridge.git

# Push
git push -u origin main
```

### **2. Update package.json**

Make sure `backend/package.json` has a start script:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.ts"
  }
}
```

### **3. Create .env.example**

Create `backend/.env.example` with all required variables (without values):

```env
NODE_ENV=
PORT=
DATABASE_URL=
JWT_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
REDIS_URL=
```

### **4. Update .gitignore**

Make sure `backend/.gitignore` includes:

```
node_modules/
.env
logs/
*.log
```

---

## 🔄 After Backend Deployment

### **1. Update Frontend Environment Variables**

Edit `web/.env.production`:

```env
VITE_API_URL=https://your-backend-url.com/api/v1
```

### **2. Rebuild and Redeploy Frontend**

```bash
cd web
npm run build
cd ..
firebase deploy --only hosting
```

### **3. Test Your Deployed App**

1. Visit your Firebase URL: `https://foodbridge-app.web.app`
2. Try logging in with OTP
3. Check if API calls work
4. Test creating a listing

---

## 🐛 Troubleshooting

### **Issue: "Cannot connect to database"**

**Solution**: Check database URL format

Railway/Render format:
```
postgresql://user:password@host:port/database
```

Cloud SQL format:
```
postgresql://user:password@/database?host=/cloudsql/project:region:instance
```

### **Issue: "CORS errors"**

**Solution**: Update CORS configuration in `backend/src/server.ts`:

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

### **Issue: "Environment variables not working"**

**Solution**: 
1. Check variable names (case-sensitive)
2. Restart your service after adding variables
3. Check logs for errors

### **Issue: "Migrations not running"**

**Solution**: Run migrations manually using platform CLI or shell

---

## 📊 Cost Comparison

| Platform | Free Tier | Paid Tier | Database | Best For |
|----------|-----------|-----------|----------|----------|
| **Railway** | $5 credit/month | ~$5-10/month | Included | Quick start |
| **Render** | ✅ Free (limited) | $7/month | Included | Hobby projects |
| **Cloud Run** | 2M requests/month | ~$1-5/month | Separate ($10/month) | Professional apps |

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Platform account created
- [ ] Database created
- [ ] Environment variables configured
- [ ] Backend deployed
- [ ] Database migrations run
- [ ] Backend URL obtained
- [ ] Frontend `.env.production` updated
- [ ] Frontend rebuilt and redeployed
- [ ] App tested end-to-end

---

## 🎯 Recommended Deployment Flow

**For beginners**: Railway (easiest, $5 credit)  
**For free hosting**: Render (free tier with limitations)  
**For production**: Google Cloud Run (professional, scalable)

---

## 🆘 Need Help?

If you encounter issues:

1. Check platform documentation
2. Check deployment logs
3. Test database connection
4. Verify environment variables
5. Ask me for help!

---

**Ready to deploy your backend? Choose a platform and follow the steps!** 🚀
