@echo off
echo.
echo ===================================
echo Fix: Push mit HTTPS
echo ===================================
echo.

cd /d "%~dp0"

echo Remote entfernen...
git remote remove origin 2>nul

echo.
echo Remote mit HTTPS hinzufuegen...
git remote add origin https://github.com/Peik1879/oberlin-portal.git

echo.
echo Push mit HTTPS...
git push -u origin main --force

echo.
echo ===================================
echo Fertig!
echo ===================================
pause
