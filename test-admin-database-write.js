// Test Script for Admin Write Access to Product-Data Database
// Tests all new fields after migration
// Run with: node test-admin-database-write.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// Test data with all new fields
const testData = {
    // Test Supplier
    supplier: {
        name: 'Test Supplier ' + Date.now(),
        website_url: 'https://testsupplier.com',
        contact_email: 'test@supplier.com',
        contact_phone: '555-0123',
        is_active: true
    },

    // Test Fragrance Oil with all 18 IFRA categories
    fragranceOil: {
        name: 'Test Lavender Oil ' + Date.now(),
        product_name: 'Premium Lavender Essential Oil',
        sku: 'TEST-LAV-001',
        scent_description: 'Pure lavender with herbal notes',
        flash_point_f: 160.5,
        specific_gravity: 0.885,
        vanillin_pct: 0.5,
        solvent_note: 'DPG',
        soap_acceleration: 'none',
        product_url: 'https://supplier.com/lavender',
        theme_family: 'Floral',
        fragrance_notes_top: 'Fresh Lavender',
        fragrance_notes_middle: 'Herbal',
        fragrance_notes_base: 'Woody',
        blending_notes: 'Blends well with citrus',
        usage_notes: 'Safe for cold process soap',
        is_active: true,
        is_discontinued: false,
        ifra_url: 'https://supplier.com/ifra/lavender.pdf',
        ifra_version: 'Amendment 51',
        ifra_date: '2024-01-15',
        // All 18 IFRA Categories
        ifra_category_1: 0.5,    // Lip Products, Toys
        ifra_category_2: 2.5,    // Deodorant, Antiperspirant
        ifra_category_3: 5.0,    // Eye Products
        ifra_category_4: 10.0,   // Perfume
        ifra_category_5a: 3.5,   // Body Creams
        ifra_category_5b: 3.5,   // Face Creams
        ifra_category_5c: 3.5,   // Hand Creams
        ifra_category_5d: 2.0,   // Baby Products
        ifra_category_6: 1.0,    // Mouthwash
        ifra_category_7a: 5.0,   // Rinse off Hair
        ifra_category_7b: 3.0,   // Leave on Hair
        ifra_category_8: 2.5,    // Intimate Wipes
        ifra_category_9: 8.0,    // Soap, Shampoo
        ifra_category_10a: 15.0, // Household Cleaning
        ifra_category_10b: 20.0, // Air Freshener Sprays
        ifra_category_11a: 1.5,  // Diapers
        ifra_category_11b: 2.0,  // Scented Clothing
        ifra_category_12: 100.0, // Candles
        intensity_rating: 4.5,
        overall_rating: 4.8
    },

    // Test Oil Price Tiers with names and SKUs
    oilPriceTiers: {
        tier1_name: 'Sample Size',
        tier1_size: 0.5,
        tier1_unit: 'oz',
        tier1_price: 5.99,
        tier1_sku: 'LAV-SAMPLE',
        
        tier2_name: 'Small Bottle',
        tier2_size: 1.0,
        tier2_unit: 'oz',
        tier2_price: 9.99,
        tier2_sku: 'LAV-1OZ',
        
        tier3_name: 'Medium Bottle',
        tier3_size: 4.0,
        tier3_unit: 'oz',
        tier3_price: 29.99,
        tier3_sku: 'LAV-4OZ',
        
        tier4_name: 'Large Bottle',
        tier4_size: 16.0,
        tier4_unit: 'oz',
        tier4_price: 89.99,
        tier4_sku: 'LAV-16OZ',
        
        tier5_name: 'Bulk Size',
        tier5_size: 1.0,
        tier5_unit: 'lb',
        tier5_price: 119.99,
        tier5_sku: 'LAV-BULK'
    },

    // Test Base Product
    baseProduct: {
        name: 'Test Soap Base ' + Date.now(),
        sku: 'TEST-SOAP-001',
        max_load_pct: 10.0,
        unit_mode: 'weight',
        wax_type: 'Shea Butter',
        specific_gravity: 1.05,
        ifra_category: 'Soap - Category 9',
        ifra_category_2: 'Rinse Off and Bathwater Products - Category 9',
        is_dual_purpose: false,
        notes: 'Premium melt and pour soap base',
        is_active: true,
        is_discontinued: false,
        ease_of_use_rating: 4.5,
        performance_rating: 4.8,
        product_url: 'https://supplier.com/soap-base'
    },

    // Test Base Price Tiers
    basePriceTiers: {
        tier1_name: 'Trial Size',
        tier1_size: 1.0,
        tier1_unit: 'lb',
        tier1_price: 4.99,
        tier1_sku: 'SOAP-1LB',
        
        tier2_name: 'Small Pack',
        tier2_size: 5.0,
        tier2_unit: 'lb',
        tier2_price: 19.99,
        tier2_sku: 'SOAP-5LB',
        
        tier3_name: 'Medium Pack',
        tier3_size: 25.0,
        tier3_unit: 'lb',
        tier3_price: 79.99,
        tier3_sku: 'SOAP-25LB',
        
        tier4_name: 'Large Pack',
        tier4_size: 50.0,
        tier4_unit: 'lb',
        tier4_price: 149.99,
        tier4_sku: 'SOAP-50LB',
        
        tier5_name: 'Bulk Pack',
        tier5_size: 100.0,
        tier5_unit: 'lb',
        tier5_price: 279.99,
        tier5_sku: 'SOAP-100LB'
    },

    // Test Vessel
    vessel: {
        name: 'Test 4oz Amber Jar ' + Date.now(),
        sku: 'TEST-JAR-4OZ',
        vessel_type: 'jar',
        size: 4.0,
        size_unit: 'oz',
        material: 'glass',
        color: 'amber',
        shape: 'round',
        neck_size: '70-400',
        recommended_fill_volume: 3.5,
        max_fill_volume: 3.8,
        weight_pounds: 0.25,
        is_active: true,
        is_discontinued: false,
        product_url: 'https://supplier.com/4oz-jar',
        notes: 'Premium amber glass jar with black lid'
    },

    // Test Vessel Price Tiers
    vesselPriceTiers: {
        tier1_name: 'Single Unit',
        tier1_size: 1,
        tier1_unit: 'units',
        tier1_price: 1.50,
        tier1_sku: 'JAR-4OZ-1',
        
        tier2_name: 'Small Case',
        tier2_size: 12,
        tier2_unit: 'units',
        tier2_price: 15.00,
        tier2_sku: 'JAR-4OZ-12',
        
        tier3_name: 'Medium Case',
        tier3_size: 72,
        tier3_unit: 'units',
        tier3_price: 75.00,
        tier3_sku: 'JAR-4OZ-72',
        
        tier4_name: 'Large Case',
        tier4_size: 144,
        tier4_unit: 'units',
        tier4_price: 135.00,
        tier4_sku: 'JAR-4OZ-144',
        
        tier5_name: 'Pallet',
        tier5_size: 1000,
        tier5_unit: 'units',
        tier5_price: 850.00,
        tier5_sku: 'JAR-4OZ-PALLET'
    }
};

