@echo off
echo ========================================
echo   Firebase Login and Deploy
echo ========================================
echo.

echo [Step 1/5] Logging in to Firebase...
echo.
echo A browser window will open. Please:
echo 1. Sign in with your Google account
echo 2. Click "Allow" to grant Firebase CLI access
echo 3. Return to this terminal
echo.
pause
firebase login

if errorlevel 1 (
    echo.
    echo ERROR: Firebase login failed!
    echo.
    echo Please try again or check your internet connection.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Login Successful!
echo ========================================
echo.

echo [Step 2/5] Create Firebase Project First...
echo.
echo IMPORTANT: Before continuing, you MUST create a Firebase project!
echo.
echo 1. Open your browser and go to: https://console.firebase.google.com/
echo 2. Sign in with your Google account
echo 3. Click "Add project" or "Create a project"
echo 4. Enter project name: foodbridge-app
echo 5. Click "Continue"
echo 6. Disable Google Analytics (toggle OFF)
echo 7. Click "Create project"
echo 8. Wait 30 seconds for project creation
echo 9. Click "Continue"
echo.
echo After creating the project, come back here and press any key...
pause

echo.
echo [Step 3/5] Initializing Firebase Hosting...
echo.
echo Please answer the prompts:
echo - Use an existing project: Yes
echo - Select project: foodbridge-app (the one you just created)
echo - Public directory: web/dist
echo - Single-page app: Yes
echo - GitHub deploys: No
echo - Overwrite index.html: No
echo.
pause
firebase init hosting

if errorlevel 1 (
    echo.
    echo ERROR: Firebase initialization failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Firebase Initialized!
echo ========================================
echo.

echo [Step 4/5] Building React app...
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
echo ========================================
echo   Build Complete!
echo ========================================
echo.

echo [Step 5/6] Deploying to Firebase Hosting...
firebase deploy --only hosting

if errorlevel 1 (
    echo.
    echo ERROR: Deployment failed!
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
echo [Step 6/6] Opening your deployed app...
firebase open hosting:site

echo.
echo ========================================
echo   All Done!
echo ========================================
echo.
echo Your FoodBridge app is now live 24/7!
echo.
echo Next steps:
echo 1. Deploy your backend to Railway/Render
echo 2. Update web/.env.production with backend URL
echo 3. Rebuild and redeploy frontend
echo.
pause
