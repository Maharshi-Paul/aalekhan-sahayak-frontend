@echo off
cd /d "%~dp0"
title Aalekhan Sahayak setup

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js not found. Trying to install Node.js LTS...
  winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
  if errorlevel 1 (
    echo.
    echo Automatic install failed. Install Node.js LTS manually from https://nodejs.org
    echo then double-click setup.bat again.
    pause
    exit /b 1
  )
  echo.
  echo Node.js installed. CLOSE this window and double-click setup.bat again.
  pause
  exit /b 0
)

if not exist .env (
  copy .env.example .env >nul
  powershell -NoProfile -Command "(Get-Content .env) -replace 'VITE_USE_MOCK=false','VITE_USE_MOCK=true' | Set-Content .env"
  echo Created .env in demo mode.
)

call npm install
if errorlevel 1 (
  echo.
  echo npm install failed. Check your internet connection and try again.
  pause
  exit /b 1
)

call npm run dev -- --open
pause
