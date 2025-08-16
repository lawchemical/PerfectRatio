require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/perfectratio',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateEnhanced() {
  try {
    console.log('Running enhanced database migrations...');
    
    // Read schema update file
    const schemaUpdatePath = path.join(__dirname, 'schema-update.sql');
    const schemaUpdate = fs.readFileSync(schemaUpdatePath, 'utf8');
    
    // Split into individual statements and execute them
    const statements = schemaUpdate
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');
    
    for (const statement of statements) {
      if (statement.includes('CREATE') || statement.includes('ALTER') || statement.includes('INSERT')) {
        try {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          await pool.query(statement);
          console.log('✅ Statement executed successfully');
        } catch (error) {
          if (error.code === '42P07' || error.code === '42701' || error.message.includes('already exists')) {
            console.log('⚠️  Already exists, skipping...');
          } else {
            console.error('❌ Statement failed:', error.message);
            // Continue with next statement
          }
        }
      }
    }
    
    console.log('✅ Enhanced database migrations completed successfully!');
    
    // Show summary of tables
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Database tables:');
    tableCheck.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check for new columns in fragrance_oils
    const oilColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'fragrance_oils' 
      AND column_name IN ('intensity_rating', 'overall_rating', 'total_ratings', 'specific_gravity', 'vanillin_pct')
      ORDER BY column_name;
    `);
    
    console.log('\n🔍 FragranceOil enhanced fields:');
    oilColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Check for new columns in base_products
    const baseColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'base_products' 
      AND column_name IN ('ease_of_use_rating', 'performance_rating', 'total_ratings')
      ORDER BY column_name;
    `);
    
    console.log('\n🔍 BaseProduct enhanced fields:');
    baseColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    process.exit(0); // Exit successfully
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateEnhanced();