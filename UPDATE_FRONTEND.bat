@echo off
echo ========================================
echo   Update Frontend with Backend URL
echo ========================================
echo.

REM Ask for backend URL
echo Enter your Render backend URL (from Render dashboard):
echo Example: https://foodbridge-backend.onrender.com
echo.
set /p BACKEND_URL="Backend URL: "

if "%BACKEND_URL%"=="" (
    echo [ERROR] Backend URL is required!
    pause
    exit /b 1
)

REM Remove trailing slash if present
if "%BACKEND_URL:~-1%"=="/" set BACKEND_URL=%BACKEND_URL:~0,-1%

echo.
echo [INFO] Backend URL: %BACKEND_URL%
echo.

REM Update .env.production
echo Updating web/.env.production...
(
echo # Production Environment Variables for Firebase Hosting
echo.
echo # Backend API URL
echo VITE_API_URL=%BACKEND_URL%/api/v1
echo.
echo # Google Maps API Key ^(optional^)
echo VITE_GOOGLE_MAPS_API_KEY=
) > web\.env.production

echo [OK] Environment file updated
echo.

REM Build frontend
echo Building frontend...
cd web
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Frontend built successfully
echo.

REM Deploy to Firebase
echo Deploying to Firebase...
call firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo [ERROR] Deployment failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS!
echo ========================================
echo.
echo Your app is now fully live!
echo.
echo Frontend: https://foodbridge-app-51332.web.app
echo Backend: %BACKEND_URL%
echo.
echo Test your app:
echo 1. Go to: https://foodbridge-app-51332.web.app
echo 2. Try logging in with any phone number
echo 3. OTP: 123456
echo 4. Create a test listing
echo.
echo Your app is now connected to the deployed backend!
echo.
pause
