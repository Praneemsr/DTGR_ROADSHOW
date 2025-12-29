# View All Database Tables
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database Tables" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "https://event-registration-backend-omega.vercel.app"

try {
    $tables = Invoke-RestMethod -Uri "$backendUrl/api/tables"
    
    if ($tables.success) {
        Write-Host "Found $($tables.count) table(s):" -ForegroundColor Green
        Write-Host ""
        
        $tables.tables | ForEach-Object {
            Write-Host "Table: $($_.name)" -ForegroundColor Cyan
            Write-Host "   Rows: $($_.rowCount)" -ForegroundColor Yellow
            
            if ($_.columns) {
                Write-Host "   Columns:" -ForegroundColor Green
                $_.columns | ForEach-Object {
                    $constraints = @()
                    if ($_.primaryKey) { $constraints += "PK" }
                    if ($_.notNull) { $constraints += "NOT NULL" }
                    $constraintStr = if ($constraints.Count -gt 0) { " [$($constraints -join ', ')]" } else { "" }
                    Write-Host "     - $($_.name) ($($_.type))$constraintStr" -ForegroundColor White
                }
            }
            Write-Host ""
        }
    } else {
        Write-Host "Error: $($tables.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error connecting to backend: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure the backend is deployed and running." -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
