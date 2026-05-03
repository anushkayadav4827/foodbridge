@echo off
echo ========================================
echo   Deploy FoodBridge to Firebase Hosting
echo ========================================
echo.

echo [1/3] Building React app...
cd web
call npm run build
if errorlevel 1 (
    echo.
    echo ❌ Build failed! Check errors above.
    pause
    exit /b 1
)

echo.
echo [2/3] Going back to root directory...
cd ..

echo.
echo [3/3] Deploying to Firebase...
call firebase deploy --only hosting

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your app should now be live at:
echo https://foodbridge-app.web.app
echo.
echo NOTE: If this is your first deployment, you need to:
echo 1. Install Firebase CLI: npm install -g firebase-tools
echo 2. Login: firebase login
echo 3. Initialize: firebase init hosting
echo.
pause
