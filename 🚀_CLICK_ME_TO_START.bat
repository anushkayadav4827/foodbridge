@echo off
color 0A
echo.
echo ============================================
echo   🚀 FoodBridge - One-Click Installer
echo ============================================
echo.
echo This will:
echo  1. Download Node.js automatically
echo  2. Help you install it
echo  3. Setup FoodBridge
echo  4. Launch the application
echo.
echo Press any key to start...
pause >nul

echo.
echo Starting automatic installation...
echo.

REM Run the PowerShell auto-installer
powershell -ExecutionPolicy Bypass -File AUTO_INSTALL_NODEJS.ps1

echo.
echo ============================================
echo   Next: Run SETUP_FOODBRIDGE.bat
echo ============================================
echo.
pause
