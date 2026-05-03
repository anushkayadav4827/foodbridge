# 🚀 Deploy Backend to Render - Step by Step

## 📋 Overview

This guide will help you deploy your FoodBridge backend to Render (free tier), including:
- ✅ PostgreSQL database (free)
- ✅ Backend API (free)
- ✅ Automatic HTTPS
- ✅ Environment variables

**Time Required**: ~20 minutes  
**Cost**: FREE (with limitations)

---

## ⚠️ Important: Free Tier Limitations

Render's free tier:
- ✅ Completely FREE (no credit card required)
- ⚠️ **Spins down after 15 minutes of inactivity**
- ⚠️ **Takes 30-60 seconds to wake up** on first request
- ✅ Good for testing and hobby projects

**If you need instant response**: Upgrade to paid tier ($7/month) later.

---

## 🎯 Step-by-Step Deployment

### **Step 1: Push Your Code to GitHub**

Your code needs to be on GitHub for Render to deploy it.

#### **1.1: Create GitHub Repository**

1. Go to: **https://github.com/new**
2. Repository name: **`foodbridge`** (or any name)
3. Description: **`FoodBridge - Food donation platform`**
4. **Public** or **Private** (your choice)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **"Create repository"**

#### **1.2: Push Your Code**

Open your terminal and run these commands:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for deployment"

# Add remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/foodbridge.git

# Push to GitHub
git push -u origin main
```

**If you get an error about "main" branch**, try:
```bash
git branch -M main
git push -u origin main
```

**✅ Your code is now on GitHub!**

---

### **Step 2: Create Render Account**

1. Go to: **https://render.com/**
2. Click **"Get Started"** or **"Sign Up"**
3. **Sign up with GitHub** (recommended - makes deployment easier)
4. Authorize Render to access your GitHub account
5. Click **"Authorize Render"**

**✅ Render account created!**

---

### **Step 3: Create PostgreSQL Database**

1. In Render dashboard, click **"New +"** (top right)
2. Select **"PostgreSQL"**
3. Fill in the details:
   - **Name**: `foodbridge-db`
   - **Database**: `foodbridge` (auto-filled)
   - **User**: `foodbridge` (auto-filled)
   - **Region**: Choose closest to you (e.g., **Oregon (US West)**)
   - **PostgreSQL Version**: **16** (latest)
   - **Plan**: **Free**
4. Click **"Create Database"**
5. Wait 1-2 minutes for database creation

#### **3.1: Copy Database Connection String**

Once created, you'll see database details. **Copy these values** (you'll need them later):

- **Internal Database URL**: `postgresql://foodbridge:...@...`
- **External Database URL**: `postgresql://foodbridge:...@...`

**Use the INTERNAL URL** for your backend.

**✅ Database created!**

---

### **Step 4: Create Web Service (Backend)**

1. Click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"**
3. Select your **foodbridge** repository
4. If you don't see it, click **"Configure account"** and grant access

#### **4.1: Configure Web Service**

Fill in these details:

| Field | Value |
|-------|-------|
| **Name** | `foodbridge-backend` |
| **Region** | Same as database (e.g., Oregon US West) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | **Free** |

#### **4.2: Add Environment Variables**

Scroll down to **"Environment Variables"** section and click **"Add Environment Variable"**.

