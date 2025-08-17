# Railway Environment Variables

## Required Environment Variables

Copy these to your Railway project's environment variables:

```
SUPABASE_URL=https://djffqywhousbhdmibuek.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZmZxeXdob3VzYmhkbWlidWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTM2NDcsImV4cCI6MjA3MDk2OTY0N30.E_SDzNv6csQl_jvSGNspXzCgMdSjaC83wBsXGXSZQn8
API_KEY=pr_live_7bbfqrKTfUZVnw00_kvsS9_UPRwiyKhoJ2xh9xLYoqM
```

## Optional Environment Variables

```
PORT=3000
NODE_ENV=production
CACHE_TTL=86400
CACHE_CHECK_PERIOD=600
```

## How to Set Environment Variables in Railway

1. Go to your Railway project dashboard
2. Click on your service (perfectratio-production)
3. Go to the "Variables" tab
4. Click "Add Variable" or "RAW Editor"
5. Paste the environment variables above
6. Railway will automatically redeploy with the new variables

## Important Notes

- The `SUPABASE_URL` and `SUPABASE_ANON_KEY` are required for the server to start
- The `API_KEY` should match what's configured in your iOS app
- Railway automatically provides the `PORT` variable, but you can override it