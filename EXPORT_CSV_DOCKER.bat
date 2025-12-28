@echo off
echo ========================================
echo Exporting Registrations to CSV (Docker)
echo ========================================
echo.

REM Check if Docker is installed
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not installed!
    pause
    exit /b 1
)

REM Check if container is running
docker ps | findstr "microsoft-event-registration" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Server container is not running!
    echo.
    echo Please start the server first using START_DOCKER.bat
    pause
    exit /b 1
)

REM Run export script
echo Exporting registrations...
call docker-compose exec event-server npm run export-csv

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

