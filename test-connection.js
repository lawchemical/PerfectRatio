const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🧪 Testing Supabase Connection...\n');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testConnection() {
  try {
    // Test 1: Check suppliers table
    console.log('1️⃣ Testing suppliers table...');
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('*')
      .limit(1);
    
    if (suppliersError) throw suppliersError;
    console.log(`✅ Suppliers table accessible. Found ${suppliers?.length || 0} supplier(s)\n`);
    
    // Test 2: Check base_products table
    console.log('2️⃣ Testing base_products table...');
    const { data: bases, error: basesError } = await supabase
      .from('base_products')
      .select('*')
      .limit(1);
    
    if (basesError) throw basesError;
    console.log(`✅ Base products table accessible. Found ${bases?.length || 0} base(s)\n`);
    
    // Test 3: Check fragrance_oils table
    console.log('3️⃣ Testing fragrance_oils table...');
    const { data: oils, error: oilsError } = await supabase
      .from('fragrance_oils')
      .select('*')
      .limit(1);
    
    if (oilsError) throw oilsError;
    console.log(`✅ Fragrance oils table accessible. Found ${oils?.length || 0} oil(s)\n`);
    
    // Test 4: Check vessels table
    console.log('4️⃣ Testing vessels table...');
    const { data: vessels, error: vesselsError } = await supabase
      .from('vessels')
      .select('*')
      .limit(1);
    
    if (vesselsError) throw vesselsError;
    console.log(`✅ Vessels table accessible. Found ${vessels?.length || 0} vessel(s)\n`);
    
    // Test 5: Test joins
    console.log('5️⃣ Testing table joins...');
    const { data: joinTest, error: joinError } = await supabase
      .from('base_products')
      .select(`
        *,
        supplier:suppliers(name),
        price_tiers:base_price_tiers(*)
      `)
      .limit(1);
    
    if (joinError) throw joinError;
    console.log(`✅ Table joins working properly\n`);
    
    // Test 6: Test incremental sync capability
    console.log('6️⃣ Testing incremental sync (updated_at filter)...');
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: incrementalTest, error: incrementalError } = await supabase
      .from('fragrance_oils')
      .select('*')
      .gt('updated_at', yesterday)
      .limit(1);
    
    if (incrementalError) throw incrementalError;
    console.log(`✅ Incremental sync filter working\n`);
    
    console.log('🎉 All Supabase connection tests passed!\n');
    
    // Display connection info
    console.log('📊 Connection Summary:');
    console.log(`   URL: ${process.env.SUPABASE_URL}`);
    console.log(`   Key: ${process.env.SUPABASE_ANON_KEY.substring(0, 20)}...`);
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Run the test
testConnection();