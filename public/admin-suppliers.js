// Suppliers Tab Module
(function() {
    // Module initialization
    async function initSuppliersModule() {
        setupSupplierTab();
        setupSupplierModal();
        await loadSuppliers();
    }

    // Setup the suppliers tab content
    function setupSupplierTab() {
        const suppliersTab = document.getElementById('suppliers');
        suppliersTab.innerHTML = `
            <div class="search-bar">
                <input type="text" class="search-input" id="supplierSearch" placeholder="Search suppliers...">
                <button class="btn btn-primary" id="addSupplierBtn">
                    ➕ Add Supplier
                </button>
            </div>
            <div class="table-container">
                <table id="suppliersTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>SUPPLIER NAME</th>
                            <th>PRODUCTS</th>
                            <th>WEBSITE</th>
                            <th>EMAIL</th>
                            <th>PHONE</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="7" style="text-align: center;">
                                <div class="loading"></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        // Add event listeners
        document.getElementById('addSupplierBtn').addEventListener('click', () => openSupplierModal());
        
        // Search functionality
        document.getElementById('supplierSearch').addEventListener('input', (e) => {
            filterSuppliers(e.target.value);
        });
    }

    // Setup supplier modal
    function setupSupplierModal() {
        const modalsContainer = document.getElementById('modals-container');
        const modalHTML = `
            <div id="supplierModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="supplierModalTitle">Add Supplier</h2>
                        <button class="close-btn">&times;</button>
                    </div>
                    <form id="supplierForm">
                        <input type="hidden" id="supplierId" name="id">
                        <div class="modal-body" style="padding: 20px;">
                            <div class="form-group">
                                <label>Supplier Name *</label>
                                <input type="text" class="form-control" name="name" required>
                            </div>
                            <div class="form-group">
                                <label>Website</label>
                                <input type="text" class="form-control" name="website_url" placeholder="www.example.com">
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" class="form-control" name="contact_email">
                            </div>
                            <div class="form-group">
                                <label>Phone</label>
                                <input type="tel" class="form-control" name="contact_phone">
                            </div>
                            <div class="form-group">
                                <label>Address</label>
                                <input type="text" class="form-control" name="address" placeholder="Street address">
                            </div>
                            <div class="form-group">
                                <label>City</label>
                                <input type="text" class="form-control" name="city">
                            </div>
                            <div class="form-group">
                                <label>State</label>
                                <input type="text" class="form-control" name="state" placeholder="e.g., TX">
                            </div>
                            <div class="form-group">
                                <label>Country</label>
                                <input type="text" class="form-control" name="country" placeholder="e.g., USA">
                            </div>
                            <div class="form-group">
                                <label>Postal Code</label>
                                <input type="text" class="form-control" name="postal_code">
                            </div>
                            <div class="form-group">
                                <label>Notes</label>
                                <textarea class="form-control" name="notes" rows="3" placeholder="Additional notes about this supplier"></textarea>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" name="is_active" checked> Is Active
                                </label>
                            </div>
                        </div>
                        <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px; padding: 20px; border-top: 1px solid var(--driftwood);">
                            <button type="button" class="btn btn-secondary" onclick="document.getElementById('supplierModal').classList.remove('active')">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Supplier</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        modalsContainer.insertAdjacentHTML('beforeend', modalHTML);

        // Form submission
        document.getElementById('supplierForm').addEventListener('submit', handleSupplierSubmit);
        
        // Close button event listener
        document.querySelector('#supplierModal .close-btn').addEventListener('click', () => {
            document.getElementById('supplierModal').classList.remove('active');
        });
        
        // Close on background click
        document.getElementById('supplierModal').addEventListener('click', (e) => {
            if (e.target.id === 'supplierModal') {
                document.getElementById('supplierModal').classList.remove('active');
            }
        });
    }

    // Load suppliers
    async function loadSuppliers() {
        try {
            const suppliers = await AdminCore.apiRequest('/api/admin/suppliers');
            AdminCore.setSuppliers(suppliers);
            renderSuppliers();
            updateSupplierSelects();
        } catch (error) {
            AdminCore.showToast('Failed to load suppliers', 'error');
        }
    }

    // Render suppliers table
    function renderSuppliers() {
        const suppliers = AdminCore.getSuppliers();
        const bases = AdminCore.getBases();
        const oils = AdminCore.getOils();
        const tbody = document.querySelector('#suppliersTable tbody');
        
        if (suppliers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center;">No suppliers found</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = suppliers.map(supplier => {
            const baseCount = bases.filter(b => b.supplier_id === supplier.id).length;
            const oilCount = oils.filter(o => o.supplier_id === supplier.id).length;
            const supplierId = typeof supplier.id === 'string' ? `'${supplier.id}'` : supplier.id;
            
            return `
                <tr>
                    <td>${supplier.id}</td>
                    <td>${supplier.name}</td>
                    <td>${baseCount} bases, ${oilCount} oils</td>
                    <td>${supplier.website_url || supplier.website ? `<a href="${supplier.website_url || supplier.website}" target="_blank">${supplier.website_url || supplier.website}</a>` : '-'}</td>
                    <td>${supplier.contact_email || supplier.email || '-'}</td>
                    <td>${supplier.contact_phone || supplier.phone || '-'}</td>
                    <td class="actions">
                        <button class="btn btn-info" onclick="editSupplier(${supplierId})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteSupplier(${supplierId})">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Filter suppliers
    function filterSuppliers(searchTerm) {
        const suppliers = AdminCore.getSuppliers();
        const filtered = suppliers.filter(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.contact_email && s.contact_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.website_url && s.website_url.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.website && s.website.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        const tbody = document.querySelector('#suppliersTable tbody');
        const bases = AdminCore.getBases();
        const oils = AdminCore.getOils();
        
        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center;">No suppliers match your search</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(supplier => {
            const baseCount = bases.filter(b => b.supplier_id === supplier.id).length;
            const oilCount = oils.filter(o => o.supplier_id === supplier.id).length;
            const supplierId = typeof supplier.id === 'string' ? `'${supplier.id}'` : supplier.id;
            
            return `
                <tr>
                    <td>${supplier.id}</td>
                    <td>${supplier.name}</td>
                    <td>${baseCount} bases, ${oilCount} oils</td>
                    <td>${supplier.website_url || supplier.website ? `<a href="${supplier.website_url || supplier.website}" target="_blank">${supplier.website_url || supplier.website}</a>` : '-'}</td>
                    <td>${supplier.contact_email || supplier.email || '-'}</td>
                    <td>${supplier.contact_phone || supplier.phone || '-'}</td>
                    <td class="actions">
                        <button class="btn btn-info" onclick="editSupplier(${supplierId})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteSupplier(${supplierId})">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Open supplier modal
    function openSupplierModal(supplier = null) {
        const modal = document.getElementById('supplierModal');
        const form = document.getElementById('supplierForm');
        
        document.getElementById('supplierModalTitle').textContent = supplier ? 'Edit Supplier' : 'Add Supplier';
        document.getElementById('supplierId').value = supplier?.id || '';
        
        if (supplier) {
            form.name.value = supplier.name;
            form.website_url.value = supplier.website_url || supplier.website || '';
            form.contact_email.value = supplier.contact_email || supplier.email || '';
            form.contact_phone.value = supplier.contact_phone || supplier.phone || '';
            form.address.value = supplier.address || '';
            form.city.value = supplier.city || '';
            form.state.value = supplier.state || '';
            form.country.value = supplier.country || '';
            form.postal_code.value = supplier.postal_code || '';
            form.notes.value = supplier.notes || '';
            form.is_active.checked = supplier.is_active !== false;
        } else {
            form.reset();
            form.is_active.checked = true;
        }
        
        modal.classList.add('active');
    }

    // Handle form submission
    async function handleSupplierSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        const id = data.id;
        delete data.id;
        
        // Convert checkbox to boolean
        data.is_active = formData.get('is_active') === 'on';
        
        // Format website URL - add https:// if not present
        if (data.website_url && data.website_url.trim() !== '') {
            const website = data.website_url.trim();
            if (!website.startsWith('http://') && !website.startsWith('https://')) {
                data.website_url = 'https://' + website;
            }
        }
        
        try {
            const endpoint = id ? `/api/admin/suppliers/${id}` : '/api/admin/suppliers';
            const method = id ? 'PUT' : 'POST';
            
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AdminCore.authToken}`
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                console.error('Server error:', result);
                throw new Error(result.details || result.error || 'Failed to save supplier');
            }
            
            await loadSuppliers();
            await loadBases(); // Reload bases to update counts
            await loadOils();  // Reload oils to update counts
            document.getElementById('supplierModal').classList.remove('active');
            AdminCore.showToast(`Supplier ${id ? 'updated' : 'created'} successfully`, 'success');
            if (AdminCore.updateStats) AdminCore.updateStats();
        } catch (error) {
            console.error('Error saving supplier:', error);
            AdminCore.showToast(`Failed to save supplier: ${error.message}`, 'error');
        }
    }

    // Update supplier selects in other modules
    function updateSupplierSelects() {
        const suppliers = AdminCore.getSuppliers();
        const options = '<option value="">Select supplier...</option>' + 
            suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        
        // Update base supplier select if it exists
        const baseSelect = document.getElementById('baseSupplierSelect');
        if (baseSelect) baseSelect.innerHTML = options;
        
        // Update oil supplier select if it exists
        const oilSelect = document.getElementById('oilSupplierSelect');
        if (oilSelect) oilSelect.innerHTML = options;
    }

    // Load bases (needed for product counts)
    async function loadBases() {
        try {
            const bases = await AdminCore.apiRequest('/api/admin/bases');
            AdminCore.setBases(bases);
        } catch (error) {
            console.error('Failed to load bases:', error);
        }
    }

    // Load oils (needed for product counts)
    async function loadOils() {
        try {
            const oils = await AdminCore.apiRequest('/api/admin/oils');
            AdminCore.setOils(oils);
        } catch (error) {
            console.error('Failed to load oils:', error);
        }
    }

    // Global functions for onclick handlers
    window.editSupplier = function(id) {
        const suppliers = AdminCore.getSuppliers();
        const supplier = suppliers.find(s => s.id == id);
        if (supplier) openSupplierModal(supplier);
    }

    window.deleteSupplier = async function(id) {
        if (!confirm('Delete this supplier? This will also delete all associated products.')) return;
        
        try {
            await AdminCore.apiRequest(`/api/admin/suppliers/${id}`, {
                method: 'DELETE'
            });
            
            await loadSuppliers();
            await loadBases();
            await loadOils();
            AdminCore.showToast('Supplier deleted successfully', 'success');
            if (AdminCore.updateStats) AdminCore.updateStats();
            renderSuppliers();
        } catch (error) {
            AdminCore.showToast('Failed to delete supplier', 'error');
        }
    }

    // Initialize module when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSuppliersModule);
    } else {
        initSuppliersModule();
    }
})();
