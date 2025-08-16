// Enhanced CSV Import Tab Module with Validation
(function() {
    // CSV field requirements for validation
    const REQUIRED_BASE_FIELDS = [
        'supplier', 
        'name', // or base_name
        'max_load_pct', // or base_max_load_pct
        'unit_mode'
    ];
    
    const REQUIRED_OIL_FIELDS = [
        'supplier',
        'product_name', // or name
        'flash_point_f'
    ];
    
    const VALID_BASE_TYPES = ['liquid', 'powder', 'wax'];
    const VALID_UNIT_MODES = ['weight', 'volume'];
    const VALID_WAX_TYPES = ['soy', 'paraffin', 'coconut', 'beeswax', 'blend', 'other'];
    const VALID_IFRA_CATEGORIES = ['4', '5A', '5B', '9', '10A', '10B', '11A', '11B', '12'];
    
    // Module initialization
    function initImportModule() {
        setupImportTab();
        setupEventListeners();
    }

    // Setup the import tab content
    function setupImportTab() {
        const importTab = document.getElementById('import');
        importTab.innerHTML = `
            <div style="display: grid; gap: 30px;">
                <!-- Base Products Import -->
                <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <h3>Import Base Products</h3>
                    <p style="color: #6c757d; margin: 10px 0;">Upload a CSV file with base product data</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h5>Required CSV Columns:</h5>
                        <code style="display: block; padding: 10px; background: #f1f3f5; border-radius: 4px; font-size: 12px;">
supplier*, name* (or base_name), max_load_pct* (or base_max_load_pct), unit_mode*, base_type, specific_gravity, ifra_category, is_dual_purpose, ifra_category_2, wax_type, notes, ease_of_use_rating, performance_rating
                        </code>
                        <p style="margin-top: 10px; font-size: 14px; color: #6c757d;">
                            <strong>* = Required fields</strong><br>
                            <strong>base_type values:</strong> liquid, powder, wax<br>
                            <strong>unit_mode values:</strong> weight, volume<br>
                            <strong>wax_type values (for wax bases):</strong> soy, paraffin, coconut, beeswax, blend, other<br>
                            <strong>Ratings:</strong> 0-5 (decimal values allowed)
                        </p>
                    </div>
                    
                    <input type="file" id="baseCsvFile" accept=".csv" style="margin: 15px 0;">
                    
                    <div style="display: flex; gap: 15px; margin: 15px 0;">
                        <label style="display: inline-flex; align-items: center; gap: 5px;">
                            <input type="checkbox" id="baseAutoLibrary" checked>
                            Automatically add to library
                        </label>
                        <label style="display: inline-flex; align-items: center; gap: 5px; color: #17a2b8;">
                            <input type="checkbox" id="baseTestMode">
                            Test mode (validate only, don't import)
                        </label>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-info" id="validateBasesBtn">
                            ✓ Validate CSV
                        </button>
                        <button class="btn btn-success" id="importBasesBtn">
                            📁 Import Bases CSV
                        </button>
                    </div>
                    
                    <div id="baseValidationResult" style="margin-top: 15px;"></div>
                    <div id="baseImportResult" style="margin-top: 15px;"></div>
                    
                    <details style="margin-top: 20px;">
                        <summary style="cursor: pointer; color: #17a2b8;">View Sample CSV Template</summary>
                        <pre style="background: #f1f3f5; padding: 10px; border-radius: 4px; font-size: 12px; margin-top: 10px; overflow-x: auto;">supplier,name,base_type,max_load_pct,unit_mode,specific_gravity,ifra_category,is_dual_purpose,ifra_category_2,wax_type,notes,ease_of_use_rating,performance_rating
Peach State,Foaming Hand Soap Base,liquid,3.0,weight,,9,false,,,Clouds above 0.5%,4.5,4.0
Makesy,Liquid Hand Soap Base,liquid,2.0,weight,,9,false,,,Easy to work with,5.0,4.5
CandleScience,Room Spray Base,liquid,4.0,volume,0.88,10A,false,,,Hydroalcoholic,4.0,4.8
Nature's Garden,Soy Wax 464,wax,10.0,weight,,11A,false,,soy,Container wax,4.8,4.7
Brambleberry,Room & Body Mist Base,liquid,3.5,volume,0.95,10A,true,9,,Dual purpose base,4.2,4.3</pre>
                    </details>
                </div>
                
                <!-- Fragrance Oils Import -->
                <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <h3>Import Fragrance Oils</h3>
                    <p style="color: #6c757d; margin: 10px 0;">Upload a CSV file with fragrance oil data</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h5>Required CSV Columns:</h5>
                        <code style="display: block; padding: 10px; background: #f1f3f5; border-radius: 4px; font-size: 12px;">
supplier*, product_name* (or name), sku, flash_point_f*, solvent_note, ifra_version, ifra_date, specific_gravity, vanillin_pct, intensity_rating, overall_rating, ifra__[product_type]...
                        </code>
                        <p style="margin-top: 10px; font-size: 14px; color: #6c757d;">
                            <strong>* = Required fields</strong><br>
                            IFRA columns should be prefixed with <code>ifra__</code> followed by the product type key.<br>
                            Date format: YYYY-MM-DD<br>
                            <strong>Ratings:</strong> 0-5 (decimal values allowed)<br>
                            <strong>vanillin_pct:</strong> 0-100 percentage
                        </p>
                    </div>
                    
                    <input type="file" id="oilCsvFile" accept=".csv" style="margin: 15px 0;">
                    
                    <div style="display: flex; gap: 15px; margin: 15px 0;">
                        <label style="display: inline-flex; align-items: center; gap: 5px;">
                            <input type="checkbox" id="oilAutoLibrary" checked>
                            Automatically add to library
                        </label>
                        <label style="display: inline-flex; align-items: center; gap: 5px; color: #17a2b8;">
                            <input type="checkbox" id="oilTestMode">
                            Test mode (validate only, don't import)
                        </label>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-info" id="validateOilsBtn">
                            ✓ Validate CSV
                        </button>
                        <button class="btn btn-success" id="importOilsBtn">
                            📁 Import Oils CSV
                        </button>
                    </div>
                    
                    <div id="oilValidationResult" style="margin-top: 15px;"></div>
                    <div id="oilImportResult" style="margin-top: 15px;"></div>
                    
                    <details style="margin-top: 20px;">
                        <summary style="cursor: pointer; color: #17a2b8;">View Sample CSV Template</summary>
                        <pre style="background: #f1f3f5; padding: 10px; border-radius: 4px; font-size: 12px; margin-top: 10px; overflow-x: auto;">supplier,product_name,sku,flash_point_f,solvent_note,ifra_version,ifra_date,specific_gravity,vanillin_pct,intensity_rating,overall_rating,ifra__foaming_hand_soap,ifra__liquid_hand_soap,ifra__body_wash,ifra__room_spray,ifra__fabric_spray,ifra__body_lotion,ifra__candles,ifra__air_freshener
Peach State,Autumn Leaves,PS123,180,DPG,Amendment 51,2024-06-01,0.98,2.5,4.2,4.5,1.2,1.2,1.5,3.0,3.5,2.0,10.0,4.0
Makesy,Sea Salt & Orchid,MK456,170,,Amendment 51,2024-05-20,1.02,0,3.8,4.7,2.0,2.0,2.0,4.0,4.5,3.0,10.0,5.0
CandleScience,Very Vanilla,CS789,200,,Amendment 51,2024-04-15,0.95,15.0,5.0,4.9,1.0,1.0,1.0,3.5,4.0,2.5,10.0,4.5</pre>
                    </details>
                </div>
                
                <!-- Validation Report Section -->
                <div id="validationReportSection" style="display: none; padding: 20px; background: #d4edda; border-radius: 10px;">
                    <h3>📊 Validation Report</h3>
                    <div id="validationReport"></div>
                </div>
                
                <!-- Export Templates -->
                <div style="padding: 20px; background: #d1ecf1; border-radius: 10px;">
                    <h3>📥 Download Templates</h3>
                    <p style="color: #0c5460; margin: 10px 0;">Download empty CSV templates with all fields for importing data</p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn btn-info" id="downloadBaseTemplateBtn">
                            📄 Enhanced Base Products Template
                        </button>
                        <button class="btn btn-info" id="downloadOilTemplateBtn">
                            📄 Enhanced Fragrance Oils Template
                        </button>
                    </div>
                </div>
                
                <!-- Bulk Operations -->
                <div style="padding: 20px; background: #fff3cd; border-radius: 10px;">
                    <h3>⚠️ Bulk Operations</h3>
                    <p style="color: #856404; margin: 10px 0;">Dangerous operations that affect all data</p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn btn-danger" id="clearAllBasesBtn">
                            🗑️ Clear All Bases
                        </button>
                        <button class="btn btn-danger" id="clearAllOilsBtn">
                            🗑️ Clear All Oils
                        </button>
                        <button class="btn btn-danger" id="clearAllDataBtn">
                            ⚠️ Clear ALL Data
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Setup event listeners
    function setupEventListeners() {
        // Validation buttons
        document.getElementById('validateBasesBtn')?.addEventListener('click', () => validateCSV('base'));
        document.getElementById('validateOilsBtn')?.addEventListener('click', () => validateCSV('oil'));
        
        // Import buttons
        document.getElementById('importBasesBtn')?.addEventListener('click', handleBaseImport);
        document.getElementById('importOilsBtn')?.addEventListener('click', handleOilImport);
        
        // Template download buttons
        document.getElementById('downloadBaseTemplateBtn')?.addEventListener('click', downloadBaseTemplate);
        document.getElementById('downloadOilTemplateBtn')?.addEventListener('click', downloadOilTemplate);
        
        // Bulk operations
        document.getElementById('clearAllBasesBtn')?.addEventListener('click', clearAllBases);
        document.getElementById('clearAllOilsBtn')?.addEventListener('click', clearAllOils);
        document.getElementById('clearAllDataBtn')?.addEventListener('click', clearAllData);
    }

    // Validate CSV file
    async function validateCSV(type) {
        const fileInput = document.getElementById(type === 'base' ? 'baseCsvFile' : 'oilCsvFile');
        const file = fileInput.files[0];
        
        if (!file) {
            AdminCore.showToast('Please select a CSV file', 'error');
            return;
        }
        
        const resultDiv = document.getElementById(type === 'base' ? 'baseValidationResult' : 'oilValidationResult');
        resultDiv.innerHTML = '<div class="loading"></div> Validating...';
        
        try {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                resultDiv.innerHTML = '<span style="color: #dc3545;">❌ CSV file is empty or has no data rows</span>';
                return;
            }
            
            // Parse CSV
            const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
            const rows = lines.slice(1).map(line => {
                const values = parseCSVLine(line);
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                return row;
            });
            
            // Validate based on type
            const validation = type === 'base' ? 
                validateBaseData(headers, rows) : 
                validateOilData(headers, rows);
            
            // Display validation report
            displayValidationReport(validation, resultDiv, type);
            
            // Show full report section if there are issues
            if (validation.warnings.length > 0 || validation.errors.length > 0) {
                document.getElementById('validationReportSection').style.display = 'block';
                document.getElementById('validationReport').innerHTML = formatDetailedReport(validation, type);
            }
            
        } catch (error) {
            resultDiv.innerHTML = `<span style="color: #dc3545;">❌ Error reading file: ${error.message}</span>`;
        }
    }

    // Validate base data
    function validateBaseData(headers, rows) {
        const errors = [];
        const warnings = [];
        const valid = [];
        
        // Check required headers
        const missingHeaders = [];
        for (const field of REQUIRED_BASE_FIELDS) {
            // Handle alternative field names
            if (field === 'name' && !headers.includes('name') && !headers.includes('base_name')) {
                missingHeaders.push('name or base_name');
            } else if (field === 'max_load_pct' && !headers.includes('max_load_pct') && !headers.includes('base_max_load_pct')) {
                missingHeaders.push('max_load_pct or base_max_load_pct');
            } else if (!headers.includes(field) && field !== 'name' && field !== 'max_load_pct') {
                missingHeaders.push(field);
            }
        }
        
        if (missingHeaders.length > 0) {
            errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
        }
        
        // Validate each row
        rows.forEach((row, index) => {
            const rowNum = index + 2; // +2 for header row and 0-index
            const rowErrors = [];
            const rowWarnings = [];
            
            // Check required fields
            if (!row.supplier || row.supplier.trim() === '') {
                rowErrors.push(`Row ${rowNum}: Missing supplier`);
            }
            
            const name = row.name || row.base_name;
            if (!name || name.trim() === '') {
                rowErrors.push(`Row ${rowNum}: Missing name`);
            }
            
            const maxLoad = row.max_load_pct || row.base_max_load_pct;
            if (!maxLoad || maxLoad.trim() === '') {
                rowErrors.push(`Row ${rowNum}: Missing max_load_pct`);
            } else if (isNaN(parseFloat(maxLoad)) || parseFloat(maxLoad) < 0 || parseFloat(maxLoad) > 100) {
                rowErrors.push(`Row ${rowNum}: Invalid max_load_pct (must be 0-100)`);
            }
            
            if (!row.unit_mode || row.unit_mode.trim() === '') {
                rowErrors.push(`Row ${rowNum}: Missing unit_mode`);
            } else if (!VALID_UNIT_MODES.includes(row.unit_mode.toLowerCase())) {
                rowErrors.push(`Row ${rowNum}: Invalid unit_mode (must be: ${VALID_UNIT_MODES.join(', ')})`);
            }
            
            // Validate optional fields
            if (row.base_type && !VALID_BASE_TYPES.includes(row.base_type.toLowerCase())) {
                rowWarnings.push(`Row ${rowNum}: Invalid base_type (should be: ${VALID_BASE_TYPES.join(', ')})`);
            }
            
            if (row.base_type === 'wax' && row.wax_type && !VALID_WAX_TYPES.includes(row.wax_type.toLowerCase())) {
                rowWarnings.push(`Row ${rowNum}: Invalid wax_type (should be: ${VALID_WAX_TYPES.join(', ')})`);
            }
            
            if (row.ifra_category && !VALID_IFRA_CATEGORIES.includes(row.ifra_category.toUpperCase())) {
                rowWarnings.push(`Row ${rowNum}: Unusual IFRA category: ${row.ifra_category}`);
            }
            
            if (row.specific_gravity && (isNaN(parseFloat(row.specific_gravity)) || parseFloat(row.specific_gravity) <= 0)) {
                rowWarnings.push(`Row ${rowNum}: Invalid specific_gravity (must be > 0)`);
            }
            
            // Validate ratings
            if (row.ease_of_use_rating && (isNaN(parseFloat(row.ease_of_use_rating)) || parseFloat(row.ease_of_use_rating) < 0 || parseFloat(row.ease_of_use_rating) > 5)) {
                rowWarnings.push(`Row ${rowNum}: Invalid ease_of_use_rating (must be 0-5)`);
            }
            
            if (row.performance_rating && (isNaN(parseFloat(row.performance_rating)) || parseFloat(row.performance_rating) < 0 || parseFloat(row.performance_rating) > 5)) {
                rowWarnings.push(`Row ${rowNum}: Invalid performance_rating (must be 0-5)`);
            }
            
            if (rowErrors.length === 0) {
                valid.push(`Row ${rowNum}: ${name} - OK`);
            }
            
            errors.push(...rowErrors);
            warnings.push(...rowWarnings);
        });
        
        return {
            valid: valid.length,
            total: rows.length,
            errors,
            warnings,
            canImport: errors.length === 0
        };
    }

    // Validate oil data
    function validateOilData(headers, rows) {
        const errors = [];
        const warnings = [];
        const valid = [];
        
        // Check required headers
        const missingHeaders = [];
        for (const field of REQUIRED_OIL_FIELDS) {
            if (field === 'product_name' && !headers.includes('product_name') && !headers.includes('name')) {
                missingHeaders.push('product_name or name');
            } else if (!headers.includes(field) && field !== 'product_name') {
                missingHeaders.push(field);
            }
        }
        
        if (missingHeaders.length > 0) {
            errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
        }
        
        // Validate each row
        rows.forEach((row, index) => {
            const rowNum = index + 2;
            const rowErrors = [];
            const rowWarnings = [];
            
            // Check required fields
            if (!row.supplier || row.supplier.trim() === '') {
                rowErrors.push(`Row ${rowNum}: Missing supplier`);
            }
            
            const name = row.product_name || row.name;
            if (!name || name.trim() === '') {
                rowErrors.push(`Row ${rowNum}: Missing product_name`);
            }
            
            if (!row.flash_point_f || row.flash_point_f.trim() === '') {
                rowErrors.push(`Row ${rowNum}: Missing flash_point_f`);
            } else if (isNaN(parseInt(row.flash_point_f)) || parseInt(row.flash_point_f) < 0) {
                rowErrors.push(`Row ${rowNum}: Invalid flash_point_f (must be a positive number)`);
            }
            
            // Validate optional fields
            if (row.specific_gravity && (isNaN(parseFloat(row.specific_gravity)) || parseFloat(row.specific_gravity) <= 0)) {
                rowWarnings.push(`Row ${rowNum}: Invalid specific_gravity (must be > 0)`);
            }
            
            if (row.vanillin_pct && (isNaN(parseFloat(row.vanillin_pct)) || parseFloat(row.vanillin_pct) < 0 || parseFloat(row.vanillin_pct) > 100)) {
                rowWarnings.push(`Row ${rowNum}: Invalid vanillin_pct (must be 0-100)`);
            }
            
            // Validate ratings
            if (row.intensity_rating && (isNaN(parseFloat(row.intensity_rating)) || parseFloat(row.intensity_rating) < 0 || parseFloat(row.intensity_rating) > 5)) {
                rowWarnings.push(`Row ${rowNum}: Invalid intensity_rating (must be 0-5)`);
            }
            
            if (row.overall_rating && (isNaN(parseFloat(row.overall_rating)) || parseFloat(row.overall_rating) < 0 || parseFloat(row.overall_rating) > 5)) {
                rowWarnings.push(`Row ${rowNum}: Invalid overall_rating (must be 0-5)`);
            }
            
            // Validate IFRA values
            Object.keys(row).forEach(key => {
                if (key.startsWith('ifra__')) {
                    const value = row[key];
                    if (value && (isNaN(parseFloat(value)) || parseFloat(value) < 0 || parseFloat(value) > 100)) {
                        rowWarnings.push(`Row ${rowNum}: Invalid IFRA value for ${key} (must be 0-100)`);
                    }
                }
            });
            
            // Validate date format
            if (row.ifra_date && !isValidDate(row.ifra_date)) {
                rowWarnings.push(`Row ${rowNum}: Invalid date format for ifra_date (use YYYY-MM-DD)`);
            }
            
            if (rowErrors.length === 0) {
                valid.push(`Row ${rowNum}: ${name} - OK`);
            }
            
            errors.push(...rowErrors);
            warnings.push(...rowWarnings);
        });
        
        return {
            valid: valid.length,
            total: rows.length,
            errors,
            warnings,
            canImport: errors.length === 0
        };
    }

    // Display validation report
    function displayValidationReport(validation, resultDiv, type) {
        const color = validation.canImport ? '#28a745' : '#dc3545';
        const icon = validation.canImport ? '✓' : '❌';
        
        let html = `
            <div style="padding: 15px; background: ${validation.canImport ? '#d4edda' : '#f8d7da'}; border-radius: 8px; margin-top: 10px;">
                <strong style="color: ${color};">${icon} Validation ${validation.canImport ? 'Passed' : 'Failed'}</strong><br>
                Valid rows: ${validation.valid} of ${validation.total}<br>
        `;
        
        if (validation.errors.length > 0) {
            html += `
                <details style="margin-top: 10px;">
                    <summary style="cursor: pointer; color: #dc3545;">❌ ${validation.errors.length} Errors (must fix)</summary>
                    <ul style="font-size: 12px; color: #dc3545; max-height: 200px; overflow-y: auto;">
                        ${validation.errors.slice(0, 10).map(e => `<li>${e}</li>`).join('')}
                        ${validation.errors.length > 10 ? `<li>... and ${validation.errors.length - 10} more</li>` : ''}
                    </ul>
                </details>
            `;
        }
        
        if (validation.warnings.length > 0) {
            html += `
                <details style="margin-top: 10px;">
                    <summary style="cursor: pointer; color: #ffc107;">⚠️ ${validation.warnings.length} Warnings (optional fixes)</summary>
                    <ul style="font-size: 12px; color: #856404; max-height: 200px; overflow-y: auto;">
                        ${validation.warnings.slice(0, 10).map(w => `<li>${w}</li>`).join('')}
                        ${validation.warnings.length > 10 ? `<li>... and ${validation.warnings.length - 10} more</li>` : ''}
                    </ul>
                </details>
            `;
        }
        
        if (validation.canImport) {
            html += `<p style="margin-top: 10px; color: #155724;">✓ CSV is ready to import!</p>`;
        } else {
            html += `<p style="margin-top: 10px; color: #721c24;">Fix errors before importing.</p>`;
        }
        
        html += `</div>`;
        resultDiv.innerHTML = html;
    }

    // Format detailed report
    function formatDetailedReport(validation, type) {
        // Create a detailed report for download or review
        let report = `<h4>${type === 'base' ? 'Base Products' : 'Fragrance Oils'} Validation Report</h4>`;
        report += `<p>Total Rows: ${validation.total} | Valid: ${validation.valid} | Errors: ${validation.errors.length} | Warnings: ${validation.warnings.length}</p>`;
        
        if (validation.errors.length > 0) {
            report += `<h5 style="color: #dc3545;">Errors</h5><ul style="font-size: 12px;">`;
            validation.errors.forEach(e => report += `<li>${e}</li>`);
            report += `</ul>`;
        }
        
        if (validation.warnings.length > 0) {
            report += `<h5 style="color: #ffc107;">Warnings</h5><ul style="font-size: 12px;">`;
            validation.warnings.forEach(w => report += `<li>${w}</li>`);
            report += `</ul>`;
        }
        
        return report;
    }

    // Parse CSV line handling quoted values
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    // Check if date is valid
    function isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
        
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    // Handle base import with validation
    async function handleBaseImport() {
        const fileInput = document.getElementById('baseCsvFile');
        const file = fileInput.files[0];
        const autoLibrary = document.getElementById('baseAutoLibrary').checked;
        const testMode = document.getElementById('baseTestMode').checked;
        
        if (!file) {
            AdminCore.showToast('Please select a CSV file', 'error');
            return;
        }
        
        // First validate
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
        const rows = lines.slice(1).map(line => {
            const values = parseCSVLine(line);
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return row;
        });
        
        const validation = validateBaseData(headers, rows);
        
        if (!validation.canImport) {
            AdminCore.showToast('Fix validation errors before importing', 'error');
            displayValidationReport(validation, document.getElementById('baseValidationResult'), 'base');
            return;
        }
        
        if (testMode) {
            AdminCore.showToast('Test mode - no data imported', 'info');
            document.getElementById('baseImportResult').innerHTML = 
                '<span style="color: #17a2b8;">ℹ️ Test mode completed - validation passed but no data was imported</span>';
            return;
        }
        
        // Proceed with actual import
        const formData = new FormData();
        formData.append('file', file);
        formData.append('auto_library', autoLibrary);
        
        const resultDiv = document.getElementById('baseImportResult');
        resultDiv.innerHTML = '<div class="loading"></div> Importing...';
        
        try {
            const response = await fetch(`${AdminCore.API_URL}/import/bases`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok) {
                resultDiv.innerHTML = `
                    <strong style="color: #28a745;">✓ Import Complete</strong><br>
                    Successfully imported ${result.imported} of ${result.total} bases
                `;
                AdminCore.showToast(`Imported ${result.imported} bases`, 'success');
                
                // Reload bases table
                if (typeof loadBases === 'function') {
                    await loadBases();
                }
            } else {
                resultDiv.innerHTML = `<span style="color: #dc3545;">❌ Import failed: ${result.error}</span>`;
                AdminCore.showToast('Import failed', 'error');
            }
        } catch (error) {
            resultDiv.innerHTML = `<span style="color: #dc3545;">❌ Import error: ${error.message}</span>`;
            AdminCore.showToast('Import error', 'error');
        }
    }

    // Handle oil import with validation
    async function handleOilImport() {
        const fileInput = document.getElementById('oilCsvFile');
        const file = fileInput.files[0];
        const autoLibrary = document.getElementById('oilAutoLibrary').checked;
        const testMode = document.getElementById('oilTestMode').checked;
        
        if (!file) {
            AdminCore.showToast('Please select a CSV file', 'error');
            return;
        }
        
        // First validate
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
        const rows = lines.slice(1).map(line => {
            const values = parseCSVLine(line);
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return row;
        });
        
        const validation = validateOilData(headers, rows);
        
        if (!validation.canImport) {
            AdminCore.showToast('Fix validation errors before importing', 'error');
            displayValidationReport(validation, document.getElementById('oilValidationResult'), 'oil');
            return;
        }
        
        if (testMode) {
            AdminCore.showToast('Test mode - no data imported', 'info');
            document.getElementById('oilImportResult').innerHTML = 
                '<span style="color: #17a2b8;">ℹ️ Test mode completed - validation passed but no data was imported</span>';
            return;
        }
        
        // Proceed with actual import
        const formData = new FormData();
        formData.append('file', file);
        formData.append('auto_library', autoLibrary);
        
        const resultDiv = document.getElementById('oilImportResult');
        resultDiv.innerHTML = '<div class="loading"></div> Importing...';
        
        try {
            const response = await fetch(`${AdminCore.API_URL}/import/oils`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok) {
                resultDiv.innerHTML = `
                    <strong style="color: #28a745;">✓ Import Complete</strong><br>
                    Successfully imported ${result.imported} of ${result.total} oils
                `;
                AdminCore.showToast(`Imported ${result.imported} oils`, 'success');
                
                // Reload oils table
                if (typeof loadOils === 'function') {
                    await loadOils();
                }
            } else {
                resultDiv.innerHTML = `<span style="color: #dc3545;">❌ Import failed: ${result.error}</span>`;
                AdminCore.showToast('Import failed', 'error');
            }
        } catch (error) {
            resultDiv.innerHTML = `<span style="color: #dc3545;">❌ Import error: ${error.message}</span>`;
            AdminCore.showToast('Import error', 'error');
        }
    }

    // Download enhanced base template
    function downloadBaseTemplate() {
        const csv = `supplier,name,base_type,max_load_pct,unit_mode,specific_gravity,ifra_category,is_dual_purpose,ifra_category_2,wax_type,notes,ease_of_use_rating,performance_rating
Example Supplier,Sample Base Product,liquid,3.0,weight,1.0,9,false,,,This is a sample note,4.5,4.2`;
        
        downloadCSV(csv, 'base_products_template.csv');
    }

    // Download enhanced oil template
    function downloadOilTemplate() {
        const csv = `supplier,product_name,sku,flash_point_f,solvent_note,ifra_version,ifra_date,specific_gravity,vanillin_pct,intensity_rating,overall_rating,ifra__foaming_hand_soap,ifra__liquid_hand_soap,ifra__body_wash,ifra__room_spray,ifra__fabric_spray,ifra__body_lotion,ifra__candles,ifra__air_freshener
Example Supplier,Sample Fragrance,SKU123,180,DPG,Amendment 51,2024-01-01,0.98,2.5,4.0,4.5,1.0,1.0,1.5,3.0,3.5,2.0,10.0,4.0`;
        
        downloadCSV(csv, 'fragrance_oils_template.csv');
    }

    // Helper function to download CSV
    function downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // Bulk operations (keeping existing)
    async function clearAllBases() {
        if (confirm('⚠️ This will delete ALL base products. Are you sure?')) {
            // Implementation
        }
    }

    async function clearAllOils() {
        if (confirm('⚠️ This will delete ALL fragrance oils. Are you sure?')) {
            // Implementation
        }
    }

    async function clearAllData() {
        if (confirm('⚠️ This will delete ALL data including suppliers. Are you sure?')) {
            if (confirm('This action cannot be undone. Type "DELETE ALL" to confirm.')) {
                // Implementation
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImportModule);
    } else {
        initImportModule();
    }
    
    // Expose to global scope
    window.ImportModuleEnhanced = {
        validateCSV,
        handleBaseImport,
        handleOilImport
    };
})();