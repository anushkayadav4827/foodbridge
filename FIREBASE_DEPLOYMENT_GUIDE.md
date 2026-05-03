# 🔥 Firebase Hosting Deployment Guide

## 📋 Overview

This guide will help you deploy your FoodBridge React frontend to Firebase Hosting, making it available 24/7 at a custom URL.

**What will be deployed**: React Frontend (web/)  
**What won't be deployed**: Backend API (you'll need to deploy this separately or keep it running locally)

---

## 🚀 Step-by-Step Deployment

### **Step 1: Install Firebase CLI**

Open a new terminal and run:

```bash
npm install -g firebase-tools
```

Wait for installation to complete.

### **Step 2: Login to Firebase**

```bash
firebase login
```

This will:
1. Open your browser
2. Ask you to sign in with your Google account
3. Grant Firebase CLI access

### **Step 3: Create Firebase Project**

1. Go to: https://console.firebase.google.com/
2. Click **"Add project"**
3. Enter project name: `foodbridge-app` (or any name you prefer)
4. Click **"Continue"**
5. Disable Google Analytics (optional)
6. Click **"Create project"**
7. Wait for project creation
8. Click **"Continue"**

### **Step 4: Initialize Firebase in Your Project**

In your project root directory, run:

```bash
firebase init hosting
```

**Answer the prompts**:

1. **"Please select an option"**  
   → Select: `Use an existing project`

2. **"Select a default Firebase project"**  
   → Select: `foodbridge-app` (or the name you chose)

3. **"What do you want to use as your public directory?"**  
   → Enter: `web/dist`

4. **"Configure as a single-page app (rewrite all urls to /index.html)?"**  
   → Enter: `Yes`

5. **"Set up automatic builds and deploys with GitHub?"**  
   → Enter: `No`

6. **"File web/dist/index.html already exists. Overwrite?"**  
   → Enter: `No`

### **Step 5: Build Your React App**

```bash
cd web
npm run build
```

This creates an optimized production build in `web/dist/`.

**Wait for build to complete**. You should see:
```
✓ built in XXXms
```

### **Step 6: Deploy to Firebase**

Go back to project root:

```bash
cd ..
firebase deploy --only hosting
```

**Wait for deployment**. You should see:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/foodbridge-app/overview
Hosting URL: https://foodbridge-app.web.app
```

### **Step 7: Access Your Deployed App**

Your app is now live at:
- **Firebase URL**: `https://foodbridge-app.web.app`
- **Custom domain** (optional): You can add your own domain later

---

## 🔧 Configuration Files Created

### **1. `firebase.json`**
Main Firebase configuration file:
- Sets `web/dist` as the public directory
- Configures SPA routing (all routes go to index.html)
- Sets cache headers for assets

### **2. `.firebaserc`**
Project configuration:
- Links your local project to Firebase project
- Default project: `foodbridge-app`

### **3. `web/.env.production`**
Production environment variables:
- `VITE_API_URL`: Backend API URL (update this!)

---

## ⚠️ Important: Backend API

**Your frontend is now deployed, but it still needs the backend API!**

### **Option 1: Use Local Backend (Temporary)**

Your deployed frontend will try to connect to `http://localhost:3005`, which won't work for other users.

**This is only for testing your deployment.**

### **Option 2: Deploy Backend Separately (Recommended)**

You need to deploy your backend to a cloud service:

**Best options**:
1. **Google Cloud Run** (recommended with Firebase)
2. **Railway** (easiest)
3. **Render** (free tier available)
4. **Heroku** (paid)

**After deploying backend**, update `web/.env.production`:
```env
VITE_API_URL=https://your-backend-url.com/api/v1
```

Then rebuild and redeploy:
```bash
cd web
npm run build
cd ..
firebase deploy --only hosting
```

---

## 🔄 How to Update Your Deployed App

Whenever you make changes to your frontend:

```bash
# 1. Build the app
cd web
npm run build

# 2. Deploy to Firebase
cd ..
firebase deploy --only hosting
```

---

## 🌐 Custom Domain (Optional)

To use your own domain (e.g., `foodbridge.com`):

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Go to **Hosting** → **Add custom domain**
4. Follow the instructions to verify domain ownership
5. Update DNS records

---

## 📊 Firebase Hosting Features

### **What You Get (Free Tier)**

- ✅ **10 GB storage**
- ✅ **360 MB/day bandwidth** (~10 GB/month)
- ✅ **Free SSL certificate** (HTTPS)
- ✅ **Global CDN** (fast worldwide)
- ✅ **Automatic scaling**
- ✅ **99.95% uptime SLA**

### **Pricing**

- **Free tier**: Perfect for small apps
- **Paid tier**: $0.026/GB storage, $0.15/GB bandwidth

For most small apps, **free tier is enough**!

---

## 🐛 Troubleshooting

### **Issue: "Firebase command not found"**

**Solution**: Install Firebase CLI globally
```bash
npm install -g firebase-tools
```

### **Issue: "Error: HTTP Error: 403, The caller does not have permission"**

**Solution**: Make sure you're logged in
```bash
firebase logout
firebase login
```

### **Issue: "Build failed"**

**Solution**: Check for errors in your React code
```bash
cd web
npm run build
```

Fix any errors shown, then try again.

### **Issue: "Deployed app shows blank page"**

**Solution**: Check browser console for errors
1. Open deployed app
2. Press F12
3. Check Console tab for errors
4. Usually it's an API connection issue

### **Issue: "API calls not working"**

**Solution**: Update backend URL in `web/.env.production`
```env
VITE_API_URL=https://your-backend-url.com/api/v1
```

Then rebuild and redeploy.

---

## 📋 Quick Commands Reference

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# Build React app
cd web && npm run build && cd ..

# Deploy to Firebase
firebase deploy --only hosting

# View deployment
firebase open hosting:site
```

---

## 🎯 Next Steps

After deploying frontend:

1. ✅ **Frontend deployed** to Firebase Hosting
2. ⏳ **Deploy backend** to Cloud Run/Railway/Render
3. ⏳ **Update API URL** in `web/.env.production`
4. ⏳ **Redeploy frontend** with correct backend URL
5. ⏳ **Add custom domain** (optional)
6. ⏳ **Set up CI/CD** (optional - auto-deploy on git push)

---

## 🚀 Deploy Backend Next

Would you like me to create deployment guides for:

1. **Google Cloud Run** (recommended with Firebase)
2. **Railway** (easiest, free tier)
3. **Render** (free tier, all-in-one)

Let me know which one you prefer!

---

## ✅ Summary

**What you have now**:
- ✅ Firebase configuration files created
- ✅ Production environment variables set up
- ✅ Deployment guide ready

**What to do**:
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `cd web && npm run build`
5. Deploy: `firebase deploy --only hosting`

**Your app will be live at**: `https://foodbridge-app.web.app` 🎉

---

**Need help with any step? Let me know!**