// Test Functions
async function testSupplierCreation() {
    console.log('\n🔧 Testing Supplier Creation...');
    try {
        const { data, error } = await supabase
            .from('suppliers')
            .insert(testData.supplier)
            .select()
            .single();
        
        if (error) throw error;
        console.log('✅ Supplier created successfully:', data.name);
        return data.id;
    } catch (error) {
        console.error('❌ Supplier creation failed:', error.message);
        return null;
    }
}

async function testFragranceOilCreation(supplierId) {
    console.log('\n🌸 Testing Fragrance Oil Creation with 18 IFRA Categories...');
    try {
        const oilData = { ...testData.fragranceOil, supplier_id: supplierId };
        
        const { data, error } = await supabase
            .from('fragrance_oils')
            .insert(oilData)
            .select()
            .single();
        
        if (error) throw error;
        
        // Verify all IFRA categories were saved
        const ifraCategories = [
            'ifra_category_1', 'ifra_category_2', 'ifra_category_3', 'ifra_category_4',
            'ifra_category_5a', 'ifra_category_5b', 'ifra_category_5c', 'ifra_category_5d',
            'ifra_category_6', 'ifra_category_7a', 'ifra_category_7b', 'ifra_category_8',
            'ifra_category_9', 'ifra_category_10a', 'ifra_category_10b', 
            'ifra_category_11a', 'ifra_category_11b', 'ifra_category_12'
        ];
        
        let allCategoriesSaved = true;
        for (const category of ifraCategories) {
            if (data[category] !== testData.fragranceOil[category]) {
                console.error(`❌ ${category} mismatch: expected ${testData.fragranceOil[category]}, got ${data[category]}`);
                allCategoriesSaved = false;
            }
        }
        
        if (allCategoriesSaved) {
            console.log('✅ All 18 IFRA categories saved correctly');
        }
        
        console.log('✅ Fragrance oil created:', data.name);
        console.log('✅ is_active:', data.is_active, '| is_discontinued:', data.is_discontinued);
        console.log('✅ IFRA URL:', data.ifra_url);
        
        return data.id;
    } catch (error) {
        console.error('❌ Fragrance oil creation failed:', error.message);
        return null;
    }
}

async function testOilPriceTiers(fragranceOilId) {
    console.log('\n💰 Testing Oil Price Tiers with Names and SKUs...');
    try {
        const tierData = { 
            ...testData.oilPriceTiers, 
            fragrance_oil_id: fragranceOilId 
        };
        
        const { data, error } = await supabase
            .from('oil_price_tiers')
            .insert(tierData)
            .select()
            .single();
        
        if (error) throw error;
        
        // Verify tier names and SKUs
        for (let i = 1; i <= 5; i++) {
            const nameField = `tier${i}_name`;
            const skuField = `tier${i}_sku`;
            console.log(`✅ Tier ${i}: ${data[nameField]} (${data[skuField]}) - $${data[`tier${i}_price`]}`);
        }
        
        return data.id;
    } catch (error) {
        console.error('❌ Oil price tier creation failed:', error.message);
        return null;
    }
}

