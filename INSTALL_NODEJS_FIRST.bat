@echo off
echo.
echo ============================================
echo   FoodBridge - Installation Check
echo ============================================
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ Node.js is NOT installed!
    echo.
    echo ============================================
    echo   PLEASE INSTALL NODE.JS FIRST
    echo ============================================
    echo.
    echo Step 1: Visit https://nodejs.org/
    echo Step 2: Download the LTS version
    echo Step 3: Run the installer
    echo Step 4: Restart this script
    echo.
    echo Direct Download Link:
    echo https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
    echo.
    echo Opening Node.js website in browser...
    timeout /t 3 /nobreak >nul
    start https://nodejs.org/
    echo.
    echo After installing Node.js:
    echo 1. Close this window
    echo 2. Open a NEW terminal
    echo 3. Run: SETUP_FOODBRIDGE.bat
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js is installed!
node --version
echo.
echo Great! Node.js is ready.
echo.
echo Next step: Run SETUP_FOODBRIDGE.bat
echo.
pause
