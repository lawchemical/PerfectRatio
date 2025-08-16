// Add this initialization code at the beginning of your server.js file
// Right after creating the pool connection

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
        
        // Check/create suppliers table
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
        console.log('✅ Suppliers table ready');
        
        // Check/create base_products table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS base_products (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                supplier_id UUID,
                name VARCHAR(255) NOT NULL,
                sku VARCHAR(100),
                base_type VARCHAR(100),
                max_load_pct DECIMAL(5,2) DEFAULT 0,
                unit_mode VARCHAR(20) DEFAULT 'weight',
                specific_gravity DECIMAL(5,3),
                ifra_category VARCHAR(20),
                ifra_category_2 VARCHAR(20),
                is_dual_purpose BOOLEAN DEFAULT FALSE,
                wax_type VARCHAR(100),
                notes TEXT,
                is_in_library BOOLEAN DEFAULT FALSE,
                is_custom BOOLEAN DEFAULT FALSE,
                ease_of_use_rating DECIMAL(3,2),
                performance_rating DECIMAL(3,2),
                total_ratings INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Base products table ready');
        
        // Check/create fragrance_oils table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS fragrance_oils (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                supplier_id UUID,
                product_name VARCHAR(255) NOT NULL,
                sku VARCHAR(100),
                flash_point_f INTEGER,
                solvent_note VARCHAR(100),
                specific_gravity DECIMAL(5,3),
                vanillin_pct DECIMAL(5,2),
                ifra_version VARCHAR(100),
                ifra_date DATE,
                is_in_library BOOLEAN DEFAULT FALSE,
                is_custom BOOLEAN DEFAULT FALSE,
                is_favorite BOOLEAN DEFAULT FALSE,
                categories TEXT,
                intensity_rating DECIMAL(3,2),
                overall_rating DECIMAL(3,2),
                total_ratings INTEGER DEFAULT 0,
                library_add_count INTEGER DEFAULT 0,
                recent_add_count INTEGER DEFAULT 0,
                unique_user_count INTEGER DEFAULT 0,
                batch_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Fragrance oils table ready');
        
        // Check/create ifra_entries table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ifra_entries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                oil_id UUID,
                product_type_key VARCHAR(100) NOT NULL,
                category_id VARCHAR(20),
                max_pct DECIMAL(5,2) DEFAULT 0,
                certificate_version VARCHAR(100),
                certificate_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ IFRA entries table ready');
        
        // Check/create product_details table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS product_details (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                product_id UUID NOT NULL,
                product_type VARCHAR(50) NOT NULL,
                fragrance_notes_top TEXT,
                fragrance_notes_middle TEXT,
                fragrance_notes_base TEXT,
                theme_family VARCHAR(255),
                scent_description TEXT,
                soap_acceleration VARCHAR(100),
                product_url TEXT,
                usage_notes TEXT,
                blending_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Product details table ready');
        
        // Check/create price_tiers table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS price_tiers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                product_id UUID NOT NULL,
                product_type VARCHAR(50) NOT NULL,
                supplier_id UUID,
                tier1_size DECIMAL(10,2),
                tier1_unit VARCHAR(20),
                tier1_price DECIMAL(10,2),
                tier2_size DECIMAL(10,2),
                tier2_unit VARCHAR(20),
                tier2_price DECIMAL(10,2),
                tier3_size DECIMAL(10,2),
                tier3_unit VARCHAR(20),
                tier3_price DECIMAL(10,2),
                tier4_size DECIMAL(10,2),
                tier4_unit VARCHAR(20),
                tier4_price DECIMAL(10,2),
                tier5_size DECIMAL(10,2),
                tier5_unit VARCHAR(20),
                tier5_price DECIMAL(10,2),
                notes TEXT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Price tiers table ready');
        
        console.log('✅ Database initialization complete!');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        // Don't throw - let the server start anyway
    }
}

// Call this function before starting the server
// Add this right before your app.listen() call:
initializeDatabase().then(() => {
    console.log('🚀 Database ready, starting server...');
});