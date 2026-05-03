# 📦 FoodBridge Installation Guide

## 🎯 Current Status

**Your System:**
- ❌ Node.js: NOT INSTALLED (Required)
- ❓ PostgreSQL: Unknown (Optional)
- ❓ Redis: Unknown (Optional)

**What You Need:**
- ✅ Windows 10/11
- ✅ Internet connection
- ✅ 2GB free disk space
- ✅ 15 minutes of time

---

## 🚀 Three Ways to Install

### Option 1: Quick Demo (Recommended First)
**Time:** 10 minutes | **Features:** Landing page, design preview

1. Install Node.js from https://nodejs.org/
2. Run `SETUP_FOODBRIDGE.bat`
3. Run `START_FOODBRIDGE.bat`
4. Visit http://localhost:3001

### Option 2: Full Application
**Time:** 20 minutes | **Features:** Everything including authentication

1. Install Node.js from https://nodejs.org/
2. Install PostgreSQL from https://www.postgresql.org/
3. Run `SETUP_FOODBRIDGE.bat`
4. Setup database when prompted
5. Run `START_FOODBRIDGE.bat`
6. Visit http://localhost:3001

### Option 3: Standalone Demo (No Installation)
**Time:** 1 minute | **Features:** Static preview only

1. Double-click `START_DEMO_MODE.bat`
2. Visit http://localhost:8000/demo/index.html

---

## 📥 Step-by-Step Installation

### STEP 1: Install Node.js (Required)

#### 1.1 Download
- Visit: https://nodejs.org/
- Click: "Download Node.js (LTS)"
- Direct link: https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi

#### 1.2 Install
- Run the downloaded .msi file
- Click: Next → Next → Install → Finish
- Takes ~3 minutes

#### 1.3 Verify
```bash
# Open NEW terminal and run:
node --version
# Should show: v20.11.0
```

### STEP 2: Run Automated Setup

#### 2.1 Run Setup Script
```bash
# Double-click or run:
SETUP_FOODBRIDGE.bat
```

#### 2.2 What Happens
```
[1/8] Checking Node.js installation...
✅ Node.js is installed

[2/8] Checking PostgreSQL installation...
⚠️  PostgreSQL not found (optional)
Continue anyway? (Y/N) → Type: Y

[3/8] Installing backend dependencies...
✅ Backend dependencies installed

[4/8] Installing frontend dependencies...
✅ Frontend dependencies installed

[5/8] Checking environment configuration...
✅ Environment configured

[6/8] Database setup...
Do you want to setup database? (Y/N) → Type: N (for now)

[7/8] Setup complete!

[8/8] Start FoodBridge now? (Y/N) → Type: Y
```

### STEP 3: Launch Application

#### 3.1 Start Servers
```bash
# If not started from setup:
START_FOODBRIDGE.bat
```

#### 3.2 What Opens
- Backend terminal (port 3000)
- Frontend terminal (port 3001)
- Browser at http://localhost:3001

#### 3.3 What You See
- Beautiful landing page
- Green gradient hero
- "Share Food, Share Hope"
- Animated statistics
- Feature cards

---

## ✅ Verification

### Test 1: Landing Page
- [ ] Browser opens automatically
- [ ] Landing page loads
- [ ] Animations work
- [ ] Responsive design works

### Test 2: Backend API
```bash
# Visit in browser:
http://localhost:3000/health

# Should return:
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 123.456
}
```

### Test 3: Terminals
- [ ] Backend terminal shows no errors
- [ ] Frontend terminal shows Vite running
- [ ] No red error messages

---

## 🗄️ Optional: Install PostgreSQL

### Why Install PostgreSQL?
- ✅ Enable authentication
- ✅ User registration
- ✅ Dashboard features
- ✅ Full API functionality

### How to Install

#### 1. Download
- Visit: https://www.postgresql.org/download/windows/
- Choose: PostgreSQL 15.x for Windows x86-64
- Download: ~300MB

#### 2. Install
- Run installer
- Set password (remember it!)
- Keep port 5432
- Takes ~5 minutes

