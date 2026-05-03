@echo off
echo ========================================
echo   FoodBridge - Quick Deploy Menu
echo ========================================
echo.
echo What do you want to deploy?
echo.
echo 1. Frontend only (Firebase Hosting)
echo 2. Backend only (Push to GitHub)
echo 3. Both Frontend and Backend
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto deploy_frontend
if "%choice%"=="2" goto deploy_backend
if "%choice%"=="3" goto deploy_both
if "%choice%"=="4" goto end
echo Invalid choice!
pause
exit /b 1

:deploy_frontend
echo.
echo ========================================
echo   Deploying Frontend to Firebase
echo ========================================
echo.
echo [1/2] Building React app...
cd web
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo.
echo [2/2] Deploying to Firebase...
call firebase deploy --only hosting
if errorlevel 1 (
    echo.
    echo ERROR: Deployment failed!
    pause
    exit /b 1
)
echo.
echo ========================================
echo   Frontend Deployed Successfully!
echo ========================================
echo.
echo Your app is live at:
echo https://foodbridge-app.web.app
echo.
pause
goto end

:deploy_backend
echo.
echo ========================================
echo   Deploying Backend to GitHub
echo ========================================
echo.
set /p commit_msg="Enter commit message: "
echo.
echo [1/3] Adding files...
git add .
echo.
echo [2/3] Committing changes...
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo.
    echo No changes to commit or commit failed.
    pause
    exit /b 1
)
echo.
echo [3/3] Pushing to GitHub...
git push
if errorlevel 1 (
    echo.
    echo ERROR: Push failed!
    pause
    exit /b 1
)
echo.
echo ========================================
echo   Backend Pushed to GitHub!
echo ========================================
echo.
echo Railway/Render will auto-deploy in 2-3 minutes.
echo.
pause
goto end

:deploy_both
echo.
echo ========================================
echo   Deploying Both Frontend and Backend
echo ========================================
echo.
set /p commit_msg="Enter commit message: "
echo.
echo [1/5] Adding files to git...
git add .
echo.
echo [2/5] Committing changes...
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo.
    echo Warning: No changes to commit or commit failed.
    echo Continuing with frontend deployment...
) else (
    echo.
    echo [3/5] Pushing to GitHub...
    git push
    if errorlevel 1 (
        echo.
        echo ERROR: Push failed!
        pause
        exit /b 1
    )
)
echo.
echo [4/5] Building React app...
cd web
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo.
echo [5/5] Deploying frontend to Firebase...
call firebase deploy --only hosting
if errorlevel 1 (
    echo.
    echo ERROR: Firebase deployment failed!
    pause
    exit /b 1
)
echo.
echo ========================================
echo   Both Deployed Successfully!
echo ========================================
echo.
echo Backend: Pushed to GitHub (auto-deploying)
echo Frontend: Live at https://foodbridge-app.web.app
echo.
echo Railway/Render will auto-deploy backend in 2-3 minutes.
echo.
pause
goto end

:end
exit /b 0
