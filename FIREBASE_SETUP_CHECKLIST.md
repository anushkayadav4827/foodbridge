# ✅ Firebase Hosting Setup Checklist

## 🎯 Quick Start

Follow these steps in order to deploy your FoodBridge frontend to Firebase Hosting.

---

## 📋 Pre-Deployment Checklist

- [ ] Node.js installed (check: `node --version`)
- [ ] npm installed (check: `npm --version`)
- [ ] Google account ready
- [ ] Internet connection stable

---

## 🚀 Deployment Steps

### **Step 1: Install Firebase CLI**

```bash
npm install -g firebase-tools
```

**Check installation**:
```bash
firebase --version
```

- [ ] Firebase CLI installed successfully

---

### **Step 2: Login to Firebase**

```bash
firebase login
```

- [ ] Browser opened
- [ ] Signed in with Google account
- [ ] Firebase CLI access granted
- [ ] Terminal shows "Success! Logged in as your-email@gmail.com"

---

### **Step 3: Create Firebase Project**

1. Go to: https://console.firebase.google.com/
2. Click **"Add project"**
3. Project name: `foodbridge-app`
4. Disable Google Analytics (optional)
5. Click **"Create project"**

- [ ] Firebase project created
- [ ] Project name: `foodbridge-app` (or your chosen name)

---

### **Step 4: Initialize Firebase**

In your project root directory:

```bash
firebase init hosting
```

**Answer prompts**:
- Use existing project: **Yes**
- Select project: **foodbridge-app**
- Public directory: **web/dist**
- Single-page app: **Yes**
- GitHub auto-deploy: **No**
- Overwrite index.html: **No**

- [ ] Firebase initialized
- [ ] `firebase.json` exists
- [ ] `.firebaserc` exists

---

### **Step 5: Build React App**

```bash
cd web
npm run build
```

**Wait for**:
```
✓ built in XXXms
```

- [ ] Build completed successfully
- [ ] `web/dist` folder created
- [ ] No build errors

---

### **Step 6: Deploy to Firebase**

```bash
cd ..
firebase deploy --only hosting
```

**Wait for**:
```
✔  Deploy complete!
Hosting URL: https://foodbridge-app.web.app
```

- [ ] Deployment successful
- [ ] Hosting URL received
- [ ] No deployment errors

---

### **Step 7: Test Deployed App**

1. Open: `https://foodbridge-app.web.app`
2. Check if landing page loads
3. Try navigating to different pages

- [ ] App loads successfully
- [ ] Landing page visible
- [ ] Navigation works
- [ ] No console errors (F12 → Console)

---

## ⚠️ Known Issues & Solutions

### **Issue 1: API Calls Fail**

**Symptom**: Frontend loads but login/data doesn't work

**Cause**: Backend not deployed

**Solution**: 
- For now, backend runs locally (localhost:3005)
- Deploy backend separately (see backend deployment guide)
- Update `web/.env.production` with backend URL
- Rebuild and redeploy

- [ ] Understood that backend needs separate deployment

---

### **Issue 2: Blank Page After Deployment**

**Symptom**: Deployed app shows blank white page

**Cause**: Build or routing issue

**Solution**:
1. Check browser console (F12)
2. Look for errors
3. Verify `firebase.json` has correct rewrites
4. Rebuild: `cd web && npm run build`
5. Redeploy: `firebase deploy --only hosting`

---

### **Issue 3: "Firebase command not found"**

**Symptom**: Terminal doesn't recognize `firebase` command

**Cause**: Firebase CLI not installed or not in PATH

**Solution**:
```bash
npm install -g firebase-tools
```

Close and reopen terminal, then try again.

---

## 🔄 How to Update Deployed App

Whenever you make changes:

```bash
# Option 1: Use the script
deploy-to-firebase.bat

# Option 2: Manual
cd web
npm run build
cd ..
firebase deploy --only hosting
```

- [ ] Know how to update deployed app

---

## 📊 What You Get

### **Free Tier Limits**

- ✅ 10 GB storage
- ✅ 360 MB/day bandwidth (~10 GB/month)
- ✅ Free SSL (HTTPS)
- ✅ Global CDN
- ✅ Custom domain support

### **Your URLs**

- **Firebase URL**: `https://foodbridge-app.web.app`
- **Alternative URL**: `https://foodbridge-app.firebaseapp.com`
- **Custom domain**: Add later in Firebase Console

- [ ] Understand Firebase Hosting limits

---

## 🎯 Post-Deployment Tasks

### **Immediate**

- [ ] Test deployed app
- [ ] Share URL with team/users
- [ ] Check Firebase Console for analytics

### **Soon**

- [ ] Deploy backend to cloud service
- [ ] Update API URL in `web/.env.production`
- [ ] Redeploy frontend with correct backend URL
- [ ] Test full app functionality

### **Optional**

- [ ] Add custom domain
- [ ] Set up CI/CD (auto-deploy on git push)
- [ ] Configure Firebase Analytics
- [ ] Set up monitoring/alerts

---

## 📚 Files Created

- ✅ `firebase.json` - Firebase configuration
- ✅ `.firebaserc` - Project settings
- ✅ `web/.env.production` - Production environment variables
- ✅ `FIREBASE_DEPLOYMENT_GUIDE.md` - Detailed guide
- ✅ `deploy-to-firebase.bat` - Quick deploy script
- ✅ `FIREBASE_SETUP_CHECKLIST.md` - This file

---

## 🆘 Need Help?

### **Firebase Documentation**
- https://firebase.google.com/docs/hosting

### **Firebase Console**
- https://console.firebase.google.com/

### **Common Commands**

```bash
# Check Firebase CLI version
firebase --version

# Login to Firebase
firebase login

# List Firebase projects
firebase projects:list

# Deploy to Firebase
firebase deploy --only hosting

# Open Firebase Console
firebase open

# View deployment logs
firebase hosting:channel:list
```

---

## ✅ Final Checklist

Before considering deployment complete:

- [ ] Firebase CLI installed
- [ ] Logged in to Firebase
- [ ] Firebase project created
- [ ] Firebase initialized in project
- [ ] React app built successfully
- [ ] Deployed to Firebase Hosting
- [ ] App accessible at Firebase URL
- [ ] Landing page loads correctly
- [ ] Navigation works
- [ ] Understand backend needs separate deployment

---

## 🎉 Success!

If all checkboxes are checked, your frontend is successfully deployed to Firebase Hosting!

**Your app is live at**: `https://foodbridge-app.web.app`

**Next step**: Deploy your backend to make the full app functional.

---

**Questions? Need help with backend deployment? Let me know!**
