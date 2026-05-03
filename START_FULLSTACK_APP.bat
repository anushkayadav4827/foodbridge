@echo off
echo ========================================
echo   FoodBridge Full-Stack Application
echo ========================================
echo.
echo Starting Backend and Frontend servers...
echo.
echo Backend will run on: http://localhost:3005
echo Frontend will run on: http://localhost:3001
echo.
echo Press Ctrl+C to stop both servers
echo ========================================
echo.

REM Start backend in a new window
start "FoodBridge Backend (Port 3005)" cmd /k "cd backend && npm run dev"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
start "FoodBridge Frontend (Port 3001)" cmd /k "cd web && npm run dev"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Open browser
echo.
echo Opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:3001

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo.
echo Backend: http://localhost:3005
echo Frontend: http://localhost:3001
echo.
echo Check the new terminal windows for server logs
echo Press any key to exit this window...
pause >nul
