@echo off
echo ========================================
echo FoodBridge PostgreSQL Setup (Docker)
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Check if container already exists
docker ps -a | findstr foodbridge-postgres >nul 2>&1
if errorlevel 1 (
    echo [INFO] Creating new PostgreSQL container...
    docker run --name foodbridge-postgres ^
      -e POSTGRES_DB=foodbridge ^
      -e POSTGRES_USER=postgres ^
      -e POSTGRES_PASSWORD=password ^
      -p 5432:5432 ^
      -v foodbridge-data:/var/lib/postgresql/data ^
      -d postgis/postgis:15-3.3
    
    if errorlevel 1 (
        echo [ERROR] Failed to create container
        pause
        exit /b 1
    )
    
    echo [OK] Container created successfully
    echo [INFO] Waiting for PostgreSQL to initialize (15 seconds)...
    timeout /t 15 /nobreak >nul
) else (
    echo [INFO] Container exists, starting...
    docker start foodbridge-postgres
    
    if errorlevel 1 (
        echo [ERROR] Failed to start container
        pause
        exit /b 1
    )
    
    echo [OK] Container started
    echo [INFO] Waiting for PostgreSQL to be ready (5 seconds)...
    timeout /t 5 /nobreak >nul
)

echo.
echo ========================================
echo PostgreSQL is running!
echo ========================================
echo.
echo Connection Details:
echo   Host: localhost
echo   Port: 5432
echo   Database: foodbridge
echo   User: postgres
echo   Password: password
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Apply migrations:
echo    cd backend
echo    node test-migration.js
echo.
echo 2. Start backend server:
echo    npm run dev
echo.
echo 3. To stop PostgreSQL:
echo    docker stop foodbridge-postgres
echo.
echo 4. To view logs:
echo    docker logs foodbridge-postgres
echo.
echo 5. To access PostgreSQL shell:
echo    docker exec -it foodbridge-postgres psql -U postgres -d foodbridge
echo.
pause
