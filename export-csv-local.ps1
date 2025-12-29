# Export CSV by fetching registrations and generating CSV locally
$backendUrl = "https://event-registration-backend-omega.vercel.app"

Write-Host "Exporting CSV (local generation)..." -ForegroundColor Yellow
Write-Host "Backend: $backendUrl" -ForegroundColor Gray
Write-Host ""

# First, check if backend is alive
Write-Host "Checking backend status..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$backendUrl/api/health" -TimeoutSec 15 -ErrorAction Stop
    Write-Host "[OK] Backend is responding (Database: $($health.database))" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[WARN] Backend may be cold starting, will retry..." -ForegroundColor Yellow
    Write-Host "Waiting 10 seconds for backend to initialize..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
}

# Retry logic for fetching registrations
$maxRetries = 3
$retryCount = 0
$success = $false

while ($retryCount -lt $maxRetries -and -not $success) {
    $retryCount++
    Write-Host "Fetching registrations (Attempt $retryCount/$maxRetries)..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri "$backendUrl/api/registrations" -TimeoutSec 60 -ErrorAction Stop
        $success = $true
    
    if ($response.success -and $response.data) {
        $registrations = $response.data
        
        if ($registrations.Count -eq 0) {
            Write-Host "[INFO] No registrations found to export" -ForegroundColor Yellow
            exit
        }
        
        Write-Host "Found $($registrations.Count) registration(s)" -ForegroundColor Green
        Write-Host "Generating CSV..." -ForegroundColor Cyan
        
        # CSV Headers
        $csvRows = @()
        $csvRows += "ID,First Name,Last Name,Email,Phone Country,Phone Number,Full Phone,Job Role,Company,Country,Registered Date"
        
        # Add data rows
        foreach ($reg in $registrations) {
            $row = @(
                $reg.id,
                "`"$($reg.first_name -replace '"', '""')`"",
                "`"$($reg.last_name -replace '"', '""')`"",
                "`"$($reg.email -replace '"', '""')`"",
                "`"$($reg.phone_country -replace '"', '""')`"",
                "`"$($reg.phone_number -replace '"', '""')`"",
                "`"$($reg.full_phone -replace '"', '""')`"",
                "`"$($reg.job_role -replace '"', '""')`"",
                "`"$($reg.company -replace '"', '""')`"",
                "`"$($reg.country -replace '"', '""')`"",
                "`"$($reg.created_at -replace '"', '""')`""
            )
            $csvRows += $row -join ','
        }
        
        # Save to file
        $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
        $filename = "registrations_$timestamp.csv"
        $csvContent = $csvRows -join "`n"
        
        [System.IO.File]::WriteAllText($filename, $csvContent, [System.Text.Encoding]::UTF8)
        
        Write-Host "[OK] CSV exported!" -ForegroundColor Green
        Write-Host "File: $filename" -ForegroundColor Cyan
        Write-Host "Size: $([math]::Round($csvContent.Length / 1KB, 2)) KB" -ForegroundColor Gray
        Write-Host "Rows: $($registrations.Count)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Location: $(Get-Location)\$filename" -ForegroundColor White
        
        # Ask to open
        $open = Read-Host "`nOpen file? (Y/N)"
        if ($open -eq 'Y' -or $open -eq 'y') {
            Start-Process $filename
        }
    } else {
        Write-Host "[FAIL] No data received" -ForegroundColor Red
    }
    } catch {
        if ($retryCount -lt $maxRetries) {
            $waitTime = [math]::Min(10 * $retryCount, 30)
            Write-Host "[RETRY] Request failed, waiting $waitTime seconds..." -ForegroundColor Yellow
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
            Start-Sleep -Seconds $waitTime
        } else {
            Write-Host "[FAIL] All retry attempts failed" -ForegroundColor Red
            Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Yellow
            
            if ($_.Exception.Response) {
                Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
            }
            
            Write-Host ""
            Write-Host "Troubleshooting:" -ForegroundColor Cyan
            Write-Host "1. Backend may be cold starting (first request takes 30-60 seconds)" -ForegroundColor White
            Write-Host "2. Try again in a minute: .\export-csv-local.ps1" -ForegroundColor White
            Write-Host "3. Or use admin dashboard: https://praneemsr.github.io/DTGR_ROADSHOW/admin.html" -ForegroundColor White
            Write-Host "4. Check backend: $backendUrl/api/health" -ForegroundColor White
        }
    }
}

