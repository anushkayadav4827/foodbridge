# 🚀 Install FoodBridge - Step by Step Guide

## ⚠️ CURRENT STATUS: Node.js NOT Installed

Your system needs Node.js to run FoodBridge. Follow these simple steps:

---

## 📥 STEP 1: Install Node.js (5 minutes)

### Quick Installation:

1. **Click this link:** https://nodejs.org/
2. **Download:** Click the big green button "Download Node.js (LTS)"
3. **Run:** The downloaded file (node-v20.x.x-x64.msi)
4. **Install:** Click Next → Next → Install → Finish
5. **Restart:** Close ALL terminal windows and open a new one

### Direct Download Link:
**Windows 64-bit:** https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi

---

## ✅ STEP 2: Verify Installation

After installing Node.js, open a **NEW** terminal and run:

```bash
node --version
```

You should see: `v20.11.0` or similar

If you see this, Node.js is installed! ✅

---

## 🎯 STEP 3: Run Automated Setup

After Node.js is installed, simply double-click:

```
SETUP_FOODBRIDGE.bat
```

This will:
- ✅ Install all dependencies (backend + frontend)
- ✅ Setup database (if PostgreSQL is installed)
- ✅ Configure environment
- ✅ Start the application

---

## 🚀 STEP 4: Launch FoodBridge

After setup completes, double-click:

```
START_FOODBRIDGE.bat
```

This will:
- ✅ Start backend server (port 3000)
- ✅ Start frontend server (port 3001)
- ✅ Open browser automatically

---

## 🎊 What You'll Get

### Without PostgreSQL (Demo Mode):
- ✅ Beautiful landing page
- ✅ Responsive design
- ✅ Animations and effects
- ❌ Authentication (needs database)
- ❌ User features (needs database)

### With PostgreSQL (Full Features):
- ✅ Everything above PLUS:
- ✅ OTP-based authentication
- ✅ User dashboard
- ✅ Profile management
- ✅ Complete backend API

---

## 📋 Installation Checklist

### Required (Must Have):
- [ ] Node.js installed
- [ ] Verified with `node --version`
- [ ] Ran `SETUP_FOODBRIDGE.bat`
- [ ] Ran `START_FOODBRIDGE.bat`

### Optional (For Full Features):
- [ ] PostgreSQL installed
- [ ] Database created
- [ ] Migrations run

---

## 🆘 Troubleshooting

### "node is not recognized"
**Solution:**
1. Restart ALL terminal windows
2. Restart computer if needed
3. Verify installation: Check `C:\Program Files\nodejs`

### "npm install failed"
**Solution:**
1. Run terminal as Administrator
2. Check internet connection
3. Try again: `cd backend && npm install`

### "Port already in use"
**Solution:**
1. Close other applications using ports 3000/3001
2. Or restart computer

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Download Node.js | 2 min |
| Install Node.js | 3 min |
| Run SETUP_FOODBRIDGE.bat | 5 min |
| Start application | 1 min |
| **Total** | **11 min** |

---

## 🎯 Quick Commands (After Node.js Installation)

### Automated Setup:
```bash
SETUP_FOODBRIDGE.bat
```

### Start Application:
```bash
START_FOODBRIDGE.bat
```

### Manual Start (Alternative):
```bash
# Terminal 1:
cd backend
npm install
npm run dev

# Terminal 2:
cd web
npm install
npm run dev
```

---

## 🌟 What Happens Next?

### After Installing Node.js:

1. **SETUP_FOODBRIDGE.bat** will:
   - Check Node.js ✅
   - Install backend packages (~2 min)
   - Install frontend packages (~3 min)
   - Ask about database setup
   - Complete setup

2. **START_FOODBRIDGE.bat** will:
   - Start backend server
   - Start frontend server
   - Open browser to http://localhost:3001
   - Show beautiful landing page

3. **You can:**
   - Explore the landing page
   - See animations and design
   - Test responsive layout
   - (With PostgreSQL) Test authentication

---

## 📞 Need Help?

### Installation Issues:
- Check `INSTALL_GUIDE.md` for detailed help
- Check `🎯_INSTALLATION_STEPS.md` for alternatives
- Check `📥_DOWNLOAD_PREREQUISITES.md` for downloads

### Quick Links:
- **Node.js:** https://nodejs.org/
- **PostgreSQL:** https://www.postgresql.org/download/
- **Project Docs:** See `README.md`

---

## 🎉 Ready to Start?

### Your Action Plan:

1. ✅ **Install Node.js** (5 minutes)
   - Visit: https://nodejs.org/
   - Download and install
   - Restart terminal

2. ✅ **Run Setup** (5 minutes)
   - Double-click: `SETUP_FOODBRIDGE.bat`
   - Wait for completion

3. ✅ **Launch App** (1 minute)
   - Double-click: `START_FOODBRIDGE.bat`
   - Browser opens automatically

4. ✅ **Enjoy!** 🌱
   - Explore FoodBridge
   - Share food, share hope

---

## 💡 Pro Tips

### For Best Experience:
1. Install PostgreSQL for full features
2. Use Chrome or Firefox browser
3. Keep terminal windows open while using app
4. Check terminal logs if issues occur

### For Development:
1. Install VS Code for editing
2. Install Git for version control
3. Read `ARCHITECTURE.md` to understand structure
4. Check `backend/README.md` for API docs

---

## 🎊 Success Indicators

After setup, you should see:

### In Terminal 1 (Backend):
```
[info]: Database connected successfully
[info]: FoodBridge API server running on port 3000
```

### In Terminal 2 (Frontend):
```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:3001/
```

### In Browser:
- Beautiful green gradient hero
- "Share Food, Share Hope" heading
- Animated statistics
- Feature cards
- Smooth animations

---

## 🚀 Let's Get Started!

**Step 1:** Install Node.js from https://nodejs.org/

**Step 2:** Run `SETUP_FOODBRIDGE.bat`

**Step 3:** Run `START_FOODBRIDGE.bat`

**Step 4:** Enjoy FoodBridge! 🌱

---

**Built with ❤️ for a hunger-free world** 🌱

**Questions?** Check the other documentation files or create an issue!
