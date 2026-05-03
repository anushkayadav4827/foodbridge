# 📥 Download Prerequisites for FoodBridge

## ⚠️ Node.js is NOT installed!

To run FoodBridge, you need to install Node.js first.

---

## 🎯 Quick Installation Guide

### Step 1: Download Node.js (5 minutes)

1. **Open your browser**
2. **Visit:** https://nodejs.org/
3. **Click:** The big green button that says "Download Node.js (LTS)"
4. **Wait:** For download to complete (~50MB)
5. **Run:** The downloaded installer
6. **Click:** "Next" → "Next" → "Install"
7. **Wait:** For installation (~2 minutes)
8. **Click:** "Finish"
9. **Restart:** This terminal/PowerShell window

### Step 2: Verify Installation

Open a NEW terminal and run:
```bash
node --version
```

You should see: `v20.x.x` or similar

---

## 🔗 Direct Download Links

### Node.js (Required)
**Windows 64-bit:**
https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi

**Windows 32-bit:**
https://nodejs.org/dist/v20.11.0/node-v20.11.0-x86.msi

### PostgreSQL (For Full Features)
**Windows:**
https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

Choose: PostgreSQL 15.x for Windows x86-64

### Redis (Optional)
**Memurai (Redis for Windows):**
https://www.memurai.com/get-memurai

---

## 📋 Installation Checklist

### Node.js Installation:
- [ ] Downloaded installer
- [ ] Ran installer
- [ ] Kept all default settings
- [ ] Installation completed
- [ ] Restarted terminal
- [ ] Verified with `node --version`

### PostgreSQL Installation (Optional):
- [ ] Downloaded installer
- [ ] Ran installer
- [ ] Set password (remember it!)
- [ ] Kept default port (5432)
- [ ] Installation completed
- [ ] Verified with `psql --version`

---

## 🚀 After Installation

### Option 1: Automated Setup
```bash
SETUP_FOODBRIDGE.bat
```

### Option 2: Demo Mode (No Database)
```bash
START_DEMO_MODE.bat
```

### Option 3: Manual Setup
See `🎯_INSTALLATION_STEPS.md`

---

## 🎬 Video Tutorial (Recommended)

**Installing Node.js on Windows:**
https://www.youtube.com/results?search_query=install+nodejs+windows

**Installing PostgreSQL on Windows:**
https://www.youtube.com/results?search_query=install+postgresql+windows

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Download Node.js | 2 min |
| Install Node.js | 3 min |
| Download PostgreSQL | 5 min |
| Install PostgreSQL | 5 min |
| Setup FoodBridge | 5 min |
| **Total** | **20 min** |

---

## 🆘 Need Help?

### Node.js Installation Issues:

**"Installation failed"**
- Run installer as Administrator
- Disable antivirus temporarily
- Download again (file may be corrupted)

**"node command not found after install"**
- Restart terminal
- Restart computer
- Check PATH: `C:\Program Files\nodejs`

### PostgreSQL Installation Issues:

**"Port 5432 already in use"**
- Another PostgreSQL is running
- Choose different port (5433)
- Or uninstall old version first

**"Installation hangs"**
- Disable antivirus
- Run as Administrator
- Check disk space (need 1GB+)

---

## 🎯 What You'll Get

After installing prerequisites and running setup:

### ✅ Beautiful Web Application
- Landing page with animations
- Authentication system
- User dashboard
- Responsive design

### ✅ Complete Backend API
- RESTful endpoints
- Real-time features
- Database integration
- Authentication

### ✅ Full Features
- OTP-based login
- User profiles
- Food listings (coming soon)
- Impact tracking (coming soon)

---

## 📊 System Check

Before installing, verify:

### Disk Space:
- Node.js: ~200MB
- PostgreSQL: ~300MB
- FoodBridge: ~500MB
- **Total needed:** ~1GB

### Internet:
- Download speed: Any
- Total download: ~400MB

### System:
- Windows 10/11
- 64-bit (recommended)
- Administrator access

---

## 🎉 Quick Start After Installation

1. **Verify Node.js:**
   ```bash
   node --version
   npm --version
   ```

2. **Run Setup:**
   ```bash
   SETUP_FOODBRIDGE.bat
   ```

3. **Start Application:**
   ```bash
   START_FOODBRIDGE.bat
   ```

4. **Open Browser:**
   ```
   http://localhost:3001
   ```

---

## 🌟 Alternative: Demo Mode

If you want to see FoodBridge immediately without PostgreSQL:

1. **Install Node.js only**
2. **Run:** `START_DEMO_MODE.bat`
3. **Visit:** http://localhost:3001

This will show:
- ✅ Landing page
- ✅ Design and animations
- ❌ Authentication (needs backend)
- ❌ Dashboard (needs backend)

---

## 📞 Quick Links

### Downloads:
- **Node.js:** https://nodejs.org/
- **PostgreSQL:** https://www.postgresql.org/download/
- **Memurai (Redis):** https://www.memurai.com/

### Documentation:
- **Node.js Docs:** https://nodejs.org/docs/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **FoodBridge Docs:** See `QUICKSTART.md`

### Tutorials:
- **Node.js Tutorial:** https://nodejs.dev/learn
- **PostgreSQL Tutorial:** https://www.postgresqltutorial.com/
- **React Tutorial:** https://react.dev/learn

---

## ✅ Ready to Install?

### Step-by-Step:

1. **Download Node.js** from https://nodejs.org/
2. **Install Node.js** (keep defaults)
3. **Restart terminal**
4. **Run:** `SETUP_FOODBRIDGE.bat`
5. **Enjoy FoodBridge!** 🌱

---

**Need help? Check `INSTALL_GUIDE.md` for detailed instructions!**

**Built with ❤️ for a hunger-free world** 🌱
