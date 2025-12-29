# Quick Registration Test Script
$body = @{
    me_firstname = "Your"
    me_lastname = "Name"
    me_email = "your@email.com"
    me_phonenumber = "+1 555-1234"
    me_companyname = "Your Company"
    me_country = "US"
    jobRole = "Your Role"
} | ConvertTo-Json

Write-Host "Registering..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "https://event-registration-backend-omega.vercel.app/api/register" -Method POST -Body $body -ContentType "application/json"

