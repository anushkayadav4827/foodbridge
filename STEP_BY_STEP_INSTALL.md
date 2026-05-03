# 📋 FoodBridge Installation - Complete Step-by-Step Guide

## 🎯 Current Status

**Node.js:** ❌ NOT INSTALLED (Required)
**PostgreSQL:** ❓ Unknown (Optional for full features)
**Redis:** ❓ Unknown (Optional for better performance)

---

## 🚀 Installation Path

### Path A: Quick Demo (Recommended to Start)
**Time:** 10 minutes
**Requirements:** Node.js only
**Features:** Landing page, design preview, no authentication

### Path B: Full Application
**Time:** 20 minutes
**Requirements:** Node.js + PostgreSQL
**Features:** Everything including authentication, dashboard, full API

---

## 📥 PART 1: Install Node.js (REQUIRED)

### Step 1.1: Download Node.js

**Option A: Automatic (Recommended)**
```bash
# Double-click this file:
INSTALL_NODEJS_FIRST.bat
```
This will open the Node.js website automatically.

**Option B: Manual**
1. Open browser
2. Go to: https://nodejs.org/
3. Click the green "Download Node.js (LTS)" button

**Option C: Direct Link**
Download directly: https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi

### Step 1.2: Install Node.js

1. **Run** the downloaded file (node-v20.11.0-x64.msi)
2. **Click** "Next" on welcome screen
3. **Accept** license agreement
4. **Keep** default installation path: `C:\Program Files\nodejs`
5. **Keep** all default features selected
6. **Click** "Install"
7. **Wait** for installation (~2 minutes)
8. **Click** "Finish"

### Step 1.3: Verify Installation

1. **Close** ALL terminal/PowerShell windows
2. **Open** a NEW terminal (Windows Key + R, type `cmd`, press Enter)
3. **Type:** `node --version`
4. **Press** Enter

**Expected Output:**
```
v20.11.0
```

If you see this, Node.js is installed! ✅

If you see "node is not recognized":
- Restart your computer
- Try again
- Check if `C:\Program Files\nodejs` exists

---

## 🎯 PART 2: Setup FoodBridge

### Step 2.1: Run Automated Setup

**Method A: Double-Click (Easiest)**
1. Find `SETUP_FOODBRIDGE.bat` in the project folder
2. Double-click it
3. Follow the prompts

**Method B: Command Line**
```bash
# In project folder:
SETUP_FOODBRIDGE.bat
```

### Step 2.2: What Happens During Setup

The setup script will:

1. **Check Node.js** ✅
   - Verifies Node.js is installed
   - Shows version

2. **Check PostgreSQL** ⚠️
   - Checks if installed
   - Continues even if not found

3. **Install Backend Dependencies** 📦
   - Runs `npm install` in backend folder
   - Downloads ~200MB of packages
   - Takes ~2-3 minutes

4. **Install Frontend Dependencies** 📦
   - Runs `npm install` in web folder
   - Downloads ~300MB of packages
   - Takes ~3-4 minutes

5. **Check Environment Files** ⚙️
   - Verifies .env files exist
   - Uses defaults if not found

6. **Database Setup** 🗄️
   - Asks if you want to setup database
   - Skip if PostgreSQL not installed
   - Can do later

7. **Completion** ✅
   - Shows success message
   - Asks if you want to start now

### Step 2.3: Expected Output

```
============================================
  FoodBridge - Automated Setup
============================================

[1/8] Checking Node.js installation...
✅ Node.js is installed
v20.11.0

[2/8] Checking PostgreSQL installation...
⚠️  PostgreSQL command not found in PATH
Continue anyway? (Y/N)
```

