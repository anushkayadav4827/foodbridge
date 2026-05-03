# ✅ Complete Deployment Guide - Frontend + Backend

## 🎯 Goal

Make your FoodBridge app fully live 24/7 with both frontend and backend deployed.

---

## 📊 Current Status

- ✅ **Frontend**: Deployed to Firebase Hosting
  - URL: https://foodbridge-app-51332.web.app
  - Status: Live ✅
  
- ⏳ **Backend**: Not deployed yet
  - Status: Needs deployment ⏳

---

## 🚀 Backend Deployment Steps

Follow these steps to deploy your backend to Render (free tier):

### **Step 1: Push Code to GitHub (5 minutes)**

1. **Create GitHub repository**:
   - Go to: https://github.com/new
   - Repository name: `foodbridge`
   - Make it Public or Private
   - Click "Create repository"

2. **Push your code**:
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git remote add origin https://github.com/YOUR-USERNAME/foodbridge.git
   git push -u origin main
   ```
   
   Replace `YOUR-USERNAME` with your GitHub username.

**✅ Code is on GitHub!**

---

### **Step 2: Create Render Account (2 minutes)**

1. Go to: https://render.com/
2. Click "Get Started" or "Sign Up"
3. **Sign up with GitHub** (easiest)
4. Authorize Render

**✅ Render account created!**

---

### **Step 3: Create PostgreSQL Database (3 minutes)**

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Fill in:
   - Name: `foodbridge-db`
   - Database: `foodbridge`
   - Region: Choose closest to you
   - Plan: **Free**
3. Click **"Create Database"**
4. Wait 1-2 minutes
5. **Copy "Internal Database URL"** (you'll need this!)

**✅ Database created!**

---

### **Step 4: Create Web Service (5 minutes)**

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Fill in:
   - Name: `foodbridge-backend`
   - Region: Same as database
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: **Free**

4. **Add Environment Variables** (click "Add Environment Variable"):

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `3005` |
   | `DATABASE_URL` | Paste Internal Database URL from Step 3 |
   | `JWT_SECRET` | `foodbridge-secret-key-12345` (change this!) |
   | `JWT_REFRESH_SECRET` | `foodbridge-refresh-key-67890` (change this!) |
   | `CORS_ORIGIN` | `https://foodbridge-app-51332.web.app` |

   **Optional variables** (can leave empty):
   - `REDIS_URL`: `redis://localhost:6379`
   - `TWILIO_ACCOUNT_SID`: (leave empty for mock OTP)
   - `TWILIO_AUTH_TOKEN`: (leave empty)
   - `TWILIO_PHONE_NUMBER`: (leave empty)

5. Click **"Create Web Service"**
6. Wait 3-5 minutes for deployment

**✅ Backend is deploying!**

---

### **Step 5: Run Database Migrations (2 minutes)**

Once deployment is complete:

1. Click **"Shell"** tab in your web service
2. Wait for shell to connect
3. Run:
   ```bash
   cd backend
   node create-database.js
   ```

You should see: `✓ Database tables created successfully`

**✅ Database is ready!**

---

### **Step 6: Get Your Backend URL (1 minute)**

Your backend URL will be shown at the top of your web service page:

**Example**: `https://foodbridge-backend.onrender.com`

**Copy this URL!**

---

### **Step 7: Update Frontend (5 minutes)**

Connect your frontend to the deployed backend:

1. **Edit** `web/.env.production`:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com/api/v1
   ```
   
   Replace `your-backend-url.onrender.com` with your actual Render URL.

2. **Rebuild frontend**:
   ```bash
   cd web
   npm run build
   cd ..
   ```

3. **Redeploy to Firebase**:
   ```bash
   firebase deploy --only hosting
   ```

**✅ Frontend is connected to backend!**

---

### **Step 8: Test Your Live App (2 minutes)**

1. Go to: **https://foodbridge-app-51332.web.app**
2. Try logging in:
   - Enter any phone number
   - OTP: `123456` (mock mode)
3. Create a test listing
4. Check dashboard

**🎉 Everything should work!**

---

## 📊 Your Deployed Stack

| Component | Service | URL | Cost |
|-----------|---------|-----|------|
| **Frontend** | Firebase Hosting | https://foodbridge-app-51332.web.app | FREE |
| **Backend** | Render Web Service | https://foodbridge-backend.onrender.com | FREE |
| **Database** | Render PostgreSQL | Internal URL | FREE |

**Total Cost**: **$0/month** 🎉

---

## ⚠️ Important: Free Tier Limitations

Render's free tier:
- ✅ Completely FREE
- ⚠️ **Spins down after 15 minutes of inactivity**
- ⚠️ **Takes 30-60 seconds to wake up** on first request
- ✅ Good for testing and hobby projects

**If you need instant response**: Upgrade to paid tier ($7/month).

---

## 🔄 How to Update Your App

### **Update Frontend**:
```bash
cd web
npm run build
cd ..
firebase deploy --only hosting
```

### **Update Backend**:
```bash
git add .
git commit -m "Update backend"
git push
# Render auto-deploys in 2-3 minutes
```

---

## 🐛 Troubleshooting

### **Issue: Backend build failed**

**Solution**: Check build logs in Render dashboard
- Look for error messages
- Fix errors in your code
- Push to GitHub again

---

### **Issue: Database connection failed**

**Solution**: 
- Make sure you used **Internal Database URL** (not External)
- Check if DATABASE_URL environment variable is set correctly
- Verify database is "Available" in Render dashboard

---

### **Issue: CORS errors**

**Solution**: Update CORS_ORIGIN environment variable
- Go to Render dashboard → Your web service → Environment
- Update `CORS_ORIGIN` to include your Firebase URL
- Save and wait for redeploy

---

### **Issue: Slow response or "Service Unavailable"**

**Solution**: This is expected on free tier
- Free tier spins down after 15 minutes
- First request takes 30-60 seconds to wake up
- Subsequent requests are fast
- Upgrade to paid tier for instant response

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] PostgreSQL database created
- [ ] Web service created
- [ ] Environment variables added
- [ ] Backend deployed successfully
- [ ] Database migrations run
- [ ] Backend URL obtained
- [ ] Frontend environment variable updated
- [ ] Frontend rebuilt and redeployed
- [ ] App tested end-to-end

---

## 🎉 Success!

Your FoodBridge app is now fully live 24/7!

**Frontend**: https://foodbridge-app-51332.web.app  
**Backend**: https://your-backend-url.onrender.com

**Share your app with the world!** 🌍

---

## 📚 Additional Resources

- **Render Documentation**: https://render.com/docs
- **Firebase Hosting Docs**: https://firebase.google.com/docs/hosting
- **Detailed Backend Guide**: `DEPLOY_BACKEND_TO_RENDER.md`
- **Environment Variables**: `RENDER_ENV_VARIABLES.txt`

---

**Need help? Let me know!** 🚀
