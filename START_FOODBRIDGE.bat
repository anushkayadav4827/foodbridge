@echo off
cls
echo.
echo ========================================
echo      FoodBridge - Full Stack Launch
echo ========================================
echo.
echo Starting FoodBridge server...
echo.
echo Server will be available at:
echo http://localhost:3005
echo.
echo Opening browser in 3 seconds...
echo.

REM Wait 3 seconds then open browser
timeout /t 3 /nobreak >nul
start http://localhost:3005

echo.
echo ========================================
echo   FoodBridge is now running!
echo ========================================
echo.
echo Frontend: http://localhost:3005
echo API:      http://localhost:3005/api/v1
echo Health:   http://localhost:3005/health
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the backend server (this will keep running)
cd backend
npm run dev
