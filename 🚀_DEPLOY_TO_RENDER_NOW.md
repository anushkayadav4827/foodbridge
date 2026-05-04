# 🚀 Deploy Backend to Render - Step by Step

## ✅ Verification Complete!

I verified your GitHub repository: **https://github.com/anushkayadav4827/foodbridge**

**Confirmed**:
- ✅ `backend` folder is on GitHub
- ✅ `web` folder is on GitHub
- ✅ All necessary files are present

**Now let's deploy your backend to Render!**

---

## 📋 What You'll Do (8 Steps - 20 minutes)

### **Step 1: Create Render Account (2 minutes)**

1. Go to: **https://render.com/**
2. Click **"Get Started"** or **"Sign Up"**
3. **Sign up with GitHub** (recommended - easiest)
4. Click **"Authorize Render"** when prompted
5. You'll be redirected to Render dashboard

**✅ Account created!**

---

### **Step 2: Create PostgreSQL Database (3 minutes)**

1. In Render dashboard, click **"New +"** button (top right)
2. Select **"PostgreSQL"**
3. Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `foodbridge-db` |
| **Database** | `foodbridge` (auto-filled) |
| **User** | `foodbridge` (auto-filled) |
| **Region** | Choose closest to you (e.g., **Oregon (US West)** or **Frankfurt (EU Central)**) |
| **PostgreSQL Version** | **16** (latest) |
| **Datadog API Key** | Leave empty |
| **Plan** | **Free** |

4. Click **"Create Database"**
5. Wait 1-2 minutes for database creation
6. You'll see "Available" status when ready

#### **Copy Database URL**

Once created, scroll down to **"Connections"** section:

- You'll see **"Internal Database URL"**
- Click the **copy icon** next to it
- **Save this URL** - you'll need it in Step 4!

Example format: `postgresql://foodbridge:XXXXX@dpg-XXXXX-a/foodbridge`

**✅ Database created!**

---

### **Step 3: Create Web Service (5 minutes)**

1. Click **"New +"** button again
2. Select **"Web Service"**
3. Click **"Build and deploy from a Git repository"**
4. Click **"Connect a repository"**

#### **Connect GitHub Repository**

- You'll see a list of your repositories
- Find and select: **`foodbridge`**
- If you don't see it, click **"Configure account"** and grant Render access to your repositories

#### **Configure Web Service**

Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `foodbridge-backend` |
| **Region** | **Same as your database** (e.g., Oregon US West) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` (auto-detected) |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | **Free** |

**Important**: Make sure **Root Directory** is set to `backend` - this tells Render where your backend code is!

**Don't click "Create Web Service" yet!** We need to add environment variables first.

---

### **Step 4: Add Environment Variables (5 minutes)**

Scroll down to **"Environment Variables"** section.

Click **"Add Environment Variable"** and add these **one by one**:

#### **Required Variables**

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3005` |
| `DATABASE_URL` | **Paste your Internal Database URL from Step 2** |
| `JWT_SECRET` | `foodbridge-secret-key-change-this-12345` |
| `JWT_REFRESH_SECRET` | `foodbridge-refresh-key-change-this-67890` |
| `JWT_EXPIRES_IN` | `7d` |
| `JWT_REFRESH_EXPIRES_IN` | `30d` |
| `CORS_ORIGIN` | `https://foodbridge-app-51332.web.app` |

#### **Optional Variables** (can leave empty for now)

| Key | Value |
|-----|-------|
| `REDIS_URL` | `redis://localhost:6379` |
| `TWILIO_ACCOUNT_SID` | (leave empty - will use mock OTP) |
| `TWILIO_AUTH_TOKEN` | (leave empty) |
| `TWILIO_PHONE_NUMBER` | (leave empty) |
| `AWS_REGION` | `ap-south-1` |
| `AWS_ACCESS_KEY_ID` | (leave empty) |
| `AWS_SECRET_ACCESS_KEY` | (leave empty) |
| `AWS_S3_BUCKET` | `foodbridge-uploads` |

**Important Notes**:
- Replace `DATABASE_URL` value with your actual Internal Database URL from Step 2
- You can change `JWT_SECRET` and `JWT_REFRESH_SECRET` to any random strings
- `CORS_ORIGIN` should match your Firebase frontend URL

---

### **Step 5: Deploy Backend (5 minutes)**

1. Click **"Create Web Service"** button at the bottom
2. Render will start building and deploying your backend
3. You'll see the deployment logs in real-time

**What's happening**:
- Render is cloning your GitHub repository
- Installing dependencies (`npm install`)
- Building TypeScript code (`npm run build`)
- Starting your server (`npm start`)

**Wait for deployment to complete** (3-5 minutes). You'll see:
- ✅ "Build successful"
- ✅ "Deploy live"
- ✅ Green "Live" status indicator

**✅ Backend deployed!**

---

### **Step 6: Get Your Backend URL (1 minute)**

Once deployed, you'll see your backend URL at the top of the page:

**Example**: `https://foodbridge-backend.onrender.com`

**Copy this URL!** You'll need it later.

---

### **Step 7: Run Database Migrations (2 minutes)**

Your database is empty and needs tables. Let's create them:

