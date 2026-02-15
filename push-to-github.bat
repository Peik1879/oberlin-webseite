@echo off
echo.
echo ===================================
echo Git Push zu GitHub
echo ===================================
echo.

cd /d "%~dp0"

echo [1/5] Git initialisieren...
git init
if errorlevel 1 (
    echo.
    echo Git ist nicht installiert!
    echo Download: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo.
echo [2/5] Alle Dateien hinzufuegen...
git add .

echo.
echo [3/5] Commit erstellen...
git commit -m "Initial commit - Oberlinhaus Portal"

echo.
echo [4/5] GitHub URL eingeben...
echo.
set /p GITHUB_URL="GitHub Repository URL eingeben (https://github.com/...): "

git remote add origin %GITHUB_URL%

echo.
echo [5/5] Push zu GitHub...
git branch -M main
git push -u origin main

echo.
echo ===================================
echo Fertig! Code ist auf GitHub!
echo ===================================
pause
