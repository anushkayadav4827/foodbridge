# 🎯 FoodBridge - Installation Steps

## Choose Your Path

### 🚀 Path 1: Quick Demo (No Database)
**Best for:** Quick preview, no installation needed
**Time:** 5 minutes
**Requirements:** Node.js only

```bash
1. Install Node.js from nodejs.org
2. Run: START_DEMO_MODE.bat
3. Visit: http://localhost:3001
```

### 🔥 Path 2: Full Application (Recommended)
**Best for:** Complete experience with authentication
**Time:** 15-20 minutes
**Requirements:** Node.js + PostgreSQL

```bash
1. Install Node.js from nodejs.org
2. Install PostgreSQL from postgresql.org
3. Run: SETUP_FOODBRIDGE.bat
4. Follow prompts
5. Visit: http://localhost:3001
```

### 💻 Path 3: Manual Setup (Advanced)
**Best for:** Developers who want control
**Time:** 20-30 minutes
**Requirements:** Node.js + PostgreSQL + Redis (optional)

See detailed steps below.

---

## 📋 Prerequisites

### Required:
1. **Node.js 20+** 
   - Download: https://nodejs.org/
   - Choose: LTS version (recommended)
   - Verify: `node --version`

### For Full Features:
2. **PostgreSQL 15+**
   - Download: https://www.postgresql.org/download/
   - Remember the password you set!
   - Verify: `psql --version`

### Optional (Better Performance):
3. **Redis 7+**
   - Windows: Use Memurai (https://www.memurai.com/)
   - Or: Use WSL with Redis
   - Can skip for now

---

## 🚀 Quick Start (Automated)

### Step 1: Install Prerequisites

**Install Node.js:**
1. Go to https://nodejs.org/
2. Download LTS version
3. Run installer (keep defaults)
4. Restart terminal

**Install PostgreSQL:**
1. Go to https://www.postgresql.org/download/
2. Download Windows installer
3. Run installer
4. **Remember your password!**
5. Default port: 5432 (keep it)

### Step 2: Run Setup Script

```bash
# Double-click or run:
SETUP_FOODBRIDGE.bat
```

This will:
- ✅ Check prerequisites
- ✅ Install dependencies
- ✅ Setup database
- ✅ Configure environment
- ✅ Start servers

### Step 3: Access Application

```
http://localhost:3001
```

---

## 🔧 Manual Setup (Detailed)

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd web
npm install
```

### 2. Setup Database

**Create Database:**
```bash
# Option A: Using createdb
createdb -U postgres foodbridge

# Option B: Using psql
psql -U postgres
CREATE DATABASE foodbridge;
\q
```

**Run Migrations:**
```bash
psql -U postgres -d foodbridge -f backend/migrations/001_initial_schema.sql
```

### 3. Configure Environment

**Backend (.env already created):**
```bash
cd backend
# Edit .env if needed
# Update DB_PASSWORD with your PostgreSQL password
```

**Frontend (.env already created):**
```bash
cd web
# .env is ready to use
```

### 4. Start Backend

```bash
cd backend
npm run dev
```

Should see:
```
[info]: Database connected successfully
[info]: Redis connected successfully (or warning if not installed)
[info]: FoodBridge API server running on port 3000
```

### 5. Start Frontend (New Terminal)

```bash
cd web
npm run dev
```

Should see:
```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:3001/
```

### 6. Open Browser

```
http://localhost:3001
```

---

## ✅ Verification

### Backend Health Check:
```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T...",
  "uptime": 5.123,
  "environment": "development"
}
```

### Frontend Check:
Visit: http://localhost:3001

Should see:
- Beautiful landing page
- Green gradient hero
- "Share Food, Share Hope"

### Authentication Test:
1. Click "Get Started"
2. Enter phone: 9876543210
3. Click "Send OTP"
4. Check backend terminal for OTP
5. Enter OTP (e.g., 123456)
6. Should redirect to dashboard

---

## 🐛 Troubleshooting

### "npm is not recognized"
**Solution:**
- Restart terminal after installing Node.js
- Or add to PATH: `C:\Program Files\nodejs`

### "createdb: command not found"
**Solution:**
- Add PostgreSQL to PATH: `C:\Program Files\PostgreSQL\15\bin`
- Or use pgAdmin to create database manually

### "EADDRINUSE: Port 3000 already in use"
**Solution:**
```bash
# Find process
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F
```

### "Database connection failed"
**Solution:**
- Check PostgreSQL is running
- Verify password in `backend/.env`
- Check database exists: `psql -U postgres -l`

### "Redis connection failed"
**Solution:**
- It's okay! App works without Redis
- Or install Memurai for Windows
- Or skip Redis for now

### Frontend shows blank page
**Solution:**
- Check browser console (F12)
- Verify backend is running
- Check for CORS errors
- Try: `npm run build` then `npm run preview`

---

## 📁 Project Structure

```
foodbridge/
├── backend/              ← Node.js API
│   ├── src/             ← Source code
│   ├── migrations/      ← Database schema
│   ├── .env            ← Configuration
│   └── package.json    ← Dependencies
│
├── web/                 ← React frontend
│   ├── src/            ← Source code
│   ├── .env           ← Configuration
│   └── package.json   ← Dependencies
│
├── demo/               ← Standalone demo
│   └── index.html     ← No installation needed
│
└── Scripts/
    ├── SETUP_FOODBRIDGE.bat      ← Automated setup
    ├── START_FOODBRIDGE.bat      ← Start servers
    └── START_DEMO_MODE.bat       ← Demo only