Add these variables **one by one**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3005` |
| `DATABASE_URL` | `YOUR-INTERNAL-DATABASE-URL-FROM-STEP-3` |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-this-to-random-string` |
| `TWILIO_ACCOUNT_SID` | `your-twilio-account-sid` (or leave empty for now) |
| `TWILIO_AUTH_TOKEN` | `your-twilio-auth-token` (or leave empty for now) |
| `TWILIO_PHONE_NUMBER` | `your-twilio-phone-number` (or leave empty for now) |
| `REDIS_URL` | `redis://localhost:6379` (optional - won't work on free tier) |

**Important**:
- Replace `YOUR-INTERNAL-DATABASE-URL-FROM-STEP-3` with the actual Internal Database URL you copied
- Change `JWT_SECRET` to a random string (e.g., `my-super-secret-key-12345`)
- Twilio variables are optional (OTP will use mock mode without them)

#### **4.3: Create Web Service**

1. Click **"Create Web Service"**
2. Render will start building and deploying your backend
3. **Wait 3-5 minutes** for deployment to complete

You'll see logs like:
```
Building...
Installing dependencies...
Running build command...
Starting service...
```

When you see **"Live"** status with a green dot, your backend is deployed! ✅

---

### **Step 5: Get Your Backend URL**

Once deployed, you'll see your backend URL at the top:

**Example**: `https://foodbridge-backend.onrender.com`

**Copy this URL** - you'll need it for the frontend!

---

### **Step 6: Run Database Migrations**

Your database is empty and needs tables. Let's create them:

#### **6.1: Open Render Shell**

1. In your web service dashboard, click the **"Shell"** tab (top menu)
2. Wait for shell to connect
3. You'll see a terminal prompt

#### **6.2: Run Migration Script**

In the Render shell, run:

```bash
cd backend
node create-database.js
```

**OR** if you have migration files:

```bash
cd backend
npm run migrate:up
```

You should see output like:
```
✓ Database tables created successfully
```

**✅ Database is ready!**

---

### **Step 7: Test Your Backend**

Test if your backend is working:

1. Open your browser
2. Go to: `https://your-backend-url.onrender.com/api/v1/health`
3. You should see: `{"status":"ok","timestamp":"..."}`

**If you see this, your backend is working!** ✅

---

### **Step 8: Update Frontend to Use Deployed Backend**

Now connect your frontend to the deployed backend:

#### **8.1: Update Environment Variable**

Edit `web/.env.production`:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api/v1
```

Replace `your-backend-url.onrender.com` with your actual Render URL.

#### **8.2: Rebuild Frontend**

```bash
cd web
npm run build
cd ..
```

#### **8.3: Redeploy Frontend**

```bash
firebase deploy --only hosting
```

**✅ Frontend is now connected to deployed backend!**

---

### **Step 9: Test Your Live App**

1. Go to: **https://foodbridge-app-51332.web.app**
2. Try logging in with a phone number
3. Enter OTP: **123456** (mock mode)
4. Create a test listing
5. Check if everything works!

**🎉 Your app is now fully live!**

---

## 🔄 How to Update Your Deployed Backend

Whenever you make changes to your backend code:

```bash
# 1. Commit changes
git add .
git commit -m "Update backend"

# 2. Push to GitHub
git push

# 3. Render will automatically redeploy (takes 2-3 minutes)
```

That's it! Render automatically deploys when you push to GitHub.

---

## 🐛 Troubleshooting

### **Issue: Build failed**

**Solution**: Check build logs in Render dashboard
- Look for error messages
- Usually it's missing dependencies or TypeScript errors
- Fix errors and push again

---

### **Issue: Service won't start**

**Solution**: Check runtime logs
- Click "Logs" tab in Render dashboard
- Look for error messages
- Usually it's environment variable issues or database connection problems

---

### **Issue: Database connection failed**

**Solution**: Check DATABASE_URL
- Make sure you used the **Internal Database URL**
- Check if database is running (should show "Available" in Render dashboard)
- Verify the URL format is correct

---

### **Issue: "Service Unavailable" or slow response**

**Solution**: This is expected on free tier
- Free tier spins down after 15 minutes of inactivity
- First request takes 30-60 seconds to wake up
- Subsequent requests are fast
- Upgrade to paid tier ($7/month) for instant response

---

### **Issue: CORS errors**

**Solution**: Update CORS configuration in `backend/src/server.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://foodbridge-app-51332.web.app'
  ],
  credentials: true
}));
```

Then commit and push to redeploy.

---

## 📊 Your Deployed Stack

| Component | Service | URL | Cost |
|-----------|---------|-----|------|
| **Frontend** | Firebase Hosting | https://foodbridge-app-51332.web.app | FREE |
| **Backend** | Render Web Service | https://foodbridge-backend.onrender.com | FREE |
| **Database** | Render PostgreSQL | Internal URL | FREE |

**Total Cost**: **$0/month** 🎉

---

## 🚀 Optional: Upgrade to Paid Tier

If you want instant response (no spin-down):

1. Go to your web service in Render
2. Click "Settings"
3. Scroll to "Plan"
4. Select **"Starter"** ($7/month)
5. Add payment method
6. Click "Upgrade"

**Benefits**:
- ✅ No spin-down (always running)
- ✅ Instant response
- ✅ More resources
- ✅ Better for production

---

## ✅ Summary

**What you need to do**:

1. ✅ Push code to GitHub
2. ✅ Create Render account
3. ✅ Create PostgreSQL database
4. ✅ Create web service (backend)
5. ✅ Add environment variables
6. ✅ Run database migrations
7. ✅ Update frontend environment variable
8. ✅ Rebuild and redeploy frontend
9. ✅ Test your live app!

**Your app will be fully live at**:
- **Frontend**: https://foodbridge-app-51332.web.app
- **Backend**: https://your-backend-url.onrender.com

---

**Ready to deploy? Start with Step 1!** 🚀
