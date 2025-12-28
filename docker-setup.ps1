# Docker Setup Script for Microsoft Event Registration
# This script helps set up and run the project using Docker

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Microsoft Event Registration - Docker Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking for Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is NOT installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Docker Desktop first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
    Write-Host "2. Install Docker Desktop for Windows" -ForegroundColor White
    Write-Host "3. Start Docker Desktop" -ForegroundColor White
    Write-Host "4. Restart PowerShell and run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to open Docker download page..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Start-Process "https://www.docker.com/products/docker-desktop/"
    exit
}

# Check if Docker is running
Write-Host "Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker ps 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker is not running"
    }
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit
}

Write-Host ""

# Create database directory if it doesn't exist
Write-Host "Creating database directory..." -ForegroundColor Yellow
$dbDir = Join-Path $PSScriptRoot "database"
if (-not (Test-Path $dbDir)) {
    New-Item -ItemType Directory -Path $dbDir | Out-Null
    Write-Host "✓ Database directory created" -ForegroundColor Green
} else {
    Write-Host "✓ Database directory already exists" -ForegroundColor Green
}

Write-Host ""

# Build and start containers
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker-compose build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Docker image built successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to build Docker image" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Starting server..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Server started successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to start server" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server is running at: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  View logs:        docker-compose logs -f" -ForegroundColor White
Write-Host "  Stop server:      docker-compose down" -ForegroundColor White
Write-Host "  Restart server:   docker-compose restart" -ForegroundColor White
Write-Host "  Export CSV:       docker-compose exec event-server npm run export-csv" -ForegroundColor White
Write-Host ""

