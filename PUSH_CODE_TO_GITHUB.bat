@echo off
echo ========================================
echo   Push Complete Code to GitHub
echo ========================================
echo.

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed!
    echo.
    echo Please run: INSTALL_GIT_NOW.bat
    echo.
    pause
    exit /b 1
)

echo [OK] Git is installed
echo.

REM Configure Git
echo Configuring Git...
git config --global user.name "anushkayadav4827" 2>nul
git config --global user.email "anushkayadav4827@users.noreply.github.com" 2>nul
echo [OK] Git configured
echo.

REM Check if .git exists
if not exist .git (
    echo Initializing Git repository...
    git init
    echo [OK] Repository initialized
    echo.
)

REM Check current remote
git remote -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Adding GitHub remote...
    git remote add origin https://github.com/anushkayadav4827/foodbridge.git
    echo [OK] Remote added
) else (
    echo Updating GitHub remote...
    git remote set-url origin https://github.com/anushkayadav4827/foodbridge.git 2>nul
    echo [OK] Remote updated
)
echo.

REM Ensure we're on main branch
echo Ensuring branch is 'main'...
git branch -M main 2>nul
echo [OK] Branch is 'main'
echo.

REM Add all files
echo Adding all files...
git add .
if %errorlevel% neq 0 (
    echo [ERROR] Failed to add files
    pause
    exit /b 1
)
echo [OK] Files added
echo.

REM Commit
echo Committing changes...
git commit -m "Add complete FoodBridge codebase - backend and web folders" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Changes committed
) else (
    echo [INFO] No new changes to commit (or already committed)
)
echo.

REM Push to GitHub
echo ========================================
echo   Pushing to GitHub...
echo ========================================
echo.
echo Repository: https://github.com/anushkayadav4827/foodbridge
echo.
echo [INFO] You will be asked to authenticate with GitHub
echo [INFO] Use your GitHub username and Personal Access Token
echo.
echo If you don't have a token:
echo 1. Go to: https://github.com/settings/tokens
echo 2. Click "Generate new token (classic)"
echo 3. Name: "FoodBridge Deployment"
echo 4. Check: "repo" (all permissions)
echo 5. Generate and copy the token
echo 6. Use token as password when prompted
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCCESS!
    echo ========================================
    echo.
    echo Your complete code is now on GitHub!
    echo.
    echo Verify at: https://github.com/anushkayadav4827/foodbridge
    echo.
    echo You should see:
    echo   - backend folder
    echo   - web folder
    echo   - .kiro folder
    echo   - Other files
    echo.
    echo ========================================
    echo   NEXT STEP: Deploy to Render
    echo ========================================
    echo.
    echo 1. Go to: https://render.com/
    echo 2. Sign up with GitHub
    echo 3. Follow: DEPLOY_BACKEND_TO_RENDER.md
    echo.
    
    REM Open GitHub repository
    echo Opening your GitHub repository...
    start https://github.com/anushkayadav4827/foodbridge
    
) else (
    echo.
    echo ========================================
    echo   AUTHENTICATION NEEDED
    echo ========================================
    echo.
    echo You need a Personal Access Token to push to GitHub.
    echo.
    echo Follow these steps:
    echo.
    echo 1. Go to: https://github.com/settings/tokens
    echo 2. Click "Generate new token (classic)"
    echo 3. Name: "FoodBridge Deployment"
    echo 4. Check: "repo" (all repo permissions)
    echo 5. Click "Generate token"
    echo 6. Copy the token (you won't see it again!)
    echo 7. Run this script again
    echo 8. When asked for password, paste the token
    echo.
    echo Opening GitHub tokens page...
    start https://github.com/settings/tokens
    echo.
)

echo.
pause
