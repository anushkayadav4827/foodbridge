# 🚀 FoodBridge - Complete Installation Guide

## Prerequisites Installation

### Step 1: Install Node.js (Required)

1. **Download Node.js 20 LTS:**
   - Visit: https://nodejs.org/
   - Download the "LTS" version (recommended)
   - Run the installer
   - Keep all default settings
   - Click "Install"

2. **Verify Installation:**
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers (e.g., v20.x.x)

### Step 2: Install PostgreSQL (Required)

1. **Download PostgreSQL 15:**
   - Visit: https://www.postgresql.org/download/windows/
   - Download the installer
   - Run the installer

2. **During Installation:**
   - Remember the password you set for "postgres" user
   - Default port: 5432 (keep it)
   - Install Stack Builder: Yes

3. **Verify Installation:**
   ```bash
   psql --version
   ```

### Step 3: Install Redis (Optional for now)

**Option A: Use Windows Subsystem for Linux (WSL)**
```bash
wsl --install
# After restart:
sudo apt-get update
sudo apt-get install redis-server
redis-server
```

**Option B: Use Memurai (Redis for Windows)**
- Visit: https://www.memurai.com/
- Download and install

**Option C: Skip for now**
- The app will work without Redis (with reduced performance)
- We'll use in-memory caching as fallback

---

## Quick Setup (After Prerequisites)

Run this command in PowerShell:
```powershell
.\SETUP_FOODBRIDGE.bat
```

This will:
1. ✅ Install all dependencies
2. ✅ Setup database
3. ✅ Configure environment
4. ✅ Start backend
5. ✅ Start frontend
6. ✅ Open browser

---

## Manual Setup (Detailed)

### 1. Setup Database

```bash
# Open Command Prompt or PowerShell
createdb -U postgres foodbridge

# If createdb doesn't work, use psql:
psql -U postgres
CREATE DATABASE foodbridge;
\q
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Setup Environment Variables

The `.env` file is already created. Update if needed:
```bash
# Edit backend/.env
# Update DB_PASSWORD with your PostgreSQL password
```

### 4. Run Database Migrations

```bash
# From backend directory
psql -U postgres -d foodbridge -f migrations/001_initial_schema.sql
```

### 5. Start Backend

```bash
cd backend
npm run dev
```

Backend will run on: http://localhost:3000

### 6. Install Frontend Dependencies (New Terminal)

```bash
cd web
npm install
```

### 7. Start Frontend

```bash
cd web
npm run dev
```

Frontend will run on: http://localhost:3001

---

## Troubleshooting

### Node.js Issues

**"npm is not recognized"**
- Restart your terminal after installing Node.js
- Or add Node.js to PATH manually

**"Permission denied"**
- Run terminal as Administrator
- Or use: `npm install --force`

### PostgreSQL Issues

**"createdb: command not found"**
- Add PostgreSQL bin to PATH:
  - Default: `C:\Program Files\PostgreSQL\15\bin`
- Or use pgAdmin GUI to create database

**"password authentication failed"**
- Update `backend/.env` with correct password
- Or reset PostgreSQL password

### Redis Issues

**"Redis connection failed"**
- It's okay! App will work without Redis
- Or install Memurai for Windows
- Or use WSL with Redis

### Port Already in Use

**Backend (3000):**
```bash
# Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Frontend (3001):**
```bash
# Find and kill process
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

---

## Verification Checklist

After setup, verify:

### Backend:
- [ ] `http://localhost:3000/health` returns `{"status":"ok"}`
- [ ] No errors in backend terminal
- [ ] Database connected successfully

### Frontend:
- [ ] `http://localhost:3001` shows landing page
- [ ] No errors in frontend terminal
- [ ] Can click "Get Started"

### Integration:
- [ ] Click "Get Started" on landing page
- [ ] Enter phone number: 9876543210
- [ ] Click "Send OTP"
- [ ] Check backend terminal for OTP code
- [ ] Enter OTP and verify

---

## Next Steps After Installation

1. **Test Authentication:**
   - Go to http://localhost:3001
   - Click "Get Started"
   - Test OTP flow

2. **Explore Dashboard:**
   - After login, see your dashboard
   - Check stats and quick actions

3. **Read Documentation:**
   - QUICKSTART.md - Quick reference
   - WEB_LAUNCH_GUIDE.md - Frontend guide
   - backend/README.md - API docs

4. **Start Building:**
   - Add new features
   - Customize design
   - Deploy to production

---

## Production Deployment

See `DEPLOYMENT.md` (to be created) for:
- AWS deployment
- Environment configuration
- SSL setup
- Domain configuration
- Monitoring setup

---

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review error messages carefully
3. Check documentation files
4. Verify all prerequisites are installed

---

**Ready to install? Run: `.\SETUP_FOODBRIDGE.bat`**
