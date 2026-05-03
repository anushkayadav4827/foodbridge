@echo off
echo.
echo ============================================
echo   Download Node.js Automatically
echo ============================================
echo.
echo This will download Node.js installer for you.
echo.

REM Create downloads folder if it doesn't exist
if not exist "downloads" mkdir downloads

echo Downloading Node.js v20.11.0 (64-bit)...
echo.
echo Please wait, this may take a few minutes...
echo.

REM Download using PowerShell
powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile 'downloads\node-v20.11.0-x64.msi'}"

if exist "downloads\node-v20.11.0-x64.msi" (
    echo.
    echo ============================================
    echo   Download Complete!
    echo ============================================
    echo.
    echo Node.js installer saved to:
    echo downloads\node-v20.11.0-x64.msi
    echo.
    echo.
    echo ============================================
    echo   NEXT STEPS:
    echo ============================================
    echo.
    echo 1. Go to the 'downloads' folder
    echo 2. Double-click: node-v20.11.0-x64.msi
    echo 3. Click: Next → Next → Install → Finish
    echo 4. Close ALL terminals
    echo 5. Open NEW terminal
    echo 6. Run: SETUP_FOODBRIDGE.bat
    echo.
    echo.
    echo Would you like to run the installer now? (Y/N)
    set /p runinstaller=
    
    if /i "!runinstaller!"=="Y" (
        echo.
        echo Opening Node.js installer...
        start downloads\node-v20.11.0-x64.msi
        echo.
        echo After installation completes:
        echo 1. Close this window
        echo 2. Open NEW terminal
        echo 3. Run: SETUP_FOODBRIDGE.bat
        echo.
    ) else (
        echo.
        echo Installer is ready in downloads folder.
        echo Run it when you're ready!
        echo.
    )
) else (
    echo.
    echo ❌ Download failed!
    echo.
    echo Please download manually from:
    echo https://nodejs.org/
    echo.
)

pause
