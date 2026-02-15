@echo off
echo.
echo ===================================
echo Ueberschreibe GitHub Repo
echo ===================================
echo.

cd /d "%~dp0"

echo [1/6] Git initialisieren...
git init
if errorlevel 1 (
    echo.
    echo Git ist nicht installiert!
    echo Download: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo.
echo [2/6] Alle Dateien hinzufuegen...
git add .

echo.
echo [3/6] Commit erstellen...
git commit -m "Oberlinhaus Portal - Komplett neu"

echo.
echo [4/6] Remote hinzufuegen...
set GITHUB_URL=https://github.com/DEIN-USERNAME/oberlin-portal.git
echo.
echo Aktuelle URL: %GITHUB_URL%
echo.
set /p GITHUB_URL="GitHub URL bestaetigen oder aendern: "

git remote add origin %GITHUB_URL%

echo.
echo [5/6] Branch umbenennen...
git branch -M main

echo.
echo [6/6] FORCE PUSH - Ueberschreibt alles!
echo.
echo WARNUNG: Alle alten Dateien werden geloescht!
pause

git push -u origin main --force

echo.
echo ===================================
echo Fertig! Repo wurde ueberschrieben!
echo ===================================
pause
