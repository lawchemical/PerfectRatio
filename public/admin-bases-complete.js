// Complete Base Products Admin Module with All Fields
(function() {
    // Module initialization
    async function initBasesModule() {
        setupBasesTab();
        setupBaseModal();
        await loadBases();
        await loadSuppliers();
    }

    // Setup the bases tab content
    function setupBasesTab() {
        const basesTab = document.getElementById('bases');
        basesTab.innerHTML = `
            <div class="search-bar">
                <input type="text" class="search-input" id="baseSearch" placeholder="Search base products...">
                <select class="form-control" id="baseSupplierFilter" style="width: 200px;">
                    <option value="">All Suppliers</option>
                </select>
                <select class="form-control" id="baseTypeFilter" style="width: 150px;">
                    <option value="">All Types</option>
                    <option value="soap">Soap</option>
                    <option value="lotion">Lotion</option>
                    <option value="candle">Candle</option>
                    <option value="spray">Spray</option>
                    <option value="other">Other</option>
                </select>
                <button class="btn btn-primary" id="addBaseBtn">
                    ➕ Add Base Product
                </button>
            </div>
            <div class="table-container">
                <table id="basesTable">
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
        document.getElementById('addBaseBtn').addEventListener('click', () => openBaseModal());
        
        // Search functionality
        document.getElementById('baseSearch').addEventListener('input', (e) => {
            filterBases();
        });
        
        // Filters
        document.getElementById('baseSupplierFilter').addEventListener('change', (e) => {
            filterBases();
        });
        document.getElementById('baseTypeFilter').addEventListener('change', (e) => {
            filterBases();
        });
    }

    // Setup comprehensive base modal with all fields
    function setupBaseModal() {
        const modalsContainer = document.getElementById('modals-container');
        const modalHTML = `
            <div id="baseModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="baseModalTitle">Add Base Product</h2>
                        <button class="close-btn">&times;</button>
                    </div>
                    <form id="baseForm">
                        <input type="hidden" id="baseId" name="id">
                        
                        <!-- Tab Navigation -->
                        <div class="form-tabs">
                            <button type="button" class="tab-btn active" data-tab="basic">Basic Info</button>
                            <button type="button" class="tab-btn" data-tab="technical">Technical</button>
                            <button type="button" class="tab-btn" data-tab="pricing">Pricing</button>
                            <button type="button" class="tab-btn" data-tab="ratings">Ratings</button>
                        </div>
                        
                        <!-- Basic Information Tab -->
                        <div class="form-tab-content active" id="basic-tab">
                            <h3>Basic Information</h3>
                            <div class="form-group">
                                <label>Supplier *</label>
                                <select class="form-control" name="supplier_id" id="baseSupplierSelect" required>
                                    <option value="">Select supplier...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Product Name *</label>
                                <input type="text" class="form-control" name="name" required>
                            </div>
                            <div class="form-group">
                                <label>SKU</label>
                                <input type="text" class="form-control" name="sku">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Max Load % *</label>
                                    <input type="number" class="form-control" name="max_load_pct" step="0.01" min="0" max="100" required>
                                </div>
                                <div class="form-group">
                                    <label>Unit Mode *</label>
                                    <select class="form-control" name="unit_mode" required>
                                        <option value="weight">Weight</option>
                                        <option value="volume">Volume</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Wax Type (for candles)</label>
                                <input type="text" class="form-control" name="wax_type" placeholder="e.g., 464 Soy, 4630 Paraffin">
                            </div>
                            <div class="form-group">
                                <label>Notes</label>
                                <textarea class="form-control" name="notes" rows="3"></textarea>
                            </div>
                            <div class="checkbox-group">
                                <input type="checkbox" id="baseIsActive" name="is_active" checked>
                                <label for="baseIsActive">Is Active (appears in app)</label>
                                
                                <input type="checkbox" id="baseIsDiscontinued" name="is_discontinued">
                                <label for="baseIsDiscontinued">Is Discontinued</label>
                            </div>
                        </div>
                        
                        <!-- Technical Properties Tab -->
                        <div class="form-tab-content" id="technical-tab">
                            <h3>Technical Properties</h3>
                            <div class="form-group">
                                <label>Specific Gravity</label>
                                <input type="number" class="form-control" name="specific_gravity" step="0.001" min="0" max="2">
                            </div>
                            
                            <h4>IFRA Categories</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Primary IFRA Category</label>
                                    <select class="form-control" name="ifra_category">
                                        <option value="">Select category...</option>
                                        <option value="Air Freshener Sprays - Category 10B">Air Freshener Sprays - Category 10B</option>
                                        <option value="Air Freshening Crystals - Category 12">Air Freshening Crystals - Category 12</option>
                                        <option value="Antiperspirant - Category 2">Antiperspirant - Category 2</option>
                                        <option value="Baby Creams - Category 5D">Baby Creams - Category 5D</option>
                                        <option value="Baby Oils - Category 5D">Baby Oils - Category 5D</option>
                                        <option value="Baby Products - Category 5D">Baby Products - Category 5D</option>
                                        <option value="Baby Wipes - Category 8">Baby Wipes - Category 8</option>
                                        <option value="Beard Oil - Category 5B">Beard Oil - Category 5B</option>
                                        <option value="Body Creams - Category 5A">Body Creams - Category 5A</option>
                                        <option value="Body Mist - Category 2">Body Mist - Category 2</option>
                                        <option value="Body Spray - Category 2">Body Spray - Category 2</option>
                                        <option value="Breath Spray - Category 6">Breath Spray - Category 6</option>
                                        <option value="Candles - Category 12">Candles - Category 12</option>
                                        <option value="Deodorant - Category 2">Deodorant - Category 2</option>
                                        <option value="Diapers - Category 11A">Diapers - Category 11A</option>
                                        <option value="Eye Products - Category 3">Eye Products - Category 3</option>
                                        <option value="Face Creams - Category 5B">Face Creams - Category 5B</option>
                                        <option value="Facial Treatment Masks - Category 3">Facial Treatment Masks - Category 3</option>
                                        <option value="Fragranced Bracelets - Category 4">Fragranced Bracelets - Category 4</option>
                                        <option value="Hand Creams - Category 5C">Hand Creams - Category 5C</option>
                                        <option value="Hand Sanitizers - Category 5C">Hand Sanitizers - Category 5C</option>
                                        <option value="Household Cleaning Products - Category 10A">Household Cleaning Products - Category 10A</option>
                                        <option value="Incense - Category 12">Incense - Category 12</option>
                                        <option value="Intimate Wipes - Category 8">Intimate Wipes - Category 8</option>
                                        <option value="Leave on Hair Treatments - Category 7B">Leave on Hair Treatments - Category 7B</option>
                                        <option value="Leave on Hand Products - Category 5C">Leave on Hand Products - Category 5C</option>
                                        <option value="Leave-on Body Products - Category 5A">Leave-on Body Products - Category 5A</option>
                                        <option value="Leave-on Face Products - Category 5B">Leave-on Face Products - Category 5B</option>
                                        <option value="Lip Products - Category 1">Lip Products - Category 1</option>
                                        <option value="Liquids - Category 12">Liquids - Category 12</option>
                                        <option value="Make-up - Category 3">Make-up - Category 3</option>
                                        <option value="Mouthwash - Category 6">Mouthwash - Category 6</option>
                                        <option value="Perfume - Category 4">Perfume - Category 4</option>
                                        <option value="Reed Diffusers - Category 10A">Reed Diffusers - Category 10A</option>
                                        <option value="Rinse Off and Bathwater Products - Category 9">Rinse Off and Bathwater Products - Category 9</option>
                                        <option value="Rinse off Hair Treatments - Category 7A">Rinse off Hair Treatments - Category 7A</option>
                                        <option value="Scented Clothing - Category 11B">Scented Clothing - Category 11B</option>
                                        <option value="Shampoo - Category 9">Shampoo - Category 9</option>
                                        <option value="Soap - Category 9">Soap - Category 9</option>
                                        <option value="Solid Perfume - Category 4">Solid Perfume - Category 4</option>
                                        <option value="Solids - Category 12">Solids - Category 12</option>
                                        <option value="Toothpaste - Category 6">Toothpaste - Category 6</option>
                                        <option value="Toys - Category 1">Toys - Category 1</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Secondary IFRA Category (Dual Purpose)</label>
                                    <select class="form-control" name="ifra_category_2">
                                        <option value="">Select category...</option>
                                        <option value="Air Freshener Sprays - Category 10B">Air Freshener Sprays - Category 10B</option>
                                        <option value="Air Freshening Crystals - Category 12">Air Freshening Crystals - Category 12</option>
                                        <option value="Antiperspirant - Category 2">Antiperspirant - Category 2</option>
                                        <option value="Baby Creams - Category 5D">Baby Creams - Category 5D</option>
                                        <option value="Baby Oils - Category 5D">Baby Oils - Category 5D</option>
                                        <option value="Baby Products - Category 5D">Baby Products - Category 5D</option>
                                        <option value="Baby Wipes - Category 8">Baby Wipes - Category 8</option>
                                        <option value="Beard Oil - Category 5B">Beard Oil - Category 5B</option>
                                        <option value="Body Creams - Category 5A">Body Creams - Category 5A</option>
                                        <option value="Body Mist - Category 2">Body Mist - Category 2</option>
                                        <option value="Body Spray - Category 2">Body Spray - Category 2</option>
                                        <option value="Breath Spray - Category 6">Breath Spray - Category 6</option>
                                        <option value="Candles - Category 12">Candles - Category 12</option>
                                        <option value="Deodorant - Category 2">Deodorant - Category 2</option>
                                        <option value="Diapers - Category 11A">Diapers - Category 11A</option>
                                        <option value="Eye Products - Category 3">Eye Products - Category 3</option>
                                        <option value="Face Creams - Category 5B">Face Creams - Category 5B</option>
                                        <option value="Facial Treatment Masks - Category 3">Facial Treatment Masks - Category 3</option>
                                        <option value="Fragranced Bracelets - Category 4">Fragranced Bracelets - Category 4</option>
                                        <option value="Hand Creams - Category 5C">Hand Creams - Category 5C</option>
                                        <option value="Hand Sanitizers - Category 5C">Hand Sanitizers - Category 5C</option>
                                        <option value="Household Cleaning Products - Category 10A">Household Cleaning Products - Category 10A</option>
                                        <option value="Incense - Category 12">Incense - Category 12</option>
                                        <option value="Intimate Wipes - Category 8">Intimate Wipes - Category 8</option>
                                        <option value="Leave on Hair Treatments - Category 7B">Leave on Hair Treatments - Category 7B</option>
                                        <option value="Leave on Hand Products - Category 5C">Leave on Hand Products - Category 5C</option>
                                        <option value="Leave-on Body Products - Category 5A">Leave-on Body Products - Category 5A</option>
                                        <option value="Leave-on Face Products - Category 5B">Leave-on Face Products - Category 5B</option>
                                        <option value="Lip Products - Category 1">Lip Products - Category 1</option>
                                        <option value="Liquids - Category 12">Liquids - Category 12</option>
                                        <option value="Make-up - Category 3">Make-up - Category 3</option>
                                        <option value="Mouthwash - Category 6">Mouthwash - Category 6</option>
                                        <option value="Perfume - Category 4">Perfume - Category 4</option>
                                        <option value="Reed Diffusers - Category 10A">Reed Diffusers - Category 10A</option>
                                        <option value="Rinse Off and Bathwater Products - Category 9">Rinse Off and Bathwater Products - Category 9</option>
                                        <option value="Rinse off Hair Treatments - Category 7A">Rinse off Hair Treatments - Category 7A</option>
                                        <option value="Scented Clothing - Category 11B">Scented Clothing - Category 11B</option>
                                        <option value="Shampoo - Category 9">Shampoo - Category 9</option>
                                        <option value="Soap - Category 9">Soap - Category 9</option>
                                        <option value="Solid Perfume - Category 4">Solid Perfume - Category 4</option>
                                        <option value="Solids - Category 12">Solids - Category 12</option>
                                        <option value="Toothpaste - Category 6">Toothpaste - Category 6</option>
                                        <option value="Toys - Category 1">Toys - Category 1</option>
                                    </select>
                                </div>
                            </div>
                            <div class="checkbox-group">
                                <input type="checkbox" id="baseIsDualPurpose" name="is_dual_purpose">
                                <label for="baseIsDualPurpose">Dual Purpose Base</label>
                            </div>
                        </div>
                        
                        <!-- Pricing Tab -->
                        <div class="form-tab-content" id="pricing-tab">
                            <h3>Pricing Tiers</h3>
                            <div class="pricing-tier">
                                <h4>Tier 1</h4>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Tier Name</label>
                                        <input type="text" class="form-control" name="tier1_name" placeholder="e.g., 1 Gallon">
                                    </div>
                                    <div class="form-group">
                                        <label>Size</label>
                                        <input type="number" class="form-control" name="tier1_size" step="0.01" min="0">
                                    </div>
                                    <div class="form-group">
                                        <label>Unit</label>
                                        <select class="form-control" name="tier1_unit">
                                            <option value="oz">oz</option>
                                            <option value="ml">ml</option>
                                            <option value="lb">lb</option>
                                            <option value="kg">kg</option>
                                            <option value="g">g</option>
                                            <option value="gal">gal</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Price ($)</label>
                                        <input type="number" class="form-control" name="tier1_price" step="0.01" min="0">
                                    </div>
                                    <div class="form-group">
                                        <label>SKU</label>
                                        <input type="text" class="form-control" name="tier1_sku" placeholder="Supplier SKU for this tier">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="pricing-tier">
                                <h4>Tier 2</h4>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Tier Name</label>
                                        <input type="text" class="form-control" name="tier2_name" placeholder="e.g., 5 Gallons">
                                    </div>
                                    <div class="form-group">
                                        <label>Size</label>
                                        <input type="number" class="form-control" name="tier2_size" step="0.01" min="0">
                                    </div>
                                    <div class="form-group">
                                        <label>Unit</label>
                                        <select class="form-control" name="tier2_unit">
                                            <option value="oz">oz</option>
                                            <option value="ml">ml</option>
                                            <option value="lb">lb</option>
                                            <option value="kg">kg</option>
                                            <option value="g">g</option>
                                            <option value="gal">gal</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Price ($)</label>
                                        <input type="number" class="form-control" name="tier2_price" step="0.01" min="0">
                                    </div>
                                    <div class="form-group">
                                        <label>SKU</label>
                                        <input type="text" class="form-control" name="tier2_sku" placeholder="Supplier SKU for this tier">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="pricing-tier">
                                <h4>Tier 3</h4>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Tier Name</label>
                                        <input type="text" class="form-control" name="tier3_name" placeholder="e.g., 10 Gallons">
                                    </div>
                                    <div class="form-group">
                                        <label>Size</label>
                                        <input type="number" class="form-control" name="tier3_size" step="0.01" min="0">
                                    </div>
                                    <div class="form-group">
                                        <label>Unit</label>
                                        <select class="form-control" name="tier3_unit">
                                            <option value="oz">oz</option>
                                            <option value="ml">ml</option>
                                            <option value="lb">lb</option>
                                            <option value="kg">kg</option>
                                            <option value="g">g</option>
                                            <option value="gal">gal</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Price ($)</label>
                                        <input type="number" class="form-control" name="tier3_price" step="0.01" min="0">
                                    </div>
                                    <div class="form-group">
                                        <label>SKU</label>
                                        <input type="text" class="form-control" name="tier3_sku" placeholder="Supplier SKU for this tier">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="pricing-tier">
                                <h4>Tier 4</h4>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Tier Name</label>
                                        <input type="text" class="form-control" name="tier4_name" placeholder="e.g., 25 Gallons">
                                    </div>
                                    <div class="form-group">
                                        <label>Size</label>
                                        <input type="number" class="form-control" name="tier4_size" step="0.01" min="0">
                                    </div>
                                    <div class="form-group">
                                        <label>Unit</label>
                                        <select class="form-control" name="tier4_unit">
                                            <option value="oz">oz</option>
                                            <option value="ml">ml</option>
                                            <option value="lb">lb</option>
                                            <option value="kg">kg</option>
                                            <option value="g">g</option>
                                            <option value="gal">gal</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Price ($)</label>
                                        <input type="number" class="form-control" name="tier4_price" step="0.01" min="0">
                                    </div>
                                    <div class="form-group">
                                        <label>SKU</label>
                                        <input type="text" class="form-control" name="tier4_sku" placeholder="Supplier SKU for this tier">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="pricing-tier">
                                <h4>Tier 5</h4>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Tier Name</label>
                                        <input type="text" class="form-control" name="tier5_name" placeholder="e.g., 50 Gallons">
                                    </div>
                                    <div class="form-group">
                                        <label>Size</label>
                                        <input type="number" class="form-control" name="tier5_size" step="0.01" min="0">
                                    </div>
                                    <div class="form-group">
                                        <label>Unit</label>
                                        <select class="form-control" name="tier5_unit">
                                            <option value="oz">oz</option>
                                            <option value="ml">ml</option>
                                            <option value="lb">lb</option>
                                            <option value="kg">kg</option>
                                            <option value="g">g</option>
                                            <option value="gal">gal</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Price ($)</label>
                                        <input type="number" class="form-control" name="tier5_price" step="0.01" min="0">
                                    </div>
                                    <div class="form-group">
                                        <label>SKU</label>
                                        <input type="text" class="form-control" name="tier5_sku" placeholder="Supplier SKU for this tier">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Ratings Tab -->
                        <div class="form-tab-content" id="ratings-tab">
                            <h3>Ratings</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Ease of Use Rating (0-5)</label>
                                    <input type="number" class="form-control" name="ease_of_use_rating" step="0.1" min="0" max="5">
                                </div>
                                <div class="form-group">
                                    <label>Performance Rating (0-5)</label>
                                    <input type="number" class="form-control" name="performance_rating" step="0.1" min="0" max="5">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Total Ratings</label>
                                <input type="number" class="form-control" name="total_ratings" min="0" readonly>
                            </div>
                        </div>
                        
                        <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px; padding: 20px; border-top: 1px solid var(--driftwood);">
                            <button type="button" class="btn btn-secondary" onclick="document.getElementById('baseModal').classList.remove('active')">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Base Product</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        modalsContainer.insertAdjacentHTML('beforeend', modalHTML);

        // Add tab switching functionality
        document.querySelectorAll('#baseModal .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = btn.dataset.tab;
                
                // Update active button
                document.querySelectorAll('#baseModal .tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active content
                document.querySelectorAll('#baseModal .form-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${tabName}-tab`).classList.add('active');
            });
        });

        // Form submission
        document.getElementById('baseForm').addEventListener('submit', handleBaseSubmit);
    }

    // Load bases
    async function loadBases() {
        try {
            const bases = await AdminCore.apiRequest('/api/admin/bases');
            AdminCore.setBases(bases);
            renderBases();
            updateSupplierFilter();
        } catch (error) {
            AdminCore.showToast('Failed to load base products', 'error');
        }
    }

    // Load suppliers for dropdown
    async function loadSuppliers() {
        try {
            const suppliers = await AdminCore.apiRequest('/api/admin/suppliers');
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
        const select = document.getElementById('baseSupplierSelect');
        if (select) {
            select.innerHTML = '<option value="">Select supplier...</option>' + 
                suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        }
    }

    // Update supplier filter
    function updateSupplierFilter() {
        const suppliers = AdminCore.getSuppliers();
        const filter = document.getElementById('baseSupplierFilter');
        if (filter) {
            filter.innerHTML = '<option value="">All Suppliers</option>' + 
                suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        }
    }

    // Render bases table
    function renderBases(basesToRender = null) {
        const bases = basesToRender || AdminCore.getBases();
        const tbody = document.querySelector('#basesTable tbody');
        
        if (bases.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center;">No base products found</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = bases.map(base => {
            const baseId = typeof base.id === 'string' ? `'${base.id}'` : base.id;
            
            // Get supplier name - check multiple possible fields
            let supplierName = base.supplier_name || base.supplier?.name || '';
            if (!supplierName && base.supplier_id) {
                // Try to find supplier from the suppliers list
                const suppliers = AdminCore.getSuppliers();
                const supplier = suppliers.find(s => s.id === base.supplier_id);
                supplierName = supplier ? supplier.name : 'Unknown Supplier';
            }
            if (!supplierName) {
                supplierName = 'No Supplier';
            }
            
            // Get the display name
            const displayName = base.name || 'Unnamed Base';
            
            // Truncate ID if it's too long (UUIDs)
            const displayId = base.id && base.id.length > 8 ? 
                base.id.substring(0, 8) + '...' : 
                base.id || '-';
            
            return `
                <tr>
                    <td title="${base.id}" style="font-family: monospace; font-size: 12px;">${displayId}</td>
                    <td style="font-weight: 500;">${displayName}</td>
                    <td>${supplierName}</td>
                        <button class="btn-small" onclick="editBase(${baseId})" title="Edit" style="margin-right: 5px;">✏️</button>
                        <button class="btn-small btn-danger" onclick="deleteBase(${baseId})" title="Delete">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Filter bases
    function filterBases() {
        const searchTerm = document.getElementById('baseSearch').value.toLowerCase();
        const supplierId = document.getElementById('baseSupplierFilter').value;
        const baseType = document.getElementById('baseTypeFilter').value;
        
        const bases = AdminCore.getBases();
        const filtered = bases.filter(base => {
            const matchesSearch = !searchTerm || 
                base.name.toLowerCase().includes(searchTerm) ||
                (base.sku && base.sku.toLowerCase().includes(searchTerm));
            const matchesSupplier = !supplierId || base.supplier_id == supplierId;
            const matchesType = !baseType || 
                (base.base_type && base.base_type.toLowerCase().includes(baseType.toLowerCase()));
            return matchesSearch && matchesSupplier && matchesType;
        });
        
        renderBases(filtered);
    }

    // Open base modal
    window.openBaseModal = function(base = null) {
        const modal = document.getElementById('baseModal');
        const form = document.getElementById('baseForm');
        const title = document.getElementById('baseModalTitle');
        
        // Reset form
        form.reset();
        
        // Reset to first tab
        document.querySelectorAll('#baseModal .tab-btn').forEach((btn, index) => {
            btn.classList.toggle('active', index === 0);
        });
        document.querySelectorAll('#baseModal .form-tab-content').forEach((content, index) => {
            content.classList.toggle('active', index === 0);
        });
        
        if (base) {
            title.textContent = 'Edit Base Product';
            form.querySelector('[name="id"]').value = base.id;
            form.querySelector('[name="supplier_id"]').value = base.supplier_id;
            form.querySelector('[name="name"]').value = base.name;
            form.querySelector('[name="sku"]').value = base.sku || '';
            form.querySelector('[name="is_active"]').checked = base.is_active !== false;
            form.querySelector('[name="is_discontinued"]').checked = base.is_discontinued === true;
            // base_type field was removed - no longer needed
            form.querySelector('[name="max_load_pct"]').value = base.max_load_pct;
            form.querySelector('[name="unit_mode"]').value = base.unit_mode;
            form.querySelector('[name="wax_type"]').value = base.wax_type || '';
            form.querySelector('[name="specific_gravity"]').value = base.specific_gravity || '';
            form.querySelector('[name="ifra_category"]').value = base.ifra_category || '';
            form.querySelector('[name="ifra_category_2"]').value = base.ifra_category_2 || '';
            form.querySelector('[name="is_dual_purpose"]').checked = base.is_dual_purpose;
            form.querySelector('[name="notes"]').value = base.notes || '';
            
            // Load ratings
            if (base.ease_of_use_rating) form.querySelector('[name="ease_of_use_rating"]').value = base.ease_of_use_rating;
            if (base.performance_rating) form.querySelector('[name="performance_rating"]').value = base.performance_rating;
            if (base.total_ratings) form.querySelector('[name="total_ratings"]').value = base.total_ratings;
            
            // Load pricing tiers
            if (base.price_tiers && base.price_tiers.length > 0) {
                const tier = base.price_tiers[0];
                if (tier.tier1_size) {
                    form.querySelector('[name="tier1_name"]').value = tier.tier1_name || '';
                    form.querySelector('[name="tier1_size"]').value = tier.tier1_size;
                    form.querySelector('[name="tier1_unit"]').value = tier.tier1_unit || 'oz';
                    form.querySelector('[name="tier1_price"]').value = tier.tier1_price;
                    form.querySelector('[name="tier1_sku"]').value = tier.tier1_sku || '';
                }
                if (tier.tier2_size) {
                    form.querySelector('[name="tier2_name"]').value = tier.tier2_name || '';
                    form.querySelector('[name="tier2_size"]').value = tier.tier2_size;
                    form.querySelector('[name="tier2_unit"]').value = tier.tier2_unit || 'oz';
                    form.querySelector('[name="tier2_price"]').value = tier.tier2_price;
                    form.querySelector('[name="tier2_sku"]').value = tier.tier2_sku || '';
                }
                if (tier.tier3_size) {
                    form.querySelector('[name="tier3_name"]').value = tier.tier3_name || '';
                    form.querySelector('[name="tier3_size"]').value = tier.tier3_size;
                    form.querySelector('[name="tier3_unit"]').value = tier.tier3_unit || 'oz';
                    form.querySelector('[name="tier3_price"]').value = tier.tier3_price;
                    form.querySelector('[name="tier3_sku"]').value = tier.tier3_sku || '';
                }
                if (tier.tier4_size) {
                    form.querySelector('[name="tier4_name"]').value = tier.tier4_name || '';
                    form.querySelector('[name="tier4_size"]').value = tier.tier4_size;
                    form.querySelector('[name="tier4_unit"]').value = tier.tier4_unit || 'oz';
                    form.querySelector('[name="tier4_price"]').value = tier.tier4_price;
                    form.querySelector('[name="tier4_sku"]').value = tier.tier4_sku || '';
                }
                if (tier.tier5_size) {
                    form.querySelector('[name="tier5_name"]').value = tier.tier5_name || '';
                    form.querySelector('[name="tier5_size"]').value = tier.tier5_size;
                    form.querySelector('[name="tier5_unit"]').value = tier.tier5_unit || 'oz';
                    form.querySelector('[name="tier5_price"]').value = tier.tier5_price;
                    form.querySelector('[name="tier5_sku"]').value = tier.tier5_sku || '';
                }
            }
        } else {
            title.textContent = 'Add Base Product';
        }
        
        modal.classList.add('show');
        
        // Close button handler
        modal.querySelector('.close-btn').onclick = () => modal.classList.remove('show');
        modal.onclick = (e) => {
            if (e.target === modal) modal.classList.remove('show');
        };
    };

    // Edit base
    window.editBase = async function(id) {
        const bases = AdminCore.getBases();
        const base = bases.find(b => b.id == id);
        if (base) {
            openBaseModal(base);
        }
    };

    // Delete base
    window.deleteBase = async function(id) {
        if (!confirm('Are you sure you want to delete this base product?')) return;
        
        try {
            await AdminCore.apiRequest(`/api/admin/bases/${id}`, {
                method: 'DELETE'
            });
            
            AdminCore.showToast('Base product deleted successfully', 'success');
            await loadBases();
        } catch (error) {
            AdminCore.showToast('Failed to delete base product', 'error');
        }
    };

    // Toggle library status
    window.toggleBaseLibrary = async function(id, newStatus) {
        try {
            await AdminCore.apiRequest(`/api/admin/bases/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_in_library: newStatus })
            });
            
            AdminCore.showToast('Library status updated', 'success');
            await loadBases();
        } catch (error) {
            AdminCore.showToast('Failed to update library status', 'error');
        }
    };

    // Close base modal
    function closeBaseModal() {
        const modal = document.getElementById('baseModal');
        modal.classList.remove('show');
    }

    // Global save function for base products
    window.saveBase = async function() {
        console.log('saveBase function called');
        const form = document.getElementById('baseForm');
        if (!form) {
            console.error('Base form not found');
            return;
        }
        
        // Validate required fields
        const requiredFields = [
            { name: 'supplier_id', label: 'Supplier' },
            { name: 'name', label: 'Product Name' },
            { name: 'max_load_pct', label: 'Max Load %' },
            { name: 'unit_mode', label: 'Unit Mode' }
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
        
        // Only include fields that exist in the base_products table
        if (rawData.supplier_id && rawData.supplier_id !== '') data.supplier_id = rawData.supplier_id;
        if (rawData.name && rawData.name !== '') data.name = rawData.name;
        if (rawData.sku && rawData.sku !== '') data.sku = rawData.sku;
        if (rawData.base_type && rawData.base_type !== '') data.base_type = rawData.base_type;
        if (rawData.wax_type && rawData.wax_type !== '') data.wax_type = rawData.wax_type;
        if (rawData.ifra_category && rawData.ifra_category !== '') data.ifra_category = rawData.ifra_category;
        if (rawData.ifra_category_2 && rawData.ifra_category_2 !== '') data.ifra_category_2 = rawData.ifra_category_2;
        if (rawData.notes && rawData.notes !== '') data.notes = rawData.notes;
        if (rawData.unit_mode && rawData.unit_mode !== '') data.unit_mode = rawData.unit_mode;
        
        // Convert numeric fields
        if (rawData.max_load_pct && rawData.max_load_pct !== '') {
            data.max_load_pct = parseFloat(rawData.max_load_pct);
        }
        if (rawData.specific_gravity && rawData.specific_gravity !== '') {
            data.specific_gravity = parseFloat(rawData.specific_gravity);
        }
        if (rawData.ease_of_use_rating && rawData.ease_of_use_rating !== '') {
            data.ease_of_use_rating = parseFloat(rawData.ease_of_use_rating);
        }
        if (rawData.performance_rating && rawData.performance_rating !== '') {
            data.performance_rating = parseFloat(rawData.performance_rating);
        }
        if (rawData.total_ratings && rawData.total_ratings !== '') {
            data.total_ratings = parseInt(rawData.total_ratings);
        }
        
        // Convert boolean fields (only include fields that exist in database)
        data.is_dual_purpose = rawData.is_dual_purpose === 'on' || rawData.is_dual_purpose === true;
        
        // Prepare price tiers
        const priceTiers = {};
        ['tier1', 'tier2', 'tier3', 'tier4', 'tier5'].forEach(tier => {
            const name = rawData[`${tier}_name`];
            const size = rawData[`${tier}_size`];
            const unit = rawData[`${tier}_unit`];
            const price = rawData[`${tier}_price`];
            const sku = rawData[`${tier}_sku`];
            
            if (size && price) {
                priceTiers[`${tier}_name`] = name || '';
                priceTiers[`${tier}_size`] = parseFloat(size);
                priceTiers[`${tier}_unit`] = unit;
                priceTiers[`${tier}_price`] = parseFloat(price);
                priceTiers[`${tier}_sku`] = sku || '';
            }
        });
        
        if (Object.keys(priceTiers).length > 0) {
            data.price_tiers = priceTiers;
        }
        
        console.log('Cleaned data for database:', data);
        
        try {
            const isEdit = !!(rawData.id && rawData.id !== '');
            const url = isEdit ? 
                `/api/admin/bases/${rawData.id}` : 
                `/api/admin/bases`;
            
            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AdminCore.authToken}`
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                console.error('Server error:', result);
                throw new Error(result.details || result.error || 'Failed to save base product');
            }
            
            AdminCore.showToast('Base product saved successfully', 'success');
            closeBaseModal();
            await loadBases();
        } catch (error) {
            console.error('Error saving base product:', error);
            AdminCore.showToast(`Failed to save base product: ${error.message}`, 'error');
        }
    };

    // Handle form submission
    async function handleBaseSubmit(e) {
        e.preventDefault();
        await window.saveBase();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBasesModule);
    } else {
        initBasesModule();
    }
})();