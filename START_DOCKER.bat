@echo off
echo ========================================
echo Microsoft Event Registration - Docker
echo ========================================
echo.

REM Check if Docker is installed
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not installed!
    echo.
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

REM Check if Docker is running
docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not running!
    echo.
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

REM Create database directory if it doesn't exist
if not exist "database" (
    mkdir database
)

echo Building Docker image...
call docker-compose build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to build Docker image
    pause
    exit /b 1
)

echo.
echo Starting server...
call docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to start server
    pause
    exit /b 1
)

echo.
echo ========================================
echo Server is running!
echo ========================================
echo.
echo Open http://localhost:3000 in your browser
echo.
echo Useful commands:
echo   View logs:        docker-compose logs -f
echo   Stop server:    docker-compose down
echo   Export CSV:       docker-compose exec event-server npm run export-csv
echo.
pause

