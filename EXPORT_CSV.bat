@echo off
echo ========================================
echo Exporting Registrations to CSV
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if database exists
if not exist "database\registrations.db" (
    echo ERROR: Database not found!
    echo.
    echo Please run the server first (START_SERVER.bat) to create the database.
    pause
    exit /b 1
)

REM Run export script
call npm run export-csv

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Export completed successfully!
    echo Check the project folder for the CSV file.
) else (
    echo.
    echo ERROR: Export failed!
)

echo.
pause

