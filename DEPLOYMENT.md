# Railway Deployment Guide

## Step 1: Push to GitHub

1. Create a new GitHub repository for the backend
2. Push the railway-backend folder to GitHub:

```bash
cd railway-backend
git init
git add .
git commit -m "Initial Railway caching backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/perfectratio-backend.git
git push -u origin main
```

## Step 2: Deploy to Railway

1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will auto-detect Node.js and deploy

## Step 3: Configure Environment Variables

In Railway dashboard, add these environment variables:

```env
API_KEY=generate-a-secure-random-string-here
NODE_ENV=production
CACHE_TTL=86400
```

Railway will automatically provide:
- `PORT` - Auto-assigned
- `REDIS_URL` - If you add Redis service (optional)

## Step 4: Update iOS App

1. Copy your Railway app URL (e.g., `https://perfectratio-backend.up.railway.app`)
2. Update `RailwayBackendService.swift`:

```swift
struct BackendConfig {
    static let railwayURL = "https://YOUR-APP-NAME.up.railway.app"
    static let apiKey = "your-api-key-from-step-3"
    static let useRailwayBackend = true
    static let enableFallback = true
}
```

## Step 5: Test the Deployment

1. Check health endpoint:
```bash
curl https://YOUR-APP-NAME.up.railway.app/health
```

2. Test with API key:
```bash
curl -H "x-api-key: YOUR_API_KEY" https://YOUR-APP-NAME.up.railway.app/api/suppliers
```

3. In iOS app, tap "Test Connections" button in debug mode

## Optional: Add Redis for Persistent Cache

1. In Railway dashboard, click "New Service"
2. Select "Redis"
3. Railway will auto-connect and provide `REDIS_URL`
4. Update `server.js` to use Redis (code already supports it)

## Monitoring

- View logs: Railway dashboard → Your service → Logs
- Check metrics: Railway dashboard → Your service → Metrics
- Health endpoint: `https://YOUR-APP.railway.app/health`
- Cache stats: `GET /api/cache/stats` (with API key)

## Cost Optimization

- Free tier: 500 hours/month + $5 credit
- Estimated cost: ~$5-10/month for caching service
- Tips:
  - Use 24-hour cache TTL (already configured)
  - Enable compression (already configured)
  - Rate limiting prevents abuse (already configured)

## Troubleshooting

If connections fail:
1. Check Railway logs for errors
2. Verify environment variables are set
3. Ensure API key matches in iOS app
4. Test direct Supabase connection (fallback)
5. Use "Test Connections" button in iOS app

The iOS app will automatically fall back to direct Supabase if Railway is unavailable!