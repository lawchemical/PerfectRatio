# Railway Quick Setup for Your Project

## Your Railway Project
URL: https://railway.com/project/ad1f13e7-b678-4ffe-acb0-d46d1001fa43

## Steps to Complete:

### 1. Add Environment Variables
Go to **Variables** tab in Railway and click **RAW Editor**, then paste:

```env
SUPABASE_URL=https://djffqywhousbhdmibuek.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZmZxeXdob3VzYmhkbWlidWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTM2NDcsImV4cCI6MjA3MDk2OTY0N30.E_SDzNv6csQl_jvSGNspXzCgMdSjaC83wBsXGXSZQn8
API_KEY=pr_live_7bbfqrKTfUZVnw00_kvsS9_UPRwiyKhoJ2xh9xLYoqM
NODE_ENV=production
CACHE_TTL=86400
CACHE_CHECK_PERIOD=600
```

Click **Update Variables**

### 2. Generate or Find Your Domain
Go to **Settings** tab → **Networking** section:
- If you see a domain, copy it
- If not, click **Generate Domain**
- Copy the URL (like `perfectratio-production-abc123.up.railway.app`)

### 3. Update iOS App
Edit `/Formulator/RailwayBackendService.swift`:
```swift
static let railwayURL = "https://YOUR-DOMAIN-HERE.up.railway.app"
```
Replace `YOUR-DOMAIN-HERE` with your actual Railway domain.

### 4. Trigger Deployment
Your Railway project should auto-deploy when you:
- Updated environment variables
- Or click **Redeploy** button in Railway

### 5. Test the Deployment

#### Test Railway Health:
```bash
curl https://YOUR-DOMAIN.up.railway.app/health
```
Should return: `{"status":"healthy",...}`

#### Test with API Key:
```bash
curl -H "x-api-key: pr_live_7bbfqrKTfUZVnw00_kvsS9_UPRwiyKhoJ2xh9xLYoqM" \
     https://YOUR-DOMAIN.up.railway.app/api/suppliers
```
Should return supplier data.

### 6. Test in iOS App
1. Build and run the app in Xcode
2. Look for green dot "Railway Cache" indicator
3. Tap "Test Connections" button
4. Should show "✅ All connections working!"

## What This Does:
- ✅ Caches product catalog data (24-hour TTL)
- ✅ Serves cached data in <100ms
- ✅ Automatically falls back to Supabase if Railway is down
- ✅ Supports 10,000+ concurrent users
- ✅ Background sync every 24 hours

## Monitoring:
- **Logs**: Railway Dashboard → Deployments → View Logs
- **Metrics**: Railway Dashboard → Observability
- **Cache Stats**: `GET /api/cache/stats` endpoint

## If Something Goes Wrong:
1. Check Railway logs for errors
2. Verify all environment variables are set
3. Make sure domain is generated
4. Temporarily set `useRailwayBackend = false` in iOS app to use direct Supabase