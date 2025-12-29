# Simple CSV Export (with timeout and progress)
$backendUrl = "https://event-registration-backend-omega.vercel.app"

Write-Host "Exporting CSV..." -ForegroundColor Yellow
Write-Host "Backend: $backendUrl" -ForegroundColor Gray
Write-Host ""

try {
    # Set timeout to 30 seconds
    $ProgressPreference = 'SilentlyContinue'
    
    Write-Host "Downloading..." -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri "$backendUrl/api/export-csv" -TimeoutSec 30 -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
        # Get filename
        $contentDisposition = $response.Headers['Content-Disposition']
        $filename = "registrations.csv"
        
        if ($contentDisposition -and $contentDisposition -match 'filename="([^"]+)"') {
            $filename = $matches[1]
        } else {
            $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
            $filename = "registrations_$timestamp.csv"
        }
        
        # Save file
        [System.IO.File]::WriteAllText($filename, $response.Content, [System.Text.Encoding]::UTF8)
        
        Write-Host "[OK] CSV exported!" -ForegroundColor Green
        Write-Host "File: $filename" -ForegroundColor Cyan
        Write-Host "Size: $([math]::Round($response.Content.Length / 1KB, 2)) KB" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Location: $(Get-Location)\$filename" -ForegroundColor White
    }
} catch {
    Write-Host "[FAIL] Error occurred" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Cyan
    Write-Host "1. Check if backend is running: $backendUrl/api/health" -ForegroundColor White
    Write-Host "2. Check if there are registrations: $backendUrl/api/registrations" -ForegroundColor White
    Write-Host "3. Try again in a few seconds (first request may be slow)" -ForegroundColor White
}

