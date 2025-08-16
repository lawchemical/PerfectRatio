// server-enhanced.js
// Enhanced API endpoints to handle all new fields

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs');
const path = require('path');

// Copy authentication setup from original...
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
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/perfectratio';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Database initialization function
async function initializeDatabase() {
    console.log('🔧 Initializing database tables...');
    
    try {
        // Create vessels table if it doesn't exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vessels (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                supplier_id UUID,
                name VARCHAR(255) NOT NULL,
                sku VARCHAR(100),
                vessel_type VARCHAR(50) DEFAULT 'bottle',
                material VARCHAR(50),
                color VARCHAR(50),
                size DECIMAL(10,2) DEFAULT 0,
                size_unit VARCHAR(10) DEFAULT 'oz',
                neck_size VARCHAR(20),
                shape VARCHAR(50),
                price_per_unit DECIMAL(10,2) DEFAULT 0,
                case_count INTEGER DEFAULT 1,
                case_price DECIMAL(10,2),
                minimum_order_quantity INTEGER DEFAULT 1,
                weight_grams DECIMAL(10,2),
                max_fill_volume DECIMAL(10,2),
                is_in_library BOOLEAN DEFAULT FALSE,
                notes TEXT,
                product_url TEXT,
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Vessels table ready');
        
        // Ensure other tables exist with proper structure
        await pool.query(`
            CREATE TABLE IF NOT EXISTS suppliers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                website_url TEXT,
                phone VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS base_products (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                supplier_id UUID,
                name VARCHAR(255) NOT NULL,
                max_load_pct DECIMAL(5,2) DEFAULT 0,
                unit_mode VARCHAR(20) DEFAULT 'weight',
                specific_gravity DECIMAL(5,3),
                ifra_category VARCHAR(20),
                ifra_category_2 VARCHAR(20),
                is_dual_purpose BOOLEAN DEFAULT FALSE,
                notes TEXT,
                is_in_library BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS fragrance_oils (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                supplier_id UUID,
                product_name VARCHAR(255) NOT NULL,
                sku VARCHAR(100),
                flash_point_f INTEGER,
                solvent_note VARCHAR(100),
                ifra_version VARCHAR(100),
                ifra_date DATE,
                is_in_library BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ All core tables initialized');
        
    } catch (error) {
        console.error('⚠️ Database initialization warning:', error.message);
        // Don't throw - let the server continue
    }
}

// Initialize database on startup
initializeDatabase().catch(console.error);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ========================================
// ENHANCED API ENDPOINTS
// ========================================

// Stats endpoint for admin dashboard
app.get('/api/stats', async (req, res) => {
    try {
        const [suppliers, bases, oils, vessels] = await Promise.all([
            pool.query('SELECT COUNT(*) as count FROM suppliers'),
            pool.query('SELECT COUNT(*) as count FROM base_products'),
            pool.query('SELECT COUNT(*) as count FROM fragrance_oils'),
            pool.query('SELECT COUNT(*) as count FROM vessels')
        ]);
        
        res.json({
            suppliers: parseInt(suppliers.rows[0]?.count || 0),
            bases: parseInt(bases.rows[0]?.count || 0),
            oils: parseInt(oils.rows[0]?.count || 0),
            vessels: parseInt(vessels.rows[0]?.count || 0)
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ 
            suppliers: 0,
            bases: 0,
            oils: 0,
            vessels: 0
        });
    }
});

// Get all bases with enhanced fields
app.get('/api/bases', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                b.*,
                s.name as supplier_name,
                pd.theme_family,
                pd.scent_description,
                pd.usage_notes,
                pd.product_url,
                pt.tier1_size, pt.tier1_unit, pt.tier1_price,
                pt.tier2_size, pt.tier2_unit, pt.tier2_price,
                pt.tier3_size, pt.tier3_unit, pt.tier3_price,
                pt.tier4_size, pt.tier4_unit, pt.tier4_price,
                pt.tier5_size, pt.tier5_unit, pt.tier5_price,
                i.quantity_on_hand, i.unit as inventory_unit, i.location
            FROM base_products b
            LEFT JOIN suppliers s ON b.supplier_id = s.id
            LEFT JOIN product_details pd ON pd.product_id = b.id AND pd.product_type = 'base'
            LEFT JOIN price_tiers pt ON pt.product_id = b.id AND pt.product_type = 'base' AND pt.supplier_id = b.supplier_id
            LEFT JOIN inventory i ON i.product_id = b.id AND i.product_type = 'base'
            ORDER BY s.name, b.name
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching bases:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get all oils with enhanced fields
app.get('/api/oils', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                o.*,
                s.name as supplier_name,
                pd.theme_family,
                pd.fragrance_notes_top,
                pd.fragrance_notes_middle,
                pd.fragrance_notes_base,
                pd.scent_description,
                pd.soap_acceleration,
                pd.usage_notes,
                pd.blending_notes,
                pd.product_url,
                pt.tier1_size, pt.tier1_unit, pt.tier1_price,
                pt.tier2_size, pt.tier2_unit, pt.tier2_price,
                pt.tier3_size, pt.tier3_unit, pt.tier3_price,
                pt.tier4_size, pt.tier4_unit, pt.tier4_price,
                pt.tier5_size, pt.tier5_unit, pt.tier5_price,
                i.quantity_on_hand, i.unit as inventory_unit, i.location,
                array_agg(DISTINCT fc.category) as categories,
                array_agg(DISTINCT json_build_object(
                    'product_type_key', ie.product_type_key,
                    'category_id', ie.category_id,
                    'max_pct', ie.max_pct
                )) as ifra_entries
            FROM fragrance_oils o
            LEFT JOIN suppliers s ON o.supplier_id = s.id
            LEFT JOIN product_details pd ON pd.product_id = o.id AND pd.product_type = 'oil'
            LEFT JOIN price_tiers pt ON pt.product_id = o.id AND pt.product_type = 'oil' AND pt.supplier_id = o.supplier_id
            LEFT JOIN inventory i ON i.product_id = o.id AND i.product_type = 'oil'
            LEFT JOIN fragrance_categories fc ON fc.oil_id = o.id
            LEFT JOIN ifra_entries ie ON ie.oil_id = o.id
            GROUP BY o.id, s.name, pd.theme_family, pd.fragrance_notes_top, pd.fragrance_notes_middle,
                     pd.fragrance_notes_base, pd.scent_description, pd.soap_acceleration, pd.usage_notes,
                     pd.blending_notes, pd.product_url,
                     pt.tier1_size, pt.tier1_unit, pt.tier1_price,
                     pt.tier2_size, pt.tier2_unit, pt.tier2_price,
                     pt.tier3_size, pt.tier3_unit, pt.tier3_price,
                     pt.tier4_size, pt.tier4_unit, pt.tier4_price,
                     pt.tier5_size, pt.tier5_unit, pt.tier5_price,
                     i.quantity_on_hand, i.unit, i.location
            ORDER BY s.name, o.name
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching oils:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Update base with all fields
app.put('/api/bases/:id', async (req, res) => {
    const { id } = req.params;
    const {
        supplier_id, name, max_load_pct, unit_mode, specific_gravity,
        ifra_category, is_dual_purpose, ifra_category_2, notes, is_in_library,
        ease_of_use_rating, performance_rating, total_ratings,
        library_add_count, batch_count,
        // Product details
        theme_family, scent_description, usage_notes, product_url,
        // Price tiers
        tier1_size, tier1_unit, tier1_price,
        tier2_size, tier2_unit, tier2_price,
        tier3_size, tier3_unit, tier3_price,
        tier4_size, tier4_unit, tier4_price,
        tier5_size, tier5_unit, tier5_price,
        // Inventory
        quantity_on_hand, inventory_unit, location
    } = req.body;
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Update base product
        await client.query(`
            UPDATE base_products 
            SET supplier_id = $1, name = $2, max_load_pct = $3, unit_mode = $4,
                specific_gravity = $5, ifra_category = $6, is_dual_purpose = $7,
                ifra_category_2 = $8, notes = $9, is_in_library = $10,
                ease_of_use_rating = $11, performance_rating = $12, total_ratings = $13,
                library_add_count = $14, batch_count = $15,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $16
        `, [supplier_id, name, max_load_pct, unit_mode, specific_gravity,
            ifra_category, is_dual_purpose, ifra_category_2, notes, is_in_library,
            ease_of_use_rating || 0, performance_rating || 0, total_ratings || 0,
            library_add_count || 0, batch_count || 0, id]);
        
        // Update or insert product details
        if (theme_family || scent_description || usage_notes || product_url) {
            await client.query(`
                INSERT INTO product_details (product_id, product_type, theme_family, scent_description, usage_notes, product_url)
                VALUES ($1, 'base', $2, $3, $4, $5)
                ON CONFLICT (product_id, product_type) 
                DO UPDATE SET 
                    theme_family = EXCLUDED.theme_family,
                    scent_description = EXCLUDED.scent_description,
                    usage_notes = EXCLUDED.usage_notes,
                    product_url = EXCLUDED.product_url,
                    updated_at = CURRENT_TIMESTAMP
            `, [id, theme_family, scent_description, usage_notes, product_url]);
        }
        
        // Update or insert price tiers
        if (tier1_size || tier2_size || tier3_size || tier4_size || tier5_size) {
            await client.query(`
                INSERT INTO price_tiers (
                    product_id, product_type, supplier_id,
                    tier1_size, tier1_unit, tier1_price,
                    tier2_size, tier2_unit, tier2_price,
                    tier3_size, tier3_unit, tier3_price,
                    tier4_size, tier4_unit, tier4_price,
                    tier5_size, tier5_unit, tier5_price
                )
                VALUES ($1, 'base', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                ON CONFLICT (product_id, product_type, supplier_id)
                DO UPDATE SET 
                    tier1_size = EXCLUDED.tier1_size, tier1_unit = EXCLUDED.tier1_unit, tier1_price = EXCLUDED.tier1_price,
                    tier2_size = EXCLUDED.tier2_size, tier2_unit = EXCLUDED.tier2_unit, tier2_price = EXCLUDED.tier2_price,
                    tier3_size = EXCLUDED.tier3_size, tier3_unit = EXCLUDED.tier3_unit, tier3_price = EXCLUDED.tier3_price,
                    tier4_size = EXCLUDED.tier4_size, tier4_unit = EXCLUDED.tier4_unit, tier4_price = EXCLUDED.tier4_price,
                    tier5_size = EXCLUDED.tier5_size, tier5_unit = EXCLUDED.tier5_unit, tier5_price = EXCLUDED.tier5_price,
                    last_updated = CURRENT_TIMESTAMP
            `, [id, supplier_id,
                tier1_size, tier1_unit || 'oz', tier1_price,
                tier2_size, tier2_unit || 'oz', tier2_price,
                tier3_size, tier3_unit || 'oz', tier3_price,
                tier4_size, tier4_unit || 'oz', tier4_price,
                tier5_size, tier5_unit || 'oz', tier5_price]);
        }
        
        // Update or insert inventory
        if (quantity_on_hand !== undefined) {
            await client.query(`
                INSERT INTO inventory (product_id, product_type, quantity_on_hand, unit, location)
                VALUES ($1, 'base', $2, $3, $4)
                ON CONFLICT (product_id, product_type)
                DO UPDATE SET 
                    quantity_on_hand = EXCLUDED.quantity_on_hand,
                    unit = EXCLUDED.unit,
                    location = EXCLUDED.location,
                    last_updated = CURRENT_TIMESTAMP
            `, [id, quantity_on_hand, inventory_unit || 'oz', location]);
        }
        
        await client.query('COMMIT');
        res.json({ message: 'Base updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating base:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        client.release();
    }
});

// Update oil with all fields
app.put('/api/oils/:id', async (req, res) => {
    const { id } = req.params;
    const {
        supplier_id, name, sku, flash_point_f, solvent_note,
        ifra_version, ifra_date, is_favorite, is_in_library,
        specific_gravity, vanillin_pct,
        intensity_rating, overall_rating, total_ratings,
        library_add_count, batch_count,
        // Product details
        theme_family, fragrance_notes_top, fragrance_notes_middle, fragrance_notes_base,
        scent_description, soap_acceleration, usage_notes, blending_notes, product_url,
        // Price tiers
        tier1_size, tier1_unit, tier1_price,
        tier2_size, tier2_unit, tier2_price,
        tier3_size, tier3_unit, tier3_price,
        tier4_size, tier4_unit, tier4_price,
        tier5_size, tier5_unit, tier5_price,
        // Inventory
        quantity_on_hand, inventory_unit, location,
        // Categories and IFRA
        categories, ifra_entries
    } = req.body;
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Update fragrance oil
        await client.query(`
            UPDATE fragrance_oils 
            SET supplier_id = $1, name = $2, sku = $3, flash_point_f = $4,
                solvent_note = $5, ifra_version = $6, ifra_date = $7,
                is_favorite = $8, is_in_library = $9,
                specific_gravity = $10, vanillin_pct = $11,
                intensity_rating = $12, overall_rating = $13, total_ratings = $14,
                library_add_count = $15, batch_count = $16,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $17
        `, [supplier_id, name, sku, flash_point_f, solvent_note,
            ifra_version, ifra_date, is_favorite, is_in_library,
            specific_gravity, vanillin_pct,
            intensity_rating || 0, overall_rating || 0, total_ratings || 0,
            library_add_count || 0, batch_count || 0, id]);
        
        // Update or insert product details
        if (theme_family || fragrance_notes_top || fragrance_notes_middle || fragrance_notes_base ||
            scent_description || soap_acceleration || usage_notes || blending_notes || product_url) {
            await client.query(`
                INSERT INTO product_details (
                    product_id, product_type, theme_family,
                    fragrance_notes_top, fragrance_notes_middle, fragrance_notes_base,
                    scent_description, soap_acceleration, usage_notes, blending_notes, product_url
                )
                VALUES ($1, 'oil', $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (product_id, product_type) 
                DO UPDATE SET 
                    theme_family = EXCLUDED.theme_family,
                    fragrance_notes_top = EXCLUDED.fragrance_notes_top,
                    fragrance_notes_middle = EXCLUDED.fragrance_notes_middle,
                    fragrance_notes_base = EXCLUDED.fragrance_notes_base,
                    scent_description = EXCLUDED.scent_description,
                    soap_acceleration = EXCLUDED.soap_acceleration,
                    usage_notes = EXCLUDED.usage_notes,
                    blending_notes = EXCLUDED.blending_notes,
                    product_url = EXCLUDED.product_url,
                    updated_at = CURRENT_TIMESTAMP
            `, [id, theme_family, fragrance_notes_top, fragrance_notes_middle, fragrance_notes_base,
                scent_description, soap_acceleration, usage_notes, blending_notes, product_url]);
        }
        
        // Update or insert price tiers
        if (tier1_size || tier2_size || tier3_size || tier4_size || tier5_size) {
            await client.query(`
                INSERT INTO price_tiers (
                    product_id, product_type, supplier_id,
                    tier1_size, tier1_unit, tier1_price,
                    tier2_size, tier2_unit, tier2_price,
                    tier3_size, tier3_unit, tier3_price,
                    tier4_size, tier4_unit, tier4_price,
                    tier5_size, tier5_unit, tier5_price
                )
                VALUES ($1, 'oil', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                ON CONFLICT (product_id, product_type, supplier_id)
                DO UPDATE SET 
                    tier1_size = EXCLUDED.tier1_size, tier1_unit = EXCLUDED.tier1_unit, tier1_price = EXCLUDED.tier1_price,
                    tier2_size = EXCLUDED.tier2_size, tier2_unit = EXCLUDED.tier2_unit, tier2_price = EXCLUDED.tier2_price,
                    tier3_size = EXCLUDED.tier3_size, tier3_unit = EXCLUDED.tier3_unit, tier3_price = EXCLUDED.tier3_price,
                    tier4_size = EXCLUDED.tier4_size, tier4_unit = EXCLUDED.tier4_unit, tier4_price = EXCLUDED.tier4_price,
                    tier5_size = EXCLUDED.tier5_size, tier5_unit = EXCLUDED.tier5_unit, tier5_price = EXCLUDED.tier5_price,
                    last_updated = CURRENT_TIMESTAMP
            `, [id, supplier_id,
                tier1_size, tier1_unit || 'oz', tier1_price,
                tier2_size, tier2_unit || 'oz', tier2_price,
                tier3_size, tier3_unit || 'oz', tier3_price,
                tier4_size, tier4_unit || 'oz', tier4_price,
                tier5_size, tier5_unit || 'oz', tier5_price]);
        }
        
        // Update or insert inventory
        if (quantity_on_hand !== undefined) {
            await client.query(`
                INSERT INTO inventory (product_id, product_type, quantity_on_hand, unit, location)
                VALUES ($1, 'oil', $2, $3, $4)
                ON CONFLICT (product_id, product_type)
                DO UPDATE SET 
                    quantity_on_hand = EXCLUDED.quantity_on_hand,
                    unit = EXCLUDED.unit,
                    location = EXCLUDED.location,
                    last_updated = CURRENT_TIMESTAMP
            `, [id, quantity_on_hand, inventory_unit || 'oz', location]);
        }
        
        // Update categories
        if (categories && Array.isArray(categories)) {
            // Delete existing categories
            await client.query('DELETE FROM fragrance_categories WHERE oil_id = $1', [id]);
            
            // Insert new categories
            for (const category of categories) {
                await client.query(
                    'INSERT INTO fragrance_categories (oil_id, category) VALUES ($1, $2)',
                    [id, category]
                );
            }
        }
        
        // Update IFRA entries
        if (ifra_entries && Array.isArray(ifra_entries)) {
            // Delete existing entries
            await client.query('DELETE FROM ifra_entries WHERE oil_id = $1', [id]);
            
            // Insert new entries
            for (const entry of ifra_entries) {
                await client.query(
                    'INSERT INTO ifra_entries (oil_id, product_type_key, category_id, max_pct) VALUES ($1, $2, $3, $4)',
                    [id, entry.product_type_key, entry.category_id, entry.max_pct]
                );
            }
        }
        
        await client.query('COMMIT');
        res.json({ message: 'Oil updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating oil:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        client.release();
    }
});

// Get formulas
app.get('/api/formulas', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                f.*,
                json_agg(DISTINCT jsonb_build_object(
                    'id', fb.id,
                    'base_product_id', fb.base_product_id,
                    'base_product_name', fb.base_product_name,
                    'percentage', fb.percentage,
                    'sort_order', fb.sort_order
                )) FILTER (WHERE fb.id IS NOT NULL) as formula_bases,
                json_agg(DISTINCT jsonb_build_object(
                    'id', fo.id,
                    'fragrance_oil_id', fo.fragrance_oil_id,
                    'oil_name', fo.oil_name,
                    'percentage', fo.percentage,
                    'sort_order', fo.sort_order
                )) FILTER (WHERE fo.id IS NOT NULL) as formula_oils
            FROM formulas f
            LEFT JOIN formula_bases fb ON fb.formula_id = f.id
            LEFT JOIN formula_oils fo ON fo.formula_id = f.id
            GROUP BY f.id
            ORDER BY f.updated_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching formulas:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get shopping lists
app.get('/api/shopping-lists', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                sl.*,
                json_agg(DISTINCT jsonb_build_object(
                    'id', sli.id,
                    'item_id', sli.item_id,
                    'item_type', sli.item_type,
                    'item_name', sli.item_name,
                    'supplier_name', sli.supplier_name,
                    'quantity_to_purchase', sli.quantity_to_purchase,
                    'quantity_on_hand', sli.quantity_on_hand,
                    'unit_type', sli.unit_type,
                    'direct_cost', sli.direct_cost,
                    'indirect_cost', sli.indirect_cost,
                    'is_purchased', sli.is_purchased
                )) FILTER (WHERE sli.id IS NOT NULL) as items
            FROM shopping_lists sl
            LEFT JOIN shopping_list_items sli ON sli.shopping_list_id = sl.id
            GROUP BY sl.id
            ORDER BY sl.modified_date DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching shopping lists:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Keep original authentication endpoints...
// (Copy the rest of the authentication code from server.js)

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Enhanced server running on port ${PORT}`);
    console.log(`📊 Database: ${DATABASE_URL}`);
    console.log(`🔐 Authentication: ${authEnabled ? 'Enabled' : 'Disabled'}`);
});