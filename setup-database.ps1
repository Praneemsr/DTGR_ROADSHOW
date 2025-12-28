# Database Setup Script for Microsoft Event Registration
# This script helps set up the database and dependencies

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Microsoft Event Registration Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking for Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is NOT installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Install the LTS version" -ForegroundColor White
    Write-Host "3. Restart PowerShell and run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to open Node.js download page..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Start-Process "https://nodejs.org/"
    exit
}

# Check if npm is available
Write-Host "Checking for npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    Write-Host "✓ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is NOT available!" -ForegroundColor Red
    exit
}

Write-Host ""

# Create database directory
Write-Host "Creating database directory..." -ForegroundColor Yellow
$dbDir = Join-Path $PSScriptRoot "database"
if (-not (Test-Path $dbDir)) {
    New-Item -ItemType Directory -Path $dbDir | Out-Null
    Write-Host "✓ Database directory created" -ForegroundColor Green
} else {
    Write-Host "✓ Database directory already exists" -ForegroundColor Green
}

Write-Host ""

# Install dependencies
Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit
}

Write-Host ""

# Initialize database
Write-Host "Initializing database..." -ForegroundColor Yellow
npm run init-db
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database initialized successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to initialize database" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the server: npm start" -ForegroundColor White
Write-Host "2. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "3. To export CSV: npm run export-csv" -ForegroundColor White
Write-Host ""

