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
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="vesselModalTitle" class="modal-title">Add Vessel</h2>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="padding: 20px; border-bottom: 1px solid #D9D3CC;">
                            <button onclick="showVesselTab('basic')" id="vessel-tab-basic" style="padding: 8px 12px; margin-right: 8px; background: #F1AD88; color: #101114; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Basic Info</button>
                            <button onclick="showVesselTab('physical')" id="vessel-tab-physical" style="padding: 8px 12px; margin-right: 8px; background: #EDEAE6; color: #2E3033; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Physical</button>
                            <button onclick="showVesselTab('pricing')" id="vessel-tab-pricing" style="padding: 8px 12px; margin-right: 8px; background: #EDEAE6; color: #2E3033; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Pricing</button>
                            <button onclick="showVesselTab('inventory')" id="vessel-tab-inventory" style="padding: 8px 12px; margin-right: 8px; background: #EDEAE6; color: #2E3033; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Inventory</button>
                        </div>
                        
                        <form id="vesselForm" style="padding: 20px;">
                            <input type="hidden" name="id" id="vesselId">
                            
                            <div id="vessel-tab-content-basic" style="display: block;">
                                <h3 style="color: #101114; margin-bottom: 20px;">Basic Information</h3>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Supplier *</label>
                                    <select name="supplier_id" id="vesselSupplierSelect" required style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
                                        <option value="">Select supplier...</option>
                                    </select>
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Vessel Name *</label>
                                    <input type="text" name="name" required style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">SKU</label>
                                    <input type="text" name="sku" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Vessel Type *</label>
                                    <select name="vessel_type" required style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
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
                            
                            <div id="vessel-tab-content-physical" style="display: none;">
                                <h3 style="color: #101114; margin-bottom: 20px;">Physical Properties</h3>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Size *</label>
                                    <div style="display: flex; gap: 10px;">
                                        <input type="number" name="size" step="0.1" min="0" required style="flex: 1; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        <select name="size_unit" style="width: 100px; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
                                            <option value="oz">oz</option>
                                            <option value="ml">ml</option>
                                            <option value="g">g</option>
                                            <option value="L">L</option>
                                        </select>
                                    </div>
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Material</label>
                                    <select name="material" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
                                        <option value="">Select material...</option>
                                        <option value="glass">Glass</option>
                                        <option value="plastic">Plastic</option>
                                        <option value="aluminum">Aluminum</option>
                                        <option value="tin">Tin</option>
                                        <option value="paper">Paper</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Color</label>
                                    <input type="text" name="color" placeholder="e.g., Clear, Amber, White" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Shape</label>
                                    <input type="text" name="shape" placeholder="e.g., Round, Square, Oval" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Neck Size (for bottles)</label>
                                    <input type="text" name="neck_size" placeholder="e.g., 24-410, 20-410" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Weight (grams)</label>
                                    <input type="number" name="weight_grams" step="0.1" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Max Fill Volume</label>
                                    <input type="number" name="max_fill_volume" step="0.1" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                            </div>
                            
                            <div id="vessel-tab-content-pricing" style="display: none;">
                                <h3 style="color: #101114; margin-bottom: 20px;">Pricing & Ordering</h3>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Price per Unit * ($)</label>
                                    <input type="number" name="price_per_unit" step="0.01" min="0" required style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Case Count *</label>
                                    <input type="number" name="case_count" min="1" value="1" required style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Case Price (if different)</label>
                                    <input type="number" name="case_price" step="0.01" min="0" placeholder="Leave blank to calculate" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Minimum Order Qty</label>
                                    <input type="number" name="minimum_order_quantity" min="1" value="1" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                            </div>
                            
                            <div id="vessel-tab-content-inventory" style="display: none;">
                                <h3 style="color: #101114; margin-bottom: 20px;">Inventory & Additional Info</h3>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Quantity on Hand</label>
                                    <input type="number" name="quantity_on_hand" min="0" value="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Location</label>
                                    <input type="text" name="location" placeholder="Storage location" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Reorder Point</label>
                                    <input type="number" name="reorder_point" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Product URL</label>
                                    <input type="url" name="product_url" placeholder="https://..." style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Notes</label>
                                    <textarea name="notes" rows="3" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; resize: vertical;"></textarea>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 16px;">
                                    <div>
                                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                            <input type="checkbox" name="is_in_library" checked style="transform: scale(1.2);">
                                            <span style="font-weight: 500; color: #2E3033; font-size: 14px;">Add to Library</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </form>
                        
                        <div style="padding: 20px; border-top: 1px solid #D9D3CC; text-align: right;">
                            <button onclick="closeVesselModal()" class="btn btn-secondary">Cancel</button>
                            <button onclick="saveVessel()" class="btn btn-primary">Save Vessel</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        modalsContainer.insertAdjacentHTML('beforeend', modalHTML);

        // Form submission
        document.getElementById('vesselForm').addEventListener('submit', handleVesselSubmit);
        
        // Close modal
        document.querySelector('#vesselModal .close-btn').addEventListener('click', () => {
            document.getElementById('vesselModal').classList.remove('show');
        });
        
        // Tab switching function for vessels
        window.showVesselTab = function(tabName) {
            // Hide all tabs
            const allTabs = ['basic', 'physical', 'pricing', 'inventory'];
            allTabs.forEach(tab => {
                const content = document.getElementById('vessel-tab-content-' + tab);
                const button = document.getElementById('vessel-tab-' + tab);
                if (content) {
                    content.style.display = 'none';
                }
                if (button) {
                    button.style.background = '#EDEAE6';
                    button.style.color = '#2E3033';
                }
            });
            
            // Show selected tab
            const selectedContent = document.getElementById('vessel-tab-content-' + tabName);
            const selectedButton = document.getElementById('vessel-tab-' + tabName);
            if (selectedContent) {
                selectedContent.style.display = 'block';
            }
            if (selectedButton) {
                selectedButton.style.background = '#F1AD88';
                selectedButton.style.color = '#101114';
            }
        };
    }

    // Load vessels
    async function loadVessels() {
        try {
            const data = await AdminCore.apiRequest("/api/admin/vessels");
            const vessels = data;
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
                <td class="price">$${vessel.price_per_unit ? parseFloat(vessel.price_per_unit).toFixed(2) : '0.00'}</td>
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
        
        // Ensure suppliers are populated in the modal dropdown
        const suppliers = AdminCore.getSuppliers();
        const modalSelect = document.getElementById('vesselSupplierSelect');
        if (modalSelect) {
            if (suppliers && suppliers.length > 0) {
                modalSelect.innerHTML = '<option value="">Select supplier...</option>' + 
                    suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            } else {
                // Fallback: try to load suppliers if they're not available
                modalSelect.innerHTML = '<option value="">Loading suppliers...</option>';
                loadSuppliers().then(() => {
                    const updatedSuppliers = AdminCore.getSuppliers();
                    if (updatedSuppliers && updatedSuppliers.length > 0) {
                        modalSelect.innerHTML = '<option value="">Select supplier...</option>' + 
                            updatedSuppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
                    }
                });
            }
        }
        
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
        
        // Reset to first tab
        showVesselTab('basic');
        
        modal.classList.add('show');
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
                `/api/admin/vessels/${data.id}` : 
                `/api/admin/vessels`;
            
            await AdminCore.apiRequest(url, {
                method: data.id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            AdminCore.showToast('Vessel saved successfully', 'success');
            document.getElementById('vesselModal').classList.remove('show');
            await loadVessels();
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
            await AdminCore.apiRequest(`/api/admin/vessels/${id}`, {
                method: 'DELETE'
            });
            
            AdminCore.showToast('Vessel deleted successfully', 'success');
            await loadVessels();
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
            // Load suppliers from API first
            const data = await AdminCore.apiRequest('/api/admin/suppliers');
            const suppliers = data;
            AdminCore.setSuppliers(suppliers);
            
            const select = document.getElementById('vesselSupplierFilter');
            const modalSelect = document.getElementById('vesselSupplierSelect');
            
            // Update filter dropdown
            if (select) {
                select.innerHTML = '<option value="">All Suppliers</option>' + 
                    suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            }
            
            // Update modal dropdown
            if (modalSelect) {
                modalSelect.innerHTML = '<option value="">Select supplier...</option>' + 
                    suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            }
        } catch (error) {
            console.error('Error loading suppliers:', error);
            // Graceful fallback - still show default options
            const select = document.getElementById('vesselSupplierFilter');
            const modalSelect = document.getElementById('vesselSupplierSelect');
            
            if (select) {
                select.innerHTML = '<option value="">All Suppliers (Failed to load)</option>';
            }
            
            if (modalSelect) {
                modalSelect.innerHTML = '<option value="">Select supplier... (Failed to load)</option>';
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVesselsModule);
    } else {
        initVesselsModule();
    }

    // Close vessel modal
    window.closeVesselModal = function() {
        const modal = document.getElementById('vesselModal');
        if (modal) {
            modal.classList.remove('show');
        }
    };
    
    // Save vessel function
    window.saveVessel = function() {
        const form = document.getElementById('vesselForm');
        if (form) {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
    };

    // Expose to global scope
    window.VesselsModule = {
        loadVessels,
        filterVessels,
        openVesselModal
    };
})();