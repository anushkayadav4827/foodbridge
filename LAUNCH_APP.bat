@echo off
echo.
echo ========================================
echo   FoodBridge - Launch Demo Application
echo ========================================
echo.
echo Starting FoodBridge server and opening demo app...
echo.

cd backend

echo [1/2] Starting backend server...
start "FoodBridge Server" cmd /k "npm run dev"

echo [2/2] Waiting for server to start...
timeout /t 5 /nobreak > nul

echo.
echo Opening demo application in browser...
start http://localhost:3005/app.html

echo.
echo ========================================
echo   FoodBridge is now running!
echo ========================================
echo.
echo Server: http://localhost:3005
echo Demo App: http://localhost:3005/app.html
echo.
echo Press any key to close this window...
echo (The server will continue running in the other window)
pause > nul
