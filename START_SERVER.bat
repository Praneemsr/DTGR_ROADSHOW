@echo off
echo ========================================
echo Microsoft Event Registration Server
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Install the LTS version, then restart and try again.
    echo.
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Initialize database if it doesn't exist
if not exist "database\registrations.db" (
    echo Initializing database...
    call npm run init-db
)

REM Start the server
echo.
echo Starting server on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
call npm start