#### 3. Setup Database
```bash
# Create database
createdb -U postgres foodbridge

# Run migrations
psql -U postgres -d foodbridge -f backend\migrations\001_initial_schema.sql
```

#### 4. Update Configuration
```bash
# Edit backend\.env
# Change: DB_PASSWORD=your_password
```

#### 5. Restart Backend
```bash
# Close backend terminal
# Run START_FOODBRIDGE.bat again
```

#### 6. Test Authentication
1. Visit http://localhost:3001
2. Click "Get Started"
3. Enter phone: 9876543210
4. Click "Send OTP"
5. Check backend terminal for OTP
6. Enter OTP
7. Should redirect to dashboard ✅

---

## 🐛 Troubleshooting

### Problem: "node is not recognized"
**Cause:** Node.js not in PATH or terminal not restarted
**Solution:**
1. Close ALL terminals
2. Open NEW terminal
3. Try again
4. If still fails, restart computer

### Problem: "npm install failed"
**Cause:** Network issues or permissions
**Solution:**
1. Check internet connection
2. Run terminal as Administrator
3. Try again: `cd backend && npm install`

### Problem: "Port 3000 already in use"
**Cause:** Another process using the port
**Solution:**
```bash
# Find process
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F
```

### Problem: "Cannot connect to database"
**Cause:** PostgreSQL not running or wrong password
**Solution:**
1. Check PostgreSQL is running
2. Verify password in `backend\.env`
3. Check database exists: `psql -U postgres -l`

### Problem: "Blank page in browser"
**Cause:** Backend not running or CORS issue
**Solution:**
1. Check backend terminal for errors
2. Verify backend is running: http://localhost:3000/health
3. Check browser console (F12)
4. Restart both servers

---

## 📁 Project Structure

```
foodbridge/
├── backend/                    ← Node.js API
│   ├── src/                   ← Source code
│   │   ├── server.ts         ← Main server
│   │   ├── controllers/      ← Route handlers
│   │   ├── services/         ← Business logic
│   │   ├── middleware/       ← Express middleware
│   │   └── database/         ← DB connection
│   ├── migrations/           ← Database schema
│   ├── .env                  ← Configuration
│   └── package.json          ← Dependencies
│
├── web/                       ← React frontend
│   ├── src/                  ← Source code
│   │   ├── App.tsx          ← Main app
│   │   ├── pages/           ← Page components
│   │   ├── components/      ← Reusable components
│   │   ├── store/           ← Redux state
│   │   └── theme/           ← Material-UI theme
│   ├── .env                 ← Configuration
│   └── package.json         ← Dependencies
│
├── demo/                     ← Standalone demo
│   └── index.html           ← No installation needed
│
└── Installation Scripts/
    ├── INSTALL_NODEJS_FIRST.bat      ← Check Node.js
    ├── SETUP_FOODBRIDGE.bat          ← Automated setup
    ├── START_FOODBRIDGE.bat          ← Start servers
    └── START_DEMO_MODE.bat           ← Demo only
```

---

## 📚 Documentation Files

### Installation Guides:
- `⚡_QUICK_START.md` - Fastest way to get started
- `🚀_INSTALL_NOW.md` - Installation overview
- `STEP_BY_STEP_INSTALL.md` - Detailed walkthrough
- `🎯_INSTALLATION_STEPS.md` - Multiple installation paths
- `📥_DOWNLOAD_PREREQUISITES.md` - Download links
- `INSTALL_GUIDE.md` - Comprehensive guide

### Project Documentation:
- `README.md` - Project overview
- `QUICKSTART.md` - Quick reference
- `ARCHITECTURE.md` - Technical architecture
- `PROJECT_STATUS.md` - Current status
- `COMPLETE_PROJECT_SUMMARY.md` - Full summary

### Launch Guides:
- `WEB_LAUNCH_GUIDE.md` - Frontend guide
- `LAUNCH_DEMO.md` - Demo instructions
- `🎉_SERVER_RUNNING.md` - After launch guide

