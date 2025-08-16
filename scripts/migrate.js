require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
  try {
    console.log('Running database migrations...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Replace CREATE statements with CREATE IF NOT EXISTS
    const safeSchema = schema
      .replace(/CREATE TABLE /g, 'CREATE TABLE IF NOT EXISTS ')
      .replace(/CREATE INDEX /g, 'CREATE INDEX IF NOT EXISTS ')
      .replace(/CREATE EXTENSION /g, 'CREATE EXTENSION IF NOT EXISTS ');
    
    // Execute schema
    await pool.query(safeSchema);
    
    console.log('✅ Database migrations completed successfully!');
    process.exit(0); // Exit successfully
  } catch (error) {
    // If it's just a "already exists" error, that's OK
    if (error.code === '42P07' || error.message.includes('already exists')) {
      console.log('✅ Database already set up!');
      process.exit(0); // Exit successfully
    } else {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

migrate();
