// Migration script to update database with all required fields
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
    console.log('🚀 Starting database migration to complete schema...');
    
    try {
        // Read the complete schema SQL file
        const schemaSQL = fs.readFileSync(
            path.join(__dirname, 'complete-schema.sql'), 
            'utf8'
        );
        
        // First, backup existing data
        console.log('📦 Backing up existing data...');
        
        const existingSuppliers = await pool.query('SELECT * FROM suppliers');
        const existingBases = await pool.query('SELECT * FROM base_products');
        const existingOils = await pool.query('SELECT * FROM fragrance_oils');
        const existingVessels = await pool.query('SELECT * FROM vessels');
        
        console.log(`Found ${existingSuppliers.rows.length} suppliers`);
        console.log(`Found ${existingBases.rows.length} base products`);
        console.log(`Found ${existingOils.rows.length} fragrance oils`);
        console.log(`Found ${existingVessels.rows.length} vessels`);
        
        // Execute the new schema
        console.log('🔨 Creating new schema...');
        await pool.query(schemaSQL);
        
        // Restore data with new fields
        console.log('♻️ Restoring data with enhanced fields...');
        
        // Restore suppliers
        for (const supplier of existingSuppliers.rows) {
            await pool.query(`
                INSERT INTO suppliers (id, name, email, website_url, phone)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    email = EXCLUDED.email,
                    website_url = EXCLUDED.website_url,
                    phone = EXCLUDED.phone
            `, [supplier.id, supplier.name, supplier.email, supplier.website_url, supplier.phone]);
        }
        
        // Restore base products with new fields
        for (const base of existingBases.rows) {
            await pool.query(`
                INSERT INTO base_products (
                    id, supplier_id, name, max_load_pct, unit_mode,
                    specific_gravity, ifra_category, ifra_category_2,
                    is_dual_purpose, notes, is_in_library, sku,
                    base_type, wax_type, ease_of_use_rating,
                    performance_rating, total_ratings, is_custom
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                ON CONFLICT (id) DO UPDATE SET
                    supplier_id = EXCLUDED.supplier_id,
                    name = EXCLUDED.name,
                    max_load_pct = EXCLUDED.max_load_pct,
                    unit_mode = EXCLUDED.unit_mode,
                    specific_gravity = EXCLUDED.specific_gravity,
                    ifra_category = EXCLUDED.ifra_category,
                    ifra_category_2 = EXCLUDED.ifra_category_2,
                    is_dual_purpose = EXCLUDED.is_dual_purpose,
                    notes = EXCLUDED.notes,
                    is_in_library = EXCLUDED.is_in_library
            `, [
                base.id, base.supplier_id, base.name, base.max_load_pct,
                base.unit_mode, base.specific_gravity, base.ifra_category,
                base.ifra_category_2, base.is_dual_purpose, base.notes,
                base.is_in_library, base.sku, base.base_type, base.wax_type,
                base.ease_of_use_rating || 0, base.performance_rating || 0,
                base.total_ratings || 0, base.is_custom || false
            ]);
        }
        
        // Restore fragrance oils with new fields
        for (const oil of existingOils.rows) {
            await pool.query(`
                INSERT INTO fragrance_oils (
                    id, supplier_id, product_name, sku, flash_point_f,
                    solvent_note, ifra_version, ifra_date, is_in_library,
                    specific_gravity, vanillin_pct, is_favorite,
                    categories, intensity_rating, overall_rating,
                    total_ratings, library_add_count, recent_add_count,
                    unique_user_count, batch_count, is_custom
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
                ON CONFLICT (id) DO UPDATE SET
                    supplier_id = EXCLUDED.supplier_id,
                    product_name = EXCLUDED.product_name,
                    sku = EXCLUDED.sku,
                    flash_point_f = EXCLUDED.flash_point_f,
                    solvent_note = EXCLUDED.solvent_note,
                    ifra_version = EXCLUDED.ifra_version,
                    ifra_date = EXCLUDED.ifra_date,
                    is_in_library = EXCLUDED.is_in_library
            `, [
                oil.id, oil.supplier_id, oil.product_name, oil.sku,
                oil.flash_point_f, oil.solvent_note, oil.ifra_version,
                oil.ifra_date, oil.is_in_library, oil.specific_gravity || 0,
                oil.vanillin_pct || 0, oil.is_favorite || false,
                oil.categories, oil.intensity_rating || 0,
                oil.overall_rating || 0, oil.total_ratings || 0,
                oil.library_add_count || 0, oil.recent_add_count || 0,
                oil.unique_user_count || 0, oil.batch_count || 0,
                oil.is_custom || false
            ]);
        }
        
        // Restore vessels with new fields
        for (const vessel of existingVessels.rows) {
            await pool.query(`
                INSERT INTO vessels (
                    id, supplier_id, name, sku, vessel_type, material,
                    color, size, size_unit, neck_size, shape,
                    price_per_unit, case_count, case_price,
                    minimum_order_quantity, weight_grams, max_fill_volume,
                    recommended_fill_size, overflow_fill_size,
                    is_in_library, notes, product_url, image_url, is_custom
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
                ON CONFLICT (id) DO UPDATE SET
                    supplier_id = EXCLUDED.supplier_id,
                    name = EXCLUDED.name,
                    sku = EXCLUDED.sku,
                    vessel_type = EXCLUDED.vessel_type,
                    material = EXCLUDED.material,
                    color = EXCLUDED.color,
                    size = EXCLUDED.size,
                    size_unit = EXCLUDED.size_unit,
                    neck_size = EXCLUDED.neck_size,
                    shape = EXCLUDED.shape,
                    price_per_unit = EXCLUDED.price_per_unit,
                    case_count = EXCLUDED.case_count,
                    case_price = EXCLUDED.case_price,
                    minimum_order_quantity = EXCLUDED.minimum_order_quantity,
                    weight_grams = EXCLUDED.weight_grams,
                    max_fill_volume = EXCLUDED.max_fill_volume,
                    is_in_library = EXCLUDED.is_in_library,
                    notes = EXCLUDED.notes,
                    product_url = EXCLUDED.product_url,
                    image_url = EXCLUDED.image_url
            `, [
                vessel.id, vessel.supplier_id, vessel.name, vessel.sku,
                vessel.vessel_type, vessel.material, vessel.color,
                vessel.size, vessel.size_unit, vessel.neck_size,
                vessel.shape, vessel.price_per_unit, vessel.case_count || 1,
                vessel.case_price, vessel.minimum_order_quantity || 1,
                vessel.weight_grams, vessel.max_fill_volume,
                vessel.recommended_fill_size, vessel.overflow_fill_size,
                vessel.is_in_library, vessel.notes, vessel.product_url,
                vessel.image_url, vessel.is_custom || false
            ]);
        }
        
        console.log('✅ Migration completed successfully!');
        console.log('📊 Database now has complete schema with all iOS app fields');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run migration
migrate().catch(console.error);