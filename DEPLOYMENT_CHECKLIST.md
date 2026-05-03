# ✅ FoodBridge Deployment Checklist

## 🎯 Goal: Make Your App Live 24/7

Follow this checklist step-by-step. Check off each item as you complete it.

---

## 📦 Phase 1: Prepare Your Code

- [ ] **1.1** Code is working locally
  - [ ] Backend runs on `http://localhost:3005`
  - [ ] Frontend runs on `http://localhost:3001`
  - [ ] Can login with OTP `123456`
  - [ ] Can create listings

- [ ] **1.2** Code is on GitHub
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  # Create repo on GitHub, then:
  git remote add origin https://github.com/yourusername/foodbridge.git
  git push -u origin main
  ```

---

## 🔥 Phase 2: Deploy Frontend (Firebase Hosting)

- [ ] **2.1** Install Firebase CLI
  ```bash
  npm install -g firebase-tools
  ```

- [ ] **2.2** Login to Firebase
  ```bash
  firebase login
  ```

- [ ] **2.3** Create Firebase Project
  - [ ] Go to: https://console.firebase.google.com/
  - [ ] Click "Add project"
  - [ ] Name: `foodbridge-app`
  - [ ] Disable Google Analytics
  - [ ] Click "Create project"

- [ ] **2.4** Initialize Firebase Hosting
  ```bash
  firebase init hosting
  ```
  - [ ] Use existing project: **Yes**
  - [ ] Select: **foodbridge-app**
  - [ ] Public directory: **web/dist**
  - [ ] Single-page app: **Yes**
  - [ ] GitHub deploys: **No**

- [ ] **2.5** Build React App
  ```bash
  cd web
  npm run build
  cd ..
  ```

- [ ] **2.6** Deploy to Firebase
  ```bash
  firebase deploy --only hosting
  ```

- [ ] **2.7** Save Frontend URL
  - [ ] URL: `https://foodbridge-app.web.app`
  - [ ] Write it down: ___________________________

