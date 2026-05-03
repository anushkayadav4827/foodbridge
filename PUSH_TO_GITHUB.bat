@echo off
echo ========================================
echo   Push Code to GitHub
echo ========================================
echo.

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed!
    echo.
    echo Please install Git first:
    echo 1. Go to: https://git-scm.com/download/win
    echo 2. Download and install Git
    echo 3. Close and reopen this terminal
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo [OK] Git is installed
echo.

REM Configure Git (if not already configured)
echo Configuring Git...
git config --global user.name "Anushka Yadav" 2>nul
git config --global user.email "anushkayadav5403@gmail.com" 2>nul
echo [OK] Git configured
echo.

REM Initialize Git repository
echo Initializing Git repository...
if not exist .git (
    git init
    echo [OK] Git repository initialized
) else (
    echo [OK] Git repository already exists
)
echo.

REM Add all files
echo Adding all files...
git add .
echo [OK] Files added
echo.

REM Commit
echo Committing changes...
git commit -m "Ready for deployment - FoodBridge app" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Changes committed
) else (
    echo [INFO] No new changes to commit
)
echo.

REM Add remote (if not already added)
echo Adding GitHub remote...
git remote add origin https://github.com/anushkayadav5403/foodbridge.git 2>nul
if %errorlevel% equ 0 (
    echo [OK] Remote added
) else (
    echo [INFO] Remote already exists
)
echo.

REM Rename branch to main (if needed)
echo Ensuring branch is named 'main'...
git branch -M main 2>nul
echo [OK] Branch is 'main'
echo.

REM Push to GitHub
echo Pushing to GitHub...
echo.
echo [INFO] You may be asked to authenticate with GitHub
echo [INFO] Use your GitHub username and password (or personal access token)
echo.
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCCESS!
    echo ========================================
    echo.
    echo Your code is now on GitHub!
    echo Repository: https://github.com/anushkayadav5403/foodbridge
    echo.
    echo NEXT STEP:
    echo 1. Go to: https://render.com/
    echo 2. Sign up with GitHub
    echo 3. Follow the guide in: DEPLOY_BACKEND_TO_RENDER.md
    echo.
) else (
    echo.
    echo ========================================
    echo   AUTHENTICATION REQUIRED
    echo ========================================
    echo.
    echo If you got an authentication error, you need to:
    echo.
    echo Option 1: Use Personal Access Token
    echo 1. Go to: https://github.com/settings/tokens
    echo 2. Click "Generate new token (classic)"
    echo 3. Name: "FoodBridge Deployment"
    echo 4. Check: "repo" (all repo permissions)
    echo 5. Click "Generate token"
    echo 6. Copy the token
    echo 7. Run this script again
    echo 8. Use the token as your password
    echo.
    echo Option 2: Use GitHub Desktop (Easier)
    echo 1. Download: https://desktop.github.com/
    echo 2. Install and sign in
    echo 3. Add this repository
    echo 4. Click "Publish repository"
    echo.
)

echo.
pause
