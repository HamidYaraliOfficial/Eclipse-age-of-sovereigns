@echo off
setlocal
cd /d "%~dp0"
echo ==============================================
echo   ECLIPSE: AGE OF SOVEREIGNS
 echo   Created by Hamid Yareli
 echo ==============================================
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 20.19+ or 22 LTS first.
  echo https://nodejs.org/
  pause
  exit /b 1
)
if not exist "node_modules\vite\bin\vite.js" (
  echo Installing game dependencies. Internet access is required the first time...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)
call npm run dev -- --open
pause
