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
                            <th>ID</th>
                            <th>NAME</th>
                            <th>SUPPLIER</th>
                            <th>SKU</th>
                            <th>FLASH PT</th>
                            <th>NOTES</th>
                            <th>IFRA</th>
                            <th>RATING</th>
                            <th>LIBRARY</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="10" style="text-align: center;">
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
                <div class="modal-content" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <h2 id="oilModalTitle">Add Fragrance Oil</h2>
                        <button class="close-btn">&times;</button>
                    </div>
                    <form id="oilForm">
                        <input type="hidden" id="oilId" name="id">
                        
                        <!-- Tab Navigation -->
                        <div class="form-tabs">
                            <button type="button" class="tab-btn active" data-tab="basic">Basic Info</button>
                            <button type="button" class="tab-btn" data-tab="technical">Technical</button>
                            <button type="button" class="tab-btn" data-tab="fragrance">Fragrance Notes</button>
                            <button type="button" class="tab-btn" data-tab="pricing">Pricing</button>
                            <button type="button" class="tab-btn" data-tab="ifra">IFRA</button>
                            <button type="button" class="tab-btn" data-tab="ratings">Ratings</button>
                        </div>
                        
                        <!-- Basic Information Tab -->
                        <div class="form-tab-content active" id="basic-tab">
                            <h3>Basic Information</h3>
                            <div class="form-group">
                                <label>Supplier *</label>
                                <select class="form-control" name="supplier_id" id="oilSupplierSelect" required>
                                    <option value="">Select supplier...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Product Name *</label>
                                <input type="text" class="form-control" name="product_name" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>SKU</label>
                                    <input type="text" class="form-control" name="sku">
                                </div>
                                <div class="form-group">
                                    <label>Categories</label>
                                    <input type="text" class="form-control" name="categories" placeholder="e.g., Floral, Fresh, Woody">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Scent Description</label>
                                <textarea class="form-control" name="scent_description" rows="3" maxlength="500"></textarea>
                            </div>
                            <div class="checkbox-group">
                                <input type="checkbox" id="oilInLibrary" name="is_in_library">
                                <label for="oilInLibrary">Add to Library</label>
                                
                                <input type="checkbox" id="oilIsFavorite" name="is_favorite">
                                <label for="oilIsFavorite">Mark as Favorite</label>
                                
                                <input type="checkbox" id="oilIsCustom" name="is_custom">
                                <label for="oilIsCustom">Custom Item</label>
                            </div>
                        </div>
                        
                        <!-- Technical Properties Tab -->
                        <div class="form-tab-content" id="technical-tab">
                            <h3>Technical Properties</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Flash Point (°F)</label>
                                    <input type="number" class="form-control" name="flash_point_f" min="0">
                                </div>
                                <div class="form-group">
                                    <label>Specific Gravity</label>
                                    <input type="number" class="form-control" name="specific_gravity" step="0.001" min="0" max="2">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Vanillin %</label>
                                    <input type="number" class="form-control" name="vanillin_pct" step="0.01" min="0" max="100">
                                </div>
                                <div class="form-group">
                                    <label>Solvent Note</label>
                                    <input type="text" class="form-control" name="solvent_note" placeholder="e.g., DPG, IPM">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Soap Acceleration</label>
                                <select class="form-control" name="soap_acceleration">
                                    <option value="">Not Specified</option>
                                    <option value="none">No Acceleration</option>
                                    <option value="slight">Slight Acceleration</option>
                                    <option value="moderate">Moderate Acceleration</option>
                                    <option value="severe">Severe Acceleration</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Product URL</label>
                                <input type="url" class="form-control" name="product_url" placeholder="https://...">
                            </div>
                        </div>
                        
                        <!-- Fragrance Notes Tab -->
                        <div class="form-tab-content" id="fragrance-tab">
                            <h3>Fragrance Notes</h3>
                            <div class="form-group">
                                <label>Theme Family</label>
                                <input type="text" class="form-control" name="theme_family" placeholder="e.g., Oriental, Fresh, Gourmand">
                            </div>
                            <div class="form-group">
                                <label>Top Notes</label>
                                <textarea class="form-control" name="fragrance_notes_top" rows="2" placeholder="e.g., Bergamot, Lemon, Orange"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Middle Notes</label>
                                <textarea class="form-control" name="fragrance_notes_middle" rows="2" placeholder="e.g., Rose, Jasmine, Lavender"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Base Notes</label>
                                <textarea class="form-control" name="fragrance_notes_base" rows="2" placeholder="e.g., Vanilla, Musk, Sandalwood"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Blending Notes</label>
                                <textarea class="form-control" name="blending_notes" rows="3" placeholder="Tips for blending this fragrance..."></textarea>
                            </div>
                            <div class="form-group">
                                <label>Usage Notes</label>
                                <textarea class="form-control" name="usage_notes" rows="3" placeholder="Special instructions or warnings..."></textarea>
                            </div>
                        </div>
                        
                        <!-- Pricing Tab -->
                        <div class="form-tab-content" id="pricing-tab">
                            <h3>Pricing Tiers</h3>
                            <div class="pricing-tier">
                                <h4>Tier 1</h4>
                                <div class="form-row">
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
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Price ($)</label>
                                        <input type="number" class="form-control" name="tier1_price" step="0.01" min="0">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="pricing-tier">
                                <h4>Tier 2</h4>
                                <div class="form-row">
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
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Price ($)</label>
                                        <input type="number" class="form-control" name="tier2_price" step="0.01" min="0">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="pricing-tier">
                                <h4>Tier 3</h4>
                                <div class="form-row">
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
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Price ($)</label>
                                        <input type="number" class="form-control" name="tier3_price" step="0.01" min="0">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- IFRA Tab -->
                        <div class="form-tab-content" id="ifra-tab">
                            <h3>IFRA Information</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>IFRA Version</label>
                                    <input type="text" class="form-control" name="ifra_version" placeholder="e.g., Amendment 51">
                                </div>
                                <div class="form-group">
                                    <label>IFRA Date</label>
                                    <input type="date" class="form-control" name="ifra_date">
                                </div>
                            </div>
                            
                            <h4>Maximum Percentages by Product Type</h4>
                            <div class="ifra-inputs">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Foaming Hand Soap (Cat 9)</label>
                                        <input type="number" class="form-control" name="ifra_foaming_hand_soap" step="0.01" min="0" max="100">
                                    </div>
                                    <div class="form-group">
                                        <label>Liquid Hand Soap (Cat 9)</label>
                                        <input type="number" class="form-control" name="ifra_liquid_hand_soap" step="0.01" min="0" max="100">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Body Wash (Cat 9)</label>
                                        <input type="number" class="form-control" name="ifra_body_wash" step="0.01" min="0" max="100">
                                    </div>
                                    <div class="form-group">
                                        <label>Body Lotion (Cat 5A)</label>
                                        <input type="number" class="form-control" name="ifra_body_lotion" step="0.01" min="0" max="100">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Room Spray (Cat 10A)</label>
                                        <input type="number" class="form-control" name="ifra_room_spray" step="0.01" min="0" max="100">
                                    </div>
                                    <div class="form-group">
                                        <label>Fabric Spray (Cat 10B)</label>
                                        <input type="number" class="form-control" name="ifra_fabric_spray" step="0.01" min="0" max="100">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Candles (Cat 12)</label>
                                        <input type="number" class="form-control" name="ifra_candles" step="0.01" min="0" max="100">
                                    </div>
                                    <div class="form-group">
                                        <label>Air Freshener (Cat 10A)</label>
                                        <input type="number" class="form-control" name="ifra_air_freshener" step="0.01" min="0" max="100">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Reed Diffuser (Cat 10B)</label>
                                        <input type="number" class="form-control" name="ifra_reed_diffuser" step="0.01" min="0" max="100">
                                    </div>
                                    <div class="form-group">
                                        <label>Wax Melts (Cat 12)</label>
                                        <input type="number" class="form-control" name="ifra_wax_melts" step="0.01" min="0" max="100">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Ratings Tab -->
                        <div class="form-tab-content" id="ratings-tab">
                            <h3>Ratings & Analytics</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Intensity Rating (0-5)</label>
                                    <input type="number" class="form-control" name="intensity_rating" step="0.1" min="0" max="5">
                                </div>
                                <div class="form-group">
                                    <label>Overall Rating (0-5)</label>
                                    <input type="number" class="form-control" name="overall_rating" step="0.1" min="0" max="5">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Total Ratings</label>
                                    <input type="number" class="form-control" name="total_ratings" min="0" readonly>
                                </div>
                                <div class="form-group">
                                    <label>Batch Count</label>
                                    <input type="number" class="form-control" name="batch_count" min="0" readonly>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Library Add Count</label>
                                    <input type="number" class="form-control" name="library_add_count" min="0" readonly>
                                </div>
                                <div class="form-group">
                                    <label>Unique User Count</label>
                                    <input type="number" class="form-control" name="unique_user_count" min="0" readonly>
                                </div>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 20px;">Save Fragrance Oil</button>
                    </form>
                </div>
            </div>
        `;
        modalsContainer.insertAdjacentHTML('beforeend', modalHTML);

        // Add tab switching functionality
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = btn.dataset.tab;
                
                // Update active button
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active content
                document.querySelectorAll('.form-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${tabName}-tab`).classList.add('active');
            });
        });

        // Form submission
        document.getElementById('oilForm').addEventListener('submit', handleOilSubmit);
    }

    // Load oils
    async function loadOils() {
        try {
            const response = await fetch(`${AdminCore.API_URL}/oils`);
            const oils = await response.json();
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
            const response = await fetch(`${AdminCore.API_URL}/suppliers`);
            const suppliers = await response.json();
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

    // Render oils table with more information
    function renderOils(oilsToRender = null) {
        const oils = oilsToRender || AdminCore.getOils();
        const tbody = document.querySelector('#oilsTable tbody');
        
        if (oils.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center;">No fragrance oils found</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = oils.map(oil => {
            const oilId = typeof oil.id === 'string' ? `'${oil.id}'` : oil.id;
            const fragranceNotes = [];
            if (oil.fragrance_notes_top) fragranceNotes.push('T');
            if (oil.fragrance_notes_middle) fragranceNotes.push('M');
            if (oil.fragrance_notes_base) fragranceNotes.push('B');
            
            return `
                <tr>
                    <td>${oil.id}</td>
                    <td>${oil.product_name}</td>
                    <td>${oil.supplier_name || '-'}</td>
                    <td>${oil.sku || '-'}</td>
                    <td>${oil.flash_point_f ? oil.flash_point_f + '°F' : '-'}</td>
                    <td>${fragranceNotes.length > 0 ? fragranceNotes.join(',') : '-'}</td>
                    <td>${oil.ifra_version || '-'}</td>
                    <td>${oil.overall_rating ? oil.overall_rating.toFixed(1) : '-'}</td>
                    <td>
                        <span class="library-toggle ${oil.is_in_library ? 'in-library' : ''}" 
                              onclick="toggleOilLibrary(${oilId}, ${!oil.is_in_library})">
                            ${oil.is_in_library ? '✓ In Library' : '✗ Not in Library'}
                        </span>
                    </td>
                    <td class="actions">
                        <button class="btn-small" onclick="editOil(${oilId})">✏️</button>
                        <button class="btn-small btn-danger" onclick="deleteOil(${oilId})">🗑️</button>
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
                oil.product_name.toLowerCase().includes(searchTerm) ||
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
        document.querySelectorAll('.tab-btn').forEach((btn, index) => {
            btn.classList.toggle('active', index === 0);
        });
        document.querySelectorAll('.form-tab-content').forEach((content, index) => {
            content.classList.toggle('active', index === 0);
        });
        
        if (oil) {
            title.textContent = 'Edit Fragrance Oil';
            form.querySelector('[name="id"]').value = oil.id;
            form.querySelector('[name="supplier_id"]').value = oil.supplier_id;
            form.querySelector('[name="product_name"]').value = oil.product_name;
            form.querySelector('[name="sku"]').value = oil.sku || '';
            form.querySelector('[name="flash_point_f"]').value = oil.flash_point_f || '';
            form.querySelector('[name="ifra_version"]').value = oil.ifra_version || '';
            form.querySelector('[name="ifra_date"]').value = oil.ifra_date || '';
            form.querySelector('[name="solvent_note"]').value = oil.solvent_note || '';
            form.querySelector('[name="is_in_library"]').checked = oil.is_in_library;
            form.querySelector('[name="is_favorite"]').checked = oil.is_favorite;
            form.querySelector('[name="is_custom"]').checked = oil.is_custom;
            
            // Load additional fields if they exist
            if (oil.specific_gravity) form.querySelector('[name="specific_gravity"]').value = oil.specific_gravity;
            if (oil.vanillin_pct) form.querySelector('[name="vanillin_pct"]').value = oil.vanillin_pct;
            if (oil.categories) form.querySelector('[name="categories"]').value = oil.categories;
            if (oil.scent_description) form.querySelector('[name="scent_description"]').value = oil.scent_description;
            if (oil.theme_family) form.querySelector('[name="theme_family"]').value = oil.theme_family;
            if (oil.fragrance_notes_top) form.querySelector('[name="fragrance_notes_top"]').value = oil.fragrance_notes_top;
            if (oil.fragrance_notes_middle) form.querySelector('[name="fragrance_notes_middle"]').value = oil.fragrance_notes_middle;
            if (oil.fragrance_notes_base) form.querySelector('[name="fragrance_notes_base"]').value = oil.fragrance_notes_base;
            if (oil.soap_acceleration) form.querySelector('[name="soap_acceleration"]').value = oil.soap_acceleration;
            if (oil.product_url) form.querySelector('[name="product_url"]').value = oil.product_url;
            if (oil.blending_notes) form.querySelector('[name="blending_notes"]').value = oil.blending_notes;
            if (oil.usage_notes) form.querySelector('[name="usage_notes"]').value = oil.usage_notes;
            
            // Load pricing tiers
            if (oil.price_tiers && oil.price_tiers.length > 0) {
                const tier = oil.price_tiers[0];
                if (tier.tier1_size) {
                    form.querySelector('[name="tier1_size"]').value = tier.tier1_size;
                    form.querySelector('[name="tier1_unit"]').value = tier.tier1_unit || 'oz';
                    form.querySelector('[name="tier1_price"]').value = tier.tier1_price;
                }
                if (tier.tier2_size) {
                    form.querySelector('[name="tier2_size"]').value = tier.tier2_size;
                    form.querySelector('[name="tier2_unit"]').value = tier.tier2_unit || 'oz';
                    form.querySelector('[name="tier2_price"]').value = tier.tier2_price;
                }
                if (tier.tier3_size) {
                    form.querySelector('[name="tier3_size"]').value = tier.tier3_size;
                    form.querySelector('[name="tier3_unit"]').value = tier.tier3_unit || 'oz';
                    form.querySelector('[name="tier3_price"]').value = tier.tier3_price;
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
            if (oil.intensity_rating) form.querySelector('[name="intensity_rating"]').value = oil.intensity_rating;
            if (oil.overall_rating) form.querySelector('[name="overall_rating"]').value = oil.overall_rating;
            if (oil.total_ratings) form.querySelector('[name="total_ratings"]').value = oil.total_ratings;
            if (oil.batch_count) form.querySelector('[name="batch_count"]').value = oil.batch_count;
            if (oil.library_add_count) form.querySelector('[name="library_add_count"]').value = oil.library_add_count;
            if (oil.unique_user_count) form.querySelector('[name="unique_user_count"]').value = oil.unique_user_count;
        } else {
            title.textContent = 'Add Fragrance Oil';
        }
        
        modal.style.display = 'block';
        
        // Close button handler
        modal.querySelector('.close-btn').onclick = () => modal.style.display = 'none';
        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };
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
            const response = await fetch(`${AdminCore.API_URL}/oils/${id}`, {
                method: 'DELETE',
                headers: AdminCore.getAuthHeaders()
            });
            
            if (response.ok) {
                AdminCore.showToast('Fragrance oil deleted successfully', 'success');
                await loadOils();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            AdminCore.showToast('Failed to delete fragrance oil', 'error');
        }
    };

    // Toggle library status
    window.toggleOilLibrary = async function(id, newStatus) {
        try {
            const response = await fetch(`${AdminCore.API_URL}/oils/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...AdminCore.getAuthHeaders()
                },
                body: JSON.stringify({ is_in_library: newStatus })
            });
            
            if (response.ok) {
                await loadOils();
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            AdminCore.showToast('Failed to update library status', 'error');
        }
    };

    // Handle form submission
    async function handleOilSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Convert checkboxes
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
        ['tier1', 'tier2', 'tier3'].forEach(tier => {
            const size = formData.get(`${tier}_size`);
            const unit = formData.get(`${tier}_unit`);
            const price = formData.get(`${tier}_price`);
            
            if (size && price) {
                priceTiers[`${tier}_size`] = parseFloat(size);
                priceTiers[`${tier}_unit`] = unit;
                priceTiers[`${tier}_price`] = parseFloat(price);
            }
        });
        
        if (Object.keys(priceTiers).length > 0) {
            data.price_tiers = priceTiers;
        }
        
        // Clean up fields not directly in fragrance_oils table
        const fieldsToMove = [
            'fragrance_notes_top', 'fragrance_notes_middle', 'fragrance_notes_base',
            'theme_family', 'scent_description', 'soap_acceleration',
            'product_url', 'blending_notes', 'usage_notes'
        ];
        
        const productDetails = {};
        fieldsToMove.forEach(field => {
            if (data[field]) {
                productDetails[field] = data[field];
                delete data[field];
            }
        });
        
        if (Object.keys(productDetails).length > 0) {
            data.product_details = productDetails;
        }
        
        try {
            const isEdit = !!data.id;
            const url = isEdit ? 
                `${AdminCore.API_URL}/oils/${data.id}` : 
                `${AdminCore.API_URL}/oils`;
            
            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...AdminCore.getAuthHeaders()
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                AdminCore.showToast(`Fragrance oil ${isEdit ? 'updated' : 'created'} successfully`, 'success');
                document.getElementById('oilModal').style.display = 'none';
                await loadOils();
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save');
            }
        } catch (error) {
            AdminCore.showToast(`Failed to save fragrance oil: ${error.message}`, 'error');
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOilsModule);
    } else {
        initOilsModule();
    }
})();