# Export CSV from Command Line
param(
    [string]$BackendUrl = "https://event-registration-backend-omega.vercel.app",
    [string]$OutputDir = "."
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CSV Export Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "Connecting to backend..." -ForegroundColor Yellow
    Write-Host "URL: $BackendUrl/api/export-csv" -ForegroundColor Gray
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/export-csv" -Method GET -TimeoutSec 30
    
    if ($response.StatusCode -eq 200) {
        # Get filename from Content-Disposition header
        $contentDisposition = $response.Headers['Content-Disposition']
        $filename = "registrations.csv"
        
        if ($contentDisposition) {
            if ($contentDisposition -match 'filename="([^"]+)"') {
                $filename = $matches[1]
            }
        }
        
        # Save file
        $filePath = Join-Path $OutputDir $filename
        $response.Content | Out-File -FilePath $filePath -Encoding UTF8
        
        Write-Host "[OK] CSV exported successfully!" -ForegroundColor Green
        Write-Host "File: $filePath" -ForegroundColor Cyan
        Write-Host "Size: $([math]::Round($response.Content.Length / 1KB, 2)) KB" -ForegroundColor Gray
        
        # Try to open the file
        $openFile = Read-Host "`nOpen file? (Y/N)"
        if ($openFile -eq 'Y' -or $openFile -eq 'y') {
            Start-Process $filePath
        }
    } else {
        Write-Host "[FAIL] Error: HTTP $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($errorResponse) {
        Write-Host "[FAIL] Error: $($errorResponse.message)" -ForegroundColor Red
    } else {
        Write-Host "[FAIL] Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

