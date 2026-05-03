@echo off
echo ========================================
echo   Restarting Backend for OTP Fix
echo ========================================
echo.

echo [1/3] Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Starting Backend Server...
start "FoodBridge Backend - OTP Fixed" cmd /k "cd backend && npm run dev"

echo.
echo [3/3] Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   Backend Restarted!
echo ========================================
echo.
echo OTP is now fixed to: 123456
echo.
echo To test:
echo 1. Go to: http://localhost:3001/login
echo 2. Phone: 9876543210
echo 3. Click "Send OTP"
echo 4. Enter OTP: 123456
echo 5. Click "Verify & Continue"
echo.
echo Check the backend console window for OTP logs
echo.
pause
