@echo off
echo ========================================
echo   Restarting FoodBridge Application
echo ========================================
echo.

echo [1/5] Stopping any running Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/5] Starting Backend Server...
start "FoodBridge Backend (Port 3005)" cmd /k "cd backend && npm run dev"

echo.
echo [3/5] Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo [4/5] Starting Frontend Server...
start "FoodBridge Frontend (Port 3001)" cmd /k "cd web && npm run dev"

echo.
echo [5/5] Waiting for frontend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   Opening Browser...
echo ========================================
echo.
start http://localhost:3001/

echo.
echo ========================================
echo   FoodBridge is Running!
echo ========================================
echo.
echo Backend:  http://localhost:3005
echo Frontend: http://localhost:3001
echo.
echo IMPORTANT:
echo - Landing page: http://localhost:3001/
echo - Login with phone: 9876543210
echo - OTP code: 123456
echo.
echo Check the new terminal windows for server logs
echo.
echo ========================================
pause
