# WASM File Fix for Vercel

## Problem
Vercel serverless functions couldn't find the sql.js WASM file at `/var/task/node_modules/sql.js/dist/sql-wasm.wasm`

## Solution
Updated `server.js` to load the WASM file from a CDN instead of the local filesystem. This is more reliable for serverless environments.

## Changes Made

1. **Updated `server.js`**:
   - Now loads WASM from jsDelivr CDN: `https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/sql-wasm.wasm`
   - Falls back to local file for development
   - Automatically detects Vercel environment

2. **Redeployed to Vercel**:
   - Backend URL: https://event-registration-backend-omega.vercel.app

## Test Your Backend

1. **Health Check**:
   ```
   https://event-registration-backend-omega.vercel.app/api/health
   ```
   Should return: `{"status":"ok","message":"Server is running"}`

2. **Check Logs** (if issues persist):
   ```bash
   vercel logs event-registration-backend-omega.vercel.app
   ```

3. **Test Registration**:
   - Visit your GitHub Pages site
   - Try registering someone
   - Check if data saves

## If Still Not Working

If you still see WASM errors, consider:

1. **Use Railway or Render** (better for persistent storage):
   - See `DEPLOY_BACKEND.md` for instructions
   - These platforms handle file system better

2. **Use External Database**:
   - PostgreSQL on Railway/Render
   - MongoDB Atlas (free tier)
   - Supabase (free tier)

3. **Check Vercel Logs**:
   ```bash
   vercel inspect event-registration-backend-omega.vercel.app --logs
   ```

## Current Status

✅ Code updated to use CDN for WASM
✅ Redeployed to Vercel
⏳ Waiting for you to test

Test the health endpoint and let me know if it works!