**✅ Frontend is deployed!** (but won't work yet - needs backend)

---

## 🚂 Phase 3: Deploy Backend (Choose One Platform)

### **Option A: Railway (Recommended)**

- [ ] **3A.1** Create Railway Account
  - [ ] Go to: https://railway.app/
  - [ ] Sign up with GitHub

- [ ] **3A.2** Create New Project
  - [ ] Click "New Project"
  - [ ] Select "Deploy from GitHub repo"
  - [ ] Choose your repository

- [ ] **3A.3** Add PostgreSQL Database
  - [ ] Click "New" → "Database" → "PostgreSQL"
  - [ ] Wait for creation

- [ ] **3A.4** Configure Environment Variables
  - [ ] Click backend service → "Variables"
  - [ ] Add:
    ```env
    NODE_ENV=production
    PORT=3005
    DATABASE_URL=${{Postgres.DATABASE_URL}}
    JWT_SECRET=change-this-to-random-string-xyz123
    TWILIO_ACCOUNT_SID=your-twilio-sid
    TWILIO_AUTH_TOKEN=your-twilio-token
    TWILIO_PHONE_NUMBER=your-twilio-number
    REDIS_URL=redis://localhost:6379
    ```

- [ ] **3A.5** Generate Domain
  - [ ] Go to "Settings" → "Domains"
  - [ ] Click "Generate Domain"
  - [ ] Save URL: ___________________________

- [ ] **3A.6** Run Database Migrations
  ```bash
  npm install -g @railway/cli
  railway login
  railway link
  railway run node backend/create-database.js
  ```

**✅ Backend is deployed on Railway!**

---

### **Option B: Render (Free Tier)**

- [ ] **3B.1** Create Render Account
  - [ ] Go to: https://render.com/
  - [ ] Sign up with GitHub

- [ ] **3B.2** Create PostgreSQL Database
  - [ ] Click "New +" → "PostgreSQL"
  - [ ] Name: `foodbridge-db`
  - [ ] Plan: **Free**
  - [ ] Click "Create Database"
  - [ ] Copy "Internal Database URL": ___________________________

- [ ] **3B.3** Create Web Service
  - [ ] Click "New +" → "Web Service"
  - [ ] Connect GitHub repo
  - [ ] Name: `foodbridge-backend`
  - [ ] Environment: `Node`
  - [ ] Build Command: `cd backend && npm install`
  - [ ] Start Command: `cd backend && npm start`
  - [ ] Plan: **Free**

- [ ] **3B.4** Add Environment Variables
  ```env
  NODE_ENV=production
  PORT=3005
  DATABASE_URL=your-internal-database-url-from-3B.2
  JWT_SECRET=change-this-to-random-string-xyz123
  TWILIO_ACCOUNT_SID=your-twilio-sid
  TWILIO_AUTH_TOKEN=your-twilio-token
  TWILIO_PHONE_NUMBER=your-twilio-number
  REDIS_URL=redis://localhost:6379
  ```

- [ ] **3B.5** Deploy
  - [ ] Click "Create Web Service"
  - [ ] Wait 3-5 minutes
  - [ ] Save URL: `https://foodbridge-backend.onrender.com`

- [ ] **3B.6** Run Database Migrations
  - [ ] Go to "Shell" tab
  - [ ] Run: `cd backend && node create-database.js`

**✅ Backend is deployed on Render!**

---

## 🔗 Phase 4: Connect Frontend to Backend

- [ ] **4.1** Update Frontend Environment Variables
  - [ ] Open `web/.env.production`
  - [ ] Update `VITE_API_URL` with your backend URL:
    ```env
    VITE_API_URL=https://your-backend-url.up.railway.app/api/v1
    ```
    or
    ```env
    VITE_API_URL=https://foodbridge-backend.onrender.com/api/v1
    ```

- [ ] **4.2** Rebuild Frontend
  ```bash
  cd web
  npm run build
  cd ..
  ```

- [ ] **4.3** Redeploy Frontend
  ```bash
  firebase deploy --only hosting
  ```

**✅ Frontend and Backend are connected!**

---

## 🧪 Phase 5: Test Your Deployed App

- [ ] **5.1** Open your Firebase URL
  - [ ] URL: `https://foodbridge-app.web.app`

- [ ] **5.2** Test Login
  - [ ] Enter phone number
  - [ ] Click "Send OTP"
  - [ ] Enter OTP: `123456`
  - [ ] Click "Verify OTP"
  - [ ] Should redirect to dashboard

- [ ] **5.3** Test Dashboard
  - [ ] Dashboard loads
  - [ ] Statistics show
  - [ ] No errors in console (F12)

- [ ] **5.4** Test Create Listing
  - [ ] Click "Create Listing"
  - [ ] Fill form
  - [ ] Submit
  - [ ] Listing created successfully

- [ ] **5.5** Test API Connection
  - [ ] Open browser console (F12)
  - [ ] Check Network tab
  - [ ] API calls should go to your backend URL
  - [ ] No CORS errors

**✅ App is fully functional!**

---

## 🐛 Troubleshooting

### **Issue: Frontend shows blank page**

- [ ] Check browser console (F12) for errors
- [ ] Verify `VITE_API_URL` is correct in `web/.env.production`
- [ ] Rebuild and redeploy frontend

### **Issue: API calls fail with CORS error**

- [ ] Update CORS in `backend/src/server.ts`:
  ```typescript
  app.use(cors({
    origin: [
      'http://localhost:3001',
      'https://foodbridge-app.web.app'
    ],
    credentials: true
  }));
  ```
- [ ] Redeploy backend (push to GitHub)

### **Issue: Database connection failed**

- [ ] Check `DATABASE_URL` in environment variables
- [ ] Verify database is running
- [ ] Run migrations again

### **Issue: OTP not working**

- [ ] Check Twilio credentials
- [ ] For testing, OTP is always `123456`
- [ ] Check backend logs

---

## 📊 Your Deployed App

### **URLs**

- **Frontend**: `https://foodbridge-app.web.app`
- **Backend**: `https://___________________________`

### **Credentials**

- **Test Phone**: Any phone number
- **Test OTP**: `123456`

### **Cost**

- **Railway**: ~$0-5/month
- **Render Free**: $0/month (spins down after inactivity)
- **Render Paid**: $7/month (no spin-down)

---

## 🔄 How to Update

### **Update Frontend**

```bash
cd web
npm run build
cd ..
firebase deploy --only hosting
```

### **Update Backend**

```bash
git add .
git commit -m "Update backend"
git push
# Railway/Render auto-deploys
```

---

## 🎉 Success!

- [ ] **Frontend deployed** to Firebase Hosting
- [ ] **Backend deployed** to Railway/Render
- [ ] **Database created** and migrations run
- [ ] **Frontend connected** to backend
- [ ] **App tested** end-to-end
- [ ] **App is live 24/7** 🚀

---

## 📚 Need More Help?

See detailed guides:

- **Frontend**: `DEPLOY_FRONTEND_NOW.md`
- **Backend**: `DEPLOY_BACKEND_GUIDE.md`
- **Complete Guide**: `MAKE_APP_LIVE_24_7.md`

---

## 🎯 Next Steps (Optional)

- [ ] Add custom domain
- [ ] Set up CI/CD (auto-deploy)
- [ ] Add monitoring
- [ ] Add analytics
- [ ] Upgrade to paid tier (if needed)

---

**Congratulations! Your FoodBridge app is now live 24/7!** 🎉