**Type:** `Y` and press Enter (we'll run demo mode first)

```
[3/8] Installing backend dependencies...
Installing packages... This may take a few minutes...
✅ Backend dependencies installed

[4/8] Installing frontend dependencies...
Installing packages... This may take a few minutes...
✅ Frontend dependencies installed

[5/8] Checking environment configuration...
✅ Backend environment configured
✅ Frontend environment configured

[6/8] Database setup...
Do you want to setup the database now? (Y/N)
```

**Type:** `N` and press Enter (skip for now)

```
[7/8] Setup complete!

============================================
  Ready to Launch FoodBridge!
============================================

[8/8] Would you like to start FoodBridge now? (Y/N)
```

**Type:** `Y` and press Enter

---

## 🚀 PART 3: Launch FoodBridge

### Step 3.1: Start the Application

If you didn't start from setup, run:

```bash
START_FOODBRIDGE.bat
```

### Step 3.2: What Happens

1. **Backend Terminal Opens**
   - Black window with logs
   - Shows "FoodBridge Backend"
   - Port 3000

2. **Frontend Terminal Opens**
   - Black window with logs
   - Shows "FoodBridge Frontend"
   - Port 3001

3. **Browser Opens Automatically**
   - Goes to http://localhost:3001
   - Shows landing page

### Step 3.3: Expected Terminal Output

**Backend Terminal:**
```
> foodbridge-backend@1.0.0 dev
> nodemon src/server.ts

[nodemon] starting `ts-node src/server.ts`
[info]: FoodBridge API server running on port 3000
[info]: Environment: development
```

**Frontend Terminal:**
```
> foodbridge-web@1.0.0 dev
> vite

  VITE v5.0.11  ready in 1234 ms

  ➜  Local:   http://localhost:3001/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Step 3.4: What You'll See in Browser

**Landing Page:**
- 🎨 Beautiful green gradient hero section
- 📝 "Share Food, Share Hope" heading
- 📊 Animated statistics (meals saved, CO2 reduced, etc.)
- 🎯 Feature cards (Donate, Receive, Track Impact)
- 📱 Responsive design
- ✨ Smooth animations

---

## ✅ PART 4: Verify Everything Works

### Test 1: Landing Page
1. Browser should show landing page
2. Scroll down to see features
3. Hover over cards (should have effects)
4. Resize window (should be responsive)

**Expected:** ✅ Everything looks good

### Test 2: Navigation
1. Click "Get Started" button
2. Should go to login page
3. See phone number input

**Expected:** ✅ Navigation works

### Test 3: Backend API
1. Open new browser tab
2. Go to: http://localhost:3000/health
3. Should see JSON response

**Expected:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-30T...",
  "uptime": 123.456,
  "environment": "development"
}
```

### Test 4: Check Terminals
1. Look at backend terminal
2. Should see log messages
3. Look at frontend terminal
4. Should see Vite running

**Expected:** ✅ No error messages

---

## 🎊 Success! What Now?

### You Now Have:
- ✅ Node.js installed
- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed
- ✅ Backend server running (port 3000)
- ✅ Frontend server running (port 3001)
- ✅ Beautiful landing page working

### What Works:
- ✅ Landing page with animations
- ✅ Navigation between pages
- ✅ Responsive design
- ✅ Backend API health check
- ✅ Frontend routing

### What Doesn't Work Yet:
- ❌ Authentication (needs PostgreSQL)
- ❌ User registration (needs PostgreSQL)
- ❌ Dashboard features (needs PostgreSQL)
- ❌ Real-time updates (needs Redis - optional)

---

## 🗄️ PART 5: Install PostgreSQL (Optional - For Full Features)

### Step 5.1: Download PostgreSQL

1. Go to: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Choose PostgreSQL 15.x for Windows x86-64
4. Download (~300MB)

**Direct Link:**
https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

### Step 5.2: Install PostgreSQL

1. **Run** the installer
2. **Click** "Next"
3. **Keep** default installation directory
4. **Select** components (keep all checked)
5. **Keep** default data directory
6. **Set** password (REMEMBER THIS!)
   - Example: `postgres123`
   - Write it down!
7. **Keep** port 5432
8. **Keep** default locale
9. **Click** "Next" → "Install"
10. **Wait** (~5 minutes)
11. **Uncheck** "Launch Stack Builder"
12. **Click** "Finish"

### Step 5.3: Setup Database

1. **Open** terminal as Administrator
2. **Run:**
```bash
# Create database
createdb -U postgres foodbridge

# Run migrations
psql -U postgres -d foodbridge -f backend\migrations\001_initial_schema.sql
```

3. **Enter** password when prompted

### Step 5.4: Update Backend Configuration

1. **Open** `backend\.env` in notepad
2. **Find** line: `DB_PASSWORD=postgres`
3. **Change** to your password: `DB_PASSWORD=postgres123`
4. **Save** file

### Step 5.5: Restart Backend

1. **Close** backend terminal (Ctrl+C)
2. **Run** again: `START_FOODBRIDGE.bat`

### Step 5.6: Test Authentication

1. **Go to** http://localhost:3001
2. **Click** "Get Started"
3. **Enter** phone: `9876543210`
4. **Click** "Send OTP"
5. **Check** backend terminal for OTP code
6. **Enter** OTP code
7. **Should** redirect to dashboard

**Expected:** ✅ Authentication works!

---

## 🐛 Troubleshooting

### Problem: "node is not recognized"
**Solution:**
1. Restart ALL terminals
2. Restart computer
3. Verify: `C:\Program Files\nodejs` exists
4. Add to PATH manually if needed

### Problem: "npm install failed"
**Solution:**
1. Run terminal as Administrator
2. Check internet connection
3. Delete `node_modules` folder
4. Try again: `npm install`

### Problem: "Port 3000 already in use"
**Solution:**
1. Find process: `netstat -ano | findstr :3000`
2. Kill process: `taskkill /PID <PID> /F`
3. Or restart computer

### Problem: "Cannot connect to database"
**Solution:**
1. Check PostgreSQL is running
2. Verify password in `backend\.env`
3. Check database exists: `psql -U postgres -l`
4. Restart backend server

### Problem: "Blank page in browser"
**Solution:**
1. Check browser console (F12)
2. Verify backend is running
3. Check for errors in terminals
4. Try: http://localhost:3001 directly

### Problem: "Dependencies installation takes forever"
**Solution:**
1. Check internet connection
2. Wait patiently (can take 5-10 minutes)
3. If stuck, press Ctrl+C and try again

---

## 📊 Installation Checklist

### Phase 1: Prerequisites
- [ ] Downloaded Node.js installer
- [ ] Installed Node.js
- [ ] Verified with `node --version`
- [ ] Restarted terminal

### Phase 2: Setup
- [ ] Ran `SETUP_FOODBRIDGE.bat`
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] No error messages

