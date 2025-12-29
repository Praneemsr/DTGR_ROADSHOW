# Backend Deployment Guide

Deploy your Node.js backend separately so it works with GitHub Pages frontend.

## Quick Comparison

| Platform | Free Tier | Ease of Use | Best For |
|----------|-----------|-------------|----------|
| **Vercel** | ✅ Yes | ⭐⭐⭐⭐⭐ | Easiest, best for Node.js |
| **Railway** | ✅ Yes (limited) | ⭐⭐⭐⭐ | Simple, good free tier |
| **Render** | ✅ Yes (sleeps after inactivity) | ⭐⭐⭐ | Good free option |

## Option 1: Deploy to Vercel (Recommended) ⭐

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
cd "C:\Users\v-praneethsr\OneDrive - Microsoft\Desktop\DTGR_ROADSHOW"
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **event-registration-backend** (or any name)
- Directory? **./** (current directory)
- Override settings? **No**

### Step 4: Get Your Backend URL

After deployment, Vercel will show you a URL like:
```
https://event-registration-backend.vercel.app
```

### Step 5: Update Frontend

**Option A: Update code directly**

Edit `js/scripts.js` line ~57:
```javascript
const defaultBackend = 'https://your-backend.vercel.app'; // Replace with your Vercel URL
```

Edit `admin.html` line ~295:
```javascript
const defaultBackend = 'https://your-backend.vercel.app'; // Replace with your Vercel URL
```

**Option B: Let users configure (already implemented)**

The code will prompt users to enter the backend URL on first use, and save it in localStorage.

### Step 6: Redeploy Frontend

Push your changes to GitHub, and your frontend will use the new backend!

---

## Option 2: Deploy to Railway

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Create New Project

1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Select your repository
4. Railway will auto-detect Node.js

### Step 3: Configure

1. Railway will automatically:
   - Detect `package.json`
   - Install dependencies
   - Start the server
2. Go to **Settings** → **Generate Domain**
3. Copy your Railway URL (e.g., `https://your-app.railway.app`)

### Step 4: Update Frontend

Same as Vercel - update the backend URL in `js/scripts.js` and `admin.html`.

---

## Option 3: Deploy to Render

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create New Web Service

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `event-registration-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

### Step 3: Deploy

1. Click **Create Web Service**
2. Render will build and deploy
3. Copy your Render URL (e.g., `https://your-app.onrender.com`)

### Step 4: Update Frontend

Same as above - update backend URLs.

---

## Environment Variables

If you need to set environment variables (not required for basic setup):

**Vercel:**
```bash
vercel env add NODE_ENV production
```

**Railway:**
- Go to project → Variables tab
- Add `NODE_ENV=production`

**Render:**
- Go to service → Environment tab
- Add `NODE_ENV=production`

---

## Database Persistence

**Important**: The database file (`database/registrations.db`) is stored in the server's filesystem.

- **Vercel**: Uses serverless functions - database resets on each deployment (not ideal for production)
- **Railway**: Persistent storage - database persists ✅
- **Render**: Persistent storage - database persists ✅

**For production with Vercel**, consider using:
- SQLite with external storage (S3, etc.)
- Or switch to Railway/Render for persistent storage

---

## Testing Your Deployment

1. Deploy backend to your chosen platform
2. Test the health endpoint:
   ```
   https://your-backend.vercel.app/api/health
   ```
   Should return: `{"status":"ok","message":"Server is running"}`

3. Update frontend URLs
4. Deploy frontend to GitHub Pages
5. Test registration form

---

## Troubleshooting

### Backend not responding
- Check deployment logs on your platform
- Verify `npm start` works locally
- Check that port is set correctly (should use `process.env.PORT`)

### CORS errors
- The backend already has CORS enabled
- If issues persist, check `server.js` CORS settings

### Database not persisting (Vercel)
- Vercel uses serverless - consider Railway/Render for persistent storage
- Or use external database service

### Frontend can't connect
- Verify backend URL is correct
- Check backend is deployed and running
- Test backend URL directly in browser

---

## Quick Deploy Commands

**Vercel:**
```bash
vercel --prod
```

**Railway:**
- Auto-deploys on git push (if connected)

**Render:**
- Auto-deploys on git push (if connected)

---

## Recommended Setup

1. **Backend**: Deploy to **Railway** (persistent storage, free tier)
2. **Frontend**: Deploy to **GitHub Pages** (free, easy)
3. **Update URLs**: Set backend URL in frontend code

This gives you:
- ✅ Free hosting for both
- ✅ Persistent database
- ✅ Auto-deployments
- ✅ Full functionality

