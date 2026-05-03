@echo off
echo.
echo ============================================
echo   FoodBridge - Easy Installation
echo ============================================
echo.
echo This will help you install everything needed.
echo.

REM Check if Node.js is installed
echo [Step 1/3] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is NOT installed
    echo.
    echo I will download Node.js for you now...
    echo.
    pause
    
    REM Run PowerShell script to download and install
    powershell -ExecutionPolicy Bypass -File AUTO_INSTALL_NODEJS.ps1
    
    echo.
    echo After Node.js installation:
    echo 1. Close this window
    echo 2. Open NEW terminal
    echo 3. Run this file again: EASY_INSTALL.bat
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
    node --version
)

echo.
echo [Step 2/3] Running setup...
echo.
call SETUP_FOODBRIDGE.bat

echo.
echo [Step 3/3] Would you like to start FoodBridge now? (Y/N)
set /p startnow=
if /i "!startnow!"=="Y" (
    call START_FOODBRIDGE.bat
)

echo.
echo ============================================
echo   Installation Complete!
echo ============================================
echo.
pause
