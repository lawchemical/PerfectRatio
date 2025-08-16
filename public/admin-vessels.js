// Vessels Tab Module for Admin Panel
(function() {
    // Module initialization
    async function initVesselsModule() {
        setupVesselsTab();
        setupVesselModal();
        await loadVessels();
        await loadSuppliers();
    }

    // Setup the vessels tab content
    function setupVesselsTab() {
        const vesselsTab = document.getElementById('vessels');
        if (!vesselsTab) {
            // Create vessels tab if it doesn't exist
            const tabsContainer = document.querySelector('.tabs');
            if (tabsContainer) {
                const vesselTab = document.createElement('div');
                vesselTab.className = 'tab-content';
                vesselTab.id = 'vessels';
                vesselTab.style.display = 'none';
                tabsContainer.parentElement.appendChild(vesselTab);
            }
        }
        
        const vesselsContent = document.getElementById('vessels');
        vesselsContent.innerHTML = `
            <div class="search-bar">
                <input type="text" class="search-input" id="vesselSearch" placeholder="Search vessels...">
                <select class="form-control" id="vesselTypeFilter" style="width: 200px;">
                    <option value="">All Types</option>
                    <option value="jar">Jars</option>
                    <option value="bottle">Bottles</option>
                    <option value="spray_bottle">Spray Bottles</option>
                    <option value="roller_bottle">Roller Bottles</option>
                    <option value="tin">Tins</option>
                    <option value="tube">Tubes</option>
                    <option value="pouch">Pouches</option>
                    <option value="other">Other</option>
                </select>
                <select class="form-control" id="vesselSupplierFilter" style="width: 200px;">
                    <option value="">All Suppliers</option>
                </select>
                <button class="btn btn-primary" id="addVesselBtn">
                    ➕ Add Vessel
                </button>
            </div>
            <div class="table-container">
                <table id="vesselsTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>NAME</th>
                            <th>SUPPLIER</th>
                            <th>TYPE</th>
                            <th>SIZE</th>
                            <th>MATERIAL</th>
                            <th>COLOR</th>
                            <th>$/UNIT</th>
                            <th>CASE</th>
                            <th>STOCK</th>
                            <th>LIBRARY</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="12" style="text-align: center;">
                                <div class="loading"></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        // Add event listeners
        document.getElementById('addVesselBtn').addEventListener('click', () => openVesselModal());
        
        // Search functionality
        document.getElementById('vesselSearch').addEventListener('input', filterVessels);
        
        // Type filter
        document.getElementById('vesselTypeFilter').addEventListener('change', filterVessels);
        
        // Supplier filter
        document.getElementById('vesselSupplierFilter').addEventListener('change', filterVessels);
    }

    // Setup vessel modal
    function setupVesselModal() {
        const modalsContainer = document.getElementById('modals-container');
        const modalHTML = `
            <div id="vesselModal" class="modal">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h2 id="vesselModalTitle">Add Vessel</h2>
                        <button class="close-btn">&times;</button>
                    </div>
                    <form id="vesselForm">
                        <input type="hidden" id="vesselId" name="id">
                        
                        <div class="form-section">
                            <h4>Basic Information</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Supplier *</label>
                                    <select class="form-control" name="supplier_id" id="vesselSupplierSelect" required>
                                        <option value="">Select supplier...</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Vessel Name *</label>
                                    <input type="text" class="form-control" name="name" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>SKU</label>
                                    <input type="text" class="form-control" name="sku">
                                </div>
                                <div class="form-group">
                                    <label>Vessel Type *</label>
                                    <select class="form-control" name="vessel_type" required>
                                        <option value="jar">Jar</option>
                                        <option value="bottle">Bottle</option>
                                        <option value="spray_bottle">Spray Bottle</option>
                                        <option value="roller_bottle">Roller Bottle</option>
                                        <option value="tin">Tin</option>
                                        <option value="tube">Tube</option>
                                        <option value="pouch">Pouch</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4>Physical Properties</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Size *</label>
                                    <div style="display: flex; gap: 10px;">
                                        <input type="number" class="form-control" name="size" step="0.1" min="0" required style="flex: 1;">
                                        <select class="form-control" name="size_unit" style="width: 100px;">
                                            <option value="oz">oz</option>
                                            <option value="ml">ml</option>
                                            <option value="g">g</option>
                                            <option value="L">L</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Material</label>
                                    <select class="form-control" name="material">
                                        <option value="">Select material...</option>
                                        <option value="glass">Glass</option>
                                        <option value="plastic">Plastic</option>
                                        <option value="aluminum">Aluminum</option>
                                        <option value="tin">Tin</option>
                                        <option value="paper">Paper</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Color</label>
                                    <input type="text" class="form-control" name="color" placeholder="e.g., Clear, Amber, White">
                                </div>
                                <div class="form-group">
                                    <label>Shape</label>
                                    <input type="text" class="form-control" name="shape" placeholder="e.g., Round, Square, Oval">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Neck Size (for bottles)</label>
                                    <input type="text" class="form-control" name="neck_size" placeholder="e.g., 24-410, 20-410">
                                </div>
                                <div class="form-group">
                                    <label>Weight (grams)</label>
                                    <input type="number" class="form-control" name="weight_grams" step="0.1" min="0">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Max Fill Volume</label>
                                    <input type="number" class="form-control" name="max_fill_volume" step="0.1" min="0">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4>Pricing & Ordering</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Price per Unit * ($)</label>
                                    <input type="number" class="form-control" name="price_per_unit" step="0.01" min="0" required>
                                </div>
                                <div class="form-group">
                                    <label>Case Count *</label>
                                    <input type="number" class="form-control" name="case_count" min="1" value="1" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Case Price (if different)</label>
                                    <input type="number" class="form-control" name="case_price" step="0.01" min="0" placeholder="Leave blank to calculate">
                                </div>
                                <div class="form-group">
                                    <label>Minimum Order Qty</label>
                                    <input type="number" class="form-control" name="minimum_order_quantity" min="1" value="1">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4>Inventory</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Quantity on Hand</label>
                                    <input type="number" class="form-control" name="quantity_on_hand" min="0" value="0">
                                </div>
                                <div class="form-group">
                                    <label>Location</label>
                                    <input type="text" class="form-control" name="location" placeholder="Storage location">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Reorder Point</label>
                                    <input type="number" class="form-control" name="reorder_point" min="0">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4>Additional Information</h4>
                            <div class="form-group">
                                <label>Product URL</label>
                                <input type="url" class="form-control" name="product_url" placeholder="https://...">
                            </div>
                            <div class="form-group">
                                <label>Notes</label>
                                <textarea class="form-control" name="notes" rows="3"></textarea>
                            </div>
                            <div class="checkbox-group">
                                <input type="checkbox" id="vesselInLibrary" name="is_in_library" checked>
                                <label for="vesselInLibrary">Add to Library</label>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Save Vessel</button>
                    </form>
                </div>
            </div>
        `;
        modalsContainer.insertAdjacentHTML('beforeend', modalHTML);

        // Form submission
        document.getElementById('vesselForm').addEventListener('submit', handleVesselSubmit);
        
        // Close modal
        document.querySelector('#vesselModal .close-btn').addEventListener('click', () => {
            document.getElementById('vesselModal').style.display = 'none';
        });
    }

    // Load vessels
    async function loadVessels() {
        try {
            const response = await fetch(`${AdminCore.API_URL}/vessels`);
            const vessels = await response.json();
            AdminCore.setVessels(vessels);
            renderVessels();
        } catch (error) {
            console.error('Error loading vessels:', error);
            AdminCore.showToast('Failed to load vessels', 'error');
        }
    }

    // Render vessels table
    function renderVessels(vesselsToRender = null) {
        const vessels = vesselsToRender || AdminCore.getVessels();
        const tbody = document.querySelector('#vesselsTable tbody');
        
        if (!vessels || vessels.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="12" style="text-align: center; color: #6c757d;">
                        No vessels found. Add your first vessel to get started.
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = vessels.map(vessel => `
            <tr data-id="${vessel.id}">
                <td class="mono">${vessel.id.substring(0, 8)}</td>
                <td><strong>${vessel.name}</strong></td>
                <td>${vessel.supplier_name || 'N/A'}</td>
                <td>${formatVesselType(vessel.vessel_type)}</td>
                <td>${vessel.size} ${vessel.size_unit || 'oz'}</td>
                <td>${vessel.material ? capitalizeFirst(vessel.material) : 'N/A'}</td>
                <td>${vessel.color || 'N/A'}</td>
                <td class="price">$${vessel.price_per_unit.toFixed(2)}</td>
                <td>${vessel.case_count > 1 ? `${vessel.case_count} units` : 'Single'}</td>
                <td>${vessel.quantity_on_hand || 0} ${vessel.quantity_unit || 'units'}</td>
                <td>
                    <span class="badge ${vessel.is_in_library ? 'badge-success' : 'badge-secondary'}">
                        ${vessel.is_in_library ? '✓' : '✗'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="editVessel('${vessel.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteVessel('${vessel.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    // Filter vessels
    function filterVessels() {
        const search = document.getElementById('vesselSearch').value.toLowerCase();
        const typeFilter = document.getElementById('vesselTypeFilter').value;
        const supplierFilter = document.getElementById('vesselSupplierFilter').value;
        
        let filtered = AdminCore.getVessels();
        
        if (search) {
            filtered = filtered.filter(vessel => 
                vessel.name.toLowerCase().includes(search) ||
                (vessel.sku && vessel.sku.toLowerCase().includes(search)) ||
                (vessel.supplier_name && vessel.supplier_name.toLowerCase().includes(search))
            );
        }
        
        if (typeFilter) {
            filtered = filtered.filter(vessel => vessel.vessel_type === typeFilter);
        }
        
        if (supplierFilter) {
            filtered = filtered.filter(vessel => vessel.supplier_id === supplierFilter);
        }
        
        renderVessels(filtered);
    }

    // Open vessel modal
    function openVesselModal(vessel = null) {
        const modal = document.getElementById('vesselModal');
        const form = document.getElementById('vesselForm');
        const title = document.getElementById('vesselModalTitle');
        
        if (vessel) {
            title.textContent = 'Edit Vessel';
            form.elements['id'].value = vessel.id;
            form.elements['supplier_id'].value = vessel.supplier_id;
            form.elements['name'].value = vessel.name;
            form.elements['sku'].value = vessel.sku || '';
            form.elements['vessel_type'].value = vessel.vessel_type;
            form.elements['size'].value = vessel.size;
            form.elements['size_unit'].value = vessel.size_unit || 'oz';
            form.elements['material'].value = vessel.material || '';
            form.elements['color'].value = vessel.color || '';
            form.elements['shape'].value = vessel.shape || '';
            form.elements['neck_size'].value = vessel.neck_size || '';
            form.elements['weight_grams'].value = vessel.weight_grams || '';
            form.elements['max_fill_volume'].value = vessel.max_fill_volume || '';
            form.elements['price_per_unit'].value = vessel.price_per_unit;
            form.elements['case_count'].value = vessel.case_count || 1;
            form.elements['case_price'].value = vessel.case_price || '';
            form.elements['minimum_order_quantity'].value = vessel.minimum_order_quantity || 1;
            form.elements['quantity_on_hand'].value = vessel.quantity_on_hand || 0;
            form.elements['location'].value = vessel.location || '';
            form.elements['reorder_point'].value = vessel.reorder_point || '';
            form.elements['product_url'].value = vessel.product_url || '';
            form.elements['notes'].value = vessel.notes || '';
            form.elements['is_in_library'].checked = vessel.is_in_library;
        } else {
            title.textContent = 'Add Vessel';
            form.reset();
            form.elements['case_count'].value = 1;
            form.elements['minimum_order_quantity'].value = 1;
            form.elements['is_in_library'].checked = true;
        }
        
        modal.style.display = 'block';
    }

    // Handle vessel form submission
    async function handleVesselSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Convert checkboxes
        data.is_in_library = formData.get('is_in_library') === 'on';
        
        // Convert numbers
        data.size = parseFloat(data.size);
        data.price_per_unit = parseFloat(data.price_per_unit);
        data.case_count = parseInt(data.case_count) || 1;
        data.minimum_order_quantity = parseInt(data.minimum_order_quantity) || 1;
        data.quantity_on_hand = parseInt(data.quantity_on_hand) || 0;
        data.reorder_point = data.reorder_point ? parseInt(data.reorder_point) : null;
        data.weight_grams = data.weight_grams ? parseFloat(data.weight_grams) : null;
        data.max_fill_volume = data.max_fill_volume ? parseFloat(data.max_fill_volume) : null;
        data.case_price = data.case_price ? parseFloat(data.case_price) : null;
        
        try {
            const url = data.id ? 
                `${AdminCore.API_URL}/vessels/${data.id}` : 
                `${AdminCore.API_URL}/vessels`;
            
            const response = await fetch(url, {
                method: data.id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                AdminCore.showToast('Vessel saved successfully', 'success');
                document.getElementById('vesselModal').style.display = 'none';
                await loadVessels();
            } else {
                const error = await response.json();
                AdminCore.showToast(error.message || 'Failed to save vessel', 'error');
            }
        } catch (error) {
            console.error('Error saving vessel:', error);
            AdminCore.showToast('Failed to save vessel', 'error');
        }
    }

    // Edit vessel
    window.editVessel = async function(id) {
        const vessel = AdminCore.getVessels().find(v => v.id === id);
        if (vessel) {
            openVesselModal(vessel);
        }
    };

    // Delete vessel
    window.deleteVessel = async function(id) {
        if (!confirm('Are you sure you want to delete this vessel?')) {
            return;
        }
        
        try {
            const response = await fetch(`${AdminCore.API_URL}/vessels/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                AdminCore.showToast('Vessel deleted successfully', 'success');
                await loadVessels();
            } else {
                AdminCore.showToast('Failed to delete vessel', 'error');
            }
        } catch (error) {
            console.error('Error deleting vessel:', error);
            AdminCore.showToast('Failed to delete vessel', 'error');
        }
    };

    // Helper functions
    function formatVesselType(type) {
        const types = {
            'jar': 'Jar',
            'bottle': 'Bottle',
            'spray_bottle': 'Spray Bottle',
            'roller_bottle': 'Roller Bottle',
            'tin': 'Tin',
            'tube': 'Tube',
            'pouch': 'Pouch',
            'other': 'Other'
        };
        return types[type] || type;
    }

    function capitalizeFirst(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    }

    // Update supplier filter
    async function loadSuppliers() {
        try {
            const suppliers = AdminCore.getSuppliers();
            const select = document.getElementById('vesselSupplierFilter');
            const modalSelect = document.getElementById('vesselSupplierSelect');
            
            // Update filter dropdown
            select.innerHTML = '<option value="">All Suppliers</option>' + 
                suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            
            // Update modal dropdown
            modalSelect.innerHTML = '<option value="">Select supplier...</option>' + 
                suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        } catch (error) {
            console.error('Error loading suppliers:', error);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVesselsModule);
    } else {
        initVesselsModule();
    }

    // Expose to global scope
    window.VesselsModule = {
        loadVessels,
        filterVessels,
        openVesselModal
    };
})();