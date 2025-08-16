// Enhanced CSV Import Endpoints for server.js
// Add these endpoints to your server.js file

// =======================
// CSV IMPORT ENDPOINTS WITH ENHANCED FIELDS
// =======================

app.post('/api/import/bases', upload.single('file'), async (req, res) => {
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
                
                // Insert base with all enhanced fields
                const baseResult = await client.query(
                    `INSERT INTO base_products 
                    (supplier_id, name, max_load_pct, unit_mode, base_type, specific_gravity, 
                     ifra_category, is_dual_purpose, ifra_category_2, wax_type, notes, 
                     is_in_library, ease_of_use_rating, performance_rating, total_ratings) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                    ON CONFLICT (supplier_id, name) DO UPDATE SET
                        max_load_pct = EXCLUDED.max_load_pct,
                        unit_mode = EXCLUDED.unit_mode,
                        base_type = EXCLUDED.base_type,
                        specific_gravity = EXCLUDED.specific_gravity,
                        ifra_category = EXCLUDED.ifra_category,
                        is_dual_purpose = EXCLUDED.is_dual_purpose,
                        ifra_category_2 = EXCLUDED.ifra_category_2,
                        wax_type = EXCLUDED.wax_type,
                        notes = EXCLUDED.notes,
                        ease_of_use_rating = EXCLUDED.ease_of_use_rating,
                        performance_rating = EXCLUDED.performance_rating,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING id`,
                    [
                        supplierId,
                        row.name || row.base_name,
                        parseFloat(row.max_load_pct || row.base_max_load_pct),
                        row.unit_mode,
                        row.base_type || 'liquid',
                        row.specific_gravity ? parseFloat(row.specific_gravity) : null,
                        row.ifra_category || null,
                        row.is_dual_purpose === 'true' || row.is_dual_purpose === '1',
                        row.ifra_category_2 || null,
                        row.wax_type || null,
                        row.notes || null,
                        req.body.auto_library === 'true',
                        row.ease_of_use_rating ? parseFloat(row.ease_of_use_rating) : 0,
                        row.performance_rating ? parseFloat(row.performance_rating) : 0,
                        0 // total_ratings starts at 0
                    ]
                );
                
                const baseId = baseResult.rows[0].id;
                
                // Add product details if provided
                if (row.theme_family || row.scent_description || row.usage_notes || row.product_url) {
                    await client.query(
                        `INSERT INTO product_details 
                        (product_id, product_type, theme_family, scent_description, usage_notes, product_url)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        ON CONFLICT (product_id, product_type) DO UPDATE SET
                            theme_family = EXCLUDED.theme_family,
                            scent_description = EXCLUDED.scent_description,
                            usage_notes = EXCLUDED.usage_notes,
                            product_url = EXCLUDED.product_url,
                            updated_at = CURRENT_TIMESTAMP`,
                        [
                            baseId,
                            'base',
                            row.theme_family || null,
                            row.scent_description || null,
                            row.usage_notes || null,
                            row.product_url || null
                        ]
                    );
                }
                
                // Add price tiers if provided
                if (row.tier1_size || row.tier1_price) {
                    await client.query(
                        `INSERT INTO price_tiers 
                        (product_id, product_type, supplier_id,
                         tier1_size, tier1_unit, tier1_price,
                         tier2_size, tier2_unit, tier2_price,
                         tier3_size, tier3_unit, tier3_price,
                         tier4_size, tier4_unit, tier4_price,
                         tier5_size, tier5_unit, tier5_price)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                        ON CONFLICT (product_id, product_type, supplier_id) DO UPDATE SET
                            tier1_size = EXCLUDED.tier1_size,
                            tier1_unit = EXCLUDED.tier1_unit,
                            tier1_price = EXCLUDED.tier1_price,
                            tier2_size = EXCLUDED.tier2_size,
                            tier2_unit = EXCLUDED.tier2_unit,
                            tier2_price = EXCLUDED.tier2_price,
                            tier3_size = EXCLUDED.tier3_size,
                            tier3_unit = EXCLUDED.tier3_unit,
                            tier3_price = EXCLUDED.tier3_price,
                            tier4_size = EXCLUDED.tier4_size,
                            tier4_unit = EXCLUDED.tier4_unit,
                            tier4_price = EXCLUDED.tier4_price,
                            tier5_size = EXCLUDED.tier5_size,
                            tier5_unit = EXCLUDED.tier5_unit,
                            tier5_price = EXCLUDED.tier5_price,
                            last_updated = CURRENT_TIMESTAMP`,
                        [
                            baseId, 'base', supplierId,
                            row.tier1_size ? parseFloat(row.tier1_size) : null,
                            row.tier1_unit || 'oz',
                            row.tier1_price ? parseFloat(row.tier1_price) : null,
                            row.tier2_size ? parseFloat(row.tier2_size) : null,
                            row.tier2_unit || 'oz',
                            row.tier2_price ? parseFloat(row.tier2_price) : null,
                            row.tier3_size ? parseFloat(row.tier3_size) : null,
                            row.tier3_unit || 'oz',
                            row.tier3_price ? parseFloat(row.tier3_price) : null,
                            row.tier4_size ? parseFloat(row.tier4_size) : null,
                            row.tier4_unit || 'oz',
                            row.tier4_price ? parseFloat(row.tier4_price) : null,
                            row.tier5_size ? parseFloat(row.tier5_size) : null,
                            row.tier5_unit || 'oz',
                            row.tier5_price ? parseFloat(row.tier5_price) : null
                        ]
                    );
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
            message: `Successfully imported ${imported} of ${total} bases`
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

app.post('/api/import/oils', upload.single('file'), async (req, res) => {
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
                
                // Insert oil with all enhanced fields
                const oilResult = await client.query(
                    `INSERT INTO fragrance_oils 
                    (supplier_id, name, sku, flash_point_f, solvent_note, 
                     ifra_version, ifra_date, is_in_library, specific_gravity, vanillin_pct,
                     intensity_rating, overall_rating, total_ratings) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    ON CONFLICT (supplier_id, name) DO UPDATE SET
                        sku = EXCLUDED.sku,
                        flash_point_f = EXCLUDED.flash_point_f,
                        solvent_note = EXCLUDED.solvent_note,
                        ifra_version = EXCLUDED.ifra_version,
                        ifra_date = EXCLUDED.ifra_date,
                        specific_gravity = EXCLUDED.specific_gravity,
                        vanillin_pct = EXCLUDED.vanillin_pct,
                        intensity_rating = EXCLUDED.intensity_rating,
                        overall_rating = EXCLUDED.overall_rating,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING id`,
                    [
                        supplierId,
                        row.product_name || row.name,
                        row.sku || null,
                        row.flash_point_f ? parseInt(row.flash_point_f) : null,
                        row.solvent_note || null,
                        row.ifra_version || null,
                        row.ifra_date || null,
                        req.body.auto_library === 'true',
                        row.specific_gravity ? parseFloat(row.specific_gravity) : null,
                        row.vanillin_pct ? parseFloat(row.vanillin_pct) : null,
                        row.intensity_rating ? parseFloat(row.intensity_rating) : 0,
                        row.overall_rating ? parseFloat(row.overall_rating) : 0,
                        0 // total_ratings starts at 0
                    ]
                );
                
                const oilId = oilResult.rows[0].id;
                
                // Process IFRA entries
                for (const header of headers) {
                    if (header.startsWith('ifra__') && row[header]) {
                        const productType = header.substring(6); // Remove 'ifra__' prefix
                        const maxPct = parseFloat(row[header]);
                        
                        if (!isNaN(maxPct)) {
                            await client.query(
                                `INSERT INTO ifra_entries 
                                (oil_id, product_type_key, category_id, max_pct)
                                VALUES ($1, $2, $3, $4)
                                ON CONFLICT (oil_id, product_type_key) DO UPDATE SET
                                    max_pct = EXCLUDED.max_pct`,
                                [oilId, productType, '', maxPct]
                            );
                        }
                    }
                }
                
                // Add product details if provided
                if (row.theme_family || row.fragrance_notes_top || row.fragrance_notes_middle || 
                    row.fragrance_notes_base || row.scent_description || row.soap_acceleration ||
                    row.usage_notes || row.blending_notes || row.product_url) {
                    await client.query(
                        `INSERT INTO product_details 
                        (product_id, product_type, theme_family,
                         fragrance_notes_top, fragrance_notes_middle, fragrance_notes_base,
                         scent_description, soap_acceleration, usage_notes, blending_notes, product_url)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        ON CONFLICT (product_id, product_type) DO UPDATE SET
                            theme_family = EXCLUDED.theme_family,
                            fragrance_notes_top = EXCLUDED.fragrance_notes_top,
                            fragrance_notes_middle = EXCLUDED.fragrance_notes_middle,
                            fragrance_notes_base = EXCLUDED.fragrance_notes_base,
                            scent_description = EXCLUDED.scent_description,
                            soap_acceleration = EXCLUDED.soap_acceleration,
                            usage_notes = EXCLUDED.usage_notes,
                            blending_notes = EXCLUDED.blending_notes,
                            product_url = EXCLUDED.product_url,
                            updated_at = CURRENT_TIMESTAMP`,
                        [
                            oilId, 'oil',
                            row.theme_family || null,
                            row.fragrance_notes_top || null,
                            row.fragrance_notes_middle || null,
                            row.fragrance_notes_base || null,
                            row.scent_description || null,
                            row.soap_acceleration || null,
                            row.usage_notes || null,
                            row.blending_notes || null,
                            row.product_url || null
                        ]
                    );
                }
                
                // Add price tiers if provided
                if (row.tier1_size || row.tier1_price) {
                    await client.query(
                        `INSERT INTO price_tiers 
                        (product_id, product_type, supplier_id,
                         tier1_size, tier1_unit, tier1_price,
                         tier2_size, tier2_unit, tier2_price,
                         tier3_size, tier3_unit, tier3_price,
                         tier4_size, tier4_unit, tier4_price,
                         tier5_size, tier5_unit, tier5_price)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                        ON CONFLICT (product_id, product_type, supplier_id) DO UPDATE SET
                            tier1_size = EXCLUDED.tier1_size,
                            tier1_unit = EXCLUDED.tier1_unit,
                            tier1_price = EXCLUDED.tier1_price,
                            tier2_size = EXCLUDED.tier2_size,
                            tier2_unit = EXCLUDED.tier2_unit,
                            tier2_price = EXCLUDED.tier2_price,
                            tier3_size = EXCLUDED.tier3_size,
                            tier3_unit = EXCLUDED.tier3_unit,
                            tier3_price = EXCLUDED.tier3_price,
                            tier4_size = EXCLUDED.tier4_size,
                            tier4_unit = EXCLUDED.tier4_unit,
                            tier4_price = EXCLUDED.tier4_price,
                            tier5_size = EXCLUDED.tier5_size,
                            tier5_unit = EXCLUDED.tier5_unit,
                            tier5_price = EXCLUDED.tier5_price,
                            last_updated = CURRENT_TIMESTAMP`,
                        [
                            oilId, 'oil', supplierId,
                            row.tier1_size ? parseFloat(row.tier1_size) : null,
                            row.tier1_unit || 'oz',
                            row.tier1_price ? parseFloat(row.tier1_price) : null,
                            row.tier2_size ? parseFloat(row.tier2_size) : null,
                            row.tier2_unit || 'oz',
                            row.tier2_price ? parseFloat(row.tier2_price) : null,
                            row.tier3_size ? parseFloat(row.tier3_size) : null,
                            row.tier3_unit || 'oz',
                            row.tier3_price ? parseFloat(row.tier3_price) : null,
                            row.tier4_size ? parseFloat(row.tier4_size) : null,
                            row.tier4_unit || 'oz',
                            row.tier4_price ? parseFloat(row.tier4_price) : null,
                            row.tier5_size ? parseFloat(row.tier5_size) : null,
                            row.tier5_unit || 'oz',
                            row.tier5_price ? parseFloat(row.tier5_price) : null
                        ]
                    );
                }
                
                // Add categories if provided
                if (row.categories) {
                    const categories = row.categories.split(';').map(c => c.trim());
                    for (const category of categories) {
                        if (category) {
                            await client.query(
                                'INSERT INTO fragrance_categories (oil_id, category) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                                [oilId, category]
                            );
                        }
                    }
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
            message: `Successfully imported ${imported} of ${total} oils`
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