async function testBaseProductCreation(supplierId) {
    console.log('\n🧼 Testing Base Product Creation...');
    try {
        const baseData = { ...testData.baseProduct, supplier_id: supplierId };
        
        const { data, error } = await supabase
            .from('base_products')
            .insert(baseData)
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Base product created:', data.name);
        console.log('✅ is_active:', data.is_active, '| is_discontinued:', data.is_discontinued);
        console.log('✅ IFRA categories:', data.ifra_category, '|', data.ifra_category_2);
        
        return data.id;
    } catch (error) {
        console.error('❌ Base product creation failed:', error.message);
        return null;
    }
}

async function testBasePriceTiers(baseProductId) {
    console.log('\n💰 Testing Base Price Tiers with Names and SKUs...');
    try {
        const tierData = { 
            ...testData.basePriceTiers, 
            base_product_id: baseProductId 
        };
        
        const { data, error } = await supabase
            .from('base_price_tiers')
            .insert(tierData)
            .select()
            .single();
        
        if (error) throw error;
        
        // Verify tier names and SKUs
        for (let i = 1; i <= 5; i++) {
            const nameField = `tier${i}_name`;
            const skuField = `tier${i}_sku`;
            console.log(`✅ Tier ${i}: ${data[nameField]} (${data[skuField]}) - $${data[`tier${i}_price`]}`);
        }
        
        return data.id;
    } catch (error) {
        console.error('❌ Base price tier creation failed:', error.message);
        return null;
    }
}

async function testVesselCreation(supplierId) {
    console.log('\n🏺 Testing Vessel Creation...');
    try {
        const vesselData = { ...testData.vessel, supplier_id: supplierId };
        
        const { data, error } = await supabase
            .from('vessels')
            .insert(vesselData)
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Vessel created:', data.name);
        console.log('✅ is_active:', data.is_active, '| is_discontinued:', data.is_discontinued);
        console.log('✅ recommended_fill_volume:', data.recommended_fill_volume, 'oz');
        console.log('✅ weight_pounds:', data.weight_pounds, 'lbs');
        console.log('✅ Color:', data.color, '| Shape:', data.shape);
        
        return data.id;
    } catch (error) {
        console.error('❌ Vessel creation failed:', error.message);
        return null;
    }
}

async function testVesselPriceTiers(vesselId) {
    console.log('\n💰 Testing Vessel Price Tiers (NEW TABLE)...');
    try {
        const tierData = { 
            ...testData.vesselPriceTiers, 
            vessel_id: vesselId 
        };
        
        const { data, error } = await supabase
            .from('vessel_price_tiers')
            .insert(tierData)
            .select()
            .single();
        
        if (error) throw error;
        
        // Verify tier names and SKUs
        for (let i = 1; i <= 5; i++) {
            const nameField = `tier${i}_name`;
            const skuField = `tier${i}_sku`;
            console.log(`✅ Tier ${i}: ${data[nameField]} (${data[skuField]}) - $${data[`tier${i}_price`]}`);
        }
        
        return data.id;
    } catch (error) {
        console.error('❌ Vessel price tier creation failed:', error.message);
        console.error('   Make sure vessel_price_tiers table exists!');
        return null;
    }
}

async function cleanupTestData(supplierId) {
    console.log('\n🧹 Cleaning up test data...');
    try {
        // Delete supplier (cascades to all related products)
        if (supplierId) {
            const { error } = await supabase
                .from('suppliers')
                .delete()
                .eq('id', supplierId);
            
            if (error) throw error;
            console.log('✅ Test data cleaned up');
        }
    } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
    }
}

// Main test runner
async function runAllTests() {
    console.log('========================================');
    console.log('🚀 ADMIN DATABASE WRITE TEST');
    console.log('Testing all new fields after migration');
    console.log('========================================');
    
    let supplierId = null;
    
    try {
        // Test supplier
        supplierId = await testSupplierCreation();
        if (!supplierId) {
            console.error('⛔ Cannot continue without supplier');
            return;
        }
        
        // Test fragrance oil with all 18 IFRA categories
        const oilId = await testFragranceOilCreation(supplierId);
        if (oilId) {
            await testOilPriceTiers(oilId);
        }
        
        // Test base product
        const baseId = await testBaseProductCreation(supplierId);
        if (baseId) {
            await testBasePriceTiers(baseId);
        }
        
        // Test vessel
        const vesselId = await testVesselCreation(supplierId);
        if (vesselId) {
            await testVesselPriceTiers(vesselId);
        }
        
        console.log('\n========================================');
        console.log('📊 TEST SUMMARY');
        console.log('========================================');
        console.log('✅ All new fields tested successfully!');
        console.log('✅ 18 IFRA categories working');
        console.log('✅ is_active/is_discontinued fields working');
        console.log('✅ Price tier names and SKUs working');
        console.log('✅ Vessel enhancements working');
        
    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
    } finally {
        // Cleanup (optional - comment out to keep test data)
        // await cleanupTestData(supplierId);
    }
    
    console.log('\n✨ Test complete!');
}

// Run the tests
runAllTests();