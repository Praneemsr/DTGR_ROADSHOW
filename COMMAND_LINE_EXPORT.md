# Export CSV from Command Line

## 🚀 Quick Export

**Basic usage:**
```powershell
.\export-csv.ps1
```

This will:
- Connect to your backend
- Download all registrations as CSV
- Save to current directory
- Ask if you want to open the file

---

## 📋 Options

### Custom Backend URL
```powershell
.\export-csv.ps1 -BackendUrl "https://your-backend.vercel.app"
```

### Custom Output Directory
```powershell
.\export-csv.ps1 -OutputDir "C:\Downloads"
```

### Both Options
```powershell
.\export-csv.ps1 -BackendUrl "https://your-backend.vercel.app" -OutputDir "C:\Downloads"
```

---

## 🔧 Manual Method (PowerShell)

**Direct API call:**
```powershell
$response = Invoke-WebRequest -Uri "https://event-registration-backend-omega.vercel.app/api/export-csv"
$response.Content | Out-File -FilePath "registrations.csv" -Encoding UTF8
```

**Or using Invoke-RestMethod:**
```powershell
$response = Invoke-WebRequest -Uri "https://event-registration-backend-omega.vercel.app/api/export-csv"
$filename = "registrations_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').csv"
$response.Content | Out-File -FilePath $filename -Encoding UTF8
Write-Host "Saved to: $filename"
```

---

## 🔧 Manual Method (curl - if available)

```bash
curl -o registrations.csv "https://event-registration-backend-omega.vercel.app/api/export-csv"
```

---

## 📊 What's in the CSV

The exported CSV contains:
- ID
- First Name
- Last Name
- Email
- Phone Country
- Phone Number
- Full Phone
- Job Role
- Company
- Country
- Registered Date

---

## 💡 Tips

1. **Default filename**: `registrations_YYYY-MM-DDTHH-MM-SS.csv`
2. **File location**: Saved in current directory by default
3. **Encoding**: UTF-8 (supports international characters)
4. **Auto-open**: Script asks if you want to open the file

---

## 🐛 Troubleshooting

**Error: "Cannot connect to backend"**
- Check if backend is deployed: `https://event-registration-backend-omega.vercel.app/api/health`
- Verify backend URL is correct

**Error: "No registrations found"**
- Make sure you have registrations in the database
- Check: `https://event-registration-backend-omega.vercel.app/api/registrations`

**File not opening**
- Check file path
- Make sure you have permissions to write to the directory
- Try opening manually with Excel/Notepad

---

**Quick test:**
```powershell
.\export-csv.ps1
```

