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
                        <div class="form-group">
                            <label>Supplier Name *</label>
                            <input type="text" class="form-control" name="name" required>
                        </div>
                        <div class="form-group">
                            <label>Website</label>
                            <input type="url" class="form-control" name="website" placeholder="https://example.com">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" class="form-control" name="email">
                        </div>
                        <div class="form-group">
                            <label>Phone</label>
                            <input type="tel" class="form-control" name="phone">
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Save Supplier</button>
                    </form>
                </div>
            </div>
        `;
        modalsContainer.insertAdjacentHTML('beforeend', modalHTML);

        // Form submission
        document.getElementById('supplierForm').addEventListener('submit', handleSupplierSubmit);
    }

    // Load suppliers
    async function loadSuppliers() {
        try {
            const response = await fetch(`${AdminCore.API_URL}/suppliers`);
            const suppliers = await response.json();
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
                    <td>${supplier.website ? `<a href="${supplier.website}" target="_blank">${supplier.website}</a>` : '-'}</td>
                    <td>${supplier.email || '-'}</td>
                    <td>${supplier.phone || '-'}</td>
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
            (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
                    <td>${supplier.website ? `<a href="${supplier.website}" target="_blank">${supplier.website}</a>` : '-'}</td>
                    <td>${supplier.email || '-'}</td>
                    <td>${supplier.phone || '-'}</td>
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
            form.website.value = supplier.website || '';
            form.email.value = supplier.email || '';
            form.phone.value = supplier.phone || '';
        } else {
            form.reset();
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
        
        try {
            const response = await fetch(`${AdminCore.API_URL}/suppliers${id ? '/' + id : ''}`, {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                await loadSuppliers();
                await loadBases(); // Reload bases to update counts
                await loadOils();  // Reload oils to update counts
                document.getElementById('supplierModal').classList.remove('active');
                AdminCore.showToast(`Supplier ${id ? 'updated' : 'created'} successfully`, 'success');
                AdminCore.updateStats();
            } else {
                const error = await response.json();
                AdminCore.showToast(error.error || 'Failed to save supplier', 'error');
            }
        } catch (error) {
            AdminCore.showToast('Failed to save supplier', 'error');
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
            const response = await fetch(`${AdminCore.API_URL}/bases`);
            const bases = await response.json();
            AdminCore.setBases(bases);
        } catch (error) {
            console.error('Failed to load bases:', error);
        }
    }

    // Load oils (needed for product counts)
    async function loadOils() {
        try {
            const response = await fetch(`${AdminCore.API_URL}/oils`);
            const oils = await response.json();
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
            const response = await fetch(`${AdminCore.API_URL}/suppliers/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await loadSuppliers();
                await loadBases();
                await loadOils();
                AdminCore.showToast('Supplier deleted successfully', 'success');
                AdminCore.updateStats();
                renderSuppliers();
            } else {
                const error = await response.json();
                AdminCore.showToast(error.error || 'Failed to delete supplier', 'error');
            }
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
