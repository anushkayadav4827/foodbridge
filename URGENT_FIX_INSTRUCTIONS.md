# 🚨 URGENT: Fix OTP and Landing Page

## Issue 1: OTP Not Working ❌
**Problem**: OTP still showing "Invalid OTP" error

**Root Cause**: Backend server needs to be restarted for code changes to take effect

## Issue 2: Landing Page Gone ❌
**Problem**: Not seeing the beautiful landing page

**Root Cause**: You're going directly to `/login` instead of starting from the home page

---

## ✅ SOLUTION: Follow These Steps

### **Step 1: Stop Backend Server**
1. Go to the terminal running the backend
2. Press `Ctrl + C` to stop the server
3. Wait for it to fully stop

### **Step 2: Restart Backend Server**
```bash
cd backend
npm run dev
```

Wait until you see:
```
[INFO] FoodBridge API server running on port 3005
[INFO] Database connected successfully
```

### **Step 3: Stop Frontend Server**
1. Go to the terminal running the frontend
2. Press `Ctrl + C` to stop the server

### **Step 4: Restart Frontend Server**
```bash
cd web
npm run dev
```

Wait until you see:
```
VITE ready in XXX ms
Local: http://localhost:3001/
```

### **Step 5: Clear Browser Cache**
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

OR

1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"

### **Step 6: Go to Landing Page**
**IMPORTANT**: Start from the home page, NOT the login page!

✅ **Correct URL**: http://localhost:3001/
❌ **Wrong URL**: http://localhost:3001/login

### **Step 7: Login from Landing Page**
1. On the landing page, click **"Get Started"** or **"Start Donating"**
2. This will take you to the login page
3. Enter phone number: `9876543210`
4. Click **"Send OTP"**
5. Check backend console - you should see:
   ```
   [INFO] OTP sent to +919876543210: 123456
   ```
6. Enter OTP: **`123456`**
7. Click **"Verify & Continue"**
8. Success! 🎉

---

## 🎯 Quick Test

### **Test 1: Landing Page**
1. Go to: http://localhost:3001/
2. You should see:
   - Green gradient background
   - "Share Food, Share Hope" heading
   - "Start Donating" button
   - Stats section (50,000+ Meals Shared, etc.)
   - "Why Choose FoodBridge?" section
   - "How It Works" section

### **Test 2: OTP Login**
1. From landing page, click "Get Started"
2. Enter phone: `9876543210`
3. Click "Send OTP"
4. Check backend console for: `OTP sent to +919876543210: 123456`
5. Enter OTP: `123456`
6. Click "Verify & Continue"
7. Should redirect to dashboard

---

## 🔍 Troubleshooting

### **Problem: Still seeing "Invalid OTP"**

**Check 1**: Did you restart the backend?
```bash
# Stop backend (Ctrl+C)
# Then restart:
cd backend
npm run dev
```

**Check 2**: Is the OTP being logged?
Look for this in backend console:
```
[INFO] OTP sent to +919876543210: 123456
```

**Check 3**: Are you entering the correct OTP?
The OTP is always: **`123456`**

**Check 4**: Is the database connected?
Look for this in backend console:
```
[INFO] Database connected successfully
```

### **Problem: Landing page not showing**

**Check 1**: Are you going to the correct URL?
✅ Correct: http://localhost:3001/
❌ Wrong: http://localhost:3001/login

**Check 2**: Is the frontend running?
```bash
cd web
npm run dev
```

**Check 3**: Clear browser cache
- Press F12
- Right-click refresh button
- Select "Empty Cache and Hard Reload"

### **Problem: Backend not starting**

**Check 1**: Is PostgreSQL running?
```bash
docker ps | grep postgres
```

**Check 2**: Is port 3005 already in use?
```bash
netstat -ano | findstr :3005
```

**Check 3**: Check backend logs for errors

---

## 📋 Checklist

Before testing, make sure:

- [ ] Backend server restarted (Ctrl+C then `npm run dev`)
- [ ] Frontend server restarted (Ctrl+C then `npm run dev`)
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] Going to correct URL (http://localhost:3001/)
- [ ] PostgreSQL database running
- [ ] Backend console showing OTP logs

---

## 🎉 Expected Result

### **Landing Page** (http://localhost:3001/)
![Landing Page](https://via.placeholder.com/800x400/2E7D32/FFFFFF?text=FoodBridge+Landing+Page)

You should see:
- ✅ Beautiful green gradient hero section
- ✅ "Share Food, Share Hope" heading
- ✅ Stats with animated counters
- ✅ Feature cards
- ✅ "How It Works" section
- ✅ Orange CTA section
- ✅ Footer

### **Login Flow**
1. Click "Get Started" → Login page
2. Enter phone → OTP sent
3. Backend logs: `OTP sent to +919876543210: 123456`
4. Enter OTP: `123456`
5. Success → Dashboard

---

## 🚀 Quick Start Script

Save this as `RESTART_ALL.bat`:

```batch
@echo off
echo Restarting FoodBridge Application...
echo.

echo Stopping any running processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Starting Backend...
start "FoodBridge Backend" cmd /k "cd backend && npm run dev"

timeout /t 5 /nobreak >nul

echo Starting Frontend...
start "FoodBridge Frontend" cmd /k "cd web && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo Opening browser...
start http://localhost:3001/

echo.
echo ========================================
echo   FoodBridge is starting!
echo ========================================
echo.
echo Backend: http://localhost:3005
echo Frontend: http://localhost:3001
echo.
echo Check the new terminal windows for logs
echo.
pause
```

Then just run: `RESTART_ALL.bat`

---

## 📞 Still Having Issues?

If you're still having problems after following all steps:

1. **Check backend console** - Look for OTP logs
2. **Check frontend console** (F12) - Look for errors
3. **Check database** - Make sure PostgreSQL is running
4. **Try different phone number** - Use `9999999999`
5. **Clear localStorage** - F12 → Application → Local Storage → Clear All

---

## ✅ Summary

**To fix OTP**:
1. Restart backend server (Ctrl+C then `npm run dev`)
2. OTP is always `123456` in development

**To see landing page**:
1. Go to http://localhost:3001/ (NOT /login)
2. Clear browser cache if needed

**The OTP code is: `123456`**

**Happy testing! 🎉**
