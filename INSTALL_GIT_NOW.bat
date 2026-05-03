@echo off
echo ========================================
echo   Installing Git for Windows
echo ========================================
echo.

echo This script will help you install Git.
echo.
echo Step 1: Downloading Git installer...
echo.

REM Check if we're in the downloads folder
if not exist "downloads" mkdir downloads

echo Opening Git download page...
echo.
echo Please download: "64-bit Git for Windows Setup"
echo.
start https://git-scm.com/download/win

echo.
echo ========================================
echo   INSTRUCTIONS
echo ========================================
echo.
echo 1. Download "64-bit Git for Windows Setup"
echo 2. Run the installer
echo 3. Click "Next" through all steps (use defaults)
echo 4. Click "Install"
echo 5. Click "Finish"
echo 6. CLOSE THIS TERMINAL and open a new one
echo 7. Run: PUSH_CODE_TO_GITHUB.bat
echo.
echo ========================================
echo.

pause
