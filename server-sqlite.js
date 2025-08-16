const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs');
const path = require('path');

// Optional authentication dependencies
let bcrypt, jwt, rateLimit, helmet, session, pgSession;
let authEnabled = false;

try {
    bcrypt = require('bcrypt');
    jwt = require('jsonwebtoken');
    rateLimit = require('express-rate-limit');
    helmet = require('helmet');
    session = require('express-session');
    pgSession = require('connect-pg-simple')(session);
    authEnabled = true;
    console.log('✅ Authentication modules loaded - auth enabled');
} catch (error) {
    console.log('⚠️ Authentication modules not found - running without auth');
}

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:ZPFfipCTOMeemqFrdANOKZQFpVZQdygb@junction.proxy.rlwy.net:16050/railway';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
    } else {
        console.log('✅ Connected to PostgreSQL at:', res.rows[0].now);
    }
});

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Security headers
if (helmet) {
    app.use(helmet({
        contentSecurityPolicy: false,
    }));
}

// Session setup with PostgreSQL store
if (session && pgSession) {
    app.use(session({
        store: new pgSession({
            pool: pool,
            tableName: 'session'
        }),
        secret: process.env.SESSION_SECRET || 'change-this-session-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 4 // 4 hours
        }
    }));
}

// Rate limiting
if (rateLimit) {
    const apiLimiter = rateLimit({
        windowMs: 1 * 60 * 1000,
        max: 100
    });
    app.use('/api', apiLimiter);
}

// File upload setup
const upload = multer({ dest: 'uploads/' });

// ========================================
// AUTHENTICATION ENDPOINTS
// ========================================

// Admin login endpoint
app.post('/admin/login', async (req, res) => {
    if (!authEnabled) {
        return res.status(501).json({ error: 'Authentication not enabled' });
    }

    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    try {
        const result = await pool.query(
            'SELECT * FROM admin_users WHERE username = $1',
            [username]
        );
        
        const user = result.rows[0];
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            return res.status(423).json({ 
                error: 'Account locked. Try again later.',
                locked_until: user.locked_until
            });
        }
        
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            const attempts = user.login_attempts + 1;
            let lockedUntil = null;
            
            if (attempts >= 5) {
                lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
            }
            
            await pool.query(
                'UPDATE admin_users SET login_attempts = $1, locked_until = $2 WHERE id = $3',
                [attempts, lockedUntil, user.id]
            );
            
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        await pool.query(
            'UPDATE admin_users SET login_attempts = 0, last_login = NOW() WHERE id = $1',
            [user.id]
        );
        
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET || 'default-secret-change-this',
            { expiresIn: '4h' }
        );
        
        if (req.session) {
            req.session.authenticated = true;
            req.session.user = { id: user.id, username: user.username };
        }
        
        res.json({ 
            token,
            expiresIn: '4h',
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin logout
app.post('/admin/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: 'Could not log out' });
            }
            res.json({ message: 'Logged out successfully' });
        });
    } else {
        res.json({ message: 'Logged out successfully' });
    }
});

// Setup admin user
app.post('/admin/setup', async (req, res) => {
    if (!authEnabled) {
        return res.status(501).json({ error: 'Authentication not enabled' });
    }

    const { username, password, setupKey } = req.body;
    
    if (!username || !password || !setupKey) {
        return res.status(400).json({ error: 'Username, password, and setup key are required' });
    }
    
    if (setupKey !== process.env.SETUP_KEY) {
        return res.status(403).json({ error: 'Invalid setup key' });
    }
    
    try {
        const existingResult = await pool.query('SELECT COUNT(*) FROM admin_users');
        
        if (existingResult.rows[0].count > 0) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }
        
        const hash = await bcrypt.hash(password, 10);
        
        await pool.query(
            'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)',
            [username, hash]
        );
        
        res.json({ 
            message: 'Admin user created successfully',
            username: username
        });
    } catch (error) {
        console.error('Setup error:', error);
        res.status(500).json({ error: 'Failed to create admin user' });
    }
});

