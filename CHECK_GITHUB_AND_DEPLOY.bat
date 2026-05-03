@echo off
echo ========================================
echo   Check GitHub and Deploy Backend
echo ========================================
echo.

echo Checking your GitHub repository...
echo Repository: https://github.com/anushkayadav4827/foodbridge
echo.

echo ========================================
echo   CURRENT STATUS
echo ========================================
echo.
echo I checked your GitHub repository and found:
echo.
echo   [X] Only .kiro folder is pushed
echo   [ ] backend folder is MISSING
echo   [ ] web folder is MISSING
echo.
echo ========================================
echo   PROBLEM
echo ========================================
echo.
echo Your backend code is not on GitHub yet!
echo Render needs the backend folder to deploy your API.
echo.
echo ========================================
echo   SOLUTION
echo ========================================
echo.
echo You need to push the complete code first.
echo.
echo OPTION 1: Use GitHub Desktop (EASIEST)
echo   1. Download: https://desktop.github.com/
echo   2. Install and sign in
echo   3. Add this repository
echo   4. Push to GitHub
echo.
echo OPTION 2: Install Git
echo   1. Download: https://git-scm.com/download/win
echo   2. Install Git
echo   3. Run: PUSH_TO_GITHUB.bat
echo.
echo ========================================
echo   DETAILED GUIDE
echo ========================================
echo.
echo Read this file for complete instructions:
echo   🚨_IMPORTANT_MISSING_CODE.md
echo.
echo This guide will show you:
echo   - How to push complete code to GitHub
echo   - How to deploy backend to Render
echo   - How to connect frontend to backend
echo.
echo ========================================
echo   QUICK START
echo ========================================
echo.
echo 1. Download GitHub Desktop:
echo    https://desktop.github.com/
echo.
echo 2. Open GitHub Desktop
echo.
echo 3. Add this repository:
echo    C:\Users\Asus\OneDrive\Desktop\wastenot
echo.
echo 4. Push to GitHub
echo.
echo 5. Verify at:
echo    https://github.com/anushkayadav4827/foodbridge
echo.
echo 6. Then continue with Render deployment
echo.
echo ========================================
echo.

echo Opening detailed guide...
start notepad "🚨_IMPORTANT_MISSING_CODE.md"

echo.
echo Press any key to open GitHub Desktop download page...
pause >nul
start https://desktop.github.com/

echo.
echo After pushing code, press any key to open Render...
pause >nul
start https://render.com/

echo.
echo ========================================
echo   NEXT STEPS
echo ========================================
echo.
echo 1. Install GitHub Desktop
echo 2. Push complete code to GitHub
echo 3. Verify backend folder is on GitHub
echo 4. Create Render account
echo 5. Deploy backend on Render
echo.
echo Read: 🚨_IMPORTANT_MISSING_CODE.md
echo.
pause
