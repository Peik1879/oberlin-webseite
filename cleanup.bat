@echo off
echo.
echo ===================================
echo Aufraeum-Script
echo ===================================
echo.

cd /d "%~dp0"

echo Loesche Test-Dateien...

del /Q start.bat 2>nul
del /Q einfach-start.bat 2>nul
del /Q direkt-start.bat 2>nul
del /Q komplett-start.bat 2>nul
del /Q nach-sql-start.bat 2>nul
del /Q test-node.bat 2>nul
del /Q test-npm.bat 2>nul
del /Q test-db.bat 2>nul
del /Q setup-database.sql 2>nul
del /Q server\config\createDB.js 2>nul

echo.
echo Fertig! Nur noch server-start.bat ist da.
echo.
pause

del /Q cleanup.bat
