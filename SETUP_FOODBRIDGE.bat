@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================
echo   FoodBridge - Automated Setup
echo ============================================
echo.

REM Check if Node.js is installed
echo [1/8] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ Node.js is NOT installed!
    echo.
    echo Please install Node.js first:
    echo 1. Visit: https://nodejs.org/
    echo 2. Download LTS version
    echo 3. Run installer
    echo 4. Restart this script
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js is installed
node --version

REM Check if PostgreSQL is installed
echo.
echo [2/8] Checking PostgreSQL installation...
psql --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ⚠️  PostgreSQL command not found in PATH
    echo.
    echo If PostgreSQL is installed, add it to PATH:
    echo C:\Program Files\PostgreSQL\15\bin
    echo.
    echo Or install PostgreSQL:
    echo Visit: https://www.postgresql.org/download/
    echo.
    echo Continue anyway? (Y/N)
    set /p continue=
    if /i not "!continue!"=="Y" exit /b 1
) else (
    echo ✅ PostgreSQL is installed
    psql --version
)

REM Install backend dependencies
echo.
echo [3/8] Installing backend dependencies...
cd backend
if not exist node_modules (
    echo Installing packages... This may take a few minutes...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend dependencies already installed
)
cd ..

REM Install frontend dependencies
echo.
echo [4/8] Installing frontend dependencies...
cd web
if not exist node_modules (
    echo Installing packages... This may take a few minutes...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo ✅ Frontend dependencies installed
) else (
    echo ✅ Frontend dependencies already installed
)
cd ..

REM Check environment files
echo.
echo [5/8] Checking environment configuration...
if not exist backend\.env (
    echo ⚠️  backend\.env not found, using defaults
) else (
    echo ✅ Backend environment configured
)

if not exist web\.env (
    echo ⚠️  web\.env not found, using defaults
) else (
    echo ✅ Frontend environment configured
)

REM Setup database (optional)
echo.
echo [6/8] Database setup...
echo.
echo Do you want to setup the database now? (Y/N)
echo (Requires PostgreSQL password)
set /p setupdb=
if /i "!setupdb!"=="Y" (
    echo.
    echo Enter PostgreSQL password:
    set /p pgpass=
    
    echo Creating database...
    set PGPASSWORD=!pgpass!
    createdb -U postgres foodbridge 2>nul
    
    echo Running migrations...
    psql -U postgres -d foodbridge -f backend\migrations\001_initial_schema.sql >nul 2>&1
    
    if errorlevel 1 (
        echo ⚠️  Database setup had issues (may already exist)
    ) else (
        echo ✅ Database setup complete
    )
) else (
    echo ⏭️  Skipping database setup
    echo You can run it later with: psql -U postgres -d foodbridge -f backend\migrations\001_initial_schema.sql
)

echo.
echo [7/8] Setup complete!
echo.
echo ============================================
echo   Ready to Launch FoodBridge!
echo ============================================
echo.
echo To start the application:
echo.
echo Option 1: Automatic (Recommended)
echo   Run: START_FOODBRIDGE.bat
echo.
echo Option 2: Manual
echo   Terminal 1: cd backend ^&^& npm run dev
echo   Terminal 2: cd web ^&^& npm run dev
echo.
echo [8/8] Would you like to start FoodBridge now? (Y/N)
set /p startnow=
if /i "!startnow!"=="Y" (
    echo.
    echo Starting FoodBridge...
    call START_FOODBRIDGE.bat
) else (
    echo.
    echo Setup complete! Run START_FOODBRIDGE.bat when ready.
)

echo.
pause
