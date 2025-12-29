# Quick Backend Deployment - 3 Steps

## 🚀 Fastest Way: Vercel (5 minutes)

### Step 1: Install & Login
```bash
npm install -g vercel
vercel login
```

### Step 2: Deploy
```bash
cd "C:\Users\v-praneethsr\OneDrive - Microsoft\Desktop\DTGR_ROADSHOW"
vercel
```

Answer the prompts:
- Set up and deploy? **Yes**
- Link to existing? **No**  
- Project name? **event-backend** (or any name)
- Directory? **./**

### Step 3: Copy Your URL

Vercel will show you a URL like:
```
https://event-backend-xxxxx.vercel.app
```

**Copy this URL!**

### Step 4: Update Frontend

Edit these files and replace `https://your-backend.vercel.app` with your actual URL:

1. **js/scripts.js** (line ~60):
   ```javascript
   const defaultBackend = 'https://YOUR-ACTUAL-URL.vercel.app';
   ```

2. **admin.html** (line ~300):
   ```javascript
   const defaultBackend = 'https://YOUR-ACTUAL-URL.vercel.app';
   ```

### Step 5: Push to GitHub

```bash
git add .
git commit -m "Update backend URL"
git push
```

**Done!** Your frontend on GitHub Pages will now connect to your backend on Vercel.

---

## Alternative: Railway (Better for Database)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Select your repo
5. Railway auto-deploys!
6. Get URL from **Settings** → **Generate Domain**
7. Update frontend URLs (same as Step 4 above)

---

## Test It

1. Visit your GitHub Pages site
2. Try registering someone
3. Check admin dashboard
4. Data should save to backend database!

---

**Need help?** See `DEPLOY_BACKEND.md` for detailed instructions.

