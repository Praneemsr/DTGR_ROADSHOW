@echo off
echo ========================================
echo Database Verification Tool
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo OR use Docker: START_DOCKER.bat
    echo.
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies first...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Run database check
call npm run check-db

pause

