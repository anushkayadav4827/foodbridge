@echo off
echo.
echo ============================================
echo   Completing FoodBridge Setup
echo ============================================
echo.

REM Refresh PATH
set PATH=%PATH%;C:\Program Files\nodejs

echo [1/4] Checking backend installation...
cd backend
if exist "node_modules" (
    echo ✅ Backend dependencies installed
) else (
    echo Installing backend dependencies...
    call npm install
)
cd ..

echo.
echo [2/4] Installing frontend dependencies...
cd web
if exist "node_modules" (
    echo ✅ Frontend dependencies already installed
) else (
    echo Installing packages... This may take a few minutes...
    call npm install
)
cd ..

echo.
echo [3/4] Setup complete!
echo.
echo ============================================
echo   FoodBridge is Ready!
echo ============================================
echo.
echo [4/4] Would you like to start FoodBridge now? (Y/N)
set /p startnow=
if /i "!startnow!"=="Y" (
    call START_FOODBRIDGE.bat
) else (
    echo.
    echo To start later, run: START_FOODBRIDGE.bat
    echo.
)

pause
