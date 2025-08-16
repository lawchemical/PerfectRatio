// migrate-to-postgres.js
// This script creates the PostgreSQL schema

const { Pool } = require('pg');

// Get database URL from environment or use Railway's
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    console.log('Set it with: export DATABASE_URL="your-postgres-url-from-railway"');
    process.exit(1);
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function createTables() {
    try {
        console.log('🚀 Starting PostgreSQL migration...');
        
        // Create suppliers table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS suppliers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                website VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created suppliers table');

        // Create base_products table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS base_products (
                id SERIAL PRIMARY KEY,
                supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
                name VARCHAR(255) NOT NULL,
                max_load_pct DECIMAL(5,2) NOT NULL,
                unit_mode VARCHAR(50) NOT NULL,
                specific_gravity DECIMAL(5,3),
                ifra_category VARCHAR(10),
                is_dual_purpose BOOLEAN DEFAULT FALSE,
                ifra_category_2 VARCHAR(10),
                notes TEXT,
                is_in_library BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created base_products table');

        // Create fragrance_oils table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS fragrance_oils (
                id SERIAL PRIMARY KEY,
                supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
                product_name VARCHAR(255) NOT NULL,
                sku VARCHAR(100),
                flash_point_f INTEGER,
                solvent_note TEXT,
                ifra_version VARCHAR(50),
                ifra_date DATE,
                is_in_library BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created fragrance_oils table');

        // Create ifra_entries table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ifra_entries (
                id SERIAL PRIMARY KEY,
                oil_id INTEGER REFERENCES fragrance_oils(id) ON DELETE CASCADE,
                product_type_key VARCHAR(50),
                category_id VARCHAR(10),
                max_pct DECIMAL(5,2),
                UNIQUE(oil_id, product_type_key)
            )
        `);
        console.log('✅ Created ifra_entries table');

        // Create admin_users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                last_login TIMESTAMP,
                login_attempts INTEGER DEFAULT 0,
                locked_until TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created admin_users table');

        // Create indexes for better performance
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_base_products_supplier ON base_products(supplier_id);
            CREATE INDEX IF NOT EXISTS idx_fragrance_oils_supplier ON fragrance_oils(supplier_id);
            CREATE INDEX IF NOT EXISTS idx_ifra_entries_oil ON ifra_entries(oil_id);
            CREATE INDEX IF NOT EXISTS idx_base_products_library ON base_products(is_in_library);
            CREATE INDEX IF NOT EXISTS idx_fragrance_oils_library ON fragrance_oils(is_in_library);
        `);
        console.log('✅ Created indexes');

        // Create session table for connect-pg-simple
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "session" (
                "sid" varchar NOT NULL COLLATE "default",
                "sess" json NOT NULL,
                "expire" timestamp(6) NOT NULL,
                CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
            ) WITH (OIDS=FALSE);
            
            CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
        `);
        console.log('✅ Created session table');

        console.log('\n========================================');
        console.log('🎉 PostgreSQL migration completed successfully!');
        console.log('========================================\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Add some sample data (optional)
async function addSampleData() {
    try {
        // Check if we already have data
        const result = await pool.query('SELECT COUNT(*) FROM suppliers');
        if (result.rows[0].count > 0) {
            console.log('📊 Database already has data, skipping sample data');
            return;
        }

        console.log('📊 Adding sample data...');

        // Add sample suppliers
        await pool.query(`
            INSERT INTO suppliers (name, website, email) VALUES
            ('Makesy', 'https://makesy.com', 'support@makesy.com'),
            ('CandleScience', 'https://candlescience.com', 'info@candlescience.com'),
            ('Brambleberry', 'https://brambleberry.com', 'info@brambleberry.com')
        `);

        console.log('✅ Added sample suppliers');

    } catch (error) {
        console.error('Warning: Could not add sample data:', error.message);
    }
}

// Run migration
async function migrate() {
    await createTables();
    await addSampleData();
    process.exit(0);
}

migrate();
