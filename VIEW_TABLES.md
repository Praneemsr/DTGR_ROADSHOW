# How to View All Database Tables

## 🚀 Quick Methods

### Method 1: Admin Dashboard (Easiest)

1. **Visit Admin Dashboard:**
   ```
   https://praneemsr.github.io/DTGR_ROADSHOW/admin.html
   ```

2. **Click "📊 View All Tables" button**
   - Shows all tables with:
     - Table names
     - Row counts
     - Column definitions
     - Data types
     - Constraints (PRIMARY KEY, NOT NULL, etc.)

---

### Method 2: Browser (Direct API)

**View all tables:**
```
https://event-registration-backend-omega.vercel.app/api/tables
```

Shows JSON with:
- Table names
- Column information
- Row counts
- Data types and constraints

---

### Method 3: PowerShell

**Quick test:**
```powershell
Invoke-RestMethod -Uri "https://event-registration-backend-omega.vercel.app/api/tables" | ConvertTo-Json -Depth 10
```

**Formatted view:**
```powershell
$tables = Invoke-RestMethod -Uri "https://event-registration-backend-omega.vercel.app/api/tables"
$tables.tables | ForEach-Object {
    Write-Host "Table: $($_.name)" -ForegroundColor Cyan
    Write-Host "  Rows: $($_.rowCount)" -ForegroundColor Yellow
    Write-Host "  Columns:" -ForegroundColor Green
    $_.columns | ForEach-Object {
        Write-Host "    - $($_.name) ($($_.type))" -ForegroundColor White
    }
    Write-Host ""
}
```

---

### Method 4: Local Script

**If running locally:**
```powershell
.\check-database.js
```

Or:
```bash
npm run check-db
```

---

## 📊 What You'll See

### Example Output:

```json
{
  "success": true,
  "count": 1,
  "tables": [
    {
      "name": "registrations",
      "rowCount": 5,
      "columns": [
        {
          "name": "id",
          "type": "INTEGER",
          "notNull": false,
          "defaultValue": null,
          "primaryKey": true
        },
        {
          "name": "first_name",
          "type": "TEXT",
          "notNull": true,
          "defaultValue": null,
          "primaryKey": false
        },
        ...
      ]
    }
  ]
}
```

---

## 🎯 Available Endpoints

- **GET /api/tables** - View all tables and their structure
- **GET /api/registrations** - View all registration data
- **GET /api/health** - Check server and database status

---

## 💡 Tips

1. **Admin Dashboard** is the easiest way - visual interface
2. **API endpoint** is good for automation/scripts
3. **Local script** works when server is running locally

---

**Need more info?** Check the admin dashboard - it shows everything in a nice visual format!

