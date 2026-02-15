@echo off
echo.
echo ===================================
echo Oberlinhaus Portal - Server Start
echo ===================================
echo.

cd /d "%~dp0"

echo Server startet...
echo.
echo Browser oeffnen: http://localhost:3000
echo.
echo Login:
echo   PIN: 0000
echo   Email: admin@oberlin.de
echo   Passwort: 0000
echo.
echo [Zum Stoppen: Strg+C oder Fenster schliessen]
echo.
echo ===================================
echo.

node server/app.js

pause