---

## 🎯 What Works After Installation

### Without PostgreSQL (Demo Mode):
- ✅ Landing page with animations
- ✅ Responsive design
- ✅ Navigation between pages
- ✅ Backend API health check
- ✅ Frontend routing
- ❌ Authentication (needs database)
- ❌ User features (needs database)

### With PostgreSQL (Full Mode):
- ✅ Everything above PLUS:
- ✅ OTP-based authentication
- ✅ User registration
- ✅ User dashboard
- ✅ Profile management
- ✅ JWT token management
- ✅ Complete backend API

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Download Node.js | 2 min |
| Install Node.js | 3 min |
| Run SETUP_FOODBRIDGE.bat | 5 min |
| Launch application | 1 min |
| **Total (Demo Mode)** | **11 min** |
| | |
| Download PostgreSQL | 5 min |
| Install PostgreSQL | 5 min |
| Setup database | 2 min |
| Test authentication | 2 min |
| **Total (Full Mode)** | **25 min** |

---

## 🎊 Success Checklist

### After Installation:
- [ ] Node.js installed (`node --version` works)
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend server running (port 3000)
- [ ] Frontend server running (port 3001)
- [ ] Landing page loads in browser
- [ ] Animations work
- [ ] No errors in terminals

### After PostgreSQL Setup:
- [ ] PostgreSQL installed
- [ ] Database created
- [ ] Migrations run
- [ ] Backend connects to database
- [ ] Authentication works
- [ ] Dashboard accessible

---

## 🚀 Quick Commands

### Check Prerequisites:
```bash
node --version          # Check Node.js
npm --version           # Check npm
psql --version          # Check PostgreSQL
```

### Installation:
```bash
SETUP_FOODBRIDGE.bat    # Automated setup
```

### Launch:
```bash
START_FOODBRIDGE.bat    # Start both servers
```

### Manual Start:
```bash
# Terminal 1 (Backend):
cd backend
npm run dev

# Terminal 2 (Frontend):
cd web
npm run dev
```

### Stop:
- Close terminal windows
- Or press Ctrl+C in each terminal

---

## 🌟 Next Steps

### After Installation:

1. **Explore the Application**
   - Browse landing page
   - Test navigation
   - Check responsive design
   - Try different browsers

2. **Install PostgreSQL** (Optional)
   - For full features
   - Follow guide above
   - Test authentication

3. **Read Documentation**
   - `QUICKSTART.md` - Quick reference
   - `ARCHITECTURE.md` - Technical details
   - `backend/README.md` - API documentation

4. **Customize**
   - Edit theme colors
   - Modify pages
   - Add features
   - Deploy to production

---

## 📞 Getting Help

### Documentation:
- Check other .md files in project root
- Read `INSTALL_GUIDE.md` for detailed help
- See `TROUBLESHOOTING.md` for common issues

### Quick Scripts:
- `INSTALL_NODEJS_FIRST.bat` - Check Node.js installation
- `SETUP_FOODBRIDGE.bat` - Run automated setup
- `START_FOODBRIDGE.bat` - Launch application
- `START_DEMO_MODE.bat` - Run standalone demo

### Online Resources:
- Node.js: https://nodejs.org/docs/
- PostgreSQL: https://www.postgresql.org/docs/
- React: https://react.dev/learn
- Material-UI: https://mui.com/

---

## 🎉 You're Ready!

### Your Path:

1. ✅ **Install Node.js** (5 minutes)
   - https://nodejs.org/

2. ✅ **Run Setup** (5 minutes)
   - `SETUP_FOODBRIDGE.bat`

3. ✅ **Launch App** (1 minute)
   - `START_FOODBRIDGE.bat`

4. ✅ **Enjoy!** 🌱
   - http://localhost:3001

---

**Built with ❤️ for a hunger-free world** 🌱

**Questions?** Check the documentation files or create an issue!

**Ready to start?** Run `INSTALL_NODEJS_FIRST.bat` to begin!
