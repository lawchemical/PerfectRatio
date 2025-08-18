// Production Server with Two Supabase Projects
// Configured for Railway deployment with environment variables

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// =====================================================
// CONFIGURATION FROM ENVIRONMENT VARIABLES
// =====================================================

// Project 1: Product Data (Public Catalog)
const PRODUCT_DATA = {
    url: process.env.PRODUCT_DB_URL || 'https://djffqywhousbhdmibuek.supabase.co',
    anonKey: process.env.PRODUCT_DB_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZmZxeXdob3VzYmhkbWlidWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTM2NDcsImV4cCI6MjA3MDk2OTY0N30.E_SDzNv6csQl_jvSGNspXzCgMdSjaC83wBsXGXSZQn8',
    serviceKey: process.env.PRODUCT_DB_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZmZxeXdob3VzYmhkbWlidWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM5MzY0NywiZXhwIjoyMDcwOTY5NjQ3fQ.wGQ61l0c9SPELuy6CDACG9hLLKAIFz6HbEWHRD1uJCE'
};

// Project 2: User Info (Private User Data)
const USER_INFO = {
    url: process.env.USER_DB_URL || 'https://evstwxophcfqjypzxkxl.supabase.co',
    anonKey: process.env.USER_DB_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c3R3eG9waGNmcWp5cHp4a3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTUwOTQsImV4cCI6MjA3MDk3MTA5NH0.yhyQb5X1XX_5SMfOlda-ptWPGkBSJ5fHYPTLn4bUlx8',
    serviceKey: process.env.USER_DB_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c3R3eG9waGNmcWp5cHp4a3hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM5NTA5NCwiZXhwIjoyMDcwOTcxMDk0fQ.4NhNI0y0Bfzn432FFDMhDNLEaOnusy3BAm8UfqMcZY4'
};

// Admin credentials from environment
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Initialize Supabase clients with error handling
let productDB, productDBAdmin, userDB, userDBAdmin;

try {
    productDB = createClient(PRODUCT_DATA.url, PRODUCT_DATA.anonKey);
    productDBAdmin = createClient(PRODUCT_DATA.url, PRODUCT_DATA.serviceKey);
    userDB = createClient(USER_INFO.url, USER_INFO.anonKey);
    userDBAdmin = createClient(USER_INFO.url, USER_INFO.serviceKey);
    console.log('Supabase clients initialized successfully');
} catch (error) {
    console.error('Error initializing Supabase clients:', error);
    // Continue anyway - health check should still work
}

const app = express();
const PORT = process.env.PORT || 8080;

// =====================================================
// HEALTH CHECK & ROOT - BEFORE ANY MIDDLEWARE
// =====================================================

// Health check - handle before any middleware
app.get('/health', (req, res) => {
    res.send('OK');
});

// Root endpoint
app.get('/', (req, res) => {
    console.log('Root request received');
    res.send('PerfectRatio Admin Server Running');
});

// Log incoming requests for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Middleware
app.use(cors({
    origin: '*', // Allow all origins in production (configure as needed)
    credentials: true
}));
app.use(express.json());

// Static files - check if directory exists
const publicPath = path.join(__dirname, 'public');
if (require('fs').existsSync(publicPath)) {
    app.use(express.static(publicPath));
    console.log(`Static files serving from: ${publicPath}`);
} else {
    console.log('Warning: public directory not found');
}

// =====================================================
// DATABASE TEST ENDPOINT
// =====================================================