```

---

## 🎯 What Works After Setup

### ✅ Landing Page
- Beautiful hero section
- Animated stats
- Feature cards
- How it works
- Call-to-action

### ✅ Authentication
- Phone number entry
- OTP sending
- OTP verification
- JWT tokens
- Session management

### ✅ Dashboard
- User stats
- Quick actions
- Navigation
- Profile menu

### ✅ API Endpoints
- `/api/v1/auth/send-otp`
- `/api/v1/auth/verify-otp`
- `/api/v1/auth/me`
- `/health`

---

## 🚀 Next Steps

### After Installation:

1. **Test the Flow:**
   - Visit landing page
   - Click "Get Started"
   - Test authentication
   - Explore dashboard

2. **Read Documentation:**
   - `QUICKSTART.md` - Quick reference
   - `WEB_LAUNCH_GUIDE.md` - Frontend guide
   - `backend/README.md` - API docs

3. **Customize:**
   - Edit colors in `web/src/theme/`
   - Modify pages in `web/src/pages/`
   - Add features

4. **Deploy:**
   - Setup production database
   - Configure environment
   - Deploy to AWS/Vercel

---

## 📊 System Requirements

### Minimum:
- **OS:** Windows 10/11
- **RAM:** 4GB
- **Disk:** 2GB free space
- **Node.js:** 20.x or higher

### Recommended:
- **OS:** Windows 11
- **RAM:** 8GB
- **Disk:** 5GB free space
- **Node.js:** 20.x LTS
- **PostgreSQL:** 15.x
- **Redis:** 7.x (optional)

---

## 🎉 Success Checklist

After setup, you should have:

- [ ] Node.js installed and working
- [ ] PostgreSQL installed (for full features)
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Database created and migrated
- [ ] Backend running on port 3000
- [ ] Frontend running on port 3001
- [ ] Can access landing page
- [ ] Can test authentication
- [ ] Can see dashboard

---

## 📞 Quick Commands

### Start Everything:
```bash
START_FOODBRIDGE.bat
```

### Start Demo Only:
```bash
START_DEMO_MODE.bat
```

### Manual Start:
```bash
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd web && npm run dev
```

### Stop Servers:
- Close terminal windows
- Or press Ctrl+C in each terminal

---

## 🌟 Tips

### Development:
- Use VS Code for editing
- Install ESLint extension
- Install Prettier extension
- Use React DevTools

### Testing:
- Test on different browsers
- Test responsive design (F12 → Device toolbar)
- Test authentication flow
- Check browser console for errors

### Performance:
- Backend: Check logs for slow queries
- Frontend: Use React DevTools Profiler
- Database: Monitor with pgAdmin
- Network: Check DevTools Network tab

---

## 🎊 You're Ready!

Choose your installation path:

**Quick Demo:** `START_DEMO_MODE.bat`
**Full Setup:** `SETUP_FOODBRIDGE.bat`
**Manual:** Follow detailed steps above

**Questions?** Check `INSTALL_GUIDE.md` for more details!

---

**Built with ❤️ for a hunger-free world** 🌱
