// Fragrance Oils Tab Module
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
                            <th>PRICE</th>
                            <th>FLASH POINT</th>
                            <th>IFRA VER</th>
                            <th>LIBRARY</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="9" style="text-align: center;">
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

    // Setup oil modal
    function setupOilModal() {
        const modalsContainer = document.getElementById('modals-container');
        const modalHTML = `
            <div id="oilModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="oilModalTitle">Add Fragrance Oil</h2>
                        <button class="close-btn">&times;</button>
                    </div>
                    <form id="oilForm">
                        <input type="hidden" id="oilId" name="id">
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
                                <label>Flash Point (°F)</label>
                                <input type="number" class="form-control" name="flash_point_f" min="0">
                            </div>
                        </div>
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
                        <div class="form-group">
                            <label>Solvent Note</label>
                            <input type="text" class="form-control" name="solvent_note" placeholder="e.g., DPG">
                        </div>
                        
                        <!-- Pricing Information -->
                        <div class="form-row">
                            <div class="form-group">
                                <label>Price per Unit ($)</label>
                                <input type="number" class="form-control" name="price_per_unit" step="0.01" min="0">
                            </div>
                            <div class="form-group">
                                <label>Unit Size</label>
                                <input type="text" class="form-control" name="unit_size" placeholder="e.g., 1 oz, 30 ml">
                            </div>
                        </div>
                        
                        <!-- Fragrance Notes -->
                        <div style="margin-top: 20px;">
                            <h4>Fragrance Notes</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Top Notes</label>
                                    <input type="text" class="form-control" name="top_notes" placeholder="e.g., Citrus, Bergamot">
                                </div>
                                <div class="form-group">
                                    <label>Middle Notes</label>
                                    <input type="text" class="form-control" name="middle_notes" placeholder="e.g., Rose, Jasmine">
                                </div>
                                <div class="form-group">
                                    <label>Bottom Notes</label>
                                    <input type="text" class="form-control" name="bottom_notes" placeholder="e.g., Vanilla, Musk">
                                </div>
                            </div>
                        </div>
                        
                        <div class="checkbox-group">
                            <input type="checkbox" id="oilInLibrary" name="is_in_library">
                            <label for="oilInLibrary">Add to Library</label>
                        </div>
                        
                        <!-- IFRA Entries Section -->
                        <div style="margin-top: 20px;">
                            <h4>IFRA Maximum Percentages</h4>
                            <div class="ifra-inputs">
                                <div class="form-group">
                                    <label>Foaming Hand Soap</label>
                                    <input type="number" class="form-control" name="ifra_foaming_hand_soap" step="0.01" min="0" max="100">
                                </div>
                                <div class="form-group">
                                    <label>Liquid Hand Soap</label>
                                    <input type="number" class="form-control" name="ifra_liquid_hand_soap" step="0.01" min="0" max="100">
                                </div>
                                <div class="form-group">
                                    <label>Body Wash</label>
                                    <input type="number" class="form-control" name="ifra_body_wash" step="0.01" min="0" max="100">
                                </div>
                                <div class="form-group">
                                    <label>Room Spray</label>
                                    <input type="number" class="form-control" name="ifra_room_spray" step="0.01" min="0" max="100">
                                </div>
                                <div class="form-group">
                                    <label>Fabric Spray</label>
                                    <input type="number" class="form-control" name="ifra_fabric_spray" step="0.01" min="0" max="100">
                                </div>
                                <div class="form-group">
                                    <label>Body Lotion</label>
                                    <input type="number" class="form-control" name="ifra_body_lotion" step="0.01" min="0" max="100">
                                </div>
                                <div class="form-group">
                                    <label>Candles</label>
                                    <input type="number" class="form-control" name="ifra_candles" step="0.01" min="0" max="100">
                                </div>
                                <div class="form-group">
                                    <label>Air Freshener</label>
                                    <input type="number" class="form-control" name="ifra_air_freshener" step="0.01" min="0" max="100">
                                </div>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 20px;">Save Fragrance Oil</button>
                    </form>
                </div>
            </div>
        `;
        modalsContainer.insertAdjacentHTML('beforeend', modalHTML);

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

    // Render oils table
    function renderOils(oilsToRender = null) {
        const oils = oilsToRender || AdminCore.getOils();
        const tbody = document.querySelector('#oilsTable tbody');
        
        if (oils.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center;">No fragrance oils found</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = oils.map(oil => {
            const oilId = typeof oil.id === 'string' ? `'${oil.id}'` : oil.id;
            
            return `
                <tr>
                    <td>${oil.id}</td>
                    <td>${oil.product_name}</td>
                    <td>${oil.supplier_name || '-'}</td>
                    <td>${oil.sku || '-'}</td>
                    <td>${oil.flash_point_f ? oil.flash_point_f + '°F' : '-'}</td>
                    <td>${oil.ifra_version || '-'}</td>
                    <td>
                        <span class="library-toggle ${oil.is_in_library ? 'in-library' : ''}" 
                              onclick="toggleOilLibrary(${oilId}, ${!oil.is_in_library})">
                            ${oil.is_in_library ? '✓ In Library' : '✗ Not in Library'}
                        </span>
                    </td>
                    <td class="actions">
                        <button class="btn btn-info" onclick="editOil(${oilId})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteOil(${oilId})">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Filter oils
    function filterOils() {
        const searchTerm = document.getElementById('oilSearch').value.toLowerCase();
        const supplierFilter = document.getElementById('oilSupplierFilter').value;
        const oils = AdminCore.getOils();
        
        const filtered = oils.filter(oil => {
            const matchesSearch = !searchTerm || 
                oil.product_name.toLowerCase().includes(searchTerm) ||
                (oil.supplier_name && oil.supplier_name.toLowerCase().includes(searchTerm)) ||
                (oil.sku && oil.sku.toLowerCase().includes(searchTerm));
            
            const matchesSupplier = !supplierFilter || oil.supplier_id == supplierFilter;
            
            return matchesSearch && matchesSupplier;
        });
        
        renderOils(filtered);
    }

// Open oil modal
function openOilModal(oil = null) {
    const modal = document.getElementById('oilModal');
    const form = document.getElementById('oilForm');
    
    document.getElementById('oilModalTitle').textContent = oil ? 'Edit Fragrance Oil' : 'Add Fragrance Oil';
    document.getElementById('oilId').value = oil?.id || '';
    
    if (oil) {
        // Debug logging to see what data we have
        console.log('Editing oil:', oil);
        console.log('Oil supplier_id:', oil.supplier_id);
        console.log('Oil supplier_name:', oil.supplier_name);
        console.log('Available suppliers:', AdminCore.getSuppliers());
        
        // Set supplier dropdown by matching the supplier name
        setTimeout(() => {
            const supplierSelect = document.getElementById('oilSupplierSelect');
            if (supplierSelect) {
                // Log all options for debugging
                console.log('Supplier options:');
                for (let i = 0; i < supplierSelect.options.length; i++) {
                    console.log(`  Option ${i}: value="${supplierSelect.options[i].value}", text="${supplierSelect.options[i].text}"`);
                }
                
                // Try to match by supplier name since IDs don't match
                if (oil.supplier_name) {
                    let found = false;
                    for (let i = 0; i < supplierSelect.options.length; i++) {
                        if (supplierSelect.options[i].text === oil.supplier_name) {
                            supplierSelect.selectedIndex = i;
                            found = true;
                            console.log(`✓ Matched supplier by name: "${oil.supplier_name}" at index ${i}`);
                            break;
                        }
                    }
                    
                    if (!found) {
                        console.warn(`Could not find supplier "${oil.supplier_name}" in dropdown`);
                        
                        // Try case-insensitive match
                        for (let i = 0; i < supplierSelect.options.length; i++) {
                            if (supplierSelect.options[i].text.toLowerCase() === oil.supplier_name.toLowerCase()) {
                                supplierSelect.selectedIndex = i;
                                console.log(`✓ Matched supplier by name (case-insensitive): "${oil.supplier_name}" at index ${i}`);
                                break;
                            }
                        }
                    }
                } else {
                    console.warn('Oil has no supplier_name property');
                }
            }
        }, 10);
        
        // Set all basic fields
        form.product_name.value = oil.product_name || oil.name || '';
        form.sku.value = oil.sku || '';
        form.flash_point_f.value = oil.flash_point_f || '';
        form.ifra_version.value = oil.ifra_version || '';
        
        // Format date properly for HTML date input
        if (oil.ifra_date) {
            const date = new Date(oil.ifra_date);
            if (!isNaN(date.getTime())) {
                form.ifra_date.value = date.toISOString().split('T')[0];
            } else {
                form.ifra_date.value = '';
            }
        } else {
            form.ifra_date.value = '';
        }
        
        form.solvent_note.value = oil.solvent_note || '';
        form.is_in_library.checked = oil.is_in_library || false;
        
        // Clear all IFRA fields first
        form.ifra_foaming_hand_soap.value = '';
        form.ifra_liquid_hand_soap.value = '';
        form.ifra_body_wash.value = '';
        form.ifra_room_spray.value = '';
        form.ifra_fabric_spray.value = '';
        form.ifra_body_lotion.value = '';
        form.ifra_candles.value = '';
        form.ifra_air_freshener.value = '';
        
        // Set IFRA values from ifra_entries array
        if (oil.ifra_entries && Array.isArray(oil.ifra_entries)) {
            oil.ifra_entries.forEach(entry => {
                const fieldName = `ifra_${entry.product_type_key}`;
                const field = form[fieldName];
                if (field) {
                    field.value = entry.max_pct || '';
                    console.log(`Set ${fieldName} to ${entry.max_pct}`);
                }
            });
        }
        
        // Log what we set for debugging
        console.log('Form values after setting:', {
            product_name: form.product_name.value,
            sku: form.sku.value,
            flash_point_f: form.flash_point_f.value,
            ifra_version: form.ifra_version.value,
            ifra_date: form.ifra_date.value,
            solvent_note: form.solvent_note.value,
            is_in_library: form.is_in_library.checked
        });
        
    } else {
        form.reset();
    }
    
    modal.classList.add('active');
}


    // Handle form submission
    async function handleOilSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        const id = data.id;
        delete data.id;
        
        // Convert checkbox values
        data.is_in_library = data.is_in_library === 'on';
        
        // Convert numbers
        data.supplier_id = parseInt(data.supplier_id);
        if (data.flash_point_f) data.flash_point_f = parseInt(data.flash_point_f);
        
        // Collect IFRA entries
        const ifraEntries = [];
        const ifraFields = [
            'foaming_hand_soap', 'liquid_hand_soap', 'body_wash', 
            'room_spray', 'fabric_spray', 'body_lotion', 
            'candles', 'air_freshener'
        ];
        
        ifraFields.forEach(field => {
            const key = `ifra_${field}`;
            if (data[key]) {
                ifraEntries.push({
                    product_type_key: field,
                    max_pct: parseFloat(data[key])
                });
                delete data[key]; // Remove from main data object
            }
        });
        
        // Add IFRA entries if any
        if (ifraEntries.length > 0) {
            data.ifra_entries = ifraEntries;
        }
        
        try {
            const response = await fetch(`${AdminCore.API_URL}/oils${id ? '/' + id : ''}`, {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                await loadOils();
                document.getElementById('oilModal').classList.remove('active');
                AdminCore.showToast(`Fragrance oil ${id ? 'updated' : 'created'} successfully`, 'success');
                AdminCore.updateStats();
            } else {
                const error = await response.json();
                AdminCore.showToast(error.error || 'Failed to save oil', 'error');
            }
        } catch (error) {
            AdminCore.showToast('Failed to save oil', 'error');
        }
    }

// Update the editOil function to ensure suppliers are loaded
window.editOil = async function(id) {
    // Make sure suppliers are loaded first
    if (AdminCore.getSuppliers().length === 0) {
        console.log('Loading suppliers first...');
        await loadSuppliers();
        // Small delay to ensure DOM updates
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const oils = AdminCore.getOils();
    const oil = oils.find(o => o.id == id);
    if (oil) {
        console.log('Opening modal for oil:', oil);
        openOilModal(oil);
    } else {
        console.error('Oil not found with ID:', id);
    }
}

    window.deleteOil = async function(id) {
        if (!confirm('Delete this fragrance oil?')) return;
        
        try {
            const response = await fetch(`${AdminCore.API_URL}/oils/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await loadOils();
                AdminCore.showToast('Fragrance oil deleted successfully', 'success');
                AdminCore.updateStats();
            } else {
                const error = await response.json();
                AdminCore.showToast(error.error || 'Failed to delete oil', 'error');
            }
        } catch (error) {
            AdminCore.showToast('Failed to delete oil', 'error');
        }
    }

    window.toggleOilLibrary = async function(id, inLibrary) {
        const oils = AdminCore.getOils();
        const oil = oils.find(o => o.id == id);
        
        if (!oil) return;
        
        oil.is_in_library = inLibrary;
        
        try {
            const response = await fetch(`${AdminCore.API_URL}/oils/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(oil)
            });
            
            if (response.ok) {
                await loadOils();
                AdminCore.showToast('Oil library status updated', 'success');
            }
        } catch (error) {
            AdminCore.showToast('Failed to update library status', 'error');
        }
    }

    // Export the loadOils function globally for other modules
    window.loadOils = loadOils;

    // Initialize module when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOilsModule);
    } else {
        initOilsModule();
    }
})();
