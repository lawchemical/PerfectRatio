// Complete Import Module with All Fields Support
(function() {
    // Module initialization
    async function initImportModule() {
        setupImportTab();
    }

    // Setup the import tab with comprehensive template downloads
    function setupImportTab() {
        const importTab = document.getElementById('import');
        importTab.innerHTML = `
            <div class="import-section">
                <h3>📥 Bulk Import Data</h3>
                <p>Import your products in bulk using CSV files. Download the templates below to see the required format.</p>
                
                <!-- Template Downloads -->
                <div class="template-section">
                    <h4>📄 Download Templates</h4>
                    <div class="template-grid">
                        <button class="btn btn-secondary" onclick="downloadTemplate('suppliers')">
                            📦 Suppliers Template
                        </button>
                        <button class="btn btn-secondary" onclick="downloadTemplate('bases')">
                            🧪 Base Products Template
                        </button>
                        <button class="btn btn-secondary" onclick="downloadTemplate('oils')">
                            💐 Fragrance Oils Template
                        </button>
                        <button class="btn btn-secondary" onclick="downloadTemplate('vessels')">
                            🍶 Vessels Template
                        </button>
                        <button class="btn btn-secondary" onclick="downloadTemplate('price_tiers')">
                            💰 Price Tiers Template
                        </button>
                        <button class="btn btn-secondary" onclick="downloadTemplate('ifra')">
                            📋 IFRA Data Template
                        </button>
                    </div>
                </div>
                
                <!-- Import Forms -->
                <div class="import-forms">
                    <!-- Suppliers Import -->
                    <div class="import-card">
                        <h4>Import Suppliers</h4>
                        <form id="importSuppliersForm" enctype="multipart/form-data">
                            <input type="file" name="file" accept=".csv" required>
                            <button type="submit" class="btn btn-primary">Import Suppliers</button>
                        </form>
                    </div>
                    
                    <!-- Base Products Import -->
                    <div class="import-card">
                        <h4>Import Base Products</h4>
                        <form id="importBasesForm" enctype="multipart/form-data">
                            <input type="file" name="file" accept=".csv" required>
                            <div class="checkbox-group">
                                <input type="checkbox" id="baseAutoLibrary" name="auto_library">
                                <label for="baseAutoLibrary">Add all to library</label>
                            </div>
                            <button type="submit" class="btn btn-primary">Import Base Products</button>
                        </form>
                    </div>
                    
                    <!-- Fragrance Oils Import -->
                    <div class="import-card">
                        <h4>Import Fragrance Oils</h4>
                        <form id="importOilsForm" enctype="multipart/form-data">
                            <input type="file" name="file" accept=".csv" required>
                            <div class="checkbox-group">
                                <input type="checkbox" id="oilAutoLibrary" name="auto_library">
                                <label for="oilAutoLibrary">Add all to library</label>
                            </div>
                            <button type="submit" class="btn btn-primary">Import Fragrance Oils</button>
                        </form>
                    </div>
                    
                    <!-- Vessels Import -->
                    <div class="import-card">
                        <h4>Import Vessels</h4>
                        <form id="importVesselsForm" enctype="multipart/form-data">
                            <input type="file" name="file" accept=".csv" required>
                            <div class="checkbox-group">
                                <input type="checkbox" id="vesselAutoLibrary" name="auto_library">
                                <label for="vesselAutoLibrary">Add all to library</label>
                            </div>
                            <button type="submit" class="btn btn-primary">Import Vessels</button>
                        </form>
                    </div>
                    
                    <!-- Price Tiers Import -->
                    <div class="import-card">
                        <h4>Import Price Tiers</h4>
                        <form id="importPriceTiersForm" enctype="multipart/form-data">
                            <input type="file" name="file" accept=".csv" required>
                            <button type="submit" class="btn btn-primary">Import Price Tiers</button>
                        </form>
                    </div>
                    
                    <!-- IFRA Data Import -->
                    <div class="import-card">
                        <h4>Import IFRA Data</h4>
                        <form id="importIFRAForm" enctype="multipart/form-data">
                            <input type="file" name="file" accept=".csv" required>
                            <button type="submit" class="btn btn-primary">Import IFRA Data</button>
                        </form>
                    </div>
                </div>
                
                <!-- Import Results -->
                <div id="importResults" class="import-results" style="display: none;">
                    <h4>Import Results</h4>
                    <div id="importResultsContent"></div>
                </div>
            </div>
            
            <style>
                .import-section {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .template-section {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 30px;
                }
                
                .template-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }
                
                .import-forms {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 20px;
                }
                
                .import-card {
                    background: white;
                    border: 2px solid #e9ecef;
                    border-radius: 10px;
                    padding: 20px;
                }
                
                .import-card h4 {
                    margin-bottom: 15px;
                    color: #495057;
                }
                
                .import-card input[type="file"] {
                    display: block;
                    width: 100%;
                    padding: 10px;
                    border: 2px dashed #dee2e6;
                    border-radius: 8px;
                    margin-bottom: 15px;
                    cursor: pointer;
                }
                
                .import-card input[type="file"]:hover {
                    border-color: #667eea;
                }
                
                .import-results {
                    margin-top: 30px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                }
                
                .import-success {
                    color: #28a745;
                    font-weight: bold;
                }
                
                .import-error {
                    color: #dc3545;
                    font-weight: bold;
                }
                
                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }
                
                .btn-secondary:hover {
                    background: #5a6268;
                }
            </style>
        `;

        // Setup form handlers
        setupImportHandlers();
    }

    // Setup import form handlers
    function setupImportHandlers() {
        // Suppliers import
        document.getElementById('importSuppliersForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleImport('suppliers', e.target);
        });

        // Base products import
        document.getElementById('importBasesForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleImport('bases', e.target);
        });

        // Fragrance oils import
        document.getElementById('importOilsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleImport('oils', e.target);
        });

        // Vessels import
        document.getElementById('importVesselsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleImport('vessels', e.target);
        });

        // Price tiers import
        document.getElementById('importPriceTiersForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleImport('price-tiers', e.target);
        });

        // IFRA data import
        document.getElementById('importIFRAForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleImport('ifra', e.target);
        });
    }

    // Handle import
    async function handleImport(type, form) {
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Importing...';
            
            const response = await fetch(`${AdminCore.API_URL}/import/${type}`, {
                method: 'POST',
                headers: AdminCore.getAuthHeaders(),
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showImportResults({
                    success: true,
                    type: type,
                    imported: result.imported,
                    total: result.total,
                    errors: result.errors
                });
                AdminCore.showToast(`Successfully imported ${result.imported} of ${result.total} items`, 'success');
                form.reset();
            } else {
                throw new Error(result.error || 'Import failed');
            }
        } catch (error) {
            showImportResults({
                success: false,
                type: type,
                error: error.message
            });
            AdminCore.showToast(`Import failed: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    // Show import results
    function showImportResults(result) {
        const resultsDiv = document.getElementById('importResults');
        const contentDiv = document.getElementById('importResultsContent');
        
        resultsDiv.style.display = 'block';
        
        if (result.success) {
            contentDiv.innerHTML = `
                <div class="import-success">
                    ✅ Successfully imported ${result.imported} of ${result.total} ${result.type}
                </div>
                ${result.errors && result.errors.length > 0 ? `
                    <div class="import-warnings">
                        <h5>Warnings:</h5>
                        <ul>
                            ${result.errors.map(err => `<li>${err}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            `;
        } else {
            contentDiv.innerHTML = `
                <div class="import-error">
                    ❌ Import failed: ${result.error}
                </div>
            `;
        }
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            resultsDiv.style.display = 'none';
        }, 10000);
    }

    // Download template
    window.downloadTemplate = function(type) {
        let csvContent = '';
        let filename = '';
        
        switch(type) {
            case 'suppliers':
                csvContent = 'name,email,website_url,phone\n';
                csvContent += 'Example Supplier,contact@example.com,https://example.com,555-0123\n';
                csvContent += 'Another Supplier,info@another.com,https://another.com,555-0456\n';
                filename = 'suppliers_template.csv';
                break;
                
            case 'bases':
                csvContent = 'supplier,name,sku,base_type,max_load_pct,unit_mode,specific_gravity,ifra_category,ifra_category_2,is_dual_purpose,wax_type,notes,ease_of_use_rating,performance_rating\n';
                csvContent += 'Example Supplier,Foaming Hand Soap Base,FHS-001,soap_foaming,3.0,weight,1.02,9,,FALSE,,Great lather,4.5,4.8\n';
                csvContent += 'Example Supplier,Soy Wax 464,SW-464,candle_soy,10.0,weight,0.9,12,,FALSE,464 Soy,Easy to work with,5.0,4.5\n';
                csvContent += 'Example Supplier,Body Lotion Base,BL-001,lotion,2.0,weight,0.98,5A,9,TRUE,,Dual purpose base,4.0,4.2\n';
                filename = 'base_products_template.csv';
                break;
                
            case 'oils':
                csvContent = 'supplier,product_name,sku,flash_point_f,specific_gravity,vanillin_pct,solvent_note,ifra_version,ifra_date,categories,theme_family,fragrance_notes_top,fragrance_notes_middle,fragrance_notes_base,scent_description,soap_acceleration,intensity_rating,overall_rating\n';
                csvContent += 'Example Supplier,Lavender Dreams,LD-001,170,0.88,0,DPG,Amendment 51,2024-01-15,"Floral,Fresh",Aromatic,"Lavender,Bergamot","Rose,Geranium","Musk,Vanilla","A calming blend of lavender with soft floral notes",none,3.5,4.2\n';
                csvContent += 'Example Supplier,Vanilla Bean,VB-002,200,0.92,12,DPG,Amendment 51,2024-01-15,"Gourmand,Sweet",Oriental,"Caramel","Vanilla,Tonka Bean","Benzoin,Musk","Rich vanilla with caramel sweetness",moderate,4.0,4.5\n';
                csvContent += 'Example Supplier,Ocean Breeze,OB-003,185,0.89,0,None,Amendment 51,2024-01-15,"Fresh,Aquatic",Marine,"Bergamot,Lemon,Sea Salt","Jasmine,Lily","Driftwood,Musk","Fresh ocean air with citrus notes",none,2.5,4.0\n';
                filename = 'fragrance_oils_template.csv';
                break;
                
            case 'vessels':
                csvContent = 'supplier,name,sku,vessel_type,material,color,size,size_unit,neck_size,shape,price_per_unit,case_count,case_price,minimum_order_quantity,weight_grams,max_fill_volume,recommended_fill_size,overflow_fill_size,notes,product_url,image_url\n';
                csvContent += 'Example Supplier,8oz Boston Round,BR-8OZ,bottle,glass,amber,8,oz,24-410,round,1.25,12,15.00,12,120,8.5,8.0,9.0,Classic amber bottle,https://example.com/product1,https://example.com/image1.jpg\n';
                csvContent += 'Example Supplier,4oz Spray Bottle,SP-4OZ,spray_bottle,plastic,clear,4,oz,20-410,cylinder,0.75,24,18.00,24,35,4.2,4.0,4.5,Fine mist sprayer included,https://example.com/product2,https://example.com/image2.jpg\n';
                csvContent += 'Example Supplier,16oz Mason Jar,MJ-16OZ,jar,glass,clear,16,oz,70-450,round,2.50,6,15.00,6,250,16.5,16.0,17.0,Wide mouth jar,https://example.com/product3,https://example.com/image3.jpg\n';
                filename = 'vessels_template.csv';
                break;
                
            case 'price_tiers':
                csvContent = 'product_type,product_name,supplier,tier1_size,tier1_unit,tier1_price,tier2_size,tier2_unit,tier2_price,tier3_size,tier3_unit,tier3_price,tier4_size,tier4_unit,tier4_price,tier5_size,tier5_unit,tier5_price\n';
                csvContent += 'oil,Lavender Dreams,Example Supplier,1,oz,5.99,4,oz,19.99,16,oz,69.99,32,oz,129.99,128,oz,449.99\n';
                csvContent += 'base,Foaming Hand Soap Base,Example Supplier,16,oz,8.99,1,gal,24.99,5,gal,99.99,,,,,,,\n';
                csvContent += 'vessel,8oz Boston Round,Example Supplier,1,units,1.25,12,units,15.00,144,units,150.00,,,,,,,\n';
                filename = 'price_tiers_template.csv';
                break;
                
            case 'ifra':
                csvContent = 'product_name,supplier,product_type_key,category_id,max_pct,certificate_version,certificate_date\n';
                csvContent += 'Lavender Dreams,Example Supplier,foaming_hand_soap,9,3.5,Amendment 51,2024-01-15\n';
                csvContent += 'Lavender Dreams,Example Supplier,liquid_hand_soap,9,3.5,Amendment 51,2024-01-15\n';
                csvContent += 'Lavender Dreams,Example Supplier,body_wash,9,3.5,Amendment 51,2024-01-15\n';
                csvContent += 'Lavender Dreams,Example Supplier,body_lotion,5A,2.0,Amendment 51,2024-01-15\n';
                csvContent += 'Lavender Dreams,Example Supplier,room_spray,10A,10.0,Amendment 51,2024-01-15\n';
                csvContent += 'Lavender Dreams,Example Supplier,candles,12,100.0,Amendment 51,2024-01-15\n';
                csvContent += 'Vanilla Bean,Example Supplier,foaming_hand_soap,9,2.0,Amendment 51,2024-01-15\n';
                csvContent += 'Vanilla Bean,Example Supplier,liquid_hand_soap,9,2.0,Amendment 51,2024-01-15\n';
                csvContent += 'Vanilla Bean,Example Supplier,body_wash,9,2.0,Amendment 51,2024-01-15\n';
                csvContent += 'Vanilla Bean,Example Supplier,body_lotion,5A,1.0,Amendment 51,2024-01-15\n';
                csvContent += 'Vanilla Bean,Example Supplier,room_spray,10A,8.0,Amendment 51,2024-01-15\n';
                csvContent += 'Vanilla Bean,Example Supplier,candles,12,100.0,Amendment 51,2024-01-15\n';
                filename = 'ifra_data_template.csv';
                break;
        }
        
        // Create and download the CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        AdminCore.showToast(`Downloaded ${filename}`, 'success');
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImportModule);
    } else {
        initImportModule();
    }
})();