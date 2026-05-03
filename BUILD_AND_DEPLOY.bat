@echo off
echo ========================================
echo   FoodBridge - Build and Deploy
echo ========================================
echo.

echo [1/3] Building React app...
cd web
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    echo Please fix the errors above and try again.
    pause
    exit /b 1
)
cd ..

echo.
echo [2/3] Build complete!
echo.

echo [3/3] Deploying to Firebase Hosting...
call firebase deploy --only hosting
if errorlevel 1 (
    echo.
    echo ERROR: Deployment failed!
    echo.
    echo Common issues:
    echo - Firebase CLI not installed: npm install -g firebase-tools
    echo - Not logged in: firebase login
    echo - Project not initialized: firebase init hosting
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your app is now live at:
echo https://foodbridge-app.web.app
echo.
echo To update your app in the future, just run this script again!
echo.
pause
