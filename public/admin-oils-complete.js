// Complete Fragrance Oils Admin Module with All Fields
(function() {
    // Module initialization
    async function initOilsModule() {
        setupOilsTab();
        setupOilModal();
        await loadOils();
        await loadSuppliers();
    }

    // Setup the oils tab content
    function setupOilsTab() {
        const oilsTab = document.getElementById('oils');
        oilsTab.innerHTML = `
            <div class="search-bar">
                <input type="text" class="search-input" id="oilSearch" placeholder="Search fragrance oils...">
                <select class="form-control" id="oilSupplierFilter" style="width: 200px;">
                    <option value="">All Suppliers</option>
                </select>
                <button class="btn btn-primary" id="addOilBtn">
                    ➕ Add Fragrance Oil
                </button>
            </div>
            <div class="table-container">
                <table id="oilsTable">
                    <thead>
                        <tr>
                            <th style="width: 100px;">ID</th>
                            <th>NAME</th>
                            <th>SUPPLIER</th>
                            <th style="width: 150px;">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="4" style="text-align: center;">
                                <div class="loading"></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        // Add event listeners
        document.getElementById('addOilBtn').addEventListener('click', () => openOilModal());
        
        // Search functionality
        document.getElementById('oilSearch').addEventListener('input', (e) => {
            filterOils();
        });
        
        // Supplier filter
        document.getElementById('oilSupplierFilter').addEventListener('change', (e) => {
            filterOils();
        });
    }

    // Setup comprehensive oil modal with all fields
    function setupOilModal() {
        const modalsContainer = document.getElementById('modals-container');
        const modalHTML = `
            <div id="oilModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="oilModalTitle" class="modal-title">Add Fragrance Oil</h2>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="padding: 20px; border-bottom: 1px solid #D9D3CC;">
                            <button onclick="showTab('basic')" id="tab-basic" style="padding: 8px 12px; margin-right: 8px; background: #F1AD88; color: #101114; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Basic Info</button>
                            <button onclick="showTab('technical')" id="tab-technical" style="padding: 8px 12px; margin-right: 8px; background: #EDEAE6; color: #2E3033; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Technical</button>
                            <button onclick="showTab('fragrance')" id="tab-fragrance" style="padding: 8px 12px; margin-right: 8px; background: #EDEAE6; color: #2E3033; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Fragrance Notes</button>
                            <button onclick="showTab('pricing')" id="tab-pricing" style="padding: 8px 12px; margin-right: 8px; background: #EDEAE6; color: #2E3033; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Pricing</button>
                            <button onclick="showTab('ifra')" id="tab-ifra" style="padding: 8px 12px; margin-right: 8px; background: #EDEAE6; color: #2E3033; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">IFRA</button>
                            <button onclick="showTab('ratings')" id="tab-ratings" style="padding: 8px 12px; margin-right: 8px; background: #EDEAE6; color: #2E3033; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Ratings</button>
                        </div>
                        
                        <form id="oilForm" style="padding: 20px;">
                            <input type="hidden" name="id" id="oilId">
                            
                            <div id="tab-content-basic" style="display: block;">
                                <h3 style="color: #101114; margin-bottom: 20px;">Basic Information</h3>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Supplier *</label>
                                    <select name="supplier_id" id="oilSupplierSelect" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
                                        <option value="">Select supplier...</option>
                                    </select>
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Product Name *</label>
                                    <input type="text" name="product_name" required style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Display Name (for iOS app) *</label>
                                    <input type="text" name="name" required style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;" placeholder="How this appears in the iOS app">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">SKU</label>
                                    <input type="text" name="sku" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Scent Description</label>
                                    <textarea name="scent_description" rows="3" maxlength="500" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; resize: vertical;"></textarea>
                                </div>
                                <div style="display: flex; gap: 24px; margin-bottom: 16px;">
                                    <label style="display: flex; align-items: center; gap: 8px; font-weight: 500; color: #2E3033; font-size: 14px;">
                                        <input type="checkbox" name="is_active" checked style="width: 16px; height: 16px;">
                                        Is Active (appears in app)
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 8px; font-weight: 500; color: #2E3033; font-size: 14px;">
                                        <input type="checkbox" name="is_discontinued" style="width: 16px; height: 16px;">
                                        Is Discontinued
                                    </label>
                                </div>
                            </div>
                            
                            <div id="tab-content-technical" style="display: none;">
                                <h3 style="color: #101114; margin-bottom: 20px;">Technical Properties</h3>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Flash Point (°F)</label>
                                    <input type="number" name="flash_point_f" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Specific Gravity</label>
                                    <input type="number" name="specific_gravity" step="0.001" min="0" max="2" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Vanillin %</label>
                                    <input type="number" name="vanillin_pct" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Solvent Note</label>
                                    <input type="text" name="solvent_note" placeholder="e.g., DPG, IPM" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Soap Acceleration</label>
                                    <select name="soap_acceleration" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
                                        <option value="">Not Specified</option>
                                        <option value="none">No Acceleration</option>
                                        <option value="slight">Slight Acceleration</option>
                                        <option value="moderate">Moderate Acceleration</option>
                                        <option value="severe">Severe Acceleration</option>
                                    </select>
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Product URL</label>
                                    <input type="url" name="product_url" placeholder="https://..." style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                            </div>
                            
                            <div id="tab-content-fragrance" style="display: none;">
                                <h3 style="color: #101114; margin-bottom: 20px;">Fragrance Notes & Profile</h3>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Theme Family *</label>
                                    <select name="theme_family" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
                                        <option value="">Select theme family...</option>
                                        <option value="Floral">Floral</option>
                                        <option value="Fruity">Fruity</option>
                                        <option value="Citrus">Citrus</option>
                                        <option value="Green">Green</option>
                                        <option value="Aquatic / Marine">Aquatic / Marine</option>
                                        <option value="Woody">Woody</option>
                                        <option value="Oriental / Amber">Oriental / Amber</option>
                                        <option value="Gourmand">Gourmand</option>
                                        <option value="Spicy">Spicy</option>
                                        <option value="Earthy">Earthy</option>
                                        <option value="Powdery">Powdery</option>
                                        <option value="Aromatic">Aromatic</option>
                                        <option value="Leather">Leather</option>
                                        <option value="Aldehydic">Aldehydic</option>
                                        <option value="Chypre">Chypre</option>
                                        <option value="Fougere">Fougere</option>
                                        <option value="Smoky">Smoky</option>
                                        <option value="Metallic / Mineral">Metallic / Mineral</option>
                                        <option value="Animalic">Animalic</option>
                                        <option value="Resinous / Balsamic">Resinous / Balsamic</option>
                                    </select>
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Top Notes</label>
                                    <textarea name="fragrance_notes_top" rows="2" placeholder="e.g., Bergamot, Lemon, Orange" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; resize: vertical;"></textarea>
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Middle Notes</label>
                                    <textarea name="fragrance_notes_middle" rows="2" placeholder="e.g., Rose, Jasmine, Lavender" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; resize: vertical;"></textarea>
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Base Notes</label>
                                    <textarea name="fragrance_notes_base" rows="2" placeholder="e.g., Vanilla, Musk, Sandalwood" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; resize: vertical;"></textarea>
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Blending Notes</label>
                                    <textarea name="blending_notes" rows="3" placeholder="Tips for blending this fragrance..." style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; resize: vertical;"></textarea>
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Soap Notes</label>
                                    <textarea name="usage_notes" rows="3" placeholder="How this oil performs in soap making..." style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; resize: vertical;"></textarea>
                                </div>
                            </div>
                            
                            <div id="tab-content-pricing" style="display: none;">
                                <h3 style="color: #101114; margin-bottom: 20px;">Pricing Tiers</h3>
                                
                                <!-- Tier 1 -->
                                <div style="background: #FAFAF8; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                                    <h4 style="color: #2E3033; margin: 0 0 12px 0;">Tier 1</h4>
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Display Name (e.g., "Sample Size", "1 oz")</label>
                                        <input type="text" name="tier1_name" placeholder="e.g., Sample Size" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;">
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Size</label>
                                            <input type="number" name="tier1_size" step="0.01" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Unit</label>
                                            <select name="tier1_unit" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
                                                <option value="oz">oz</option>
                                                <option value="ml">ml</option>
                                                <option value="lb">lb</option>
                                                <option value="kg">kg</option>
                                                <option value="g">g</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Price ($)</label>
                                            <input type="number" name="tier1_price" step="0.01" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">SKU</label>
                                            <input type="text" name="tier1_sku" placeholder="Supplier SKU" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Tier 2 -->
                                <div style="background: #FAFAF8; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                                    <h4 style="color: #2E3033; margin: 0 0 12px 0;">Tier 2</h4>
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Display Name (e.g., "16 oz", "1 Pound")</label>
                                        <input type="text" name="tier2_name" placeholder="e.g., 16 oz" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;">
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Size</label>
                                            <input type="number" name="tier2_size" step="0.01" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Unit</label>
                                            <select name="tier2_unit" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
                                                <option value="oz">oz</option>
                                                <option value="ml">ml</option>
                                                <option value="lb">lb</option>
                                                <option value="kg">kg</option>
                                                <option value="g">g</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Price ($)</label>
                                            <input type="number" name="tier2_price" step="0.01" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">SKU</label>
                                            <input type="text" name="tier2_sku" placeholder="Supplier SKU" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Tier 3 -->
                                <div style="background: #FAFAF8; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                                    <h4 style="color: #2E3033; margin: 0 0 12px 0;">Tier 3</h4>
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Display Name (e.g., "1 Gallon", "5 Pounds")</label>
                                        <input type="text" name="tier3_name" placeholder="e.g., 1 Gallon" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;">
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Size</label>
                                            <input type="number" name="tier3_size" step="0.01" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Unit</label>
                                            <select name="tier3_unit" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
                                                <option value="oz">oz</option>
                                                <option value="ml">ml</option>
                                                <option value="lb">lb</option>
                                                <option value="kg">kg</option>
                                                <option value="g">g</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Price ($)</label>
                                            <input type="number" name="tier3_price" step="0.01" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">SKU</label>
                                            <input type="text" name="tier3_sku" placeholder="Supplier SKU" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Tier 4 -->
                                <div style="padding: 16px; background: #F5F3F0; border-radius: 8px; margin-bottom: 16px;">
                                    <h4 style="color: #101114; margin-bottom: 12px;">Pricing Tier 4</h4>
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Display Name (e.g., "Bulk", "10 Pounds")</label>
                                        <input type="text" name="tier4_name" placeholder="e.g., Bulk" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;">
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Size</label>
                                            <input type="number" name="tier4_size" step="0.01" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Unit</label>
                                            <select name="tier4_unit" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
                                                <option value="oz">oz</option>
                                                <option value="ml">ml</option>
                                                <option value="lb">lb</option>
                                                <option value="kg">kg</option>
                                                <option value="g">g</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Price ($)</label>
                                            <input type="number" name="tier4_price" step="0.01" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">SKU</label>
                                            <input type="text" name="tier4_sku" placeholder="Supplier SKU" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Tier 5 -->
                                <div style="padding: 16px; background: #F5F3F0; border-radius: 8px; margin-bottom: 16px;">
                                    <h4 style="color: #101114; margin-bottom: 12px;">Pricing Tier 5</h4>
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Display Name (e.g., "Wholesale", "25 Pounds")</label>
                                        <input type="text" name="tier5_name" placeholder="e.g., Wholesale" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;">
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Size</label>
                                            <input type="number" name="tier5_size" step="0.01" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Unit</label>
                                            <select name="tier5_unit" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
                                                <option value="oz">oz</option>
                                                <option value="ml">ml</option>
                                                <option value="lb">lb</option>
                                                <option value="kg">kg</option>
                                                <option value="g">g</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Price ($)</label>
                                            <input type="number" name="tier5_price" step="0.01" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">SKU</label>
                                            <input type="text" name="tier5_sku" placeholder="Supplier SKU" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div id="tab-content-ifra" style="display: none;">
                                <h3 style="color: #101114; margin-bottom: 20px;">IFRA Information</h3>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">IFRA Version</label>
                                    <input type="text" name="ifra_version" placeholder="e.g., Amendment 51" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">IFRA Date</label>
                                    <input type="date" name="ifra_date" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">IFRA Certificate URL</label>
                                    <input type="url" name="ifra_url" placeholder="https://..." style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <h4 style="color: #2E3033; margin: 16px 0 8px 0;">Maximum Percentages by Product Type</h4>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Category 1: Lip Products, Toys</label>
                                    <input type="number" name="ifra_category_1" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Category 2: Deodorant, Antiperspirant, Body Spray, Body Mist</label>
                                    <input type="number" name="ifra_category_2" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Category 3: Eye Products, Make-up, Facial Treatment Masks</label>
                                    <input type="number" name="ifra_category_3" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Category 4: Perfume, Solid Perfume, Fragranced Bracelets</label>
                                    <input type="number" name="ifra_category_4" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Category 5A: Body Creams, Leave-on Body Products</label>
                                    <input type="number" name="ifra_category_5a" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Category 5B: Face Creams, Beard Oil, Leave-on Face Products</label>
                                    <input type="number" name="ifra_category_5b" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Category 5C: Hand Creams, Hand Sanitizers, Leave on Hand Products</label>
                                    <input type="number" name="ifra_category_5c" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Category 5D: Baby Creams, Baby Oils, Baby Products</label>
                                    <input type="number" name="ifra_category_5d" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Category 6: Mouthwash, Toothpaste, Breath Spray</label>
                                    <input type="number" name="ifra_category_6" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Category 7A: Rinse off Hair Treatments</label>
                                    <input type="number" name="ifra_category_7a" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Category 7B: Leave on Hair Treatments</label>
                                    <input type="number" name="ifra_category_7b" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Category 8: Intimate Wipes, Baby Wipes</label>
                                    <input type="number" name="ifra_category_8" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Category 9: Rinse Off and Bathwater Products, Soap, Shampoo</label>
                                    <input type="number" name="ifra_category_9" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Category 10A: Household Cleaning Products, Reed Diffusers</label>
                                    <input type="number" name="ifra_category_10a" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Category 10B: Air Freshener Sprays</label>
                                    <input type="number" name="ifra_category_10b" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Category 11A: Diapers</label>
                                    <input type="number" name="ifra_category_11a" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Category 11B: Scented Clothing</label>
                                    <input type="number" name="ifra_category_11b" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Category 12: Candles, Incense, Air Freshening Crystals, Liquids, Solids</label>
                                    <input type="number" name="ifra_category_12" step="0.01" min="0" max="100" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                            </div>
                            
                            <div id="tab-content-ratings" style="display: none;">
                                <h3 style="color: #101114; margin-bottom: 20px;">Ratings & Analytics</h3>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Intensity Rating (0-5)</label>
                                    <input type="number" name="intensity_rating" step="0.1" min="0" max="5" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Overall Rating (0-5)</label>
                                    <input type="number" name="overall_rating" step="0.1" min="0" max="5" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Total Ratings</label>
                                    <input type="number" name="total_ratings" min="0" readonly style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: #FAFAF8;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Batch Count</label>
                                    <input type="number" name="batch_count" min="0" readonly style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: #FAFAF8;">
                                </div>
                            </div>
                        </form>
                        
                        <div style="padding: 20px; border-top: 1px solid #D9D3CC; text-align: right;">
                            <button onclick="closeOilModal()" class="btn btn-secondary">Cancel</button>
                            <button onclick="saveOil()" class="btn btn-primary">Save Fragrance Oil</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        modalsContainer.insertAdjacentHTML('beforeend', modalHTML);

        // Form submission
        document.getElementById('oilForm').addEventListener('submit', handleOilSubmit);
        
        // Close modal handlers
        document.querySelector('#oilModal .close-btn').addEventListener('click', () => {
            document.getElementById('oilModal').classList.remove('show');
        });
        
        // Tab switching function
        window.showTab = function(tabName) {
            // Hide all tabs
            const allTabs = ['basic', 'technical', 'fragrance', 'pricing', 'ifra', 'ratings'];
            allTabs.forEach(tab => {
                const content = document.getElementById('tab-content-' + tab);
                const button = document.getElementById('tab-' + tab);
                if (content) {
                    content.style.display = 'none';
                }
                if (button) {
                    button.style.background = '#EDEAE6';
                    button.style.color = '#2E3033';
                }
            });
            
            // Show selected tab
            const selectedContent = document.getElementById('tab-content-' + tabName);
            const selectedButton = document.getElementById('tab-' + tabName);
            if (selectedContent) {
                selectedContent.style.display = 'block';
            }
            if (selectedButton) {
                selectedButton.style.background = '#F1AD88';
                selectedButton.style.color = '#101114';
            }
        };
    }

    // Load oils
    async function loadOils() {
        try {
            const data = await AdminCore.apiRequest("/api/admin/oils");
            const oils = data;
            AdminCore.setOils(oils);
            renderOils();
            updateSupplierFilter();
        } catch (error) {
            AdminCore.showToast('Failed to load fragrance oils', 'error');
        }
    }

    // Load suppliers for dropdown
    async function loadSuppliers() {
        try {
            const data = await AdminCore.apiRequest("/api/admin/suppliers");
            const suppliers = data;
            AdminCore.setSuppliers(suppliers);
            updateSupplierSelect();
            updateSupplierFilter();
        } catch (error) {
            console.error('Failed to load suppliers:', error);
        }
    }

    // Update supplier select
    function updateSupplierSelect() {
        const suppliers = AdminCore.getSuppliers();
        const select = document.getElementById('oilSupplierSelect');
        if (select) {
            select.innerHTML = '<option value="">Select supplier...</option>' + 
                suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        }
    }

    // Update supplier filter
    function updateSupplierFilter() {
        const suppliers = AdminCore.getSuppliers();
        const filter = document.getElementById('oilSupplierFilter');
        if (filter) {
            filter.innerHTML = '<option value="">All Suppliers</option>' + 
                suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        }
    }

    // Render oils table - simplified to show only ID, Name, Supplier
    function renderOils(oilsToRender = null) {
        const oils = oilsToRender || AdminCore.getOils();
        const tbody = document.querySelector('#oilsTable tbody');
        
        if (oils.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center;">No fragrance oils found</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = oils.map(oil => {
            const oilId = typeof oil.id === 'string' ? `'${oil.id}'` : oil.id;
            
            // Get supplier name - check multiple possible fields
            let supplierName = oil.supplier_name || oil.supplier?.name || '';
            if (!supplierName && oil.supplier_id) {
                // Try to find supplier from the suppliers list
                const suppliers = AdminCore.getSuppliers();
                const supplier = suppliers.find(s => s.id === oil.supplier_id);
                supplierName = supplier ? supplier.name : 'Unknown Supplier';
            }
            if (!supplierName) {
                supplierName = 'No Supplier';
            }
            
            // Get the display name - prioritize name over product_name
            const displayName = oil.name || oil.product_name || 'Unnamed Oil';
            
            // Truncate ID if it's too long (UUIDs)
            const displayId = oil.id && oil.id.length > 8 ? 
                oil.id.substring(0, 8) + '...' : 
                oil.id || '-';
            
            return `
                <tr>
                    <td title="${oil.id}" style="font-family: monospace; font-size: 12px;">${displayId}</td>
                    <td style="font-weight: 500;">${displayName}</td>
                    <td>${supplierName}</td>
                    <td class="actions">
                        <button class="btn-small" onclick="editOil(${oilId})" title="Edit">✏️</button>
                        <button class="btn-small btn-danger" onclick="deleteOil(${oilId})" title="Delete">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Filter oils
    function filterOils() {
        const searchTerm = document.getElementById('oilSearch').value.toLowerCase();
        const supplierId = document.getElementById('oilSupplierFilter').value;
        
        const oils = AdminCore.getOils();
        const filtered = oils.filter(oil => {
            const matchesSearch = !searchTerm || 
                (oil.product_name || oil.name || '').toLowerCase().includes(searchTerm) ||
                (oil.sku && oil.sku.toLowerCase().includes(searchTerm));
            const matchesSupplier = !supplierId || oil.supplier_id == supplierId;
            return matchesSearch && matchesSupplier;
        });
        
        renderOils(filtered);
    }

    // Open oil modal
    window.openOilModal = function(oil = null) {
        const modal = document.getElementById('oilModal');
        const form = document.getElementById('oilForm');
        const title = document.getElementById('oilModalTitle');
        
        // Reset form
        form.reset();
        
        // Reset to first tab
        showTab('basic');
        
        if (oil) {
            title.textContent = 'Edit Fragrance Oil';
            form.elements['id'].value = oil.id;
            form.elements['supplier_id'].value = oil.supplier_id;
            form.elements['product_name'].value = oil.product_name;
            if (oil.name) form.elements['name'].value = oil.name;
            form.elements['sku'].value = oil.sku || '';
            form.elements['flash_point_f'].value = oil.flash_point_f || '';
            form.elements['ifra_version'].value = oil.ifra_version || '';
            form.elements['ifra_date'].value = oil.ifra_date || '';
            form.elements['ifra_url'].value = oil.ifra_url || '';
            form.elements['solvent_note'].value = oil.solvent_note || '';
            
            // Set checkbox states
            form.elements['is_active'].checked = oil.is_active !== false;
            
            // Load IFRA category fields
            const ifraCategories = ['1', '2', '3', '4', '5a', '5b', '5c', '5d', '6', '7a', '7b', '8', '9', '10a', '10b', '11a', '11b', '12'];
            ifraCategories.forEach(cat => {
                const fieldName = `ifra_category_${cat}`;
                if (oil[fieldName] !== undefined && oil[fieldName] !== null) {
                    const element = form.elements[fieldName];
                    if (element) {
                        element.value = oil[fieldName];
                    }
                }
            });
            
            // Load additional fields if they exist
            if (oil.specific_gravity) form.elements['specific_gravity'].value = oil.specific_gravity;
            if (oil.vanillin_pct) form.elements['vanillin_pct'].value = oil.vanillin_pct;
            if (oil.scent_description) form.elements['scent_description'].value = oil.scent_description;
            if (oil.theme_family) {
                console.log('Setting theme_family:', oil.theme_family);
                
                // Check if the value exists in the dropdown options
                const themeSelect = form.elements['theme_family'];
                let validOption = false;
                for (let i = 0; i < themeSelect.options.length; i++) {
                    if (themeSelect.options[i].value === oil.theme_family) {
                        validOption = true;
                        break;
                    }
                }
                
                if (validOption) {
                    themeSelect.value = oil.theme_family;
                } else {
                    // Try to map common legacy values
                    const mappings = {
                        'Fresh Floral': 'Floral',
                        'Fresh': 'Green',
                        'Oriental': 'Oriental / Amber',
                        'Aquatic': 'Aquatic / Marine',
                        'Metallic': 'Metallic / Mineral',
                        'Resinous': 'Resinous / Balsamic',
                        'Herbal': 'Aromatic'
                    };
                    
                    if (mappings[oil.theme_family]) {
                        themeSelect.value = mappings[oil.theme_family];
                        console.log(`Mapped "${oil.theme_family}" to "${mappings[oil.theme_family]}"`);
                    } else {
                        console.warn(`Theme family "${oil.theme_family}" not found in dropdown options. Leaving unselected.`);
                    }
                }
                
                console.log('Theme family dropdown value after setting:', themeSelect.value);
            }
            if (oil.fragrance_notes_top) form.elements['fragrance_notes_top'].value = oil.fragrance_notes_top;
            if (oil.fragrance_notes_middle) form.elements['fragrance_notes_middle'].value = oil.fragrance_notes_middle;
            if (oil.fragrance_notes_base) form.elements['fragrance_notes_base'].value = oil.fragrance_notes_base;
            if (oil.soap_acceleration) form.elements['soap_acceleration'].value = oil.soap_acceleration;
            if (oil.product_url) form.elements['product_url'].value = oil.product_url;
            if (oil.blending_notes) form.elements['blending_notes'].value = oil.blending_notes;
            if (oil.usage_notes) form.elements['usage_notes'].value = oil.usage_notes;
            
            // Load pricing tiers
            if (oil.price_tiers && oil.price_tiers.length > 0) {
                const tier = oil.price_tiers[0];
                // Tier 1
                if (tier.tier1_size) {
                    if (tier.tier1_name) form.elements['tier1_name'].value = tier.tier1_name;
                    form.elements['tier1_size'].value = tier.tier1_size;
                    form.elements['tier1_unit'].value = tier.tier1_unit || 'oz';
                    form.elements['tier1_price'].value = tier.tier1_price;
                    if (tier.tier1_sku) form.elements['tier1_sku'].value = tier.tier1_sku;
                }
                // Tier 2
                if (tier.tier2_size) {
                    if (tier.tier2_name) form.elements['tier2_name'].value = tier.tier2_name;
                    form.elements['tier2_size'].value = tier.tier2_size;
                    form.elements['tier2_unit'].value = tier.tier2_unit || 'oz';
                    form.elements['tier2_price'].value = tier.tier2_price;
                    if (tier.tier2_sku) form.elements['tier2_sku'].value = tier.tier2_sku;
                }
                // Tier 3
                if (tier.tier3_size) {
                    if (tier.tier3_name) form.elements['tier3_name'].value = tier.tier3_name;
                    form.elements['tier3_size'].value = tier.tier3_size;
                    form.elements['tier3_unit'].value = tier.tier3_unit || 'oz';
                    form.elements['tier3_price'].value = tier.tier3_price;
                    if (tier.tier3_sku) form.elements['tier3_sku'].value = tier.tier3_sku;
                }
                // Tier 4
                if (tier.tier4_size) {
                    if (tier.tier4_name) form.elements['tier4_name'].value = tier.tier4_name;
                    form.elements['tier4_size'].value = tier.tier4_size;
                    form.elements['tier4_unit'].value = tier.tier4_unit || 'oz';
                    form.elements['tier4_price'].value = tier.tier4_price;
                    if (tier.tier4_sku) form.elements['tier4_sku'].value = tier.tier4_sku;
                }
                // Tier 5
                if (tier.tier5_size) {
                    if (tier.tier5_name) form.elements['tier5_name'].value = tier.tier5_name;
                    form.elements['tier5_size'].value = tier.tier5_size;
                    form.elements['tier5_unit'].value = tier.tier5_unit || 'oz';
                    form.elements['tier5_price'].value = tier.tier5_price;
                    if (tier.tier5_sku) form.elements['tier5_sku'].value = tier.tier5_sku;
                }
            }
            
            // Load IFRA percentages
            if (oil.ifra_entries) {
                oil.ifra_entries.forEach(entry => {
                    const inputName = `ifra_${entry.product_type_key.replace(/_/g, '_')}`;
                    const input = form.querySelector(`[name="${inputName}"]`);
                    if (input) input.value = entry.max_pct;
                });
            }
            
            // Load ratings
            if (oil.intensity_rating) form.elements['intensity_rating'].value = oil.intensity_rating;
            if (oil.overall_rating) form.elements['overall_rating'].value = oil.overall_rating;
            if (oil.total_ratings) form.elements['total_ratings'].value = oil.total_ratings;
            if (oil.batch_count) form.elements['batch_count'].value = oil.batch_count;
        } else {
            title.textContent = 'Add Fragrance Oil';
            // Explicitly clear the id field for new oils
            if (form.elements['id']) {
                form.elements['id'].value = '';
            }
        }
        
        modal.classList.add('show');
    };

    // Close oil modal
    window.closeOilModal = function() {
        const modal = document.getElementById('oilModal');
        if (modal) {
            modal.classList.remove('show');
        }
    };
    
    // Edit oil
    window.editOil = async function(id) {
        const oils = AdminCore.getOils();
        const oil = oils.find(o => o.id == id);
        if (oil) {
            openOilModal(oil);
        }
    };

    // Delete oil
    window.deleteOil = async function(id) {
        if (!confirm('Are you sure you want to delete this fragrance oil?')) return;
        
        try {
            await AdminCore.apiRequest(`/api/admin/oils/${id}`, {
                method: 'DELETE'
            });
            
            AdminCore.showToast('Fragrance oil deleted successfully', 'success');
            await loadOils();
        } catch (error) {
            AdminCore.showToast('Failed to delete fragrance oil', 'error');
        }
    };

    // Toggle library status
    window.toggleOilLibrary = async function(id, newStatus) {
        try {
            await AdminCore.apiRequest(`/api/admin/oils/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_in_library: newStatus })
            });
            
            AdminCore.showToast('Library status updated', 'success');
            await loadOils();
        } catch (error) {
            AdminCore.showToast('Failed to update library status', 'error');
        }
    };

    // Handle form submission
    async function handleOilSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Remove empty id field to ensure new items are created, not updated
        if (!data.id || data.id === '') {
            delete data.id;
        }
        
        // Convert checkboxes
        data.is_active = formData.get('is_active') === 'on';
        data.is_in_library = formData.get('is_in_library') ? true : false;
        data.is_favorite = formData.get('is_favorite') ? true : false;
        data.is_custom = formData.get('is_custom') ? true : false;
        
        // Prepare IFRA entries
        const ifraEntries = [];
        const ifraFields = [
            'foaming_hand_soap', 'liquid_hand_soap', 'body_wash', 'body_lotion',
            'room_spray', 'fabric_spray', 'candles', 'air_freshener',
            'reed_diffuser', 'wax_melts'
        ];
        
        ifraFields.forEach(field => {
            const value = formData.get(`ifra_${field}`);
            if (value) {
                ifraEntries.push({
                    product_type_key: field,
                    max_pct: parseFloat(value)
                });
            }
        });
        
        if (ifraEntries.length > 0) {
            data.ifra_entries = ifraEntries;
        }
        
        // Prepare price tiers
        const priceTiers = {};
        ['tier1', 'tier2', 'tier3', 'tier4', 'tier5'].forEach(tier => {
            const name = formData.get(`${tier}_name`);
            const size = formData.get(`${tier}_size`);
            const unit = formData.get(`${tier}_unit`);
            const price = formData.get(`${tier}_price`);
            const sku = formData.get(`${tier}_sku`);
            
            console.log(`${tier}: name=${name}, size=${size}, unit=${unit}, price=${price}, sku=${sku}`);
            
            if (size && price) {
                priceTiers[`${tier}_name`] = name || '';
                priceTiers[`${tier}_size`] = parseFloat(size);
                priceTiers[`${tier}_unit`] = unit;
                priceTiers[`${tier}_price`] = parseFloat(price);
                priceTiers[`${tier}_sku`] = sku || '';
            }
        });
        
        console.log('Collected price tiers:', priceTiers);
        
        if (Object.keys(priceTiers).length > 0) {
            data.price_tiers = priceTiers;
        }
        
        console.log('Final data being sent:', data);
        
        // All fields are now directly in fragrance_oils table
        // No need to move anything to product_details
        
        try {
            const isEdit = !!data.id;
            const url = isEdit ? 
                `/api/admin/oils/${data.id}` : 
                `/api/admin/oils`;
            
            await AdminCore.apiRequest(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            AdminCore.showToast('Fragrance oil saved successfully', 'success');
            closeOilModal();
            await loadOils();
        } catch (error) {
            AdminCore.showToast(`Failed to save fragrance oil: ${error.message}`, 'error');
        }
    }

    // Save Oil Function (called by modal button)
    window.saveOil = async function() {
        console.log('saveOil function called');
        const form = document.getElementById('oilForm');
        if (!form) {
            console.error('Oil form not found');
            return;
        }

        // Validate required fields
        const requiredFields = [
            { name: 'supplier_id', label: 'Supplier' },
            { name: 'product_name', label: 'Product Name' },
            { name: 'name', label: 'Display Name' },
            { name: 'theme_family', label: 'Theme Family' }
        ];

        const missingFields = [];
        for (const field of requiredFields) {
            const input = form.querySelector(`[name="${field.name}"]`);
            if (!input || !input.value || input.value.trim() === '') {
                missingFields.push(field.label);
            }
        }

        if (missingFields.length > 0) {
            AdminCore.showToast(`Please fill in required fields: ${missingFields.join(', ')}`, 'error');
            return;
        }

        const formData = new FormData(form);
        const rawData = Object.fromEntries(formData);
        
        console.log('Raw form data:', rawData);

        // Map form fields to database schema and filter out unsupported fields
        const data = {};
        
        // IMPORTANT: Include ID for updates
        if (rawData.id && rawData.id !== '') {
            data.id = rawData.id;
        }
        
        // Basic fields that exist in the database schema
        if (rawData.supplier_id && rawData.supplier_id !== '') data.supplier_id = rawData.supplier_id;
        if (rawData.product_name && rawData.product_name !== '') data.product_name = rawData.product_name;
        if (rawData.name && rawData.name !== '') data.name = rawData.name;
        if (rawData.sku && rawData.sku !== '') data.sku = rawData.sku;
        
        // Map scent_description to scent_profile (database field name)
        if (rawData.scent_description && rawData.scent_description !== '') {
            data.scent_profile = rawData.scent_description;
        }
        
        // Convert numeric fields
        if (rawData.flash_point_f && rawData.flash_point_f !== '') {
            data.flash_point_f = parseFloat(rawData.flash_point_f);
        }
        if (rawData.specific_gravity && rawData.specific_gravity !== '') {
            data.specific_gravity = parseFloat(rawData.specific_gravity);
        }
        if (rawData.vanillin_pct && rawData.vanillin_pct !== '') {
            data.vanilla_content = parseFloat(rawData.vanillin_pct);
        }
        if (rawData.recommended_load_pct && rawData.recommended_load_pct !== '') {
            data.recommended_load_pct = parseFloat(rawData.recommended_load_pct);
        }
        if (rawData.max_load_pct && rawData.max_load_pct !== '') {
            data.max_load_pct = parseFloat(rawData.max_load_pct);
        }
        
        // Convert boolean fields (only include fields that exist in database)
        data.is_natural = rawData.is_natural === 'on' || rawData.is_natural === true;
        data.has_restrictions = rawData.has_restrictions === 'on' || rawData.has_restrictions === true;
        
        // Text fields
        if (rawData.restriction_notes && rawData.restriction_notes !== '') {
            data.restriction_notes = rawData.restriction_notes;
        }
        if (rawData.notes && rawData.notes !== '') {
            data.notes = rawData.notes;
        }
        
        // Fragrance note fields - These are ALL direct database fields now
        if (rawData.theme_family && rawData.theme_family !== '') {
            data.theme_family = rawData.theme_family;
        }
        if (rawData.fragrance_notes_top && rawData.fragrance_notes_top !== '') {
            data.fragrance_notes_top = rawData.fragrance_notes_top;
        }
        if (rawData.fragrance_notes_middle && rawData.fragrance_notes_middle !== '') {
            data.fragrance_notes_middle = rawData.fragrance_notes_middle;
        }
        if (rawData.fragrance_notes_base && rawData.fragrance_notes_base !== '') {
            data.fragrance_notes_base = rawData.fragrance_notes_base;
        }
        if (rawData.blending_notes && rawData.blending_notes !== '') {
            data.blending_notes = rawData.blending_notes;
        }
        if (rawData.usage_notes && rawData.usage_notes !== '') {
            data.usage_notes = rawData.usage_notes;
        }
        if (rawData.soap_acceleration && rawData.soap_acceleration !== '') {
            data.soap_acceleration = rawData.soap_acceleration;
        }
        if (rawData.product_url && rawData.product_url !== '') {
            data.product_url = rawData.product_url;
        }
        
        // Also add scent_description as its own field (not just mapped to scent_profile)
        if (rawData.scent_description && rawData.scent_description !== '') {
            data.scent_description = rawData.scent_description;
        }
        
        // Rating fields
        if (rawData.price_rating && rawData.price_rating !== '') {
            data.price_rating = parseInt(rawData.price_rating);
        }
        if (rawData.potency_rating && rawData.potency_rating !== '') {
            data.potency_rating = parseFloat(rawData.potency_rating);
        }
        if (rawData.performance_rating && rawData.performance_rating !== '') {
            data.performance_rating = parseFloat(rawData.performance_rating);
        }
        if (rawData.intensity_rating && rawData.intensity_rating !== '') {
            data.intensity_rating = parseFloat(rawData.intensity_rating);
        }
        if (rawData.overall_rating && rawData.overall_rating !== '') {
            data.overall_rating = parseFloat(rawData.overall_rating);
        }
        if (rawData.total_ratings && rawData.total_ratings !== '') {
            data.total_ratings = parseInt(rawData.total_ratings);
        }
        
        // IFRA fields
        if (rawData.ifra_url && rawData.ifra_url !== '') {
            data.ifra_url = rawData.ifra_url;
        }
        if (rawData.ifra_version && rawData.ifra_version !== '') {
            data.ifra_version = rawData.ifra_version;
        }
        if (rawData.ifra_date && rawData.ifra_date !== '') {
            data.ifra_date = rawData.ifra_date;
        }
        if (rawData.solvent_note && rawData.solvent_note !== '') {
            data.solvent_note = rawData.solvent_note;
        }
        
        // Status fields
        data.is_active = rawData.is_active === 'on' || rawData.is_active === true || rawData.is_active === 'true';
        data.is_discontinued = rawData.is_discontinued === 'on' || rawData.is_discontinued === true || rawData.is_discontinued === 'true';
        
        // All 18 IFRA categories
        for (let i of ['1', '2', '3', '4', '5a', '5b', '5c', '5d', '6', '7a', '7b', '8', '9', '10a', '10b', '11a', '11b', '12']) {
            const fieldName = `ifra_category_${i}`;
            if (rawData[fieldName] && rawData[fieldName] !== '') {
                data[fieldName] = parseFloat(rawData[fieldName]);
            }
        }
        
        // Handle price tiers
        const priceTiers = {};
        ['tier1', 'tier2', 'tier3', 'tier4', 'tier5'].forEach(tier => {
            const name = rawData[`${tier}_name`];
            const size = rawData[`${tier}_size`];
            const unit = rawData[`${tier}_unit`];
            const price = rawData[`${tier}_price`];
            const sku = rawData[`${tier}_sku`];
            
            console.log(`${tier}: name=${name}, size=${size}, unit=${unit}, price=${price}, sku=${sku}`);
            
            if (size && price) {
                priceTiers[`${tier}_name`] = name || '';
                priceTiers[`${tier}_size`] = parseFloat(size);
                priceTiers[`${tier}_unit`] = unit;
                priceTiers[`${tier}_price`] = parseFloat(price);
                priceTiers[`${tier}_sku`] = sku || '';
            }
        });
        
        console.log('Collected price tiers:', priceTiers);
        
        if (Object.keys(priceTiers).length > 0) {
            data.price_tiers = priceTiers;
        }

        console.log('Cleaned data for database:', data);

        try {
            const isEdit = !!(rawData.id && rawData.id !== '');
            const url = isEdit ? 
                `/api/admin/oils/${rawData.id}` : 
                `/api/admin/oils`;
            
            const response = await AdminCore.apiRequest(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log('Save response:', response);
            AdminCore.showToast('Fragrance oil saved successfully', 'success');
            closeOilModal();
            await loadOils();
        } catch (error) {
            console.error('Error saving oil:', error);
            AdminCore.showToast(`Failed to save fragrance oil: ${error.message}`, 'error');
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOilsModule);
    } else {
        initOilsModule();
    }
})();