@echo off
setlocal enabledelayedexpansion
title Night Treehole

echo.
echo ========================================
echo        Night Treehole
echo ========================================
echo.

echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [X] Node.js is not installed.
    echo.
    echo Please open this link and download the LTS version:
    echo https://nodejs.org
    echo.
    echo After installing, double-click this start.bat again.
    echo.
    pause
    exit
)

node --version
echo [OK] Node.js works

echo.
echo Checking project files...
if not exist "package.json" (
    echo [X] package.json not found. Make sure start.bat is in the project folder.
    pause
    exit
)
echo [OK] Project found

if not exist "node_modules" (
    echo.
    echo [!] Installing dependencies. This may take a few minutes...
    npm install
    if errorlevel 1 (
        echo.
        echo [X] Install failed.
        echo Make sure you are connected to the internet.
        pause
        exit
    )
    echo [OK] Done
)

if not exist ".env.local" (
    echo.
    echo [!] No API key found.
    echo.
    echo Paste your DeepSeek API Key below (starts with sk-):
    echo.
    set /p key="> "
    echo DEEPSEEK_API_KEY=!key!> .env.local
    echo [OK] Saved
)

echo.
echo ========================================
echo Starting... Open http://localhost:3000
echo Press Ctrl+C to stop anytime
echo ========================================
echo.

start http://localhost:3000
npm run dev

pause
