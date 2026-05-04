@echo off
echo ========================================
echo UPDATE FRONTEND WITH RENDER BACKEND URL
echo ========================================
echo.

set /p BACKEND_URL="Enter your Render backend URL (e.g., https://foodbridge-backend.onrender.com): "

echo.
echo Updating web/.env.production...
echo VITE_API_URL=%BACKEND_URL%/api/v1 > web\.env.production
echo VITE_GOOGLE_MAPS_API_KEY= >> web\.env.production

echo.
echo Building frontend...
cd web
call npm run build

echo.
echo Deploying to Firebase...
cd ..
call firebase deploy --only hosting

echo.
echo ========================================
echo DONE! Your app is live at:
echo https://foodbridge-app-51332.web.app
echo ========================================
pause
