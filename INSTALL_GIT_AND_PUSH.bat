@echo off
echo ========================================
echo   Install Git and Push to GitHub
echo ========================================
echo.

echo Checking if Git is installed...
git --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo Git is NOT installed!
    echo.
    echo Please install Git first:
    echo.
    echo Option 1: Download Git
    echo   1. Go to: https://git-scm.com/download/win
    echo   2. Download and install
    echo   3. Close and reopen this terminal
    echo   4. Run this script again
    echo.
    echo Option 2: Use GitHub Desktop (Easier)
    echo   1. Go to: https://desktop.github.com/
    echo   2. Download and install
    echo   3. Sign in with GitHub
    echo   4. Add this folder as a repository
    echo   5. Publish to GitHub
    echo.
    echo Press any key to open Git download page...
    pause >nul
    start https://git-scm.com/download/win
    exit /b 1
)

echo.
echo Git is installed! Version:
git --version
echo.

echo ========================================
echo   Pushing Code to GitHub
echo ========================================
echo.

echo Step 1: Initializing Git repository...
git init
if errorlevel 1 (
    echo ERROR: Failed to initialize git
    pause
    exit /b 1
)

echo.
echo Step 2: Adding all files...
git add .
if errorlevel 1 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)

echo.
echo Step 3: Committing files...
git commit -m "Initial commit - ready for deployment"
if errorlevel 1 (
    echo.
    echo Note: If you see "nothing to commit", that's okay!
    echo It means git is already initialized.
)

echo.
echo Step 4: Adding remote repository...
git remote add origin https://github.com/anushkayadav5403/foodbridge.git 2>nul
if errorlevel 1 (
    echo Remote already exists, updating...
    git remote set-url origin https://github.com/anushkayadav5403/foodbridge.git
)

echo.
echo Step 5: Pushing to GitHub...
echo.
echo IMPORTANT: You may be asked to authenticate!
echo - Username: anushkayadav5403
echo - Password: Use your GitHub password or Personal Access Token
echo.
echo If you don't have a token, create one at:
echo https://github.com/settings/tokens
echo.
pause

git push -u origin main
if errorlevel 1 (
    echo.
    echo Push failed! Trying with branch rename...
    git branch -M main
    git push -u origin main
    if errorlevel 1 (
        echo.
        echo ERROR: Push failed!
        echo.
        echo Common issues:
        echo 1. Authentication failed - You need a Personal Access Token
        echo    Go to: https://github.com/settings/tokens
        echo    Generate a token and use it as your password
        echo.
        echo 2. Repository doesn't exist
        echo    Make sure the repository exists at:
        echo    https://github.com/anushkayadav5403/foodbridge
        echo.
        echo 3. Use GitHub Desktop instead (easier)
        echo    Download: https://desktop.github.com/
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   Success! Code Pushed to GitHub
echo ========================================
echo.
echo Your code is now at:
echo https://github.com/anushkayadav5403/foodbridge
echo.
echo Next steps:
echo 1. Verify code is on GitHub (open the URL above)
echo 2. Continue with Render deployment
echo 3. See: ✅_COMPLETE_DEPLOYMENT_GUIDE.md
echo.
pause
