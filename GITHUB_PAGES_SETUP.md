# GitHub Pages Setup Guide

## Important Note ⚠️

**GitHub Pages only serves static files** - it cannot run Node.js backends!

This means:
- ✅ Your HTML/CSS/JS files will work
- ❌ The API endpoints (`/api/register`, `/api/registrations`) will NOT work
- ❌ The database will NOT work on GitHub Pages
- ❌ The admin dashboard will NOT be able to fetch data

## Solutions

### Option 1: Frontend Only (No Database)
- Deploy only the frontend to GitHub Pages
- Remove or disable the registration form submission
- Use it as a static event page only

### Option 2: Full Stack Deployment
- **Frontend**: Deploy to GitHub Pages (this repo)
- **Backend**: Deploy separately to:
  - [Vercel](https://vercel.com) (recommended - free)
  - [Railway](https://railway.app) (free tier available)
  - [Render](https://render.com) (free tier available)
  - [Heroku](https://heroku.com) (paid)
- Update API URLs in `js/scripts.js` and `admin.html` to point to your backend

### Option 3: Use a Full-Stack Platform
- Deploy everything to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
- These platforms support Node.js backends

## Setting Up GitHub Pages (Frontend Only)

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - **Branch**: `main` (or `master`)
   - **Folder**: `/ (root)`
4. Click **Save**

### Step 2: Wait for Deployment

- GitHub will build and deploy your site
- Usually takes 1-2 minutes
- You'll see a green checkmark when done
- Your site URL will be: `https://YOUR_USERNAME.github.io/REPO_NAME/`

### Step 3: Access Your Site

- Main page: `https://YOUR_USERNAME.github.io/REPO_NAME/`
- Admin page: `https://YOUR_USERNAME.github.io/REPO_NAME/admin.html`

## File Structure for GitHub Pages

Make sure these files are in your repository root:
```
├── index.html
├── admin.html
├── css/
│   └── styles.css
├── js/
│   └── scripts.js
└── images/
    └── event-banner.jpg (optional)
```

## What Won't Work on GitHub Pages

- ❌ Form submissions (no backend)
- ❌ Database storage (no server)
- ❌ Admin dashboard data fetching (no API)
- ❌ CSV exports (no server-side scripts)

## Recommended: Deploy Backend Separately

### Using Vercel (Easiest)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd your-project
   vercel
   ```

3. **Update Frontend**:
   - Edit `js/scripts.js`:
     ```javascript
     const API_BASE_URL = 'https://your-backend.vercel.app';
     ```
   - Edit `admin.html`:
     ```javascript
     const API_BASE_URL = 'https://your-backend.vercel.app';
     ```

### Using Railway

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect your GitHub repo
4. Railway auto-detects Node.js and deploys
5. Get your backend URL and update frontend

## Troubleshooting

### 404 Error
- Make sure GitHub Pages is enabled in Settings
- Check that `index.html` is in the root directory
- Wait a few minutes for deployment to complete
- Check the Actions tab for deployment status

### Files Not Loading
- Use relative paths (e.g., `css/styles.css` not `/css/styles.css`)
- Make sure all files are committed and pushed
- Check browser console for 404 errors

### API Not Working
- This is expected! GitHub Pages can't run Node.js
- Deploy backend separately (see options above)

## Current Status

Your repository structure looks good for GitHub Pages. Just enable Pages in Settings and wait for deployment!