### Phase 3: Launch
- [ ] Ran `START_FOODBRIDGE.bat`
- [ ] Backend terminal opened
- [ ] Frontend terminal opened
- [ ] Browser opened automatically

### Phase 4: Verification
- [ ] Landing page loads
- [ ] Animations work
- [ ] Navigation works
- [ ] Backend health check works

### Phase 5: Database (Optional)
- [ ] Downloaded PostgreSQL
- [ ] Installed PostgreSQL
- [ ] Created database
- [ ] Ran migrations
- [ ] Updated .env file
- [ ] Authentication works

---

## 🎯 Quick Reference

### Start Application:
```bash
START_FOODBRIDGE.bat
```

### Stop Application:
- Close both terminal windows
- Or press Ctrl+C in each

### Restart Application:
1. Close terminals
2. Run `START_FOODBRIDGE.bat` again

### Check Status:
- Backend: http://localhost:3000/health
- Frontend: http://localhost:3001

### View Logs:
- Backend: Check backend terminal
- Frontend: Check frontend terminal
- Browser: Press F12 → Console tab

---

## 🌟 Next Steps

### After Installation:

1. **Explore the Application**
   - Browse landing page
   - Test navigation
   - Check responsive design

2. **Read Documentation**
   - `README.md` - Project overview
   - `QUICKSTART.md` - Quick reference
   - `ARCHITECTURE.md` - Technical details

3. **Install PostgreSQL**
   - For full features
   - Follow Part 5 above

4. **Customize**
   - Edit colors in `web/src/theme/`
   - Modify pages in `web/src/pages/`
   - Add features

---

## 🎊 Congratulations!

You've successfully installed FoodBridge! 🎉

**What you achieved:**
- ✅ Installed Node.js
- ✅ Setup backend and frontend
- ✅ Launched the application
- ✅ Verified everything works

**Next:**
- 🗄️ Install PostgreSQL for full features
- 🎨 Customize the design
- 🚀 Deploy to production
- 🌱 Share food, share hope!

---

**Built with ❤️ for a hunger-free world** 🌱

**Questions?** Check other documentation files or create an issue!