1. In your web service page, click the **"Shell"** tab (top menu)
2. Wait for shell to connect (10-20 seconds)
3. You'll see a terminal prompt

Run this command:

```bash
node create-database.js
```

You should see output like:
```
✓ Connected to database
✓ Creating tables...
✓ Database tables created successfully
```

**If you see errors**, try:
```bash
cd backend
node create-database.js
```

**✅ Database is ready!**

---

### **Step 8: Test Your Backend (1 minute)**

Let's verify your backend is working:

1. Open your browser
2. Go to: `https://your-backend-url.onrender.com/api/v1/health`
   (Replace `your-backend-url` with your actual Render URL)

You should see:
```json
{
  "status": "ok",
  "timestamp": "2026-05-04T..."
}
```

**If you see this, your backend is working!** ✅

---

## 🔗 Next Step: Connect Frontend to Backend

Now that your backend is deployed, let's connect your frontend to it.

### **Update Frontend Environment Variable**

1. Open `web/.env.production` in your project
2. Update it with your Render backend URL:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api/v1
```

Replace `your-backend-url.onrender.com` with your actual Render URL.

### **Rebuild and Redeploy Frontend**

Run these commands:

```bash
cd web
npm run build
cd ..
firebase deploy --only hosting
```

Wait for deployment to complete (1-2 minutes).

**✅ Frontend is now connected to deployed backend!**

---

## 🎉 Test Your Live App

1. Go to: **https://foodbridge-app-51332.web.app**
2. Try logging in:
   - Enter any phone number (e.g., +919876543210)
   - OTP: `123456` (mock mode)
3. Create a test listing
4. Check dashboard
5. Everything should work!

**🎉 Your app is now fully live 24/7!**

---

## 📊 Your Deployed Stack

| Component | Service | URL | Cost |
|-----------|---------|-----|------|
| **Frontend** | Firebase Hosting | https://foodbridge-app-51332.web.app | FREE |
| **Backend** | Render Web Service | https://your-backend-url.onrender.com | FREE |
| **Database** | Render PostgreSQL | Internal URL | FREE |

**Total Cost**: **$0/month** 🎉

---

## ⚠️ Important: Free Tier Limitations

Render's free tier has some limitations:

- ✅ Completely FREE (no credit card required)
- ⚠️ **Spins down after 15 minutes of inactivity**
- ⚠️ **Takes 30-60 seconds to wake up** on first request after spin-down
- ✅ Good for testing, demos, and hobby projects

**What this means**:
- If no one uses your app for 15 minutes, the backend goes to sleep
- The next person who visits will wait 30-60 seconds for it to wake up
- After that, it's fast until it goes to sleep again

**If you need instant response 24/7**: Upgrade to paid tier ($7/month) later.

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
- Click "Logs" tab
- Look for error messages
- Usually it's missing dependencies or TypeScript errors
- Fix errors in your code and push to GitHub again

---

### **Issue: Service won't start**

**Solution**: Check runtime logs
- Click "Logs" tab
- Look for error messages
- Usually it's environment variable issues or database connection problems
- Verify DATABASE_URL is correct
- Check if database is "Available"

---

### **Issue: Database connection failed**

**Solution**: 
- Make sure you used the **Internal Database URL** (not External)
- Check if DATABASE_URL environment variable is set correctly
- Verify database status is "Available" in Render dashboard
- Try restarting the web service

---

### **Issue: CORS errors in frontend**

**Solution**: Update CORS_ORIGIN environment variable
- Go to Render dashboard → Your web service → Environment
- Update `CORS_ORIGIN` to include your Firebase URL
- Save and wait for automatic redeploy

---

### **Issue: "Service Unavailable" or slow response**

**Solution**: This is expected on free tier
- Free tier spins down after 15 minutes of inactivity
- First request takes 30-60 seconds to wake up
- Subsequent requests are fast
- This is normal behavior for free tier
- Upgrade to paid tier ($7/month) for instant response

---

## ✅ Deployment Checklist

- [ ] Create Render account
- [ ] Create PostgreSQL database
- [ ] Copy Internal Database URL
- [ ] Create Web Service
- [ ] Set Root Directory to `backend`
- [ ] Add environment variables
- [ ] Deploy backend
- [ ] Wait for "Live" status
- [ ] Run database migrations in Shell
- [ ] Copy backend URL
- [ ] Test backend health endpoint
- [ ] Update frontend .env.production
- [ ] Rebuild frontend
- [ ] Redeploy frontend to Firebase
- [ ] Test live app end-to-end

---

## 🎯 Quick Summary

**What you need to do right now**:

1. ✅ Go to: **https://render.com/**
2. ✅ Sign up with GitHub
3. ✅ Create PostgreSQL database
4. ✅ Create Web Service (connect foodbridge repo)
5. ✅ Add environment variables
6. ✅ Deploy and wait 5 minutes
7. ✅ Run migrations in Shell
8. ✅ Update frontend with backend URL
9. ✅ Redeploy frontend
10. ✅ Test your app!

**Total Time**: ~20 minutes  
**Total Cost**: $0

---

**Ready to deploy? Start with Step 1!** 🚀

Go to: **https://render.com/**

