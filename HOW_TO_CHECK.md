# How to Check Your Backend

## 🚀 Quick Tests

### Method 1: Browser (Easiest)

**1. Health Check:**
Open in browser:
```
https://event-registration-backend-omega.vercel.app/api/health
```
Should show: `{"status":"ok","message":"Server is running","database":"ready"}`

**2. View Registrations:**
Open in browser:
```
https://event-registration-backend-omega.vercel.app/api/registrations
```
Shows all registrations in JSON format.

---

### Method 2: PowerShell Script (Recommended)

**Run the test script:**
```powershell
.\test-backend.ps1
```

This will test:
- ✅ Health endpoint
- ✅ Registration
- ✅ Getting all registrations

---

### Method 3: Manual PowerShell Test

**Step 1: Health Check**
```powershell
Invoke-RestMethod -Uri "https://event-registration-backend-omega.vercel.app/api/health"
```

**Step 2: Test Registration**
```powershell
$body = @{
    me_firstname = "Test"
    me_lastname = "User"
    me_email = "test@example.com"
    me_phonenumber = "+1 555-1234"
    me_companyname = "Test Company"
    me_country = "US"
    jobRole = "Developer"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://event-registration-backend-omega.vercel.app/api/register" -Method POST -Body $body -ContentType "application/json"
```

**Step 3: View Registrations**
```powershell
Invoke-RestMethod -Uri "https://event-registration-backend-omega.vercel.app/api/registrations"
```

---

### Method 4: Test Full Stack

**1. Frontend Form:**
- Visit: https://praneemsr.github.io/DTGR_ROADSHOW/
- Fill out the registration form
- Submit
- Should see success message

**2. Admin Dashboard:**
- Visit: https://praneemsr.github.io/DTGR_ROADSHOW/admin.html
- Should show your registration in the table

---

## ✅ What to Look For

### Success Indicators:
- ✅ Health endpoint returns `{"status":"ok"}`
- ✅ Registration returns `{"success":true,"id":1}`
- ✅ `/api/registrations` shows your data
- ✅ Frontend form shows success message
- ✅ Admin dashboard displays registrations

### Error Indicators:
- ❌ "Database is initializing" - Wait 5-10 seconds and try again
- ❌ "Database error occurred" - Check Vercel logs
- ❌ Connection timeout - Backend might be down
- ❌ CORS errors - Check backend URL in frontend code

---

## 🔍 Check Vercel Logs

**View deployment logs:**
```bash
vercel logs event-registration-backend-omega.vercel.app
```

**Or visit Vercel dashboard:**
```
https://vercel.com/praneeth-manchals-projects/event-registration-backend
```
Click on "Logs" tab to see real-time logs.

---

## 🎯 Quick Checklist

- [ ] Health endpoint works
- [ ] Can register via API
- [ ] Can view registrations
- [ ] Frontend form works
- [ ] Admin dashboard shows data

---

## 💡 Tips

1. **First request is slow** - WASM file downloads (5-10 seconds)
2. **Wait between tests** - Give database time to initialize
3. **Check browser console** - F12 for frontend errors
4. **Use test script** - `.\test-backend.ps1` tests everything

---

**Need help?** Check the logs or test each endpoint individually!

