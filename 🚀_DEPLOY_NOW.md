# 🚀 DEPLOY TO RENDER NOW

Code is pushed to GitHub! Now deploy to Render in 5 minutes.

---

## STEP 1: Create Render Account (1 minute)

1. Go to: **https://render.com**
2. Click **"Get Started"**
3. Click **"Sign up with GitHub"**
4. Authorize Render to access your repositories

---

## STEP 2: Create PostgreSQL Database (2 minutes)

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Fill in:
   - **Name**: `foodbridge-db`
   - **Database**: `foodbridge`
   - **User**: `foodbridge`
   - **Region**: **Oregon (US West)**
   - **Plan**: **Free**
3. Click **"Create Database"**
4. **WAIT 2-3 minutes** for status to show "Available"
5. Click on the database name
6. Copy the **"Internal Database URL"** (starts with `postgresql://`)
   - It looks like: `postgresql://foodbridge:xxxxx@dpg-xxxxx/foodbridge`
   - **SAVE THIS URL** - you'll need it in Step 4

---

## STEP 3: Create Web Service (1 minute)

1. Click **"New +"** → **"Web Service"**
2. Click **"Build and deploy from a Git repository"** → **"Next"**
3. Find and select: **`anushkayadav4827/foodbridge`**
4. Click **"Connect"**
5. Fill in:
   - **Name**: `foodbridge-backend`
   - **Region**: **Oregon (US West)**
   - **Branch**: `main`
   - **Root Directory**: **(leave empty)**
   - **Runtime**: **Node**
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: **Free**

6. **DO NOT CLICK CREATE YET** - scroll down to environment variables first

---

## STEP 4: Add Environment Variables (1 minute)

Scroll down to **"Environment Variables"** section and click **"Add Environment Variable"**

Add these ONE BY ONE (click "Add Environment Variable" for each):

```
NODE_ENV = production
PORT = 10000
DATABASE_URL = <paste-the-internal-database-url-from-step-2>
JWT_SECRET = foodbridge-prod-secret-2024-change-this
JWT_EXPIRES_IN = 7d
JWT_REFRESH_SECRET = foodbridge-prod-refresh-2024-change-this
JWT_REFRESH_EXPIRES_IN = 30d
CORS_ORIGIN = https://foodbridge-app-51332.web.app
OTP_EXPIRY_MINUTES = 10
LOG_LEVEL = info
```

**IMPORTANT**: Replace `<paste-the-internal-database-url-from-step-2>` with the actual URL you copied in Step 2!

Now click **"Create Web Service"**

---

## STEP 5: Wait for Deployment (3-5 minutes)

1. Render will start building your backend
2. Watch the logs - you'll see:
   - Installing dependencies...
   - Building TypeScript...
   - Starting server...
3. When you see **"Your service is live 🎉"** at the top, it's ready!
4. Copy your backend URL from the top (looks like: `https://foodbridge-backend.onrender.com`)

---

## STEP 6: Run Database Migrations (1 minute)

1. In your Render web service page, click **"Shell"** tab (top right)
2. Wait for shell to connect
3. Run these commands:

```bash
cd backend
npm run migrate:up
```

4. You should see: "Migration completed successfully"

---

## STEP 7: Update Frontend (2 minutes)

Now update your frontend to use the Render backend:

1. Open your terminal/command prompt
2. Run:

```bash
cd C:\Users\Asus\OneDrive\Desktop\wastenot
```

3. Run the update script and enter your Render URL when prompted:

```bash
update-frontend-url.bat
```

4. When prompted, enter your Render backend URL (from Step 5)
   - Example: `https://foodbridge-backend.onrender.com`

The script will:
- Update frontend environment
- Build frontend
- Deploy to Firebase

---

## STEP 8: Test Your App! 🎉

1. Open: **https://foodbridge-app-51332.web.app**
2. Try logging in with a phone number
3. OTP will be `123456` (development mode)
4. Create a listing
5. Check if everything works!

---

## ✅ DONE!

Your app is now live:
- **Frontend**: https://foodbridge-app-51332.web.app
- **Backend**: https://foodbridge-backend.onrender.com
- **Database**: PostgreSQL on Render

---

## 🐛 If Something Goes Wrong

### Backend not responding?
1. Check Render logs: Dashboard → foodbridge-backend → Logs
2. Look for errors in red
3. Common issue: Database not connected - check DATABASE_URL is correct

### Frontend can't connect to backend?
1. Open browser console (F12)
2. Check for CORS errors
3. Make sure CORS_ORIGIN in Render matches your Firebase URL exactly

### Database errors?
1. Make sure you ran migrations (Step 6)
2. Check database is "Available" in Render dashboard
3. Verify DATABASE_URL is the **Internal** URL, not External

---

## 📝 Important Notes

**Free Tier Limitations**:
- Backend sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds (cold start)
- This is normal for free tier!

**To keep backend awake**:
- Use a service like UptimeRobot to ping your backend every 10 minutes
- Or upgrade to paid plan ($7/month)

---

**Need help?** Check the logs in Render dashboard!
