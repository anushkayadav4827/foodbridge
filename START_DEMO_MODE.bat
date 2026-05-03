@echo off
echo.
echo ============================================
echo   FoodBridge - Demo Mode
echo   (No Database Required)
echo ============================================
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo.
    echo Please install Node.js:
    echo Visit: https://nodejs.org/
    echo Download and install LTS version
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.
echo Installing dependencies if needed...
echo.

REM Install web dependencies only
cd web
if not exist node_modules (
    echo Installing frontend packages...
    call npm install
)
cd ..

echo.
echo Starting FoodBridge in Demo Mode...
echo (Frontend only, no backend required)
echo.

REM Start frontend
start "FoodBridge Demo" cmd /k "cd web && npm run dev"

echo.
echo ============================================
echo   FoodBridge Demo Starting!
echo ============================================
echo.
echo Frontend: http://localhost:3001
echo.
echo Note: This is demo mode
echo - Landing page will work
echo - Authentication will not work (no backend)
echo - For full features, run SETUP_FOODBRIDGE.bat
echo.

timeout /t 8 /nobreak >nul

echo Opening browser...
start http://localhost:3001

echo.
echo ✅ Demo is running!
echo.
pause
