// Import Module for Admin Panel
(function() {
    // Module initialization
    async function initImportModule() {
        setupImportTab();
        setupImportHandlers();
    }

    // Setup the import tab content
    function setupImportTab() {
        // Check if import tab exists, if not create it
        let importTab = document.getElementById('import');
        if (!importTab) {
            const tabsContainer = document.querySelector('.tabs');
            if (tabsContainer) {
                // Add import tab to navigation
                const navTabs = document.querySelector('.nav-tabs');
                if (navTabs && !document.querySelector('[data-tab="import"]')) {
                    const importNavTab = document.createElement('li');
                    importNavTab.className = 'nav-tab';
                    importNavTab.setAttribute('data-tab', 'import');
                    importNavTab.innerHTML = '📥 Import';
                    importNavTab.addEventListener('click', () => {
                        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                        importNavTab.classList.add('active');
                        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                        document.getElementById('import').classList.add('active');
                    });
                    navTabs.appendChild(importNavTab);
                }
                
                // Create import tab content
                importTab = document.createElement('div');
                importTab.className = 'tab-content';
                importTab.id = 'import';
                importTab.style.display = 'none';
                tabsContainer.parentElement.appendChild(importTab);
            }
        }
        
        const importContent = document.getElementById('import');
        importContent.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #101114; margin-bottom: 24px; font-size: 28px;">Import Data</h2>
                
                <div style="background: #F6EDE3; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <p style="margin: 0; color: #2E3033;">
                        <strong>📋 Import Guidelines:</strong><br>
                        • CSV files only (comma-separated values)<br>
                        • First row must contain column headers<br>
                        • Updates will match by SKU for products or Name for suppliers<br>
                        • New items will be created if no match is found
                    </p>
                </div>
                
                <!-- Suppliers Import Section -->
                <div class="import-section" style="background: white; padding: 24px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="color: #101114; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 24px;">🏢</span> Import Suppliers
                    </h3>
                    <p style="color: #6c757d; margin-bottom: 16px;">Import or update supplier information</p>
                    
                    <div style="background: #FAFAF8; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                        <strong>Required columns:</strong> name, contact_email<br>
                        <strong>Optional columns:</strong> contact_phone, website, address, notes
                    </div>
                    
                    <div class="import-controls" style="display: flex; gap: 12px; align-items: center;">
                        <input type="file" id="suppliersFile" accept=".csv" style="display: none;">
                        <button class="btn btn-primary" onclick="document.getElementById('suppliersFile').click()">
                            Choose CSV File
                        </button>
                        <span id="suppliersFileName" style="color: #6c757d;">No file selected</span>
                    </div>
                    
                    <div id="suppliersPreview" style="margin-top: 16px; display: none;">
                        <h4>Preview (first 5 rows)</h4>
                        <div style="overflow-x: auto;">
                            <table class="preview-table" style="width: 100%; font-size: 14px;"></table>
                        </div>
                        <div style="margin-top: 16px; display: flex; gap: 12px;">
                            <button class="btn btn-success" onclick="importSuppliers()">
                                Import <span id="suppliersCount">0</span> Suppliers
                            </button>
                            <button class="btn btn-secondary" onclick="cancelImport('suppliers')">Cancel</button>
                        </div>
                    </div>
                </div>
                
                <!-- Base Products Import Section -->
                <div class="import-section" style="background: white; padding: 24px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="color: #101114; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 24px;">🕯️</span> Import Base Products
                    </h3>
                    <p style="color: #6c757d; margin-bottom: 16px;">Import or update base product catalog</p>
                    
                    <div style="background: #FAFAF8; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                        <strong>Required columns:</strong> name, product_type, supplier_name<br>
                        <strong>Optional columns:</strong> sku, price_per_lb, max_fragrance_load, notes, ifra_category
                    </div>
                    
                    <div class="import-controls" style="display: flex; gap: 12px; align-items: center;">
                        <input type="file" id="basesFile" accept=".csv" style="display: none;">
                        <button class="btn btn-primary" onclick="document.getElementById('basesFile').click()">
                            Choose CSV File
                        </button>
                        <span id="basesFileName" style="color: #6c757d;">No file selected</span>
                    </div>
                    
                    <div id="basesPreview" style="margin-top: 16px; display: none;">
                        <h4>Preview (first 5 rows)</h4>
                        <div style="overflow-x: auto;">
                            <table class="preview-table" style="width: 100%; font-size: 14px;"></table>
                        </div>
                        <div style="margin-top: 16px; display: flex; gap: 12px;">
                            <button class="btn btn-success" onclick="importBases()">
                                Import <span id="basesCount">0</span> Base Products
                            </button>
                            <button class="btn btn-secondary" onclick="cancelImport('bases')">Cancel</button>
                        </div>
                    </div>
                </div>
                
                <!-- Fragrance Oils Import Section -->
                <div class="import-section" style="background: white; padding: 24px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="color: #101114; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 24px;">🌸</span> Import Fragrance Oils
                    </h3>
                    <p style="color: #6c757d; margin-bottom: 16px;">Import or update fragrance oil inventory</p>
                    
                    <div style="background: #FAFAF8; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                        <strong>Required columns:</strong> product_name, supplier_name<br>
                        <strong>Optional columns:</strong> sku, flash_point, ifra_category_12, vanillin_pct, price_tier1, price_tier2, price_tier3, categories, scent_description
                    </div>
                    
                    <div class="import-controls" style="display: flex; gap: 12px; align-items: center;">
                        <input type="file" id="oilsFile" accept=".csv" style="display: none;">
                        <button class="btn btn-primary" onclick="document.getElementById('oilsFile').click()">
                            Choose CSV File
                        </button>
                        <span id="oilsFileName" style="color: #6c757d;">No file selected</span>
                    </div>
                    
                    <div id="oilsPreview" style="margin-top: 16px; display: none;">
                        <h4>Preview (first 5 rows)</h4>
                        <div style="overflow-x: auto;">
                            <table class="preview-table" style="width: 100%; font-size: 14px;"></table>
                        </div>
                        <div style="margin-top: 16px; display: flex; gap: 12px;">
                            <button class="btn btn-success" onclick="importOils()">
                                Import <span id="oilsCount">0</span> Fragrance Oils
                            </button>
                            <button class="btn btn-secondary" onclick="cancelImport('oils')">Cancel</button>
                        </div>
                    </div>
                </div>
                
                <!-- Vessels Import Section -->
                <div class="import-section" style="background: white; padding: 24px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="color: #101114; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 24px;">🏺</span> Import Vessels
                    </h3>
                    <p style="color: #6c757d; margin-bottom: 16px;">Import or update vessel catalog</p>
                    
                    <div style="background: #FAFAF8; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                        <strong>Required columns:</strong> name, vessel_type, size, size_unit, price_per_unit<br>
                        <strong>Optional columns:</strong> sku, supplier_name, material, color, shape, neck_size, case_count
                    </div>
                    
                    <div class="import-controls" style="display: flex; gap: 12px; align-items: center;">
                        <input type="file" id="vesselsFile" accept=".csv" style="display: none;">
                        <button class="btn btn-primary" onclick="document.getElementById('vesselsFile').click()">
                            Choose CSV File
                        </button>
                        <span id="vesselsFileName" style="color: #6c757d;">No file selected</span>
                    </div>
                    
                    <div id="vesselsPreview" style="margin-top: 16px; display: none;">
                        <h4>Preview (first 5 rows)</h4>
                        <div style="overflow-x: auto;">
                            <table class="preview-table" style="width: 100%; font-size: 14px;"></table>
                        </div>
                        <div style="margin-top: 16px; display: flex; gap: 12px;">
                            <button class="btn btn-success" onclick="importVessels()">
                                Import <span id="vesselsCount">0</span> Vessels
                            </button>
                            <button class="btn btn-secondary" onclick="cancelImport('vessels')">Cancel</button>
                        </div>
                    </div>
                </div>
                
                <!-- Download Templates Section -->
                <div style="background: #CEDCC8; padding: 24px; border-radius: 12px; margin-top: 32px;">
                    <h3 style="color: #101114; margin-bottom: 16px;">📄 Download CSV Templates</h3>
                    <p style="color: #2E3033; margin-bottom: 16px;">Use these templates to ensure your data is formatted correctly</p>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <button class="btn btn-secondary" onclick="downloadTemplate('suppliers')">
                            Suppliers Template
                        </button>
                        <button class="btn btn-secondary" onclick="downloadTemplate('bases')">
                            Base Products Template
                        </button>
                        <button class="btn btn-secondary" onclick="downloadTemplate('oils')">
                            Fragrance Oils Template
                        </button>
                        <button class="btn btn-secondary" onclick="downloadTemplate('vessels')">
                            Vessels Template
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Setup import handlers
    function setupImportHandlers() {
        // Suppliers file handler
        const suppliersFile = document.getElementById('suppliersFile');
        if (suppliersFile) {
            suppliersFile.addEventListener('change', (e) => handleFileSelect(e, 'suppliers'));
        }
        
        // Bases file handler
        const basesFile = document.getElementById('basesFile');
        if (basesFile) {
            basesFile.addEventListener('change', (e) => handleFileSelect(e, 'bases'));
        }
        
        // Oils file handler
        const oilsFile = document.getElementById('oilsFile');
        if (oilsFile) {
            oilsFile.addEventListener('change', (e) => handleFileSelect(e, 'oils'));
        }
        
        // Vessels file handler
        const vesselsFile = document.getElementById('vesselsFile');
        if (vesselsFile) {
            vesselsFile.addEventListener('change', (e) => handleFileSelect(e, 'vessels'));
        }
    }

    // Store parsed CSV data
    let importData = {
        suppliers: null,
        bases: null,
        oils: null,
        vessels: null
    };

    // Handle file selection
    function handleFileSelect(event, type) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Update filename display
        document.getElementById(`${type}FileName`).textContent = file.name;
        
        // Parse CSV file
        const reader = new FileReader();
        reader.onload = function(e) {
            const csv = e.target.result;
            const parsed = parseCSV(csv);
            
            if (parsed && parsed.length > 0) {
                importData[type] = parsed;
                showPreview(type, parsed);
            } else {
                AdminCore.showToast('Invalid CSV file or no data found', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Parse CSV content
    function parseCSV(csv) {
        const lines = csv.split('\n').filter(line => line.trim());
        if (lines.length < 2) return null;
        
        // Parse headers
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
        
        // Parse data rows
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index].trim().replace(/^["']|["']$/g, '');
                });
                data.push(row);
            }
        }
        
        return data;
    }

    // Parse a single CSV line (handles commas in quoted fields)
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"' || char === "'") {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    // Show preview of imported data
    function showPreview(type, data) {
        const previewDiv = document.getElementById(`${type}Preview`);
        const table = previewDiv.querySelector('.preview-table');
        const countSpan = document.getElementById(`${type}Count`);
        
        // Update count
        countSpan.textContent = data.length;
        
        // Create preview table
        const previewData = data.slice(0, 5);
        const headers = Object.keys(data[0]);
        
        let tableHTML = '<thead><tr>';
        headers.forEach(header => {
            tableHTML += `<th style="padding: 8px; background: #F6EDE3; text-align: left;">${header}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';
        
        previewData.forEach(row => {
            tableHTML += '<tr>';
            headers.forEach(header => {
                tableHTML += `<td style="padding: 8px; border-bottom: 1px solid #EDEAE6;">${row[header] || ''}</td>`;
            });
            tableHTML += '</tr>';
        });
        
        if (data.length > 5) {
            tableHTML += `<tr><td colspan="${headers.length}" style="padding: 8px; text-align: center; color: #6c757d;">... and ${data.length - 5} more rows</td></tr>`;
        }
        
        tableHTML += '</tbody>';
        table.innerHTML = tableHTML;
        
        // Show preview section
        previewDiv.style.display = 'block';
    }

    // Cancel import
    window.cancelImport = function(type) {
        importData[type] = null;
        document.getElementById(`${type}File`).value = '';
        document.getElementById(`${type}FileName`).textContent = 'No file selected';
        document.getElementById(`${type}Preview`).style.display = 'none';
    };

    // Import suppliers
    window.importSuppliers = async function() {
        const data = importData.suppliers;
        if (!data || data.length === 0) return;
        
        try {
            const response = await AdminCore.apiRequest('/api/admin/import/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data })
            });
            
            AdminCore.showToast(`Successfully imported ${response.created} new and updated ${response.updated} existing suppliers`, 'success');
            cancelImport('suppliers');
            
            // Reload suppliers if the module is available
            if (window.SuppliersModule) {
                window.SuppliersModule.loadSuppliers();
            }
        } catch (error) {
            console.error('Import failed:', error);
            AdminCore.showToast('Failed to import suppliers', 'error');
        }
    };

    // Import base products
    window.importBases = async function() {
        const data = importData.bases;
        if (!data || data.length === 0) return;
        
        try {
            const response = await AdminCore.apiRequest('/api/admin/import/bases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data })
            });
            
            AdminCore.showToast(`Successfully imported ${response.created} new and updated ${response.updated} existing base products`, 'success');
            cancelImport('bases');
            
            // Reload bases if the module is available
            if (window.BasesModule) {
                window.BasesModule.loadBases();
            }
        } catch (error) {
            console.error('Import failed:', error);
            AdminCore.showToast('Failed to import base products', 'error');
        }
    };

    // Import fragrance oils
    window.importOils = async function() {
        const data = importData.oils;
        if (!data || data.length === 0) return;
        
        try {
            const response = await AdminCore.apiRequest('/api/admin/import/oils', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data })
            });
            
            AdminCore.showToast(`Successfully imported ${response.created} new and updated ${response.updated} existing fragrance oils`, 'success');
            cancelImport('oils');
            
            // Reload oils if the module is available
            if (window.OilsModule) {
                window.OilsModule.loadOils();
            }
        } catch (error) {
            console.error('Import failed:', error);
            AdminCore.showToast('Failed to import fragrance oils', 'error');
        }
    };

    // Import vessels
    window.importVessels = async function() {
        const data = importData.vessels;
        if (!data || data.length === 0) return;
        
        try {
            const response = await AdminCore.apiRequest('/api/admin/import/vessels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data })
            });
            
            AdminCore.showToast(`Successfully imported ${response.created} new and updated ${response.updated} existing vessels`, 'success');
            cancelImport('vessels');
            
            // Reload vessels if the module is available
            if (window.VesselsModule) {
                window.VesselsModule.loadVessels();
            }
        } catch (error) {
            console.error('Import failed:', error);
            AdminCore.showToast('Failed to import vessels', 'error');
        }
    };

    // Download CSV template
    window.downloadTemplate = function(type) {
        const templates = {
            suppliers: {
                filename: 'suppliers_template.csv',
                headers: ['name', 'contact_email', 'contact_phone', 'website', 'address', 'notes'],
                sample: ['Acme Supplies', 'contact@acme.com', '555-1234', 'www.acme.com', '123 Main St', 'Primary supplier']
            },
            bases: {
                filename: 'base_products_template.csv',
                headers: ['name', 'product_type', 'supplier_name', 'sku', 'price_per_lb', 'max_fragrance_load', 'notes', 'ifra_category', 'ifra_category_2', 'is_dual_purpose', 'melting_point', 'pour_temp_min', 'pour_temp_max', 'fragrance_temp', 'cure_time_days', 'wax_type', 'ease_of_use_rating', 'performance_rating', 'base_type'],
                sample: ['Soy Wax 464', 'candle', 'Acme Supplies', 'SW464', '2.50', '10', 'Container wax', '12', '9', 'true', '119', '135', '145', '185', '14', 'soy', '4.5', '4.8', 'wax']
            },
            oils: {
                filename: 'fragrance_oils_template.csv',
                headers: [
                    'product_name', 'supplier_name', 'flash_point', 'specific_gravity', 
                    'vanilla_content', 'discoloration', 'ethyl_vanillin', 'vanillin_pct',
                    // Price tier 1
                    'tier1_name', 'tier1_size', 'tier1_unit', 'tier1_price', 'tier1_sku',
                    // Price tier 2
                    'tier2_name', 'tier2_size', 'tier2_unit', 'tier2_price', 'tier2_sku',
                    // Price tier 3
                    'tier3_name', 'tier3_size', 'tier3_unit', 'tier3_price', 'tier3_sku',
                    // Price tier 4
                    'tier4_name', 'tier4_size', 'tier4_unit', 'tier4_price', 'tier4_sku',
                    // Price tier 5
                    'tier5_name', 'tier5_size', 'tier5_unit', 'tier5_price', 'tier5_sku',
                    // IFRA categories with subcategories (removed base categories 5, 7, 10, 11)
                    'ifra_category_1', 'ifra_category_2', 'ifra_category_3', 'ifra_category_4',
                    'ifra_category_5A', 'ifra_category_5B', 'ifra_category_5C', 'ifra_category_5D',
                    'ifra_category_6', 
                    'ifra_category_7A', 'ifra_category_7B',
                    'ifra_category_8', 'ifra_category_9',
                    'ifra_category_10A', 'ifra_category_10B',
                    'ifra_category_11A', 'ifra_category_11B',
                    'ifra_category_12',
                    // Additional fields
                    'categories', 'scent_description', 'is_favorite',
                    'scent_strength_rating', 'cold_throw_rating', 'hot_throw_rating',
                    'acceleration', 'ricing', 'separation',
                    'top_notes', 'middle_notes', 'base_notes',
                    'blends_well_with', 'usage_notes',
                    'ifra_url', 'sds_url', 'image_url'
                ],
                sample: [
                    'Vanilla Bean', 'Fragrance Co', '200', '0.98',
                    '5', 'Medium Brown', '0', '5.5',
                    // Price tiers
                    'Sample', '1', 'oz', '3.99', 'VB001-1',
                    'Small', '4', 'oz', '10.99', 'VB001-4',
                    'Medium', '8', 'oz', '17.99', 'VB001-8',
                    'Large', '16', 'oz', '29.99', 'VB001-16',
                    'Bulk', '32', 'oz', '52.99', 'VB001-32',
                    // IFRA values - removed main categories 5, 7, 10, 11 but kept subcategories
                    '2', '4', '5', '10',  // categories 1-4
                    '8', '8', '8', '8',   // categories 5A-5D
                    '5',                  // category 6
                    '6', '6',             // categories 7A-7B
                    '5', '25',            // categories 8-9
                    '10', '10',           // categories 10A-10B
                    '15', '15',           // categories 11A-11B
                    '100',                // category 12
                    // Additional info
                    'Gourmand,Sweet', 'Rich vanilla with caramel notes', 'false',
                    '4.5', '4.2', '4.8',
                    'None', 'None', 'None',
                    'Vanilla, Caramel', 'Brown Sugar, Tonka', 'Sandalwood, Musk',
                    'Chocolate, Coffee, Amber', 'Works well at 6-10% in CP soap',
                    'https://example.com/vanilla-ifra.pdf', 'https://example.com/vanilla-sds.pdf', 'https://example.com/vanilla.jpg'
                ]
            },
            vessels: {
                filename: 'vessels_template.csv',
                headers: ['name', 'vessel_type', 'size', 'size_unit', 'price_per_unit', 'sku', 'supplier_name', 'material', 'color', 'shape', 'neck_size', 'case_count', 'case_price', 'minimum_order_quantity', 'weight_grams', 'dimensions', 'image_url', 'is_in_library'],
                sample: ['8oz Straight Jar', 'jar', '8', 'oz', '2.50', 'JAR8OZ', 'Container Co', 'glass', 'clear', 'round', '70-400', '12', '30.00', '1', '150', '3x3x4', 'https://example.com/jar.jpg', 'true']
            }
        };
        
        const template = templates[type];
        if (!template) return;
        
        // Create CSV content
        let csvContent = template.headers.join(',') + '\n';
        csvContent += template.sample.join(',') + '\n';
        
        // Download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = template.filename;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImportModule);
    } else {
        initImportModule();
    }

    // Expose to global scope
    window.ImportModule = {
        initImportModule,
        parseCSV,
        downloadTemplate
    };
})();