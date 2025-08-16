// Vessels API Endpoints for server.js
// Add these endpoints to your server.js file

// =======================
// VESSELS ENDPOINTS
// =======================

// Get all vessels with details
app.get('/api/vessels', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                v.*,
                s.name as supplier_name,
                vi.quantity_on_hand,
                vi.quantity_unit,
                vi.location,
                vi.reorder_point,
                vs.diameter_mm,
                vs.height_mm,
                vs.opening_diameter_mm,
                vs.wall_thickness_mm,
                vs.is_food_safe,
                vs.is_leak_proof,
                vs.is_child_resistant,
                vs.uv_protection
            FROM vessels v
            LEFT JOIN suppliers s ON v.supplier_id = s.id
            LEFT JOIN vessel_inventory vi ON vi.vessel_id = v.id
            LEFT JOIN vessel_specifications vs ON vs.vessel_id = v.id
            ORDER BY s.name, v.name
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching vessels:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get single vessel
app.get('/api/vessels/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(`
            SELECT 
                v.*,
                s.name as supplier_name,
                vi.quantity_on_hand,
                vi.quantity_unit,
                vi.location,
                vi.reorder_point,
                vs.*
            FROM vessels v
            LEFT JOIN suppliers s ON v.supplier_id = s.id
            LEFT JOIN vessel_inventory vi ON vi.vessel_id = v.id
            LEFT JOIN vessel_specifications vs ON vs.vessel_id = v.id
            WHERE v.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vessel not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching vessel:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Create vessel
app.post('/api/vessels', async (req, res) => {
    const {
        supplier_id, name, sku, vessel_type, material, color,
        size, size_unit, neck_size, shape, price_per_unit,
        case_count, case_price, minimum_order_quantity,
        weight_grams, max_fill_volume, is_in_library,
        notes, product_url, image_url,
        // Inventory fields
        quantity_on_hand, location, reorder_point,
        // Specification fields
        diameter_mm, height_mm, opening_diameter_mm,
        wall_thickness_mm, is_food_safe, is_leak_proof,
        is_child_resistant, uv_protection
    } = req.body;
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Insert vessel
        const vesselResult = await client.query(`
            INSERT INTO vessels (
                supplier_id, name, sku, vessel_type, material, color,
                size, size_unit, neck_size, shape, price_per_unit,
                case_count, case_price, minimum_order_quantity,
                weight_grams, max_fill_volume, is_in_library,
                notes, product_url, image_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
            RETURNING *
        `, [
            supplier_id, name, sku, vessel_type, material, color,
            size, size_unit || 'oz', neck_size, shape, price_per_unit,
            case_count || 1, case_price, minimum_order_quantity || 1,
            weight_grams, max_fill_volume, is_in_library || false,
            notes, product_url, image_url
        ]);
        
        const vesselId = vesselResult.rows[0].id;
        
        // Insert inventory if provided
        if (quantity_on_hand !== undefined || location || reorder_point) {
            await client.query(`
                INSERT INTO vessel_inventory (
                    vessel_id, quantity_on_hand, quantity_unit, location, reorder_point
                ) VALUES ($1, $2, $3, $4, $5)
            `, [
                vesselId,
                quantity_on_hand || 0,
                'units',
                location,
                reorder_point
            ]);
        }
        
        // Insert specifications if provided
        if (diameter_mm || height_mm || opening_diameter_mm || wall_thickness_mm ||
            is_food_safe !== undefined || is_leak_proof !== undefined ||
            is_child_resistant !== undefined || uv_protection !== undefined) {
            await client.query(`
                INSERT INTO vessel_specifications (
                    vessel_id, diameter_mm, height_mm, opening_diameter_mm,
                    wall_thickness_mm, is_food_safe, is_leak_proof,
                    is_child_resistant, uv_protection
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                vesselId,
                diameter_mm, height_mm, opening_diameter_mm,
                wall_thickness_mm,
                is_food_safe !== undefined ? is_food_safe : true,
                is_leak_proof !== undefined ? is_leak_proof : false,
                is_child_resistant !== undefined ? is_child_resistant : false,
                uv_protection !== undefined ? uv_protection : false
            ]);
        }
        
        await client.query('COMMIT');
        res.status(201).json(vesselResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating vessel:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        client.release();
    }
});

// Update vessel
app.put('/api/vessels/:id', async (req, res) => {
    const { id } = req.params;
    const {
        supplier_id, name, sku, vessel_type, material, color,
        size, size_unit, neck_size, shape, price_per_unit,
        case_count, case_price, minimum_order_quantity,
        weight_grams, max_fill_volume, is_in_library,
        notes, product_url, image_url,
        // Inventory fields
        quantity_on_hand, location, reorder_point,
        // Specification fields
        diameter_mm, height_mm, opening_diameter_mm,
        wall_thickness_mm, is_food_safe, is_leak_proof,
        is_child_resistant, uv_protection
    } = req.body;
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Update vessel
        await client.query(`
            UPDATE vessels SET
                supplier_id = $1, name = $2, sku = $3, vessel_type = $4,
                material = $5, color = $6, size = $7, size_unit = $8,
                neck_size = $9, shape = $10, price_per_unit = $11,
                case_count = $12, case_price = $13, minimum_order_quantity = $14,
                weight_grams = $15, max_fill_volume = $16, is_in_library = $17,
                notes = $18, product_url = $19, image_url = $20,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $21
        `, [
            supplier_id, name, sku, vessel_type, material, color,
            size, size_unit || 'oz', neck_size, shape, price_per_unit,
            case_count || 1, case_price, minimum_order_quantity || 1,
            weight_grams, max_fill_volume, is_in_library || false,
            notes, product_url, image_url, id
        ]);
        
        // Update or insert inventory
        if (quantity_on_hand !== undefined || location || reorder_point) {
            await client.query(`
                INSERT INTO vessel_inventory (
                    vessel_id, quantity_on_hand, quantity_unit, location, reorder_point
                ) VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (vessel_id) DO UPDATE SET
                    quantity_on_hand = EXCLUDED.quantity_on_hand,
                    quantity_unit = EXCLUDED.quantity_unit,
                    location = EXCLUDED.location,
                    reorder_point = EXCLUDED.reorder_point,
                    last_updated = CURRENT_TIMESTAMP
            `, [
                id,
                quantity_on_hand || 0,
                'units',
                location,
                reorder_point
            ]);
        }
        
        // Update or insert specifications
        if (diameter_mm !== undefined || height_mm !== undefined || 
            opening_diameter_mm !== undefined || wall_thickness_mm !== undefined ||
            is_food_safe !== undefined || is_leak_proof !== undefined ||
            is_child_resistant !== undefined || uv_protection !== undefined) {
            await client.query(`
                INSERT INTO vessel_specifications (
                    vessel_id, diameter_mm, height_mm, opening_diameter_mm,
                    wall_thickness_mm, is_food_safe, is_leak_proof,
                    is_child_resistant, uv_protection
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (vessel_id) DO UPDATE SET
                    diameter_mm = EXCLUDED.diameter_mm,
                    height_mm = EXCLUDED.height_mm,
                    opening_diameter_mm = EXCLUDED.opening_diameter_mm,
                    wall_thickness_mm = EXCLUDED.wall_thickness_mm,
                    is_food_safe = EXCLUDED.is_food_safe,
                    is_leak_proof = EXCLUDED.is_leak_proof,
                    is_child_resistant = EXCLUDED.is_child_resistant,
                    uv_protection = EXCLUDED.uv_protection
            `, [
                id,
                diameter_mm, height_mm, opening_diameter_mm,
                wall_thickness_mm,
                is_food_safe !== undefined ? is_food_safe : true,
                is_leak_proof !== undefined ? is_leak_proof : false,
                is_child_resistant !== undefined ? is_child_resistant : false,
                uv_protection !== undefined ? uv_protection : false
            ]);
        }
        
        await client.query('COMMIT');
        res.json({ message: 'Vessel updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating vessel:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        client.release();
    }
});

// Delete vessel
app.delete('/api/vessels/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'DELETE FROM vessels WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vessel not found' });
        }
        
        res.json({ message: 'Vessel deleted successfully' });
    } catch (error) {
        console.error('Error deleting vessel:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Import vessels from CSV
app.post('/api/import/vessels', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const results = [];
    const errors = [];
    let imported = 0;
    let total = 0;
    
    const client = await pool.connect();
    
    try {
        // Parse CSV file
        const fileContent = fs.readFileSync(req.file.path, 'utf-8');
        const lines = fileContent.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            return res.status(400).json({ error: 'CSV file is empty or has no data' });
        }
        
        // Parse headers
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        // Start transaction
        await client.query('BEGIN');
        
        // Process each row
        for (let i = 1; i < lines.length; i++) {
            total++;
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            
            try {
                // Find or create supplier
                let supplierResult = await client.query(
                    'SELECT id FROM suppliers WHERE name = $1',
                    [row.supplier]
                );
                
                let supplierId;
                if (supplierResult.rows.length === 0) {
                    const newSupplier = await client.query(
                        'INSERT INTO suppliers (name) VALUES ($1) RETURNING id',
                        [row.supplier]
                    );
                    supplierId = newSupplier.rows[0].id;
                } else {
                    supplierId = supplierResult.rows[0].id;
                }
                
                // Insert vessel
                const vesselResult = await client.query(`
                    INSERT INTO vessels (
                        supplier_id, name, sku, vessel_type, material, color,
                        size, size_unit, neck_size, shape, price_per_unit,
                        case_count, case_price, minimum_order_quantity,
                        weight_grams, max_fill_volume, is_in_library,
                        notes, product_url
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                    ON CONFLICT (supplier_id, name, size) DO UPDATE SET
                        sku = EXCLUDED.sku,
                        vessel_type = EXCLUDED.vessel_type,
                        material = EXCLUDED.material,
                        color = EXCLUDED.color,
                        neck_size = EXCLUDED.neck_size,
                        shape = EXCLUDED.shape,
                        price_per_unit = EXCLUDED.price_per_unit,
                        case_count = EXCLUDED.case_count,
                        case_price = EXCLUDED.case_price,
                        minimum_order_quantity = EXCLUDED.minimum_order_quantity,
                        weight_grams = EXCLUDED.weight_grams,
                        max_fill_volume = EXCLUDED.max_fill_volume,
                        notes = EXCLUDED.notes,
                        product_url = EXCLUDED.product_url,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING id
                `, [
                    supplierId,
                    row.name,
                    row.sku || null,
                    row.vessel_type || 'bottle',
                    row.material || null,
                    row.color || null,
                    parseFloat(row.size),
                    row.size_unit || 'oz',
                    row.neck_size || null,
                    row.shape || null,
                    parseFloat(row.price_per_unit),
                    row.case_count ? parseInt(row.case_count) : 1,
                    row.case_price ? parseFloat(row.case_price) : null,
                    row.minimum_order_quantity ? parseInt(row.minimum_order_quantity) : 1,
                    row.weight_grams ? parseFloat(row.weight_grams) : null,
                    row.max_fill_volume ? parseFloat(row.max_fill_volume) : null,
                    req.body.auto_library === 'true',
                    row.notes || null,
                    row.product_url || null
                ]);
                
                const vesselId = vesselResult.rows[0].id;
                
                // Add inventory if provided
                if (row.quantity_on_hand || row.location || row.reorder_point) {
                    await client.query(`
                        INSERT INTO vessel_inventory (
                            vessel_id, quantity_on_hand, quantity_unit, location, reorder_point
                        ) VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (vessel_id) DO UPDATE SET
                            quantity_on_hand = EXCLUDED.quantity_on_hand,
                            location = EXCLUDED.location,
                            reorder_point = EXCLUDED.reorder_point,
                            last_updated = CURRENT_TIMESTAMP
                    `, [
                        vesselId,
                        row.quantity_on_hand ? parseInt(row.quantity_on_hand) : 0,
                        'units',
                        row.location || null,
                        row.reorder_point ? parseInt(row.reorder_point) : null
                    ]);
                }
                
                imported++;
            } catch (error) {
                errors.push(`Row ${i + 1}: ${error.message}`);
                console.error(`Error importing row ${i + 1}:`, error);
            }
        }
        
        // Commit transaction
        await client.query('COMMIT');
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json({ 
            imported, 
            total,
            errors: errors.length > 0 ? errors : null,
            message: `Successfully imported ${imported} of ${total} vessels`
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Import error:', error);
        
        // Clean up uploaded file
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});