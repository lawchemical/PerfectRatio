# Railway Setup Checklist for New Project

Project URL: https://railway.com/project/06aaf29c-2ca0-4524-871f-bef4ba23c670

## ✅ Step-by-Step Setup:

### 1. Connect GitHub Repository
- [ ] Go to Settings tab
- [ ] Under "Service" → "Source"
- [ ] Click "Connect GitHub"
- [ ] Choose: `lawchemical/PerfectRatio`
- [ ] Select branch: `main`
- [ ] Wait for initial deployment

### 2. Add Environment Variables
- [ ] Go to Variables tab
- [ ] Click "RAW Editor"
- [ ] Copy ALL text from: `/Users/seanlaw/Documents/PerfectRatio/NEW_RAILWAY_ENV.txt`
- [ ] Paste into RAW Editor
- [ ] Click "Update Variables"
- [ ] Service will restart automatically

### 3. Generate Domain
- [ ] Go to Settings tab
- [ ] Scroll to "Networking" section
- [ ] Click "Generate Domain"
- [ ] Copy your domain URL
- [ ] Share the URL here so I can update your iOS app

### 4. Verify Deployment
After deployment completes (2-3 minutes):
- [ ] Check Deployments tab → should show "Success"
- [ ] Click "View Logs" → should see "🚀 Cache server running on port 3000"

### 5. Test Your Endpoints
Replace YOUR-DOMAIN with your actual Railway domain:

```bash
# Test health (no auth needed)
curl https://YOUR-DOMAIN.up.railway.app/health

# Test with API key
curl -H "x-api-key: pr_live_7bbfqrKTfUZVnw00_kvsS9_UPRwiyKhoJ2xh9xLYoqM" \
     https://YOUR-DOMAIN.up.railway.app/api/suppliers
```

### 6. Update iOS App
Once you share your Railway domain, I'll update:
- `/Formulator/RailwayBackendService.swift`
- Set your Railway URL
- Enable Railway backend

### 7. Test in iOS App
- [ ] Build and run in Xcode
- [ ] Check for green "Railway Cache" indicator
- [ ] Tap "Test Connections"
- [ ] Should show "✅ All connections working!"

## What This Gives You:
✅ 24-hour cached product catalog
✅ <100ms response times
✅ Automatic Supabase fallback
✅ Support for 10,000+ concurrent users
✅ Background sync (won't block app launch)

## If You Need Help:
- Check Railway logs: Deployments → View Logs
- Verify all env variables are set
- Make sure GitHub is connected to `main` branch
- The domain must start with `https://`