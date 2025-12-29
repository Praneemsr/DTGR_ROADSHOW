# Testing Your Backend

## ✅ Quick Tests

### 1. Health Check
Open in browser:
```
https://event-registration-backend-omega.vercel.app/api/health
```

Should return:
```json
{"status":"ok","message":"Server is running"}
```

### 2. Test Registration API
Use this in browser console or Postman:

**POST Request:**
```
URL: https://event-registration-backend-omega.vercel.app/api/register
Method: POST
Headers: Content-Type: application/json
Body:
{
  "me_firstname": "Test",
  "me_lastname": "User",
  "me_email": "test@example.com",
  "me_phonenumber": "+1 555-1234",
  "me_companyname": "Test Company",
  "me_country": "US",
  "jobRole": "Developer"
}
```

### 3. View All Registrations
Open in browser:
```
https://event-registration-backend-omega.vercel.app/api/registrations
```

Should return JSON with all registrations.

---

## 🌐 Test with Your Frontend

### Step 1: Make Sure Frontend is Updated

Your frontend code should already have the backend URL configured. Verify in:
- `js/scripts.js` - Should have: `https://event-registration-backend-omega.vercel.app`
- `admin.html` - Should have: `https://event-registration-backend-omega.vercel.app`

### Step 2: Test Registration Form

1. **Visit your GitHub Pages site**:
   ```
   https://praneemsr.github.io/DTGR_ROADSHOW/
   ```

2. **Fill out the registration form**:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Phone: +1 555-1234
   - Company: Test Company
   - Country: United States
   - Click "Register"

3. **Check for success message**:
   - Should see: "Thank you! Your registration has been received..."

### Step 3: Check Admin Dashboard

1. **Visit admin page**:
   ```
   https://praneemsr.github.io/DTGR_ROADSHOW/admin.html
   ```

2. **Should see**:
   - Your test registration in the table
   - Statistics showing 1 registration
   - All registration details

---

## 🔍 Advanced Testing

### Using Browser Console

1. Open your GitHub Pages site
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Run:

```javascript
// Test health endpoint
fetch('https://event-registration-backend-omega.vercel.app/api/health')
  .then(r => r.json())
  .then(console.log);

// Test registrations endpoint
fetch('https://event-registration-backend-omega.vercel.app/api/registrations')
  .then(r => r.json())
  .then(console.log);

// Test registration
fetch('https://event-registration-backend-omega.vercel.app/api/register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    me_firstname: "Test",
    me_lastname: "User",
    me_email: "test2@example.com",
    me_phonenumber: "+1 555-5678",
    me_companyname: "Test Corp",
    me_country: "US",
    jobRole: "Manager"
  })
})
.then(r => r.json())
.then(console.log);
```

### Using PowerShell

```powershell
# Health check
Invoke-RestMethod -Uri "https://event-registration-backend-omega.vercel.app/api/health"

# Get all registrations
Invoke-RestMethod -Uri "https://event-registration-backend-omega.vercel.app/api/registrations"

# Register someone
$body = @{
    me_firstname = "PowerShell"
    me_lastname = "Test"
    me_email = "powershell@test.com"
    me_phonenumber = "+1 555-9999"
    me_companyname = "Test Company"
    me_country = "US"
    jobRole = "Tester"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://event-registration-backend-omega.vercel.app/api/register" -Method POST -Body $body -ContentType "application/json"
```

---

## ✅ Checklist

- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Can register via frontend form
- [ ] Success message appears after registration
- [ ] Admin dashboard shows registrations
- [ ] Can see registration data in admin table
- [ ] Search/filter works in admin dashboard

---

## 🐛 Troubleshooting

**Frontend can't connect?**
- Check browser console (F12) for errors
- Verify backend URL is correct in `js/scripts.js`
- Test backend directly: https://event-registration-backend-omega.vercel.app/api/health

**CORS errors?**
- Backend already has CORS enabled
- Check that backend URL is correct

**Registration fails?**
- Check browser console for error messages
- Verify all required fields are filled
- Test backend directly with Postman/curl

**Admin dashboard empty?**
- Make sure you've registered someone first
- Check browser console for API errors
- Test `/api/registrations` endpoint directly

---

## 📊 View Vercel Logs

```bash
vercel logs event-registration-backend-omega.vercel.app
```

Or visit:
```
https://vercel.com/praneeth-manchals-projects/event-registration-backend
```

---

**Everything working?** 🎉 Your full-stack app is live!

