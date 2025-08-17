const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client (with validation)
let supabase = null;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables: SUPABASE_URL and/or SUPABASE_ANON_KEY');
  console.error('Please set these in Railway environment variables');
  // Don't exit immediately - allow health endpoint to work for debugging
} else {
  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
  }
}

// Initialize node-cache with TTL
const cache = new NodeCache({ 
  stdTTL: parseInt(process.env.CACHE_TTL || 86400), // 24 hours default
  checkperiod: parseInt(process.env.CACHE_CHECK_PERIOD || 600), // Check every 10 minutes
  useClones: false // Don't clone objects for better performance
});

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const heavyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs for heavy operations
  message: 'Too many heavy requests from this IP, please try again later.'
});

app.use('/api/', limiter);
app.use('/api/sync', heavyLimiter);

// Optional API key middleware
const authenticateAPIKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (process.env.API_KEY && apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  try {
    res.json({ 
      status: 'healthy',
      version: '1.0.2', // Version to track deployments
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      env: {
        has_supabase_url: !!process.env.SUPABASE_URL,
        has_supabase_key: !!process.env.SUPABASE_ANON_KEY,
        has_api_key: !!process.env.API_KEY,
        node_env: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error',
      error: error.message 
    });
  }
});

// Get all suppliers (with caching)
app.get('/api/suppliers', authenticateAPIKey, async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ 
      error: 'Database connection not available',
      message: 'Supabase client not initialized. Check server logs.' 
    });
  }

  const cacheKey = 'suppliers';
  const forceRefresh = req.query.refresh === 'true';
  
  try {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return res.json({
          data: cachedData,
          cached: true,
          cache_expires: new Date(Date.now() + cache.getTtl(cacheKey)).toISOString()
        });
      }
    }
    
    console.log(`Cache miss for ${cacheKey}, fetching from Supabase...`);
    
    // Fetch from Supabase
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    
    // Store in cache
    cache.set(cacheKey, data);
    
    res.json({
      data,
      cached: false,
      cache_expires: new Date(Date.now() + parseInt(process.env.CACHE_TTL) * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all base products (with caching)
app.get('/api/base-products', authenticateAPIKey, async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ 
      error: 'Database connection not available',
      message: 'Supabase client not initialized. Check server logs.' 
    });
  }

  const cacheKey = 'base_products';
  const forceRefresh = req.query.refresh === 'true';
  const since = req.query.since; // For incremental updates
  
  try {
    // Check cache first (unless force refresh or incremental)
    if (!forceRefresh && !since) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return res.json({
          data: cachedData,
          cached: true,
          cache_expires: new Date(Date.now() + cache.getTtl(cacheKey)).toISOString()
        });
      }
    }
    
    console.log(`Cache miss for ${cacheKey}, fetching from Supabase...`);
    
    // Build query
    let query = supabase
      .from('base_products')
      .select(`
        *,
        supplier:suppliers(name, website_url),
        price_tiers:base_price_tiers(*)
      `);
    
    // Add incremental filter if provided
    if (since) {
      query = query.gt('updated_at', since);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) throw error;
    
    // Store in cache (only if not incremental)
    if (!since) {
      cache.set(cacheKey, data);
    }
    
    res.json({
      data,
      cached: false,
      incremental: !!since,
      cache_expires: new Date(Date.now() + parseInt(process.env.CACHE_TTL) * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error fetching base products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get fragrance oils with pagination (with caching)
app.get('/api/fragrance-oils', authenticateAPIKey, async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ 
      error: 'Database connection not available',
      message: 'Supabase client not initialized. Check server logs.' 
    });
  }

  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 50;
  const forceRefresh = req.query.refresh === 'true';
  const since = req.query.since;
  
  const offset = (page - 1) * pageSize;
  const cacheKey = `fragrance_oils_page_${page}_size_${pageSize}`;
  
  try {
    // Check cache first (unless force refresh or incremental)
    if (!forceRefresh && !since) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return res.json({
          data: cachedData.data,
          page,
          pageSize,
          hasMore: cachedData.hasMore,
          cached: true,
          cache_expires: new Date(Date.now() + cache.getTtl(cacheKey)).toISOString()
        });
      }
    }
    
    console.log(`Cache miss for ${cacheKey}, fetching from Supabase...`);
    
    // Build query
    let query = supabase
      .from('fragrance_oils')
      .select(`
        *,
        supplier:suppliers(name, website_url),
        price_tiers:oil_price_tiers(*),
        ifra_entries(*),
        fragrance_notes(*)
      `);
    
    // Add incremental filter if provided
    if (since) {
      query = query.gt('updated_at', since);
    }
    
    // Add pagination
    query = query
      .order('name')
      .range(offset, offset + pageSize - 1);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const hasMore = data.length === pageSize;
    
    // Store in cache (only if not incremental)
    if (!since) {
      cache.set(cacheKey, { data, hasMore });
    }
    
    res.json({
      data,
      page,
      pageSize,
      hasMore,
      cached: false,
      incremental: !!since,
      cache_expires: new Date(Date.now() + parseInt(process.env.CACHE_TTL) * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error fetching fragrance oils:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get vessels (with caching)
app.get('/api/vessels', authenticateAPIKey, async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ 
      error: 'Database connection not available',
      message: 'Supabase client not initialized. Check server logs.' 
    });
  }

  const cacheKey = 'vessels';
  const forceRefresh = req.query.refresh === 'true';
  const since = req.query.since;
  
  try {
    // Check cache first
    if (!forceRefresh && !since) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return res.json({
          data: cachedData,
          cached: true,
          cache_expires: new Date(Date.now() + cache.getTtl(cacheKey)).toISOString()
        });
      }
    }
    
    console.log(`Cache miss for ${cacheKey}, fetching from Supabase...`);
    
    // Build query
    let query = supabase
      .from('vessels')
      .select(`
        *,
        supplier:suppliers(name, website_url)
      `);
    
    // Add incremental filter if provided
    if (since) {
      query = query.gt('updated_at', since);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) throw error;
    
    // Store in cache (only if not incremental)
    if (!since) {
      cache.set(cacheKey, data);
    }
    
    res.json({
      data,
      cached: false,
      incremental: !!since,
      cache_expires: new Date(Date.now() + parseInt(process.env.CACHE_TTL) * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error fetching vessels:', error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk sync endpoint - get all catalog data
app.get('/api/sync/catalog', authenticateAPIKey, heavyLimiter, async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ 
      error: 'Database connection not available',
      message: 'Supabase client not initialized. Check server logs.' 
    });
  }

  const forceRefresh = req.query.refresh === 'true';
  const since = req.query.since;
  const cacheKey = `full_catalog${since ? '_incremental' : ''}`;
  
  try {
    // Check cache first
    if (!forceRefresh && !since) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return res.json({
          ...cachedData,
          cached: true,
          cache_expires: new Date(Date.now() + cache.getTtl(cacheKey)).toISOString()
        });
      }
    }
    
    console.log(`Fetching full catalog from Supabase...`);
    
    // Fetch all data in parallel
    const promises = [];
    
    // Suppliers query
    let suppliersQuery = supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true);
    if (since) suppliersQuery = suppliersQuery.gt('updated_at', since);
    promises.push(suppliersQuery.order('name'));
    
    // Base products query
    let basesQuery = supabase
      .from('base_products')
      .select(`
        *,
        supplier:suppliers(name, website_url),
        price_tiers:base_price_tiers(*)
      `);
    if (since) basesQuery = basesQuery.gt('updated_at', since);
    promises.push(basesQuery.order('name'));
    
    // Vessels query
    let vesselsQuery = supabase
      .from('vessels')
      .select(`
        *,
        supplier:suppliers(name, website_url)
      `);
    if (since) vesselsQuery = vesselsQuery.gt('updated_at', since);
    promises.push(vesselsQuery.order('name'));
    
    // Execute all queries
    const [suppliersResult, basesResult, vesselsResult] = await Promise.all(promises);
    
    // Check for errors
    if (suppliersResult.error) throw suppliersResult.error;
    if (basesResult.error) throw basesResult.error;
    if (vesselsResult.error) throw vesselsResult.error;
    
    // Fetch fragrance oils with pagination
    const allOils = [];
    let page = 0;
    let hasMore = true;
    const pageSize = 100;
    
    while (hasMore) {
      let oilsQuery = supabase
        .from('fragrance_oils')
        .select(`
          *,
          supplier:suppliers(name, website_url),
          price_tiers:oil_price_tiers(*),
          ifra_entries(*),
          fragrance_notes(*)
        `);
      
      if (since) oilsQuery = oilsQuery.gt('updated_at', since);
      
      const { data: oilsData, error: oilsError } = await oilsQuery
        .order('name')
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (oilsError) throw oilsError;
      
      allOils.push(...oilsData);
      hasMore = oilsData.length === pageSize;
      page++;
    }
    
    const catalogData = {
      suppliers: suppliersResult.data,
      base_products: basesResult.data,
      fragrance_oils: allOils,
      vessels: vesselsResult.data,
      timestamp: new Date().toISOString(),
      incremental: !!since
    };
    
    // Store in cache (only if not incremental)
    if (!since) {
      cache.set(cacheKey, catalogData);
    }
    
    res.json({
      ...catalogData,
      cached: false,
      cache_expires: new Date(Date.now() + parseInt(process.env.CACHE_TTL) * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error syncing catalog:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear cache endpoint (for admin use)
app.post('/api/cache/clear', authenticateAPIKey, (req, res) => {
  const keys = cache.keys();
  cache.flushAll();
  res.json({ 
    message: 'Cache cleared successfully',
    cleared_keys: keys.length
  });
});

// Get cache statistics
app.get('/api/cache/stats', authenticateAPIKey, (req, res) => {
  const stats = cache.getStats();
  const keys = cache.keys();
  
  res.json({
    stats,
    keys: keys.map(key => ({
      key,
      ttl: cache.getTtl(key),
      expires: new Date(cache.getTtl(key)).toISOString()
    })),
    total_keys: keys.length
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Cache server running on port ${PORT}`);
  console.log(`📦 Cache TTL: ${process.env.CACHE_TTL || 86400} seconds`);
  console.log(`🔄 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});