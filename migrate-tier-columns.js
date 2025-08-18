const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

async function migrateTierColumns() {
    console.log('🔄 Starting tier columns migration...');
    
    // Initialize Supabase admin client
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    );
    
    try {
        // Read the SQL migration file
        const sqlContent = fs.readFileSync('./add-tier-name-sku-columns.sql', 'utf8');
        
        // Split into individual statements (remove comments and empty lines)
        const statements = sqlContent
            .split('\n')
            .filter(line => line.trim() && !line.trim().startsWith('--'))
            .join('\n')
            .split(';')
            .filter(stmt => stmt.trim());
        
        console.log(`📄 Found ${statements.length} SQL statements to execute`);
        
        // Execute the ALTER TABLE statement
        const alterStatement = statements.find(stmt => stmt.trim().startsWith('ALTER TABLE'));
        if (alterStatement) {
            console.log('🔨 Adding tier name and SKU columns...');
            const { data, error } = await supabase.rpc('exec_sql', { 
                sql: alterStatement.trim() 
            });
            
            if (error) {
                console.error('❌ Error executing ALTER TABLE:', error);
                throw error;
            }
            console.log('✅ Columns added successfully');
        }
        
        // Verify columns exist by checking schema
        console.log('🔍 Verifying columns were added...');
        const { data: columns, error: schemaError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', 'oil_price_tiers')
            .order('column_name');
            
        if (schemaError) {
            console.error('❌ Error checking schema:', schemaError);
        } else {
            console.log('📋 Current oil_price_tiers columns:');
            columns.forEach(col => {
                console.log(`  - ${col.column_name} (${col.data_type})`);
            });
        }
        
        console.log('🎉 Migration completed successfully!');
        
    } catch (error) {
        console.error('💥 Migration failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    migrateTierColumns();
}

module.exports = { migrateTierColumns };