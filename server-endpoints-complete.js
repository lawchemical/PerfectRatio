// Add these endpoints to your server.js file

// =====================
// STATS ENDPOINT
// =====================
app.get('/api/stats', async (req, res) => {
    try {
        const [suppliers, bases, oils, vessels] = await Promise.all([
            pool.query('SELECT COUNT(*) as count FROM suppliers'),
            pool.query('SELECT COUNT(*) as count FROM base_products'),
            pool.query('SELECT COUNT(*) as count FROM fragrance_oils'),
            pool.query('SELECT COUNT(*) as count FROM vessels')
        ]);
        
        res.json({
            suppliers: parseInt(suppliers.rows[0].count),
            bases: parseInt(bases.rows[0].count),
            oils: parseInt(oils.rows[0].count),
            vessels: parseInt(vessels.rows[0].count)
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// =====================
// ENHANCED OIL ENDPOINTS WITH ALL FIELDS
// =====================

// Get all oils with product details
app.get('/api/oils', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                o.*,
                s.name as supplier_name,
                pd.fragrance_notes_top,
                pd.fragrance_notes_middle,
                pd.fragrance_notes_base,
                pd.theme_family,
                pd.scent_description,
                pd.soap_acceleration,
                pd.product_url,
                pd.usage_notes,
                pd.blending_notes
            FROM fragrance_oils o
            LEFT JOIN suppliers s ON o.supplier_id = s.id
            LEFT JOIN product_details pd ON pd.product_id = o.id AND pd.product_type = 'oil'
            ORDER BY s.name, o.product_name
        `);
        
        // Get price tiers for each oil
        for (let oil of result.rows) {
            const tiers = await pool.query(
                'SELECT * FROM price_tiers WHERE product_id = $1 AND product_type = $2',
                [oil.id, 'oil']
            );
            oil.price_tiers = tiers.rows;
            
            // Get IFRA entries
            const ifra = await pool.query(
                'SELECT * FROM ifra_entries WHERE oil_id = $1',
                [oil.id]
            );
            oil.ifra_entries = ifra.rows;
        }
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching oils:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Create oil with all fields
app.post('/api/oils', async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Insert main oil record
        const oilResult = await client.query(`
            INSERT INTO fragrance_oils (
                supplier_id, product_name, sku, flash_point_f,
                solvent_note, specific_gravity, vanillin_pct,
                ifra_version, ifra_date, is_in_library, is_favorite,
                is_custom, categories, intensity_rating, overall_rating
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
        `, [
            req.body.supplier_id,
            req.body.product_name,
            req.body.sku,
            req.body.flash_point_f,
            req.body.solvent_note,
            req.body.specific_gravity,
            req.body.vanillin_pct,
            req.body.ifra_version,
            req.body.ifra_date,
            req.body.is_in_library || false,
            req.body.is_favorite || false,
            req.body.is_custom || false,
            req.body.categories,
            req.body.intensity_rating,
            req.body.overall_rating
        ]);
        
        const oilId = oilResult.rows[0].id;
        
        // Insert product details if provided
        if (req.body.product_details) {
            const pd = req.body.product_details;
            await client.query(`
                INSERT INTO product_details (
                    product_id, product_type, fragrance_notes_top,
                    fragrance_notes_middle, fragrance_notes_base,
                    theme_family, scent_description, soap_acceleration,
                    product_url, usage_notes, blending_notes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, [
                oilId, 'oil',
                pd.fragrance_notes_top,
                pd.fragrance_notes_middle,
                pd.fragrance_notes_base,
                pd.theme_family,
                pd.scent_description,
                pd.soap_acceleration,
                pd.product_url,
                pd.usage_notes,
                pd.blending_notes
            ]);
        }
        
        // Insert price tiers if provided
        if (req.body.price_tiers) {
            const pt = req.body.price_tiers;
            await client.query(`
                INSERT INTO price_tiers (
                    product_id, product_type, supplier_id,
                    tier1_size, tier1_unit, tier1_price,
                    tier2_size, tier2_unit, tier2_price,
                    tier3_size, tier3_unit, tier3_price
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
                oilId, 'oil', req.body.supplier_id,
                pt.tier1_size, pt.tier1_unit, pt.tier1_price,
                pt.tier2_size, pt.tier2_unit, pt.tier2_price,
                pt.tier3_size, pt.tier3_unit, pt.tier3_price
            ]);
        }
        
        // Insert IFRA entries if provided
        if (req.body.ifra_entries && Array.isArray(req.body.ifra_entries)) {
            for (const entry of req.body.ifra_entries) {
                await client.query(`
                    INSERT INTO ifra_entries (
                        oil_id, product_type_key, category_id, max_pct,
                        certificate_version, certificate_date
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                `, [
                    oilId,
                    entry.product_type_key,
                    entry.category_id || '',
                    entry.max_pct,
                    req.body.ifra_version,
                    req.body.ifra_date
                ]);
            }
        }
        
        await client.query('COMMIT');
        res.status(201).json(oilResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating oil:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        client.release();
    }
});

// Update oil with all fields
app.put('/api/oils/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Update main oil record
        await client.query(`
            UPDATE fragrance_oils SET
                supplier_id = COALESCE($1, supplier_id),
                product_name = COALESCE($2, product_name),
                sku = COALESCE($3, sku),
                flash_point_f = COALESCE($4, flash_point_f),
                solvent_note = COALESCE($5, solvent_note),
                specific_gravity = COALESCE($6, specific_gravity),
                vanillin_pct = COALESCE($7, vanillin_pct),
                ifra_version = COALESCE($8, ifra_version),
                ifra_date = COALESCE($9, ifra_date),
                is_in_library = COALESCE($10, is_in_library),
                is_favorite = COALESCE($11, is_favorite),
                is_custom = COALESCE($12, is_custom),
                categories = COALESCE($13, categories),
                intensity_rating = COALESCE($14, intensity_rating),
                overall_rating = COALESCE($15, overall_rating),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $16
        `, [
            req.body.supplier_id,
            req.body.product_name,
            req.body.sku,
            req.body.flash_point_f,
            req.body.solvent_note,
            req.body.specific_gravity,
            req.body.vanillin_pct,
            req.body.ifra_version,
            req.body.ifra_date,
            req.body.is_in_library,
            req.body.is_favorite,
            req.body.is_custom,
            req.body.categories,
            req.body.intensity_rating,
            req.body.overall_rating,
            id
        ]);
        
        // Update or insert product details
        if (req.body.product_details) {
            const pd = req.body.product_details;
            await client.query(`
                INSERT INTO product_details (
                    product_id, product_type, fragrance_notes_top,
                    fragrance_notes_middle, fragrance_notes_base,
                    theme_family, scent_description, soap_acceleration,
                    product_url, usage_notes, blending_notes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                ON CONFLICT (product_id, product_type) DO UPDATE SET
                    fragrance_notes_top = EXCLUDED.fragrance_notes_top,
                    fragrance_notes_middle = EXCLUDED.fragrance_notes_middle,
                    fragrance_notes_base = EXCLUDED.fragrance_notes_base,
                    theme_family = EXCLUDED.theme_family,
                    scent_description = EXCLUDED.scent_description,
                    soap_acceleration = EXCLUDED.soap_acceleration,
                    product_url = EXCLUDED.product_url,
                    usage_notes = EXCLUDED.usage_notes,
                    blending_notes = EXCLUDED.blending_notes,
                    updated_at = CURRENT_TIMESTAMP
            `, [
                id, 'oil',
                pd.fragrance_notes_top,
                pd.fragrance_notes_middle,
                pd.fragrance_notes_base,
                pd.theme_family,
                pd.scent_description,
                pd.soap_acceleration,
                pd.product_url,
                pd.usage_notes,
                pd.blending_notes
            ]);
        }
        
        // Update or insert price tiers
        if (req.body.price_tiers) {
            const pt = req.body.price_tiers;
            await client.query(`
                INSERT INTO price_tiers (
                    product_id, product_type, supplier_id,
                    tier1_size, tier1_unit, tier1_price,
                    tier2_size, tier2_unit, tier2_price,
                    tier3_size, tier3_unit, tier3_price
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (product_id, product_type) DO UPDATE SET
                    tier1_size = EXCLUDED.tier1_size,
                    tier1_unit = EXCLUDED.tier1_unit,
                    tier1_price = EXCLUDED.tier1_price,
                    tier2_size = EXCLUDED.tier2_size,
                    tier2_unit = EXCLUDED.tier2_unit,
                    tier2_price = EXCLUDED.tier2_price,
                    tier3_size = EXCLUDED.tier3_size,
                    tier3_unit = EXCLUDED.tier3_unit,
                    tier3_price = EXCLUDED.tier3_price,
                    last_updated = CURRENT_TIMESTAMP
            `, [
                id, 'oil', req.body.supplier_id,
                pt.tier1_size, pt.tier1_unit, pt.tier1_price,
                pt.tier2_size, pt.tier2_unit, pt.tier2_price,
                pt.tier3_size, pt.tier3_unit, pt.tier3_price
            ]);
        }
        
        // Update IFRA entries
        if (req.body.ifra_entries && Array.isArray(req.body.ifra_entries)) {
            // Delete existing entries
            await client.query('DELETE FROM ifra_entries WHERE oil_id = $1', [id]);
            
            // Insert new entries
            for (const entry of req.body.ifra_entries) {
                await client.query(`
                    INSERT INTO ifra_entries (
                        oil_id, product_type_key, category_id, max_pct,
                        certificate_version, certificate_date
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                `, [
                    id,
                    entry.product_type_key,
                    entry.category_id || '',
                    entry.max_pct,
                    req.body.ifra_version,
                    req.body.ifra_date
                ]);
            }
        }
        
        await client.query('COMMIT');
        res.json({ message: 'Oil updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating oil:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        client.release();
    }
});

// =====================
// ENHANCED BASE ENDPOINTS WITH ALL FIELDS
// =====================

// Get all bases with price tiers
app.get('/api/bases', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                b.*,
                s.name as supplier_name
            FROM base_products b
            LEFT JOIN suppliers s ON b.supplier_id = s.id
            ORDER BY s.name, b.name
        `);
        
        // Get price tiers for each base
        for (let base of result.rows) {
            const tiers = await pool.query(
                'SELECT * FROM price_tiers WHERE product_id = $1 AND product_type = $2',
                [base.id, 'base']
            );
            base.price_tiers = tiers.rows;
        }
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching bases:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Create base with all fields
app.post('/api/bases', async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Insert main base record
        const baseResult = await client.query(`
            INSERT INTO base_products (
                supplier_id, name, sku, base_type, max_load_pct,
                unit_mode, specific_gravity, ifra_category,
                ifra_category_2, is_dual_purpose, wax_type,
                notes, is_in_library, is_custom,
                ease_of_use_rating, performance_rating
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *
        `, [
            req.body.supplier_id,
            req.body.name,
            req.body.sku,
            req.body.base_type,
            req.body.max_load_pct,
            req.body.unit_mode,
            req.body.specific_gravity,
            req.body.ifra_category,
            req.body.ifra_category_2,
            req.body.is_dual_purpose || false,
            req.body.wax_type,
            req.body.notes,
            req.body.is_in_library || false,
            req.body.is_custom || false,
            req.body.ease_of_use_rating,
            req.body.performance_rating
        ]);
        
        const baseId = baseResult.rows[0].id;
        
        // Insert price tiers if provided
        if (req.body.price_tiers) {
            const pt = req.body.price_tiers;
            await client.query(`
                INSERT INTO price_tiers (
                    product_id, product_type, supplier_id,
                    tier1_size, tier1_unit, tier1_price,
                    tier2_size, tier2_unit, tier2_price,
                    tier3_size, tier3_unit, tier3_price
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
                baseId, 'base', req.body.supplier_id,
                pt.tier1_size, pt.tier1_unit, pt.tier1_price,
                pt.tier2_size, pt.tier2_unit, pt.tier2_price,
                pt.tier3_size, pt.tier3_unit, pt.tier3_price
            ]);
        }
        
        await client.query('COMMIT');
        res.status(201).json(baseResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating base:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        client.release();
    }
});

// Update base with all fields
app.put('/api/bases/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Update main base record
        await client.query(`
            UPDATE base_products SET
                supplier_id = COALESCE($1, supplier_id),
                name = COALESCE($2, name),
                sku = COALESCE($3, sku),
                base_type = COALESCE($4, base_type),
                max_load_pct = COALESCE($5, max_load_pct),
                unit_mode = COALESCE($6, unit_mode),
                specific_gravity = COALESCE($7, specific_gravity),
                ifra_category = COALESCE($8, ifra_category),
                ifra_category_2 = COALESCE($9, ifra_category_2),
                is_dual_purpose = COALESCE($10, is_dual_purpose),
                wax_type = COALESCE($11, wax_type),
                notes = COALESCE($12, notes),
                is_in_library = COALESCE($13, is_in_library),
                is_custom = COALESCE($14, is_custom),
                ease_of_use_rating = COALESCE($15, ease_of_use_rating),
                performance_rating = COALESCE($16, performance_rating),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $17
        `, [
            req.body.supplier_id,
            req.body.name,
            req.body.sku,
            req.body.base_type,
            req.body.max_load_pct,
            req.body.unit_mode,
            req.body.specific_gravity,
            req.body.ifra_category,
            req.body.ifra_category_2,
            req.body.is_dual_purpose,
            req.body.wax_type,
            req.body.notes,
            req.body.is_in_library,
            req.body.is_custom,
            req.body.ease_of_use_rating,
            req.body.performance_rating,
            id
        ]);
        
        // Update or insert price tiers
        if (req.body.price_tiers) {
            const pt = req.body.price_tiers;
            await client.query(`
                INSERT INTO price_tiers (
                    product_id, product_type, supplier_id,
                    tier1_size, tier1_unit, tier1_price,
                    tier2_size, tier2_unit, tier2_price,
                    tier3_size, tier3_unit, tier3_price
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (product_id, product_type) DO UPDATE SET
                    tier1_size = EXCLUDED.tier1_size,
                    tier1_unit = EXCLUDED.tier1_unit,
                    tier1_price = EXCLUDED.tier1_price,
                    tier2_size = EXCLUDED.tier2_size,
                    tier2_unit = EXCLUDED.tier2_unit,
                    tier2_price = EXCLUDED.tier2_price,
                    tier3_size = EXCLUDED.tier3_size,
                    tier3_unit = EXCLUDED.tier3_unit,
                    tier3_price = EXCLUDED.tier3_price,
                    last_updated = CURRENT_TIMESTAMP
            `, [
                id, 'base', req.body.supplier_id,
                pt.tier1_size, pt.tier1_unit, pt.tier1_price,
                pt.tier2_size, pt.tier2_unit, pt.tier2_price,
                pt.tier3_size, pt.tier3_unit, pt.tier3_price
            ]);
        }
        
        await client.query('COMMIT');
        res.json({ message: 'Base updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating base:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        client.release();
    }
});

// Delete base
app.delete('/api/bases/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'DELETE FROM base_products WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Base not found' });
        }
        
        res.json({ message: 'Base deleted successfully' });
    } catch (error) {
        console.error('Error deleting base:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Delete oil
app.delete('/api/oils/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'DELETE FROM fragrance_oils WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Oil not found' });
        }
        
        res.json({ message: 'Oil deleted successfully' });
    } catch (error) {
        console.error('Error deleting oil:', error);
        res.status(500).json({ error: 'Database error' });
    }
});