require('dotenv').config();
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('Seeding database with sample data...');
    await client.query('BEGIN');
    
    // Insert suppliers
    const suppliers = [
      { name: 'Peach State', website: 'https://peachstate.com' },
      { name: 'Makesy', website: 'https://makesy.com' },
      { name: 'CandleScience', website: 'https://candlescience.com' },
      { name: 'Brambleberry', website: 'https://brambleberry.com' },
      { name: "Nature's Garden", website: 'https://naturesgardencandles.com' }
    ];
    
    const supplierIds = {};
    for (const supplier of suppliers) {
      const id = uuidv4();
      await client.query(
        'INSERT INTO suppliers (id, name, website) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
        [id, supplier.name, supplier.website]
      );
      supplierIds[supplier.name] = id;
    }
    
    // Insert base products
    const bases = [
      { supplier: 'Peach State', name: 'Foaming Hand Soap Base', maxLoad: 3.0, unitMode: 'weight', ifraCategory: '9' },
      { supplier: 'Makesy', name: 'Liquid Hand Soap Base', maxLoad: 2.0, unitMode: 'weight', ifraCategory: '9' },
      { supplier: 'CandleScience', name: 'Room Spray Base', maxLoad: 4.0, unitMode: 'volume', sg: 0.88, ifraCategory: '10A' },
      { supplier: 'Brambleberry', name: 'Room & Body Mist Base', maxLoad: 3.5, unitMode: 'volume', sg: 0.95, ifraCategory: '10A', dual: true, ifra2: '9' },
      { supplier: "Nature's Garden", name: 'Shower Gel Base', maxLoad: 2.5, unitMode: 'weight', ifraCategory: '9' }
    ];
    
    for (const base of bases) {
      const result = await client.query('SELECT id FROM suppliers WHERE name = $1', [base.supplier]);
      if (result.rows.length > 0) {
        await client.query(
          `INSERT INTO base_products 
           (id, supplier_id, name, max_load_pct, unit_mode, specific_gravity, ifra_category, is_dual_purpose, ifra_category_2)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [uuidv4(), result.rows[0].id, base.name, base.maxLoad, base.unitMode, base.sg || null, 
           base.ifraCategory, base.dual || false, base.ifra2 || null]
        );
      }
    }
    
    // Insert fragrance oils with IFRA data
    const oils = [
      { 
        supplier: 'Peach State', 
        name: 'Autumn Leaves', 
        sku: 'PS123', 
        flashPoint: 180,
        ifraLimits: { foaming_hand_soap: 1.2, liquid_hand_soap: 1.2, room_spray: 3.0, body_wash: 1.5 }
      },
      { 
        supplier: 'Makesy', 
        name: 'Sea Salt & Orchid', 
        sku: 'MK456', 
        flashPoint: 170,
        ifraLimits: { foaming_hand_soap: 2.0, liquid_hand_soap: 2.0, room_spray: 4.0, body_wash: 2.0 }
      },
      { 
        supplier: 'CandleScience', 
        name: 'Very Vanilla', 
        sku: 'CS789', 
        flashPoint: 200,
        ifraLimits: { foaming_hand_soap: 1.0, liquid_hand_soap: 1.0, room_spray: 3.5, body_wash: 1.0 }
      }
    ];
    
    for (const oil of oils) {
      const result = await client.query('SELECT id FROM suppliers WHERE name = $1', [oil.supplier]);
      if (result.rows.length > 0) {
        const oilId = uuidv4();
        await client.query(
          `INSERT INTO fragrance_oils 
           (id, supplier_id, name, sku, flash_point_f, ifra_version, ifra_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [oilId, result.rows[0].id, oil.name, oil.sku, oil.flashPoint, 
           'Amendment 51', '2024-06-01']
        );
        
        // Insert IFRA entries
        for (const [productType, maxPct] of Object.entries(oil.ifraLimits)) {
          const categoryMap = {
            'foaming_hand_soap': '9',
            'liquid_hand_soap': '9',
            'body_wash': '9',
            'room_spray': '10A'
          };
          
          await client.query(
            `INSERT INTO ifra_entries (id, oil_id, product_type_key, category_id, max_pct)
             VALUES ($1, $2, $3, $4, $5)`,
            [uuidv4(), oilId, productType, categoryMap[productType], maxPct]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
