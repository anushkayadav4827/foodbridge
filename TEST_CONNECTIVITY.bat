@echo off
echo.
echo ========================================
echo   FOODBRIDGE CONNECTIVITY TEST
echo ========================================
echo.
echo Opening connectivity test page...
echo.
echo This will test:
echo   1. Backend health check
echo   2. OTP sending
echo   3. OTP verification and login
echo   4. Listing creation
echo.
echo Make sure both servers are running:
echo   - Backend: http://localhost:3005
echo   - Frontend: http://localhost:3001
echo.
echo ========================================
echo.

start http://localhost:3001/connectivity-test.html

echo.
echo Test page opened in your browser!
echo.
echo Click "Run Complete Flow" to test everything.
echo.
pause
