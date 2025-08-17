# Quick Deployment Steps

## Step 1: Create GitHub Repository ✅

1. Go to https://github.com/new
2. Name it: `perfectratio-backend`
3. Make it **Private** (for security)
4. Don't initialize with README (we already have one)
5. Click "Create repository"

## Step 2: Push to GitHub ✅

Copy and run these commands in Terminal:

```bash
cd /Users/seanlaw/Documents/PerfectRatio/railway-backend
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/perfectratio-backend.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

## Step 3: Deploy to Railway 🚂

1. Go to https://railway.app
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose `perfectratio-backend`
6. Railway will auto-deploy!

## Step 4: Set Environment Variables 🔐

In Railway dashboard:

1. Click on your deployed service
2. Go to **"Variables"** tab
3. Click **"RAW Editor"**
4. Paste this (generate a secure API key):

```env
API_KEY=pr_live_XKJ9mN4pQ8vR2sT6wY3zL5aF7bC1dE0gH
NODE_ENV=production
CACHE_TTL=86400
CACHE_CHECK_PERIOD=600
```

Generate API key at: https://randomkeygen.com/ (use "CodeIgniter Encryption Keys" option)

5. Click **"Update Variables"**
6. Service will auto-restart

## Step 5: Get Your Railway URL 🌐

1. In Railway dashboard, go to **"Settings"** tab
2. Under **"Domains"**, click **"Generate Domain"**
3. Copy your URL (like `perfectratio-backend-production.up.railway.app`)

## Step 6: Update iOS App 📱

Edit `/Users/seanlaw/Documents/PerfectRatio/PerfectRatio/Formulator/RailwayBackendService.swift`:

```swift
struct BackendConfig {
    // Railway Backend URL - Update this after deploying to Railway
    static let railwayURL = "https://YOUR-APP-NAME.up.railway.app"  // <-- PASTE YOUR URL HERE
    static let apiKey = "pr_live_XKJ9mN4pQ8vR2sT6wY3zL5aF7bC1dE0gH"  // <-- PASTE YOUR API KEY HERE
    
    // Feature flags
    static let useRailwayBackend = true  // Make sure this is true
    static let enableFallback = true
}
```

## Step 7: Test Everything 🧪

### Test Railway Backend:
```bash
# Test health endpoint (no auth required)
curl https://YOUR-APP-NAME.up.railway.app/health

# Test with API key
curl -H "x-api-key: YOUR_API_KEY" \
     https://YOUR-APP-NAME.up.railway.app/api/suppliers
```

### Test in iOS App:
1. Build and run the app
2. Look for the status indicator (green circle = Railway, orange = Supabase)
3. Tap **"Test Connections"** button
4. Tap **"Manual Catalog Sync"** to test sync

## Expected Results ✅

You should see:
- Green status dot showing "Railway Cache"
- "✅ All connections working!" message
- Fast catalog loading (<100ms for cached data)
- Automatic fallback to Supabase if Railway is down

## Troubleshooting 🔧

### If Railway connection fails:
1. Check Railway logs: Dashboard → Deployments → View Logs
2. Verify environment variables are set
3. Make sure domain is generated
4. Check API key matches

### If iOS app shows "Direct Supabase":
1. Verify `railwayURL` is correct (https://, no trailing slash)
2. Check `useRailwayBackend = true`
3. Verify `apiKey` matches Railway env variable
4. Check Xcode console for error messages

## Monitor Your Backend 📊

- **Logs**: Railway Dashboard → Deployments → View Logs
- **Metrics**: Railway Dashboard → Metrics tab
- **Cache Stats**: 
  ```bash
  curl -H "x-api-key: YOUR_API_KEY" \
       https://YOUR-APP-NAME.up.railway.app/api/cache/stats
  ```

## Success Indicators 🎉

✅ Health endpoint returns `{"status":"healthy"}`
✅ iOS app shows "Railway Cache" with green dot
✅ Test Connections shows "All connections working!"
✅ Manual sync completes in <2 seconds
✅ Cache hit rate increases after first sync

---

**Need help?** Check the full DEPLOYMENT.md or Railway logs for detailed troubleshooting.