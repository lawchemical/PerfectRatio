// Bases Tab Module (Including Candle Wax Support)
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
                <select class="form-control" id="baseTypeFilter" style="width: 200px;">
                    <option value="">All Types</option>
                    <option value="liquid">Liquid Bases</option>
                    <option value="powder">Powder/Dry Bases</option>
                    <option value="wax">Candle Wax</option>
                </select>
                <button class="btn btn-primary" id="addBaseBtn">
                    ➕ Add Base Product
                </button>
            </div>
            <div class="table-container">
                <table id="basesTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>NAME</th>
                            <th>SUPPLIER</th>
                            <th>TYPE</th>
                            <th>MAX LOAD %</th>
                            <th>UNIT MODE</th>
                            <th>IFRA CAT</th>
                            <th>DUAL</th>
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
        document.getElementById('addBaseBtn').addEventListener('click', () => openBaseModal());
        
        // Search functionality
        document.getElementById('baseSearch').addEventListener('input', (e) => {
            filterBases();
        });
        
        // Type filter
        document.getElementById('baseTypeFilter').addEventListener('change', (e) => {
            filterBases();
        });
    }

    // Setup base modal
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
                        <div class="form-group">
                            <label>Supplier *</label>
                            <select class="form-control" name="supplier_id" id="baseSupplierSelect" required>
                                <option value="">Select supplier...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Base Name *</label>
                            <input type="text" class="form-control" name="name" required>
                        </div>
                        <div class="form-group">
                            <label>Base Type *</label>
                            <select class="form-control" name="base_type" required>
                                <option value="liquid">Liquid Base</option>
                                <option value="powder">Powder/Dry Base</option>
                                <option value="wax">Candle Wax</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Max Load % *</label>
                                <input type="number" class="form-control" name="max_load_pct" step="0.1" min="0" max="100" required>
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
                            <label>Specific Gravity (for volume mode)</label>
                            <input type="number" class="form-control" name="specific_gravity" step="0.001" min="0">
                        </div>
                        <div class="form-group">
                            <label>Primary IFRA Category</label>
                            <select class="form-control" name="ifra_category" id="primaryIfraSelect">
                                <option value="">Select category...</option>
                                <option value="9">Category 9 - Hand/Body Wash Products</option>
                                <option value="10A">Category 10A - Room Spray (Hydroalcoholic)</option>
                                <option value="10B">Category 10B - Fabric/Linen Spray</option>
                                <option value="4">Category 4 - Fine Fragrance</option>
                                <option value="5A">Category 5A - Body Lotion</option>
                                <option value="11A">Category 11A - Candles</option>
                                <option value="12">Category 12 - Air Fresheners</option>
                            </select>
                        </div>
                        <div class="checkbox-group">
                            <input type="checkbox" id="dualPurpose" name="is_dual_purpose">
                            <label for="dualPurpose">Dual Purpose Product</label>
                        </div>
                        <div class="form-group" id="secondaryCategoryGroup" style="display: none;">
                            <label>Secondary IFRA Category</label>
                            <select class="form-control" name="ifra_category_2">
                                <option value="">Select secondary category...</option>
                                <option value="9">Category 9 - Hand/Body Wash Products</option>
                                <option value="10A">Category 10A - Room Spray (Hydroalcoholic)</option>
                                <option value="10B">Category 10B - Fabric/Linen Spray</option>
                                <option value="4">Category 4 - Fine Fragrance</option>
                                <option value="5A">Category 5A - Body Lotion</option>
                                <option value="11A">Category 11A - Candles</option>
                                <option value="12">Category 12 - Air Fresheners</option>
                            </select>
                        </div>
                        <div class="form-group" id="waxSpecificFields" style="display: none;">
                            <label>Wax Type</label>
                            <select class="form-control" name="wax_type">
                                <option value="">Select wax type...</option>
                                <option value="soy">Soy Wax</option>
                                <option value="paraffin">Paraffin Wax</option>
                                <option value="coconut">Coconut Wax</option>
                                <option value="beeswax">Beeswax</option>
                                <option value="blend">Wax Blend</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="checkbox-group">
                            <input type="checkbox" id="baseInLibrary" name="is_in_library">
                            <label for="baseInLibrary">Add to Library</label>
                        </div>
                        <div class="form-group">
                            <label>Notes</label>
                            <textarea class="form-control" name="notes" rows="3"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Save Base Product</button>
                    </form>
                </div>
            </div>
        `;
        modalsContainer.insertAdjacentHTML('beforeend', modalHTML);

        // Form submission
        document.getElementById('baseForm').addEventListener('submit', handleBaseSubmit);
        
        // Setup dynamic form behaviors
        setupFormBehaviors();
    }

    // Setup form behaviors
    function setupFormBehaviors() {
        // Dual purpose checkbox
        document.getElementById('dualPurpose').addEventListener('change', function() {
            const secondaryGroup = document.getElementById('secondaryCategoryGroup');
            if (this.checked) {
                secondaryGroup.style.display = 'block';
            } else {
                secondaryGroup.style.display = 'none';
                document.querySelector('[name="ifra_category_2"]').value = '';
            }
        });
        
        // Base type selector - show wax fields when wax is selected
        const baseTypeSelect = document.querySelector('[name="base_type"]');
        if (baseTypeSelect) {
            baseTypeSelect.addEventListener('change', function() {
                const waxFields = document.getElementById('waxSpecificFields');
                const primaryIfra = document.getElementById('primaryIfraSelect');
                
                if (this.value === 'wax') {
                    waxFields.style.display = 'block';
                    // Auto-select candles IFRA category for wax
                    primaryIfra.value = '11A';
                } else {
                    waxFields.style.display = 'none';
                    document.querySelector('[name="wax_type"]').value = '';
                }
            });
        }
    }

    // Load bases
    async function loadBases() {
        try {
            const response = await fetch(`${AdminCore.API_URL}/bases`);
            const bases = await response.json();
            AdminCore.setBases(bases);
            renderBases();
        } catch (error) {
            AdminCore.showToast('Failed to load bases', 'error');
        }
    }

    // Load suppliers for dropdown
    async function loadSuppliers() {
        try {
            const response = await fetch(`${AdminCore.API_URL}/suppliers`);
            const suppliers = await response.json();
            AdminCore.setSuppliers(suppliers);
            updateSupplierSelect();
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

    // Render bases table
    function renderBases(basesToRender = null) {
        const bases = basesToRender || AdminCore.getBases();
        const tbody = document.querySelector('#basesTable tbody');
        
        if (bases.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center;">No base products found</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = bases.map(base => {
            const baseId = typeof base.id === 'string' ? `'${base.id}'` : base.id;
            const baseType = base.base_type || 'liquid'; // Default to liquid if not set
            const typeLabel = baseType.charAt(0).toUpperCase() + baseType.slice(1);
            
            return `
                <tr>
                    <td>${base.id}</td>
                    <td>${base.name}</td>
                    <td>${base.supplier_name || '-'}</td>
                    <td><span class="badge badge-${baseType}">${typeLabel}</span></td>
                    <td>${base.max_load_pct}%</td>
                    <td>${base.unit_mode}</td>
                    <td>${base.ifra_category || '-'}</td>
                    <td>${base.is_dual_purpose ? '✓' : '-'}</td>
                    <td>
                        <span class="library-toggle ${base.is_in_library ? 'in-library' : ''}" 
                              onclick="toggleBaseLibrary(${baseId}, ${!base.is_in_library})">
                            ${base.is_in_library ? '✓ In Library' : '✗ Not in Library'}
                        </span>
                    </td>
                    <td class="actions">
                        <button class="btn btn-info" onclick="editBase(${baseId})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteBase(${baseId})">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Filter bases
    function filterBases() {
        const searchTerm = document.getElementById('baseSearch').value.toLowerCase();
        const typeFilter = document.getElementById('baseTypeFilter').value;
        const bases = AdminCore.getBases();
        
        const filtered = bases.filter(base => {
            const matchesSearch = !searchTerm || 
                base.name.toLowerCase().includes(searchTerm) ||
                (base.supplier_name && base.supplier_name.toLowerCase().includes(searchTerm)) ||
                (base.notes && base.notes.toLowerCase().includes(searchTerm));
            
            const matchesType = !typeFilter || base.base_type === typeFilter;
            
            return matchesSearch && matchesType;
        });
        
        renderBases(filtered);
    }

    // Open base modal
    function openBaseModal(base = null) {
        const modal = document.getElementById('baseModal');
        const form = document.getElementById('baseForm');
        
        document.getElementById('baseModalTitle').textContent = base ? 'Edit Base' : 'Add Base';
        document.getElementById('baseId').value = base?.id || '';
        
        if (base) {
            form.supplier_id.value = base.supplier_id;
            form.name.value = base.name;
            form.base_type.value = base.base_type || 'liquid';
            form.max_load_pct.value = base.max_load_pct;
            form.unit_mode.value = base.unit_mode;
            form.specific_gravity.value = base.specific_gravity || '';
            form.ifra_category.value = base.ifra_category || '';
            form.is_dual_purpose.checked = base.is_dual_purpose;
            form.ifra_category_2.value = base.ifra_category_2 || '';
            form.is_in_library.checked = base.is_in_library;
            form.notes.value = base.notes || '';
            
            // Handle wax-specific fields
            if (base.base_type === 'wax') {
                document.getElementById('waxSpecificFields').style.display = 'block';
                form.wax_type.value = base.wax_type || '';
            } else {
                document.getElementById('waxSpecificFields').style.display = 'none';
            }
            
            // Show/hide secondary category
            document.getElementById('secondaryCategoryGroup').style.display = 
                base.is_dual_purpose ? 'block' : 'none';
        } else {
            form.reset();
            document.getElementById('secondaryCategoryGroup').style.display = 'none';
            document.getElementById('waxSpecificFields').style.display = 'none';
        }
        
        modal.classList.add('active');
    }

    // Handle form submission
    async function handleBaseSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        const id = data.id;
        delete data.id;
        
        // Convert checkbox values
        data.is_dual_purpose = data.is_dual_purpose === 'on';
        data.is_in_library = data.is_in_library === 'on';
        
        // Convert numbers
        data.supplier_id = parseInt(data.supplier_id);
        data.max_load_pct = parseFloat(data.max_load_pct);
        if (data.specific_gravity) data.specific_gravity = parseFloat(data.specific_gravity);
        
        // Clear secondary category if not dual purpose
        if (!data.is_dual_purpose) {
            data.ifra_category_2 = null;
        }
        
        // Clear wax type if not wax
        if (data.base_type !== 'wax') {
            data.wax_type = null;
        }
        
        try {
            const response = await fetch(`${AdminCore.API_URL}/bases${id ? '/' + id : ''}`, {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                await loadBases();
                document.getElementById('baseModal').classList.remove('active');
                AdminCore.showToast(`Base ${id ? 'updated' : 'created'} successfully`, 'success');
                AdminCore.updateStats();
            } else {
                const error = await response.json();
                AdminCore.showToast(error.error || 'Failed to save base', 'error');
            }
        } catch (error) {
            AdminCore.showToast('Failed to save base', 'error');
        }
    }

    // Global functions for onclick handlers
    window.editBase = function(id) {
        const bases = AdminCore.getBases();
        const base = bases.find(b => b.id == id);
        if (base) openBaseModal(base);
    }

    window.deleteBase = async function(id) {
        if (!confirm('Delete this base product?')) return;
        
        try {
            const response = await fetch(`${AdminCore.API_URL}/bases/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await loadBases();
                AdminCore.showToast('Base deleted successfully', 'success');
                AdminCore.updateStats();
            } else {
                const error = await response.json();
                AdminCore.showToast(error.error || 'Failed to delete base', 'error');
            }
        } catch (error) {
            AdminCore.showToast('Failed to delete base', 'error');
        }
    }

    window.toggleBaseLibrary = async function(id, inLibrary) {
        const bases = AdminCore.getBases();
        const base = bases.find(b => b.id == id);
        
        if (!base) return;
        
        base.is_in_library = inLibrary;
        
        try {
            const response = await fetch(`${AdminCore.API_URL}/bases/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(base)
            });
            
            if (response.ok) {
                await loadBases();
                AdminCore.showToast('Base library status updated', 'success');
            }
        } catch (error) {
            AdminCore.showToast('Failed to update library status', 'error');
        }
    }

    // Add some base type styling
    const style = document.createElement('style');
    style.textContent = `
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge-liquid {
            background: #e3f2fd;
            color: #1976d2;
        }
        .badge-powder {
            background: #fff3e0;
            color: #f57c00;
        }
        .badge-wax {
            background: #fce4ec;
            color: #c2185b;
        }
    `;
    document.head.appendChild(style);

    // Initialize module when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBasesModule);
    } else {
        initBasesModule();
    }
})();
