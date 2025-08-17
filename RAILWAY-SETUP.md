# Railway Setup - TWO SERVERS FROM SAME REPO

This repository contains TWO different servers that deploy to TWO different Railway services:

## 1. ADMIN SERVER
- **URL**: https://perfectratio-production.up.railway.app
- **Purpose**: Serves the admin dashboard for managing products
- **Entry Point**: `start-admin.js` (which runs `server-production.js`)
- **Files Used**:
  - `server-production.js` - Main admin server
  - `public/` folder - Admin dashboard HTML/JS/CSS
- **Railway Start Command**: `npm run start-admin`

## 2. CACHE SERVER  
- **URL**: https://perfectratio-production-fbe3.up.railway.app
- **Purpose**: API cache server for iOS app
- **Entry Point**: `start-cache.js` (which runs `railway-backend/server.js`)
- **Files Used**:
  - `railway-backend/server.js` - Cache server
- **Railway Start Command**: `npm run start-cache`

## How to Configure in Railway

### For Admin Server Service:
1. Go to your admin server service in Railway
2. Go to Settings > Deploy
3. Set Start Command to: `npm run start-admin`

### For Cache Server Service:
1. Go to your cache server service in Railway
2. Go to Settings > Deploy  
3. Set Start Command to: `npm run start-cache`

## Environment Variables

Both services need Supabase credentials but can have different API keys.

### Admin Server Needs:
- PRODUCT_DB_URL
- PRODUCT_DB_ANON_KEY
- USER_DB_URL
- USER_DB_ANON_KEY
- ADMIN_USERNAME
- ADMIN_PASSWORD

### Cache Server Needs:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- API_KEY

## DO NOT DELETE
- `start-admin.js` - Entry point for admin server
- `start-cache.js` - Entry point for cache server
- `server-production.js` - Admin server code
- `railway-backend/` folder - Cache server code
- `public/` folder - Admin dashboard files