// Get table schema info
app.get('/api/schema/:table', async (req, res) => {
    try {
        const tableName = req.params.table;
        // Query information_schema to get column details
        const { data, error } = await productDB
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', tableName)
            .eq('table_schema', 'public');
        
        if (error) throw error;
        
        res.json({ 
            table: tableName,
            columns: data
        });
    } catch (error) {
        console.error('Schema check error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/test-db', async (req, res) => {
    try {
        console.log('Testing database connection...');
        console.log('Product DB URL:', PRODUCT_DATA.url);
        console.log('Anon Key length:', PRODUCT_DATA.anonKey ? PRODUCT_DATA.anonKey.length : 0);
        console.log('Service Key length:', PRODUCT_DATA.serviceKey ? PRODUCT_DATA.serviceKey.length : 0);
        
        // Test basic connection
        const { data, error } = await productDB
            .from('suppliers')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('Database test error:', error);
            return res.status(500).json({ 
                error: 'Database connection failed',
                details: error.message,
                hint: error.hint,
                code: error.code
            });
        }
        
        // Also test oil_price_tiers table structure
        const { data: tierData, error: tierError } = await productDB
            .from('oil_price_tiers')
            .select('*')
            .limit(1);
        
        res.json({ 
            status: 'Database connected',
            test: 'success',
            data,
            oil_price_tiers_sample: tierData,
            oil_price_tiers_error: tierError
        });
    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({ 
            error: 'Test failed',
            message: error.message
        });
    }
});

// =====================================================
// PRODUCT DATA ENDPOINTS (Public Catalog)
// =====================================================

// Get all suppliers
app.get('/api/suppliers', async (req, res) => {
    try {
        const { data, error } = await productDB
            .from('suppliers')
            .select('*')
            .eq('is_active', true)
            .order('name');
        
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        res.json(data);
    } catch (error) {
        console.error('Error fetching suppliers:', error.message || error);
        res.status(500).json({ 
            error: 'Database error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all base products with supplier info
app.get('/api/bases', async (req, res) => {
    try {
        const { data, error } = await productDB
            .from('base_products')
            .select(`
                *,
                supplier:suppliers(name, website_url),
                price_tiers:base_price_tiers(*)
            `)
            .order('name');
        
        if (error) throw error;
        
        // Flatten for compatibility
        const bases = data.map(base => ({
            ...base,
            supplier_name: base.supplier?.name,
            supplier_website: base.supplier?.website_url,
            price_tiers: base.price_tiers
        }));
        
        res.json(bases);
    } catch (error) {
        console.error('Error fetching bases:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get all fragrance oils with supplier info
app.get('/api/oils', async (req, res) => {
    try {
        const { data, error } = await productDB
            .from('fragrance_oils')
            .select(`
                *,
                supplier:suppliers(name, website_url),
                price_tiers:oil_price_tiers(*),
                ifra_entries(*),
                notes:fragrance_notes(*)
            `)
            .order('name');
        
        if (error) throw error;
        
        // Flatten for compatibility
        const oils = data.map(oil => ({
            ...oil,
            supplier_name: oil.supplier?.name,
            supplier_website: oil.supplier?.website_url,
            price_tiers: oil.price_tiers,
            ifra_entries: oil.ifra_entries,
            fragrance_notes: oil.notes
        }));
        
        res.json(oils);
    } catch (error) {
        console.error('Error fetching oils:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get all vessels with supplier info
app.get('/api/vessels', async (req, res) => {
    try {
        const { data, error } = await productDB
            .from('vessels')
            .select(`
                *,
                supplier:suppliers(name, website_url),
                specifications:vessel_specifications(*)
            `)
            .order('name');
        
        if (error) throw error;
        
        // Flatten for compatibility
        const vessels = data.map(vessel => ({
            ...vessel,
            supplier_name: vessel.supplier?.name,
            supplier_website: vessel.supplier?.website_url,
            specifications: vessel.specifications?.[0] || null
        }));
        
        res.json(vessels);
    } catch (error) {
        console.error('Error fetching vessels:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// =====================================================
// USER DATA ENDPOINTS
// =====================================================

// Middleware to verify auth token
async function requireAuth(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const { data: { user }, error } = await userDBAdmin.auth.getUser(token);
        
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
}

// Sign up new user
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, fullName, companyName } = req.body;
        
        const { data: authData, error: authError } = await userDBAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });
        
        if (authError) throw authError;
        
        // Create user profile
        const { error: profileError } = await userDBAdmin
            .from('profiles')
            .insert({
                id: authData.user.id,
                email,
                full_name: fullName,
                company_name: companyName
            });
        
        if (profileError) throw profileError;
        
        res.json({ 
            message: 'User created successfully',
            user: { id: authData.user.id, email }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Sign in user
app.post('/api/auth/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const { data, error } = await userDB.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        res.json({
            session: data.session,
            user: data.user
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Sign out user
app.post('/api/auth/signout', requireAuth, async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (token) {
            await userDBAdmin.auth.admin.signOut(token);
        }
        
        res.json({ message: 'Signed out successfully' });
    } catch (error) {
        console.error('Signout error:', error);
        res.status(500).json({ error: 'Signout failed' });
    }
});

// Get user's library
app.get('/api/user/library', requireAuth, async (req, res) => {
    try {
        const { data, error } = await userDBAdmin
            .from('library')
            .select('*')
            .eq('user_id', req.user.id);
        
        if (error) throw error;
        
        // Fetch product details from product database
        const enrichedLibrary = await Promise.all(data.map(async (item) => {
            let productDetails = null;
            
            if (item.item_type === 'base') {
                const { data: base } = await productDB
                    .from('base_products')
                    .select('*, suppliers(name)')
                    .eq('id', item.item_id)
                    .single();
                productDetails = base;
            } else if (item.item_type === 'oil') {
                const { data: oil } = await productDB
                    .from('fragrance_oils')
                    .select('*, suppliers(name)')
                    .eq('id', item.item_id)
                    .single();
                productDetails = oil;
            } else if (item.item_type === 'vessel') {
                const { data: vessel } = await productDB
                    .from('vessels')
                    .select('*, suppliers(name)')
                    .eq('id', item.item_id)
                    .single();
                productDetails = vessel;
            }
            
            return {
                ...item,
                product_details: productDetails
            };
        }));
        
        res.json(enrichedLibrary);
    } catch (error) {
        console.error('Error fetching library:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Add item to user's library
app.post('/api/user/library', requireAuth, async (req, res) => {
    try {
        const { item_type, item_id, is_custom, notes } = req.body;
        
        // Verify item exists in product database
        let tableName = '';
        if (item_type === 'base') tableName = 'base_products';
        else if (item_type === 'oil') tableName = 'fragrance_oils';
        else if (item_type === 'vessel') tableName = 'vessels';
        else return res.status(400).json({ error: 'Invalid item type' });
        
        const { data: product, error: productError } = await productDB
            .from(tableName)
            .select('id')
            .eq('id', item_id)
            .single();
        
        if (productError || !product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Add to user's library
        const { data, error } = await userDBAdmin
            .from('library')
            .upsert({
                user_id: req.user.id,
                item_type,
                item_id,
                is_custom,
                notes
            }, {
                onConflict: 'user_id,item_type,item_id'
            })
            .select()
            .single();
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error adding to library:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get user's formulas
app.get('/api/user/formulas', requireAuth, async (req, res) => {
    try {
        const { data, error } = await userDBAdmin
            .from('formulas')
            .select('*')
            .eq('user_id', req.user.id)
            .order('updated_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching formulas:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Create/update formula
app.post('/api/user/formulas', requireAuth, async (req, res) => {
    try {
        const formulaData = {
            ...req.body,
            user_id: req.user.id
        };
        
        const { data, error } = await userDBAdmin
            .from('formulas')
            .insert(formulaData)
            .select()
            .single();
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error saving formula:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get user's inventory
app.get('/api/user/inventory', requireAuth, async (req, res) => {
    try {
        const { data, error } = await userDBAdmin
            .from('inventory')
            .select('*')
            .eq('user_id', req.user.id);
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Update inventory
app.post('/api/user/inventory', requireAuth, async (req, res) => {
    try {
        const inventoryData = {
            ...req.body,
            user_id: req.user.id
        };
        
        const { data, error } = await userDBAdmin
            .from('inventory')
            .upsert(inventoryData, {
                onConflict: 'user_id,item_type,item_id'
            })
            .select()
            .single();
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get user's shopping list
app.get('/api/user/shopping-list', requireAuth, async (req, res) => {
    try {
        const { data, error } = await userDBAdmin
            .from('shopping_list')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('is_purchased', false)
            .order('priority', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching shopping list:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Add to shopping list
app.post('/api/user/shopping-list', requireAuth, async (req, res) => {
    try {
        const listData = {
            ...req.body,
            user_id: req.user.id
        };
        
        const { data, error } = await userDBAdmin
            .from('shopping_list')
            .insert(listData)
            .select()
            .single();
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error adding to shopping list:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// =====================================================
// ADMIN ENDPOINTS
// =====================================================

// Admin authentication
app.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            res.json({ 
                success: true,
                token: 'admin-token-' + Date.now()
            });
        } else {
            res.status(401).json({ error: 'Invalid admin credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Admin logout
app.post('/admin/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out' });
});

// =====================================================
// ADMIN API ENDPOINTS (GET)
// =====================================================

// Admin: Get all suppliers
app.get('/api/admin/suppliers', async (req, res) => {
    try {
        const { data, error } = await productDB
            .from('suppliers')
            .select('*')
            .order('name');
        
        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin: Get all bases
app.get('/api/admin/bases', async (req, res) => {
    try {
        const { data, error } = await productDB
            .from('base_products')
            .select(`
                *,
                supplier:suppliers(name, website_url),
                price_tiers:base_price_tiers(*)
            `)
            .order('name');
        
        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        console.error('Error fetching bases:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin: Get all oils
app.get('/api/admin/oils', async (req, res) => {
    try {
        const { data, error } = await productDB
            .from('fragrance_oils')
            .select(`
                *,
                supplier:suppliers(name, website_url),
                price_tiers:oil_price_tiers(*),
                ifra_entries(*),
                fragrance_notes(*)
            `)
            .order('name');
        
        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        console.error('Error fetching oils:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin: Get all vessels
app.get('/api/admin/vessels', async (req, res) => {
    try {
        const { data, error } = await productDB
            .from('vessels')
            .select(`
                *,
                supplier:suppliers(name, website_url)
            `)
            .order('name');
        
        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        console.error('Error fetching vessels:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin: Get stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        // Get counts from product database
        const [suppliers, bases, oils, vessels] = await Promise.all([
            productDB.from('suppliers').select('*', { count: 'exact', head: true }),
            productDB.from('base_products').select('*', { count: 'exact', head: true }),
            productDB.from('fragrance_oils').select('*', { count: 'exact', head: true }),
            productDB.from('vessels').select('*', { count: 'exact', head: true })
        ]);
        
        // Get counts from user database
        const [users, formulas] = await Promise.all([
            userDB.from('profiles').select('*', { count: 'exact', head: true }),
            userDB.from('formulas').select('*', { count: 'exact', head: true })
        ]);
        
        res.json({
            catalog: {
                suppliers: suppliers.count || 0,
                bases: bases.count || 0,
                oils: oils.count || 0,
                vessels: vessels.count || 0
            },
            users: {
                total: users.count || 0,
                formulas: formulas.count || 0
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// =====================================================
// ADMIN API ENDPOINTS (POST/PUT/DELETE)
// =====================================================

// Test endpoint to check database structure
app.get('/api/admin/test-db', async (req, res) => {
    try {
        // Test if we can query the suppliers table
        const { data: testQuery, error: queryError } = await productDBAdmin
            .from('suppliers')
            .select('*')
            .limit(1);
        
        if (queryError) {
            console.error('Database query error:', queryError);
            return res.status(500).json({ 
                error: 'Database query failed',
                details: queryError.message,
                hint: queryError.hint || 'Check if suppliers table exists'
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Database connection working',
            sampleData: testQuery 
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Database test failed',
            details: error.message 
        });
    }
});

// Admin: Add supplier
app.post('/api/admin/suppliers', async (req, res) => {
    try {
        console.log('Creating supplier with data:', req.body);
        
        // Clean up empty strings to null for optional fields
        const supplierData = {
            name: req.body.name,
            website_url: req.body.website || null,
            contact_email: req.body.email || null,
            contact_phone: req.body.phone || null
        };
        
        console.log('Cleaned supplier data:', supplierData);
        
        const { data, error } = await productDBAdmin
            .from('suppliers')
            .insert(supplierData)
            .select()
            .single();
        
        if (error) {
            console.error('Supabase error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            
            // Return more specific error information
            return res.status(500).json({ 
                error: 'Failed to create supplier',
                details: error.message,
                hint: error.hint || 'Check database permissions and table structure',
                code: error.code
            });
        }
        
        console.log('Supplier created successfully:', data);
        res.json(data);
    } catch (error) {
        console.error('Unexpected error creating supplier:', error);
        res.status(500).json({ 
            error: 'Failed to create supplier',
            details: error.message || 'Unknown error occurred'
        });
    }
});

// Admin: Update supplier
app.put('/api/admin/suppliers/:id', async (req, res) => {
    try {
        console.log('Updating supplier:', req.params.id, 'with data:', req.body);
        
        // Clean up empty strings to null for optional fields
        const supplierData = {
            name: req.body.name,
            website_url: req.body.website || null,
            contact_email: req.body.email || null,
            contact_phone: req.body.phone || null
        };
        
        const { data, error } = await productDBAdmin
            .from('suppliers')
            .update(supplierData)
            .eq('id', req.params.id)
            .select()
            .single();
        
        if (error) {
            console.error('Supabase error updating supplier:', error);
            throw error;
        }
        
        console.log('Supplier updated successfully:', data);
        res.json(data);
    } catch (error) {
        console.error('Error updating supplier:', error.message || error);
        res.status(500).json({ 
            error: 'Failed to update supplier',
            details: error.message 
        });
    }
});

// Admin: Delete supplier
app.delete('/api/admin/suppliers/:id', async (req, res) => {
    try {
        const { error } = await productDBAdmin
            .from('suppliers')
            .delete()
            .eq('id', req.params.id);
        
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin: Add base
app.post('/api/admin/bases', async (req, res) => {
    try {
        const { data, error } = await productDBAdmin
            .from('base_products')
            .insert(req.body)
            .select()
            .single();
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error creating base:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin: Update base
app.put('/api/admin/bases/:id', async (req, res) => {
    try {
        const { data, error } = await productDBAdmin
            .from('base_products')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error updating base:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin: Delete base
app.delete('/api/admin/bases/:id', async (req, res) => {
    try {
        const { error } = await productDBAdmin
            .from('base_products')
            .delete()
            .eq('id', req.params.id);
        
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting base:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin: Add oil
app.post('/api/admin/oils', async (req, res) => {
    try {
        const { price_tiers, ifra_entries, ...oilData } = req.body;
        
        // Insert the oil itself (without price_tiers and ifra_entries)
        const { data: newOil, error: oilError } = await productDBAdmin
            .from('fragrance_oils')
            .insert(oilData)
            .select()
            .single();
        
        if (oilError) throw oilError;
        
        // Handle price tiers if provided
        if (price_tiers && newOil) {
            console.log('Processing price tiers for new oil:', price_tiers);
            
            // Build single row with tier columns
            const tierData = { fragrance_oil_id: newOil.id };
            
            // Extract tier data and build column-based row
            for (let i = 1; i <= 5; i++) {
                const tierName = price_tiers[`tier${i}_name`];
                const tierSize = price_tiers[`tier${i}_size`];
                const tierUnit = price_tiers[`tier${i}_unit`];
                const tierPrice = price_tiers[`tier${i}_price`];
                const tierSku = price_tiers[`tier${i}_sku`];
                
                if (tierSize && tierPrice) {
                    if (tierName) tierData[`tier${i}_name`] = tierName;
                    tierData[`tier${i}_size`] = parseFloat(tierSize);
                    tierData[`tier${i}_unit`] = tierUnit || 'oz';
                    tierData[`tier${i}_price`] = parseFloat(tierPrice);
                    if (tierSku) tierData[`tier${i}_sku`] = tierSku;
                }
            }
            
            // Only insert if we have at least one tier
            if (Object.keys(tierData).length > 1) {
                const { error: tierError } = await productDBAdmin
                    .from('oil_price_tiers')
                    .insert(tierData);
                
                if (tierError) {
                    console.error('Error saving price tiers:', tierError);
                } else {
                    console.log('Successfully saved price tiers');
                }
            }
        }
        
        // Handle IFRA entries if provided
        if (ifra_entries && Array.isArray(ifra_entries) && newOil) {
            const ifraData = ifra_entries.map(entry => ({
                fragrance_oil_id: newOil.id,
                ...entry
            }));
            
            if (ifraData.length > 0) {
                const { error: ifraError } = await productDBAdmin
                    .from('ifra_entries')
                    .insert(ifraData);
                
                if (ifraError) {
                    console.error('Error saving IFRA entries:', ifraError);
                }
            }
        }
        
        res.json(newOil);
    } catch (error) {
        console.error('Error creating oil:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin: Update oil
app.put('/api/admin/oils/:id', async (req, res) => {
    try {
        console.log('Updating oil:', req.params.id);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        const { price_tiers, ifra_entries, ...oilData } = req.body;
        
        // Update the oil itself (without price_tiers and ifra_entries)
        const { data: updatedOil, error: oilError } = await productDBAdmin
            .from('fragrance_oils')
            .update(oilData)
            .eq('id', req.params.id)
            .select()
            .single();
        
        if (oilError) throw oilError;
        
        // Handle price tiers if provided
        if (price_tiers) {
            console.log('Processing price tiers for update:', price_tiers);
            
            // Delete existing price tiers
            await productDBAdmin
                .from('oil_price_tiers')
                .delete()
                .eq('fragrance_oil_id', req.params.id);
            
            // Build single row with tier columns
            const tierData = { fragrance_oil_id: req.params.id };
            
            // Extract tier data and build column-based row
            for (let i = 1; i <= 5; i++) {
                const tierName = price_tiers[`tier${i}_name`];
                const tierSize = price_tiers[`tier${i}_size`];
                const tierUnit = price_tiers[`tier${i}_unit`];
                const tierPrice = price_tiers[`tier${i}_price`];
                const tierSku = price_tiers[`tier${i}_sku`];
                
                if (tierSize && tierPrice) {
                    if (tierName) tierData[`tier${i}_name`] = tierName;
                    tierData[`tier${i}_size`] = parseFloat(tierSize);
                    tierData[`tier${i}_unit`] = tierUnit || 'oz';
                    tierData[`tier${i}_price`] = parseFloat(tierPrice);
                    if (tierSku) tierData[`tier${i}_sku`] = tierSku;
                }
            }
            
            // Only insert if we have at least one tier
            if (Object.keys(tierData).length > 1) {
                const { error: tierError } = await productDBAdmin
                    .from('oil_price_tiers')
                    .insert(tierData);
                
                if (tierError) {
                    console.error('Error saving price tiers:', tierError);
                } else {
                    console.log('Successfully saved price tiers');
                }
            }
        }
        
        // Handle IFRA entries if provided
        if (ifra_entries && Array.isArray(ifra_entries)) {
            // Delete existing IFRA entries
            await productDBAdmin
                .from('ifra_entries')
                .delete()
                .eq('fragrance_oil_id', req.params.id);
            
            // Add new IFRA entries
            const ifraData = ifra_entries.map(entry => ({
                fragrance_oil_id: req.params.id,
                ...entry
            }));
            
            if (ifraData.length > 0) {
                const { error: ifraError } = await productDBAdmin
                    .from('ifra_entries')
                    .insert(ifraData);
                
                if (ifraError) {
                    console.error('Error saving IFRA entries:', ifraError);
                }
            }
        }
        
        res.json(updatedOil);
    } catch (error) {
        console.error('Error updating oil:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin: Delete oil
app.delete('/api/admin/oils/:id', async (req, res) => {
    try {
        const { error } = await productDBAdmin
            .from('fragrance_oils')
            .delete()
            .eq('id', req.params.id);
        
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting oil:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin: Add vessel
app.post('/api/admin/vessels', async (req, res) => {
    try {
        const { data, error } = await productDBAdmin
            .from('vessels')
            .insert(req.body)
            .select()
            .single();
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error creating vessel:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin: Update vessel
app.put('/api/admin/vessels/:id', async (req, res) => {
    try {
        const { data, error } = await productDBAdmin
            .from('vessels')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error updating vessel:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin: Delete vessel
app.delete('/api/admin/vessels/:id', async (req, res) => {
    try {
        const { error } = await productDBAdmin
            .from('vessels')
            .delete()
            .eq('id', req.params.id);
        
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting vessel:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// =====================================================
// ADMIN IMPORT ENDPOINTS
// =====================================================

// Admin: Import suppliers
app.post('/api/admin/import/suppliers', async (req, res) => {
    try {
        const { data } = req.body;
        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        let created = 0, updated = 0;

        for (const item of data) {
            // Check if supplier exists by name
            const { data: existing } = await productDBAdmin
                .from('suppliers')
                .select('id')
                .eq('name', item.name)
                .single();

            if (existing) {
                // Update existing supplier
                const { error } = await productDBAdmin
                    .from('suppliers')
                    .update({
                        contact_email: item.contact_email,
                        contact_phone: item.contact_phone || null,
                        website: item.website || null,
                        address: item.address || null,
                        notes: item.notes || null
                    })
                    .eq('id', existing.id);
                
                if (!error) updated++;
            } else {
                // Create new supplier
                const { error } = await productDBAdmin
                    .from('suppliers')
                    .insert({
                        name: item.name,
                        contact_email: item.contact_email,
                        contact_phone: item.contact_phone || null,
                        website: item.website || null,
                        address: item.address || null,
                        notes: item.notes || null
                    });
                
                if (!error) created++;
            }
        }

        res.json({ success: true, created, updated });
    } catch (error) {
        console.error('Error importing suppliers:', error);
        res.status(500).json({ error: 'Import failed' });
    }
});

// Admin: Import base products
app.post('/api/admin/import/bases', async (req, res) => {
    try {
        const { data } = req.body;
        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        let created = 0, updated = 0;

        for (const item of data) {
            // Get supplier ID by name
            let supplierId = null;
            if (item.supplier_name) {
                const { data: supplier } = await productDBAdmin
                    .from('suppliers')
                    .select('id')
                    .eq('name', item.supplier_name)
                    .single();
                
                supplierId = supplier?.id;
            }

            // Check if base exists by SKU or name
            const { data: existing } = await productDBAdmin
                .from('base_products')
                .select('id')
                .or(`sku.eq.${item.sku || ''},name.eq.${item.name}`)
                .single();

            const baseData = {
                name: item.name,
                product_type: item.product_type,
                supplier_id: supplierId,
                sku: item.sku || null,
                price_per_lb: parseFloat(item.price_per_lb) || 0,
                max_fragrance_load: parseFloat(item.max_fragrance_load) || 10,
                notes: item.notes || null,
                ifra_category: item.ifra_category || null
            };

            if (existing) {
                // Update existing base
                const { error } = await productDBAdmin
                    .from('base_products')
                    .update(baseData)
                    .eq('id', existing.id);
                
                if (!error) updated++;
            } else {
                // Create new base
                const { error } = await productDBAdmin
                    .from('base_products')
                    .insert(baseData);
                
                if (!error) created++;
            }
        }

        res.json({ success: true, created, updated });
    } catch (error) {
        console.error('Error importing base products:', error);
        res.status(500).json({ error: 'Import failed' });
    }
});

// Admin: Import fragrance oils
app.post('/api/admin/import/oils', async (req, res) => {
    try {
        const { data } = req.body;
        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        let created = 0, updated = 0;

        for (const item of data) {
            // Get supplier ID by name
            let supplierId = null;
            if (item.supplier_name) {
                const { data: supplier } = await productDBAdmin
                    .from('suppliers')
                    .select('id')
                    .eq('name', item.supplier_name)
                    .single();
                
                supplierId = supplier?.id;
            }

            // Check if oil exists by SKU or product_name
            const { data: existing } = await productDBAdmin
                .from('fragrance_oils')
                .select('id')
                .or(`sku.eq.${item.sku || ''},product_name.eq.${item.product_name}`)
                .single();

            const oilData = {
                product_name: item.product_name,
                supplier_id: supplierId,
                sku: item.sku || null,
                flash_point: parseFloat(item.flash_point) || null,
                ifra_category_12: parseFloat(item.ifra_category_12) || 100,
                vanillin_pct: parseFloat(item.vanillin_pct) || 0,
                price_tier1: parseFloat(item.price_tier1) || 0,
                price_tier2: parseFloat(item.price_tier2) || null,
                price_tier3: parseFloat(item.price_tier3) || null,
                categories: item.categories || null,
                scent_description: item.scent_description || null
            };

            if (existing) {
                // Update existing oil
                const { error } = await productDBAdmin
                    .from('fragrance_oils')
                    .update(oilData)
                    .eq('id', existing.id);
                
                if (!error) updated++;
            } else {
                // Create new oil
                const { error } = await productDBAdmin
                    .from('fragrance_oils')
                    .insert(oilData);
                
                if (!error) created++;
            }
        }

        res.json({ success: true, created, updated });
    } catch (error) {
        console.error('Error importing fragrance oils:', error);
        res.status(500).json({ error: 'Import failed' });
    }
});

// Admin: Import vessels
app.post('/api/admin/import/vessels', async (req, res) => {
    try {
        const { data } = req.body;
        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        let created = 0, updated = 0;

        for (const item of data) {
            // Get supplier ID by name
            let supplierId = null;
            if (item.supplier_name) {
                const { data: supplier } = await productDBAdmin
                    .from('suppliers')
                    .select('id')
                    .eq('name', item.supplier_name)
                    .single();
                
                supplierId = supplier?.id;
            }

            // Check if vessel exists by SKU or name
            const { data: existing } = await productDBAdmin
                .from('vessels')
                .select('id')
                .or(`sku.eq.${item.sku || ''},name.eq.${item.name}`)
                .single();

            const vesselData = {
                name: item.name,
                vessel_type: item.vessel_type,
                size: parseFloat(item.size),
                size_unit: item.size_unit || 'oz',
                price_per_unit: parseFloat(item.price_per_unit),
                sku: item.sku || null,
                supplier_id: supplierId,
                material: item.material || null,
                color: item.color || null,
                shape: item.shape || null,
                neck_size: item.neck_size || null,
                case_count: parseInt(item.case_count) || 1,
                is_in_library: true
            };

            if (existing) {
                // Update existing vessel
                const { error } = await productDBAdmin
                    .from('vessels')
                    .update(vesselData)
                    .eq('id', existing.id);
                
                if (!error) updated++;
            } else {
                // Create new vessel
                const { error } = await productDBAdmin
                    .from('vessels')
                    .insert(vesselData);
                
                if (!error) created++;
            }
        }

        res.json({ success: true, created, updated });
    } catch (error) {
        console.error('Error importing vessels:', error);
        res.status(500).json({ error: 'Import failed' });
    }
});

// =====================================================
// SERVE ADMIN PANEL
// =====================================================

// Root route - redirect to admin
app.get('/', (req, res) => {
    res.redirect('/admin');
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-peach.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-peach.html'));
});

// =====================================================
// SERVER STATUS ENDPOINT
// =====================================================

app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        environment: process.env.NODE_ENV || 'development',
        databases: {
            productData: {
                name: 'PerfectRatio-product-data',
                url: PRODUCT_DATA.url,
                status: 'connected'
            },
            userInfo: {
                name: 'PerfectRatio-user-data',
                url: USER_INFO.url,
                status: 'connected'
            }
        },
        message: 'Both Supabase databases connected',
        version: '2.0.0'
    });
});

// =====================================================
// ERROR HANDLING
// =====================================================

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Handle process errors - but don't exit immediately
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Don't exit for now to see if this is the issue
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit for now to see if this is the issue
});

// Start server - bind to 0.0.0.0 for Railway
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 PerfectRatio Production Server Running');
    console.log(`📊 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Server listening on 0.0.0.0:${PORT}`);
    console.log('\nDatabase Status:');
    console.log(`✅ Product Data: ${PRODUCT_DATA.url}`);
    console.log(`✅ User Info: ${USER_INFO.url}`);
    console.log('\nEndpoints:');
    console.log(`- Health Check: /health`);
    console.log(`- Product API: /api/suppliers, /api/bases, /api/oils, /api/vessels`);
    console.log(`- User API: /api/user/*`);
    console.log(`- Admin Panel: /admin`);
    console.log(`- Status: /api/status`);
    
    // Test the health endpoint locally
    setTimeout(() => {
        const http = require('http');
        http.get(`http://localhost:${PORT}/health`, (res) => {
            console.log(`\n✅ Local health check successful: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error('❌ Local health check failed:', err.message);
        });
    }, 1000);
});

server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
});
