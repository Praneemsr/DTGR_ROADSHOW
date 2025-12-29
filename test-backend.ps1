# Test Backend Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Vercel Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "https://event-registration-backend-omega.vercel.app"

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$backendUrl/api/health" -Method GET
    Write-Host "   [OK] Health: $($health.status)" -ForegroundColor Green
    Write-Host "   Database: $($health.database)" -ForegroundColor $(if ($health.database -eq 'ready') { 'Green' } else { 'Yellow' })
} catch {
    Write-Host "   [FAIL] Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Wait a moment for initialization
Write-Host "Waiting 3 seconds for database initialization..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host ""

# Test 2: Register
Write-Host "2. Testing Registration..." -ForegroundColor Yellow
$randomEmail = "test$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"
$body = @{
    me_firstname = "Test"
    me_lastname = "User"
    me_email = $randomEmail
    me_phonenumber = "+1 555-1234"
    me_companyname = "Test Company"
    me_country = "US"
    jobRole = "Developer"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$backendUrl/api/register" -Method POST -Body $body -ContentType "application/json"
    if ($result.success) {
        Write-Host "   [OK] Registration successful!" -ForegroundColor Green
        Write-Host "   ID: $($result.id)" -ForegroundColor Cyan
    } else {
        Write-Host "   [FAIL] Registration failed: $($result.message)" -ForegroundColor Red
    }
} catch {
    try {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   [FAIL] Error: $($errorResponse.message)" -ForegroundColor Red
    } catch {
        Write-Host "   [FAIL] Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 3: Get Registrations
Write-Host "3. Testing Get Registrations..." -ForegroundColor Yellow
try {
    $registrations = Invoke-RestMethod -Uri "$backendUrl/api/registrations" -Method GET
    if ($registrations.success) {
        Write-Host "   [OK] Found $($registrations.count) registration(s)" -ForegroundColor Green
        if ($registrations.count -gt 0) {
            $latest = $registrations.data[0]
            Write-Host "   Latest: $($latest.first_name) $($latest.last_name) - $($latest.email)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "   [FAIL] Failed: $($registrations.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   [FAIL] Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
