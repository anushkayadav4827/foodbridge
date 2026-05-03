# 🔧 Fix Firebase CLI and Deploy Your App

## ⚠️ Issue

PowerShell execution policy is blocking Firebase CLI from running.

## ✅ Solution - Follow These Steps

### **Step 1: Enable PowerShell Scripts (One-Time Setup)**

**Option A: Run as Administrator (Recommended)**

1. **Close this terminal**
2. **Right-click** on PowerShell or Command Prompt
3. Select **"Run as Administrator"**
4. Run this command:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
5. Type **Y** and press Enter

**Option B: Use Command Prompt Instead**

If you don't have admin access, use **Command Prompt (CMD)** instead of PowerShell:

1. Press **Windows + R**
2. Type **`cmd`** and press Enter
3. Navigate to your project: `cd C:\Users\Asus\OneDrive\Desktop\wastenot`
4. Continue with Step 2 below

---

### **Step 2: Verify Firebase CLI**

```bash
firebase --version
```

You should see something like: `13.x.x`

---

### **Step 3: Login to Firebase**

```bash
firebase login
```

This will:
1. Open your browser
2. Ask you to sign in with Google
3. Grant Firebase CLI access

**Click "Allow"** when prompted.

---

### **Step 4: Create Firebase Project**

1. Go to: **https://console.firebase.google.com/**
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: **`foodbridge-app`**
4. Click **"Continue"**
5. **Disable Google Analytics** (toggle off)
6. Click **"Create project"**
7. Wait 30 seconds for project creation
8. Click **"Continue"**

**Keep this browser tab open!**

---

### **Step 5: Initialize Firebase Hosting**

In your terminal (CMD or PowerShell with admin), run:

```bash
firebase init hosting
```

**Answer the prompts**:

| Question | Your Answer |
|----------|-------------|
| "Please select an option" | **Use an existing project** |
| "Select a default Firebase project" | **foodbridge-app** (or your project name) |
| "What do you want to use as your public directory?" | **web/dist** |
| "Configure as a single-page app?" | **Yes** |
| "Set up automatic builds and deploys with GitHub?" | **No** |
| "File web/dist/index.html already exists. Overwrite?" | **No** (if asked) |

You should see:
```
✔  Firebase initialization complete!
```

---

### **Step 6: Build Your React App**

```bash
cd web
npm run build
cd ..
```

**Wait for build to complete.** You should see:
```
✓ built in XXXms
```

---

### **Step 7: Deploy to Firebase**

```bash
firebase deploy --only hosting
```

**Wait for deployment** (1-2 minutes). You should see:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/foodbridge-app/overview
Hosting URL: https://foodbridge-app.web.app
```

---

## 🎉 Your App is Live!

Your frontend is now available at:

**🌐 https://foodbridge-app.web.app**

(Replace `foodbridge-app` with your actual project name)

---

## ⚠️ Important: Backend API

Your deployed frontend is trying to connect to:
```
http://localhost:3005/api/v1
```

This means:
- ✅ **You** can test it (if your backend is running locally)
- ❌ **Other users** cannot access it (localhost only works on your computer)

### **To Make It Fully Functional**

You need to deploy your backend to a cloud service:

1. **Railway** (easiest, $5 credit/month)
2. **Render** (free tier available)
3. **Google Cloud Run** (professional)

See `DEPLOY_BACKEND_GUIDE.md` for instructions.

---

## 🔄 How to Update Your Deployed App

Whenever you make changes to your frontend:

```bash
# 1. Build the app
cd web
npm run build
cd ..

# 2. Deploy to Firebase
firebase deploy --only hosting
```

---

## 🐛 Troubleshooting

### **Issue: "Firebase command not found"**

**Solution**: Close and reopen your terminal, then try again.

---

### **Issue: "Build failed"**

**Solution**: Check for errors in your code
```bash
cd web
npm run build
```

Fix any errors shown, then try deploying again.

---

### **Issue: "Deployed app shows blank page"**

**Solution**: Check browser console (F12)
1. Open your deployed app
2. Press **F12**
3. Go to **Console** tab
4. Look for errors (red text)

Usually it's an API connection issue (backend not deployed).

---

### **Issue: "API calls not working"**

**Solution**: This is expected! Your backend is not deployed yet.

**Temporary fix** (for testing):
1. Make sure your local backend is running: `cd backend && npm start`
2. Your deployed frontend will try to connect to `localhost:3005`
3. This only works on your computer

**Permanent fix**:
Deploy your backend to Railway/Render/Cloud Run, then update `web/.env.production`:
```env
VITE_API_URL=https://your-backend-url.com/api/v1
```

Then rebuild and redeploy:
```bash
cd web && npm run build && cd .. && firebase deploy --only hosting
```

---

## 📋 Quick Commands Reference

```bash
# Enable PowerShell scripts (run as admin, one-time)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Verify Firebase CLI
firebase --version

# Login to Firebase
firebase login

# Initialize Firebase (one-time)
firebase init hosting

# Build React app
cd web && npm run build && cd ..

# Deploy to Firebase
firebase deploy --only hosting

# View your deployed app
firebase open hosting:site
```

---

## ✅ Summary

**What you need to do**:

1. **Enable PowerShell scripts** (run as admin, one-time)
2. **Login to Firebase**: `firebase login`
3. **Create Firebase project**: https://console.firebase.google.com/
4. **Initialize Firebase**: `firebase init hosting`
5. **Build React app**: `cd web && npm run build && cd ..`
6. **Deploy**: `firebase deploy --only hosting`

**Your app will be live at**: `https://foodbridge-app.web.app` 🎉

---

**Need help with any step? Let me know!**
