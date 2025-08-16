// CSV Import Tab Module
(function() {
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
supplier, base_name (or name), base_max_load_pct (or max_load_pct), unit_mode, base_type, specific_gravity, ifra_category, is_dual_purpose, ifra_category_2, wax_type, notes
                        </code>
                        <p style="margin-top: 10px; font-size: 14px; color: #6c757d;">
                            <strong>base_type values:</strong> liquid, powder, wax<br>
                            <strong>wax_type values (for wax bases):</strong> soy, paraffin, coconut, beeswax, blend, other
                        </p>
                    </div>
                    
                    <input type="file" id="baseCsvFile" accept=".csv" style="margin: 15px 0;">
                    <div style="margin: 10px 0;">
                        <label style="display: inline-flex; align-items: center; gap: 5px;">
                            <input type="checkbox" id="baseAutoLibrary" checked>
                            Automatically add to library
                        </label>
                    </div>
                    <button class="btn btn-success" id="importBasesBtn">
                        📁 Import Bases CSV
                    </button>
                    <div id="baseImportResult" style="margin-top: 15px;"></div>
                    
                    <details style="margin-top: 20px;">
                        <summary style="cursor: pointer; color: #17a2b8;">View Sample CSV Template</summary>
                        <pre style="background: #f1f3f5; padding: 10px; border-radius: 4px; font-size: 12px; margin-top: 10px; overflow-x: auto;">supplier,base_name,base_type,base_max_load_pct,unit_mode,specific_gravity,ifra_category,is_dual_purpose,ifra_category_2,wax_type,notes
Peach State,Foaming Hand Soap Base,liquid,3.0,weight,,9,false,,,Clouds above 0.5%
Makesy,Liquid Hand Soap Base,liquid,2.0,weight,,9,false,,,
CandleScience,Room Spray Base,liquid,4.0,volume,0.88,10A,false,,,Hydroalcoholic
Nature's Garden,Soy Wax 464,wax,10.0,weight,,11A,false,,soy,Container wax
Brambleberry,Room & Body Mist Base,liquid,3.5,volume,0.95,10A,true,9,,Dual purpose base</pre>
                    </details>
                </div>
                
                <!-- Fragrance Oils Import -->
                <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <h3>Import Fragrance Oils</h3>
                    <p style="color: #6c757d; margin: 10px 0;">Upload a CSV file with fragrance oil data</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h5>Required CSV Columns:</h5>
                        <code style="display: block; padding: 10px; background: #f1f3f5; border-radius: 4px; font-size: 12px;">
supplier, product_name, sku, flash_point_f, solvent_note, ifra_version, ifra_date, ifra__foaming_hand_soap, ifra__liquid_hand_soap, ifra__body_wash, ifra__room_spray, ifra__fabric_spray, ifra__body_lotion, ifra__candles, ifra__air_freshener
                        </code>
                        <p style="margin-top: 10px; font-size: 14px; color: #6c757d;">
                            IFRA columns should be prefixed with <code>ifra__</code> followed by the product type key.<br>
                            Date format: YYYY-MM-DD
                        </p>
                    </div>
                    
                    <input type="file" id="oilCsvFile" accept=".csv" style="margin: 15px 0;">
                    <div style="margin: 10px 0;">
                        <label style="display: inline-flex; align-items: center; gap: 5px;">
                            <input type="checkbox" id="oilAutoLibrary" checked>
                            Automatically add to library
                        </label>
                    </div>
                    <button class="btn btn-success" id="importOilsBtn">
                        📁 Import Oils CSV
                    </button>
                    <div id="oilImportResult" style="margin-top: 15px;"></div>
                    
                    <details style="margin-top: 20px;">
                        <summary style="cursor: pointer; color: #17a2b8;">View Sample CSV Template</summary>
                        <pre style="background: #f1f3f5; padding: 10px; border-radius: 4px; font-size: 12px; margin-top: 10px; overflow-x: auto;">supplier,product_name,sku,flash_point_f,solvent_note,ifra_version,ifra_date,ifra__foaming_hand_soap,ifra__liquid_hand_soap,ifra__body_wash,ifra__room_spray,ifra__fabric_spray,ifra__body_lotion,ifra__candles,ifra__air_freshener
Peach State,Autumn Leaves,PS123,180,DPG,Amendment 51,2024-06-01,1.2,1.2,1.5,3.0,3.5,2.0,10.0,4.0
Makesy,Sea Salt & Orchid,MK456,170,,Amendment 51,2024-05-20,2.0,2.0,2.0,4.0,4.5,3.0,10.0,5.0
CandleScience,Very Vanilla,CS789,200,,Amendment 51,2024-04-15,1.0,1.0,1.0,3.5,4.0,2.5,10.0,4.5</pre>
                    </details>
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
                
                <!-- Export Templates -->
                <div style="padding: 20px; background: #d1ecf1; border-radius: 10px;">
                    <h3>📥 Download Templates</h3>
                    <p style="color: #0c5460; margin: 10px 0;">Download empty CSV templates for importing data</p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn btn-info" id="downloadBaseTemplateBtn">
                            📄 Base Products Template
                        </button>
                        <button class="btn btn-info" id="downloadOilTemplateBtn">
                            📄 Fragrance Oils Template
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Setup event listeners
    function setupEventListeners() {
        // Import buttons
        const importBasesBtn = document.getElementById('importBasesBtn');
        if (importBasesBtn) {
            importBasesBtn.addEventListener('click', handleBaseImport);
        }
        
        const importOilsBtn = document.getElementById('importOilsBtn');
        if (importOilsBtn) {
            importOilsBtn.addEventListener('click', handleOilImport);
        }
        
        // Bulk operation buttons
        const clearBasesBtn = document.getElementById('clearAllBasesBtn');
        if (clearBasesBtn) {
            clearBasesBtn.addEventListener('click', clearAllBases);
        }
        
        const clearOilsBtn = document.getElementById('clearAllOilsBtn');
        if (clearOilsBtn) {
            clearOilsBtn.addEventListener('click', clearAllOils);
        }
        
        const clearAllBtn = document.getElementById('clearAllDataBtn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', clearAllData);
        }
        
        // Template download buttons
        const baseTemplateBtn = document.getElementById('downloadBaseTemplateBtn');
        if (baseTemplateBtn) {
            baseTemplateBtn.addEventListener('click', downloadBaseTemplate);
        }
        
        const oilTemplateBtn = document.getElementById('downloadOilTemplateBtn');
        if (oilTemplateBtn) {
            oilTemplateBtn.addEventListener('click', downloadOilTemplate);
        }
    }

    // Handle base import
    async function handleBaseImport() {
        const fileInput = document.getElementById('baseCsvFile');
        const file = fileInput.files[0];
        const autoLibrary = document.getElementById('baseAutoLibrary').checked;
        
        if (!file) {
            AdminCore.showToast('Please select a CSV file', 'error');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('auto_library', autoLibrary);
        
        // Show loading state
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
                    Successfully imported ${result.imported} of ${result.total} bases<br>
                    ${result.errors && result.errors.length > 0 ? 
                        `<details style="margin-top: 10px;">
                            <summary style="cursor: pointer; color: #dc3545;">View ${result.errors.length} errors</summary>
                            <ul style="font-size: 12px; color: #dc3545;">
                                ${result.errors.map(e => `<li>${e}</li>`).join('')}
                            </ul>
                        </details>` : ''}
                `;
                AdminCore.showToast('Bases imported successfully', 'success');
                fileInput.value = ''; // Clear the file input
                
                // Reload bases data
                if (window.loadBases) window.loadBases();
                AdminCore.updateStats();
            } else {
                resultDiv.innerHTML = `
                    <strong style="color: #dc3545;">✗ ${result.error || 'Import failed'}</strong>
                `;
                AdminCore.showToast(result.error || 'Failed to import bases', 'error');
            }
        } catch (error) {
            resultDiv.innerHTML = `
                <strong style="color: #dc3545;">✗ Import failed: ${error.message}</strong>
            `;
            AdminCore.showToast('Failed to import bases', 'error');
        }
    }

    // Handle oil import
    async function handleOilImport() {
        const fileInput = document.getElementById('oilCsvFile');
        const file = fileInput.files[0];
        const autoLibrary = document.getElementById('oilAutoLibrary').checked;
        
        if (!file) {
            AdminCore.showToast('Please select a CSV file', 'error');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('auto_library', autoLibrary);
        
        // Show loading state
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
                    Successfully imported ${result.imported} of ${result.total} oils<br>
                    ${result.errors && result.errors.length > 0 ? 
                        `<details style="margin-top: 10px;">
                            <summary style="cursor: pointer; color: #dc3545;">View ${result.errors.length} errors</summary>
                            <ul style="font-size: 12px; color: #dc3545;">
                                ${result.errors.map(e => `<li>${e}</li>`).join('')}
                            </ul>
                        </details>` : ''}
                `;
                AdminCore.showToast('Oils imported successfully', 'success');
                fileInput.value = ''; // Clear the file input
                
                // Reload oils data
                if (window.loadOils) window.loadOils();
                AdminCore.updateStats();
            } else {
                resultDiv.innerHTML = `
                    <strong style="color: #dc3545;">✗ ${result.error || 'Import failed'}</strong>
                `;
                AdminCore.showToast(result.error || 'Failed to import oils', 'error');
            }
        } catch (error) {
            resultDiv.innerHTML = `
                <strong style="color: #dc3545;">✗ Import failed: ${error.message}</strong>
            `;
            AdminCore.showToast('Failed to import oils', 'error');
        }
    }

    // Bulk operations
    async function clearAllBases() {
        if (!confirm('⚠️ WARNING: This will delete ALL base products. This cannot be undone. Are you sure?')) return;
        if (!confirm('Are you REALLY sure? This will permanently delete all base products.')) return;
        
        try {
            const response = await fetch(`${AdminCore.API_URL}/bulk/clear-bases`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                AdminCore.showToast('All bases deleted', 'success');
                if (window.loadBases) window.loadBases();
                AdminCore.updateStats();
            } else {
                AdminCore.showToast('Failed to clear bases', 'error');
            }
        } catch (error) {
            AdminCore.showToast('Failed to clear bases', 'error');
        }
    }

    async function clearAllOils() {
        if (!confirm('⚠️ WARNING: This will delete ALL fragrance oils. This cannot be undone. Are you sure?')) return;
        if (!confirm('Are you REALLY sure? This will permanently delete all fragrance oils.')) return;
        
        try {
            const response = await fetch(`${AdminCore.API_URL}/bulk/clear-oils`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                AdminCore.showToast('All oils deleted', 'success');
                if (window.loadOils) window.loadOils();
                AdminCore.updateStats();
            } else {
                AdminCore.showToast('Failed to clear oils', 'error');
            }
        } catch (error) {
            AdminCore.showToast('Failed to clear oils', 'error');
        }
    }

    async function clearAllData() {
        if (!confirm('⚠️ EXTREME WARNING: This will delete ALL DATA including suppliers, bases, and oils. This cannot be undone. Are you sure?')) return;
        if (!confirm('Are you ABSOLUTELY CERTAIN? Type "DELETE ALL" to confirm.')) return;
        
        const confirmation = prompt('Type "DELETE ALL" to confirm permanent deletion of all data:');
        if (confirmation !== 'DELETE ALL') {
            AdminCore.showToast('Deletion cancelled', 'info');
            return;
        }
        
        try {
            const response = await fetch(`${AdminCore.API_URL}/bulk/clear-all`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                AdminCore.showToast('All data deleted', 'success');
                if (window.loadSuppliers) window.loadSuppliers();
                if (window.loadBases) window.loadBases();
                if (window.loadOils) window.loadOils();
                AdminCore.updateStats();
            } else {
                AdminCore.showToast('Failed to clear data', 'error');
            }
        } catch (error) {
            AdminCore.showToast('Failed to clear data', 'error');
        }
    }

    // Download templates
    function downloadBaseTemplate() {
        const csv = `supplier,base_name,base_type,base_max_load_pct,unit_mode,specific_gravity,ifra_category,is_dual_purpose,ifra_category_2,wax_type,notes
Example Supplier,Example Base,liquid,3.0,weight,,9,false,,,Add your notes here`;
        
        downloadCSV(csv, 'base_products_template.csv');
    }

    function downloadOilTemplate() {
        const csv = `supplier,product_name,sku,flash_point_f,solvent_note,ifra_version,ifra_date,ifra__foaming_hand_soap,ifra__liquid_hand_soap,ifra__body_wash,ifra__room_spray,ifra__fabric_spray,ifra__body_lotion,ifra__candles,ifra__air_freshener
Example Supplier,Example Fragrance,SKU123,180,DPG,Amendment 51,2024-01-01,1.0,1.0,1.0,3.0,3.5,2.0,10.0,4.0`;
        
        downloadCSV(csv, 'fragrance_oils_template.csv');
    }

    function downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    // Initialize module when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImportModule);
    } else {
        initImportModule();
    }
})();