// Authentication middleware
function authenticateToken(req, res, next) {
    if (!authEnabled) {
        return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token && !req.session?.authenticated) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid or expired token' });
            }
            req.user = user;
            next();
        });
    } else if (req.session?.authenticated) {
        req.user = req.session.user;
        next();
    }
}

// Apply authentication to write operations
app.use((req, res, next) => {
    if (!authEnabled) {
        return next();
    }

    if (req.method === 'GET') {
        return next();
    }
    
    if (req.path.startsWith('/api') && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
        return authenticateToken(req, res, next);
    }
    
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        authEnabled,
        database: 'PostgreSQL',
        timestamp: new Date().toISOString() 
    });
});

// Stats endpoint
app.get('/api/stats', async (req, res) => {
    try {
        const suppliers = await pool.query('SELECT COUNT(*) FROM suppliers');
        const bases = await pool.query('SELECT COUNT(*) FROM base_products');
        const oils = await pool.query('SELECT COUNT(*) FROM fragrance_oils');
        
        res.json({
            suppliers: parseInt(suppliers.rows[0].count),
            bases: parseInt(bases.rows[0].count),
            oils: parseInt(oils.rows[0].count)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =======================
// SUPPLIERS ENDPOINTS
// =======================

app.get('/api/suppliers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM suppliers ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/suppliers', async (req, res) => {
    const { name, website, email, phone } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    
    try {
        const result = await pool.query(
            'INSERT INTO suppliers (name, website, email, phone) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, website, email, phone]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/suppliers/:id', async (req, res) => {
    const { name, website, email, phone } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE suppliers SET name = $1, website = $2, email = $3, phone = $4 WHERE id = $5 RETURNING *',
            [name, website, email, phone, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/suppliers/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM suppliers WHERE id = $1', [req.params.id]);
        res.json({ message: 'Supplier deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =======================
// BASE PRODUCTS ENDPOINTS
// =======================

app.get('/api/bases', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT b.*, s.name as supplier_name 
            FROM base_products b
            LEFT JOIN suppliers s ON b.supplier_id = s.id
            ORDER BY s.name, b.name
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/bases/library', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT b.*, s.name as supplier_name 
            FROM base_products b
            LEFT JOIN suppliers s ON b.supplier_id = s.id
            WHERE b.is_in_library = true
            ORDER BY s.name, b.name
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/bases', async (req, res) => {
    const {
        supplier_id, name, max_load_pct, unit_mode, 
        specific_gravity, ifra_category, is_dual_purpose, 
        ifra_category_2, notes, is_in_library
    } = req.body;
    
    if (!name || !max_load_pct || !unit_mode) {
        return res.status(400).json({ error: 'Name, max_load_pct, and unit_mode are required' });
    }
    
    try {
        const result = await pool.query(
            `INSERT INTO base_products 
            (supplier_id, name, max_load_pct, unit_mode, specific_gravity, 
             ifra_category, is_dual_purpose, ifra_category_2, notes, is_in_library) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [supplier_id, name, max_load_pct, unit_mode, specific_gravity,
             ifra_category, is_dual_purpose || false, ifra_category_2, notes, is_in_library || false]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/bases/:id', async (req, res) => {
    const {
        supplier_id, name, max_load_pct, unit_mode, 
        specific_gravity, ifra_category, is_dual_purpose, 
        ifra_category_2, notes, is_in_library
    } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE base_products SET 
             supplier_id = $1, name = $2, max_load_pct = $3, unit_mode = $4, 
             specific_gravity = $5, ifra_category = $6, is_dual_purpose = $7, 
             ifra_category_2 = $8, notes = $9, is_in_library = $10
             WHERE id = $11 RETURNING *`,
            [supplier_id, name, max_load_pct, unit_mode, specific_gravity,
             ifra_category, is_dual_purpose || false, ifra_category_2, notes, 
             is_in_library || false, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/bases/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM base_products WHERE id = $1', [req.params.id]);
        res.json({ message: 'Base product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =======================
// FRAGRANCE OILS ENDPOINTS
// =======================

app.get('/api/oils', async (req, res) => {
    try {
        const oilsResult = await pool.query(`
            SELECT o.*, s.name as supplier_name,
                   COUNT(DISTINCT ie.id) as ifra_entry_count
            FROM fragrance_oils o
            LEFT JOIN suppliers s ON o.supplier_id = s.id
            LEFT JOIN ifra_entries ie ON o.id = ie.oil_id
            GROUP BY o.id, s.name
            ORDER BY s.name, o.product_name
        `);
        
        // Get IFRA entries for each oil
        const oils = [];
        for (const oil of oilsResult.rows) {
            const entriesResult = await pool.query(
                'SELECT * FROM ifra_entries WHERE oil_id = $1',
                [oil.id]
            );
            oil.ifra_entries = entriesResult.rows;
            oils.push(oil);
        }
        
        res.json(oils);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/oils/library', async (req, res) => {
    try {
        const oilsResult = await pool.query(`
            SELECT o.*, s.name as supplier_name
            FROM fragrance_oils o
            LEFT JOIN suppliers s ON o.supplier_id = s.id
            WHERE o.is_in_library = true
            ORDER BY s.name, o.product_name
        `);
        
        const oils = [];
        for (const oil of oilsResult.rows) {
            const entriesResult = await pool.query(
                'SELECT * FROM ifra_entries WHERE oil_id = $1',
                [oil.id]
            );
            oil.ifra_entries = entriesResult.rows;
            oils.push(oil);
        }
        
        res.json(oils);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/oils', async (req, res) => {
    const {
        supplier_id, product_name, sku, flash_point_f,
        solvent_note, ifra_version, ifra_date, is_in_library,
        ifra_entries
    } = req.body;
    
    if (!product_name) {
        return res.status(400).json({ error: 'Product name is required' });
    }
    
    try {
        const result = await pool.query(
            `INSERT INTO fragrance_oils 
            (supplier_id, product_name, sku, flash_point_f, solvent_note, 
             ifra_version, ifra_date, is_in_library) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [supplier_id, product_name, sku, flash_point_f, solvent_note,
             ifra_version, ifra_date, is_in_library || false]
        );
        
        const oilId = result.rows[0].id;
        
        // Insert IFRA entries
        if (ifra_entries && ifra_entries.length > 0) {
            for (const entry of ifra_entries) {
                await pool.query(
                    'INSERT INTO ifra_entries (oil_id, product_type_key, category_id, max_pct) VALUES ($1, $2, $3, $4)',
                    [oilId, entry.product_type_key, entry.category_id, entry.max_pct]
                );
            }
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/oils/:id', async (req, res) => {
    const {
        supplier_id, product_name, sku, flash_point_f,
        solvent_note, ifra_version, ifra_date, is_in_library,
        ifra_entries
    } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE fragrance_oils SET 
             supplier_id = $1, product_name = $2, sku = $3, flash_point_f = $4, 
             solvent_note = $5, ifra_version = $6, ifra_date = $7, is_in_library = $8
             WHERE id = $9 RETURNING *`,
            [supplier_id, product_name, sku, flash_point_f, solvent_note,
             ifra_version, ifra_date, is_in_library || false, req.params.id]
        );
        
        // Update IFRA entries
        if (ifra_entries) {
            await pool.query('DELETE FROM ifra_entries WHERE oil_id = $1', [req.params.id]);
            
            for (const entry of ifra_entries) {
                await pool.query(
                    'INSERT INTO ifra_entries (oil_id, product_type_key, category_id, max_pct) VALUES ($1, $2, $3, $4)',
                    [req.params.id, entry.product_type_key, entry.category_id, entry.max_pct]
                );
            }
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/oils/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM fragrance_oils WHERE id = $1', [req.params.id]);
        res.json({ message: 'Fragrance oil deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =======================
// CSV IMPORT ENDPOINTS
// =======================

app.post('/api/import/bases', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const results = [];
    let imported = 0;
    
    fs.createReadStream(req.file.path)
        .pipe(csv.parse({ columns: true, trim: true }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            for (const row of results) {
                try {
                    // Find or create supplier
                    let supplierResult = await pool.query(
                        'SELECT id FROM suppliers WHERE name = $1',
                        [row.supplier]
                    );
                    
                    let supplierId;
                    if (supplierResult.rows.length === 0) {
                        const newSupplier = await pool.query(
                            'INSERT INTO suppliers (name) VALUES ($1) RETURNING id',
                            [row.supplier]
                        );
                        supplierId = newSupplier.rows[0].id;
                    } else {
                        supplierId = supplierResult.rows[0].id;
                    }
                    
                    // Insert base
                    await pool.query(
                        `INSERT INTO base_products 
                        (supplier_id, name, max_load_pct, unit_mode, specific_gravity, 
                         ifra_category, is_dual_purpose, ifra_category_2, notes, is_in_library) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                        [
                            supplierId,
                            row.base_name || row.name,
                            parseFloat(row.base_max_load_pct || row.max_load_pct),
                            row.unit_mode,
                            row.specific_gravity ? parseFloat(row.specific_gravity) : null,
                            row.ifra_category,
                            row.is_dual_purpose === 'true' || row.is_dual_purpose === '1',
                            row.ifra_category_2,
                            row.notes,
                            true
                        ]
                    );
                    imported++;
                } catch (error) {
                    console.error('Error importing row:', error);
                }
            }
            
            fs.unlinkSync(req.file.path);
            res.json({ 
                message: 'Import completed', 
                total: results.length,
                imported: imported 
            });
        })
        .on('error', (err) => {
            fs.unlinkSync(req.file.path);
            res.status(500).json({ error: err.message });
        });
});

app.post('/api/import/oils', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const results = [];
    let imported = 0;
    
    fs.createReadStream(req.file.path)
        .pipe(csv.parse({ columns: true, trim: true }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            for (const row of results) {
                try {
                    // Find or create supplier
                    let supplierResult = await pool.query(
                        'SELECT id FROM suppliers WHERE name = $1',
                        [row.supplier]
                    );
                    
                    let supplierId;
                    if (supplierResult.rows.length === 0) {
                        const newSupplier = await pool.query(
                            'INSERT INTO suppliers (name) VALUES ($1) RETURNING id',
                            [row.supplier]
                        );
                        supplierId = newSupplier.rows[0].id;
                    } else {
                        supplierId = supplierResult.rows[0].id;
                    }
                    
                    // Insert oil
                    const oilResult = await pool.query(
                        `INSERT INTO fragrance_oils 
                        (supplier_id, product_name, sku, flash_point_f, solvent_note, 
                         ifra_version, ifra_date, is_in_library) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                        [
                            supplierId,
                            row.product_name,
                            row.sku,
                            row.flash_point_f ? parseInt(row.flash_point_f) : null,
                            row.solvent_note,
                            row.ifra_version,
                            row.ifra_date,
                            true
                        ]
                    );
                    
                    const oilId = oilResult.rows[0].id;
                    
                    // Process IFRA columns
                    for (const key of Object.keys(row)) {
                        if (key.startsWith('ifra__')) {
                            const productType = key.substring(6);
                            const maxPct = parseFloat(row[key]);
                            
                            if (!isNaN(maxPct) && maxPct > 0) {
                                await pool.query(
                                    'INSERT INTO ifra_entries (oil_id, product_type_key, category_id, max_pct) VALUES ($1, $2, $3, $4)',
                                    [oilId, productType, '', maxPct]
                                );
                            }
                        }
                    }
                    
                    imported++;
                } catch (error) {
                    console.error('Error importing row:', error);
                }
            }
            
            fs.unlinkSync(req.file.path);
            res.json({ 
                message: 'Import completed', 
                total: results.length,
                imported: imported 
            });
        })
        .on('error', (err) => {
            fs.unlinkSync(req.file.path);
            res.status(500).json({ error: err.message });
        });
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ========================================
    🚀 PerfectRatio Server Running
    ========================================
    📍 Port: ${PORT}
    🔐 Auth: ${authEnabled ? 'Enabled' : 'Disabled'}
    🗄️  Database: PostgreSQL
    📱 API: http://localhost:${PORT}/api
    💻 Admin: http://localhost:${PORT}
    ========================================
    `);
});
