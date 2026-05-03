@echo off
echo.
echo ========================================
echo   FoodBridge Demo Website Launcher
echo ========================================
echo.
echo Opening the demo website...
echo.

REM Open the main demo page
start demo\index.html

echo.
echo The demo website should now be open in your browser!
echo.
echo If it didn't open automatically, you can manually open:
echo %CD%\demo\index.html
echo.
echo Available demo pages:
echo - demo\index.html (Main demo page)
echo - demo\api-test.html (API testing page)
echo - demo\server-test.html (Server status page)
echo.
pause
