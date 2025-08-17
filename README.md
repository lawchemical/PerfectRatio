# PerfectRatio Cache Backend

This is the caching backend service for the PerfectRatio iOS app. It acts as a proxy between the app and Supabase, providing:

- **In-memory caching** with 24-hour TTL
- **Rate limiting** to prevent API abuse
- **Pagination support** for large datasets
- **Incremental sync** capabilities
- **Health monitoring** endpoints

## Deployment to Railway

1. Push this code to a GitHub repository
2. Connect Railway to your GitHub repo
3. Railway will auto-deploy on push
4. Add environment variables in Railway dashboard:
   - `API_KEY` - Set a secure API key for your iOS app
   - `REDIS_URL` - (Optional) Add Redis for persistent caching

## API Endpoints

### Public Endpoints
- `GET /health` - Health check and stats

### Protected Endpoints (require x-api-key header)
- `GET /api/suppliers` - Get all suppliers (cached)
- `GET /api/base-products` - Get all base products (cached)
- `GET /api/fragrance-oils?page=1&pageSize=50` - Get fragrance oils (paginated, cached)
- `GET /api/vessels` - Get all vessels (cached)
- `GET /api/sync/catalog` - Get full catalog in one request (heavy operation)

### Cache Management
- `POST /api/cache/clear` - Clear all cache
- `GET /api/cache/stats` - Get cache statistics

### Query Parameters
- `?refresh=true` - Force refresh from Supabase (bypass cache)
- `?since=2024-01-01T00:00:00Z` - Get only records updated after this timestamp

## Local Development

```bash
# Install dependencies
npm install

# Test Supabase connection
npm test

# Run development server
npm run dev
```

## Performance

- Serves cached responses in <10ms
- Fresh data fetches take 100-500ms depending on dataset size
- Supports 100+ concurrent connections
- Auto-expires cache after 24 hours

## Security

- Rate limiting: 100 requests per 15 minutes per IP
- Heavy operations limited to 10 per 15 minutes
- Optional API key authentication
- Helmet.js for security headers
- CORS enabled for iOS app access