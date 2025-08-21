// Delete Management Module for Admin Panel
(function() {
    // Track selected items for bulk delete
    let selectedItems = {
        suppliers: new Set(),
        bases: new Set(),
        oils: new Set(),
        vessels: new Set()
    };

    // Initialize delete module
    function initDeleteModule() {
        addDeleteButtons();
        addBulkDeleteControls();
        setupDeleteHandlers();
    }

    // Add delete buttons to existing tables
    function addDeleteButtons() {
        // Wait for tables to be loaded
        setTimeout(() => {
            enhanceTable('suppliers');
            // Skip bases - it has its own delete functionality
            // enhanceTable('bases');
            // Skip oils - it has its own delete functionality
            // enhanceTable('oils');
            // Skip vessels - it has its own delete functionality
            // enhanceTable('vessels');
        }, 1000);
    }

    // Enhance table with checkboxes and delete buttons
    function enhanceTable(type) {
        const table = document.querySelector(`#${type} table`);
        if (!table) return;

        // Add checkbox column header
        const headerRow = table.querySelector('thead tr');
        if (headerRow && !headerRow.querySelector('.delete-checkbox-header')) {
            const checkHeader = document.createElement('th');
            checkHeader.className = 'delete-checkbox-header';
            checkHeader.innerHTML = `
                <input type="checkbox" id="selectAll${type}" 
                       onchange="window.DeleteModule.toggleSelectAll('${type}', this.checked)">
            `;
            headerRow.insertBefore(checkHeader, headerRow.firstChild);

            // Add action column header
            const actionHeader = document.createElement('th');
            actionHeader.textContent = 'Actions';
            actionHeader.style.width = '100px';
            headerRow.appendChild(actionHeader);
        }

        // Add checkboxes and delete buttons to rows
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            if (!row.querySelector('.delete-checkbox')) {
                // Get item ID from row (assuming it's in a data attribute or first cell)
                const itemId = row.dataset.id || row.querySelector('td')?.textContent;
                
                // Add checkbox cell
                const checkCell = document.createElement('td');
                checkCell.className = 'delete-checkbox';
                checkCell.innerHTML = `
                    <input type="checkbox" 
                           data-id="${itemId}"
                           onchange="window.DeleteModule.toggleItemSelection('${type}', '${itemId}', this.checked)">
                `;
                row.insertBefore(checkCell, row.firstChild);

                // Add action cell
                const actionCell = document.createElement('td');
                actionCell.innerHTML = `
                    <button class="btn btn-danger btn-sm" 
                            onclick="window.DeleteModule.deleteItem('${type}', '${itemId}')">
                        🗑️ Delete
                    </button>
                `;
                row.appendChild(actionCell);
            }
        });
    }

    // Add bulk delete controls to each tab
    function addBulkDeleteControls() {
        // Skip oils, bases, vessels - they have their own delete functionality
        const tabs = ['suppliers'];
        
        tabs.forEach(type => {
            const tabContent = document.getElementById(type);
            if (!tabContent) return;

            // Check if controls already exist
            if (tabContent.querySelector('.bulk-delete-controls')) return;

            // Create bulk delete control bar
            const controlBar = document.createElement('div');
            controlBar.className = 'bulk-delete-controls';
            controlBar.style.cssText = `
                background: #f8f9fa;
                padding: 12px;
                border-radius: 8px;
                margin-bottom: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            
            controlBar.innerHTML = `
                <div style="display: flex; gap: 12px; align-items: center;">
                    <span id="${type}SelectedCount" style="font-weight: 500;">
                        0 items selected
                    </span>
                    <button class="btn btn-secondary btn-sm" 
                            onclick="window.DeleteModule.clearSelection('${type}')">
                        Clear Selection
                    </button>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-warning" 
                            onclick="window.DeleteModule.deleteSelected('${type}')"
                            id="${type}BulkDeleteBtn"
                            disabled>
                        🗑️ Delete Selected
                    </button>
                    <button class="btn btn-danger" 
                            onclick="window.DeleteModule.deleteAll('${type}')">
                        ⚠️ Delete All
                    </button>
                </div>
            `;

            // Insert after the heading
            const heading = tabContent.querySelector('h2');
            if (heading) {
                heading.insertAdjacentElement('afterend', controlBar);
            } else {
                tabContent.insertBefore(controlBar, tabContent.firstChild);
            }
        });
    }

    // Setup delete handlers
    function setupDeleteHandlers() {
        // Refresh tables after delete operations
        window.addEventListener('itemsDeleted', (event) => {
            const { type } = event.detail;
            refreshTable(type);
            updateSelectedCount(type);
        });
    }

    // Toggle select all items
    window.DeleteModule = window.DeleteModule || {};
    
    window.DeleteModule.toggleSelectAll = function(type, checked) {
        const checkboxes = document.querySelectorAll(`#${type} tbody input[type="checkbox"]`);
        checkboxes.forEach(cb => {
            cb.checked = checked;
            const id = cb.dataset.id;
            if (id) {
                if (checked) {
                    selectedItems[type].add(id);
                } else {
                    selectedItems[type].delete(id);
                }
            }
        });
        updateSelectedCount(type);
    };

    // Toggle individual item selection
    window.DeleteModule.toggleItemSelection = function(type, id, checked) {
        if (checked) {
            selectedItems[type].add(id);
        } else {
            selectedItems[type].delete(id);
        }
        updateSelectedCount(type);
    };

    // Clear selection
    window.DeleteModule.clearSelection = function(type) {
        selectedItems[type].clear();
        const checkboxes = document.querySelectorAll(`#${type} input[type="checkbox"]`);
        checkboxes.forEach(cb => cb.checked = false);
        updateSelectedCount(type);
    };

    // Update selected count display
    function updateSelectedCount(type) {
        const count = selectedItems[type].size;
        const countElement = document.getElementById(`${type}SelectedCount`);
        if (countElement) {
            countElement.textContent = `${count} items selected`;
        }
        
        const bulkDeleteBtn = document.getElementById(`${type}BulkDeleteBtn`);
        if (bulkDeleteBtn) {
            bulkDeleteBtn.disabled = count === 0;
        }
    }

    // Delete single item
    window.DeleteModule.deleteItem = async function(type, id) {
        const itemName = getItemName(type);
        
        if (!confirm(`Are you sure you want to delete this ${itemName}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/${type}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: [id] })
            });

            const result = await response.json();
            
            if (result.success) {
                AdminCore.showToast(`${itemName} deleted successfully`, 'success');
                window.dispatchEvent(new CustomEvent('itemsDeleted', { 
                    detail: { type, ids: [id] } 
                }));
                // Reload the table
                loadTabData(type);
            } else {
                AdminCore.showToast(result.error || 'Delete failed', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            AdminCore.showToast('Delete failed: ' + error.message, 'error');
        }
    };

    // Delete selected items
    window.DeleteModule.deleteSelected = async function(type) {
        const ids = Array.from(selectedItems[type]);
        if (ids.length === 0) return;

        const itemName = getItemName(type);
        const plural = ids.length > 1 ? 's' : '';
        
        if (!confirm(`Are you sure you want to delete ${ids.length} ${itemName}${plural}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/${type}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids })
            });

            const result = await response.json();
            
            if (result.success) {
                AdminCore.showToast(result.message || `Deleted ${ids.length} ${itemName}${plural}`, 'success');
                selectedItems[type].clear();
                window.dispatchEvent(new CustomEvent('itemsDeleted', { 
                    detail: { type, ids } 
                }));
                // Reload the table
                loadTabData(type);
            } else {
                AdminCore.showToast(result.error || 'Delete failed', 'error');
                if (result.details) {
                    console.error('Delete details:', result.details);
                }
            }
        } catch (error) {
            console.error('Delete error:', error);
            AdminCore.showToast('Delete failed: ' + error.message, 'error');
        }
    };

    // Delete all items (with extra confirmation)
    window.DeleteModule.deleteAll = async function(type) {
        const itemName = getItemName(type);
        
        // Double confirmation for delete all
        if (!confirm(`⚠️ WARNING: Are you sure you want to delete ALL ${itemName}s?\n\nThis action cannot be undone!`)) {
            return;
        }
        
        if (!confirm(`⚠️ FINAL WARNING: This will permanently delete ALL ${itemName}s from the database.\n\nType "DELETE ALL" to confirm.`)) {
            return;
        }

        const userInput = prompt(`Type "DELETE ALL" to permanently delete all ${itemName}s:`);
        if (userInput !== 'DELETE ALL') {
            AdminCore.showToast('Delete all cancelled', 'info');
            return;
        }

        try {
            // First get all IDs
            const response = await fetch(`/api/admin/${type}`);
            const items = await response.json();
            
            if (!items || items.length === 0) {
                AdminCore.showToast(`No ${itemName}s to delete`, 'info');
                return;
            }

            const ids = items.map(item => item.id);

            // Now delete them all
            const deleteResponse = await fetch(`/api/admin/${type}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids })
            });

            const result = await deleteResponse.json();
            
            if (result.success) {
                AdminCore.showToast(`All ${itemName}s deleted successfully`, 'success');
                selectedItems[type].clear();
                window.dispatchEvent(new CustomEvent('itemsDeleted', { 
                    detail: { type, ids } 
                }));
                // Reload the table
                loadTabData(type);
            } else {
                AdminCore.showToast(result.error || 'Delete all failed', 'error');
            }
        } catch (error) {
            console.error('Delete all error:', error);
            AdminCore.showToast('Delete all failed: ' + error.message, 'error');
        }
    };

    // Helper function to get item name
    function getItemName(type) {
        const names = {
            suppliers: 'supplier',
            bases: 'base product',
            oils: 'fragrance oil',
            vessels: 'vessel'
        };
        return names[type] || 'item';
    }

    // Refresh table after deletion
    function refreshTable(type) {
        // This should trigger a reload of the table data
        // Assuming there's a loadTabData function from admin-core.js
        if (window.loadTabData) {
            window.loadTabData(type);
        }
    }

    // Helper function to load tab data (if not available from admin-core)
    function loadTabData(type) {
        fetch(`/api/admin/${type}`)
            .then(response => response.json())
            .then(data => {
                // Update the table
                const table = document.querySelector(`#${type} table tbody`);
                if (table && window.AdminCore && window.AdminCore.renderTable) {
                    // Use existing render function if available
                    const tabContent = document.getElementById(type);
                    if (tabContent) {
                        const existingTable = tabContent.querySelector('.data-table');
                        if (existingTable) {
                            existingTable.remove();
                        }
                        // Re-render the table
                        const columns = getColumnsForType(type);
                        const newTable = window.AdminCore.renderTable(data, columns);
                        tabContent.appendChild(newTable);
                        // Re-enhance the table with delete buttons
                        setTimeout(() => enhanceTable(type), 100);
                    }
                } else {
                    // Simple reload
                    location.reload();
                }
            })
            .catch(error => {
                console.error(`Error loading ${type}:`, error);
            });
    }

    // Get columns configuration for each type
    function getColumnsForType(type) {
        const columnConfigs = {
            suppliers: ['name', 'contact_email', 'contact_phone', 'website'],
            bases: ['name', 'product_type', 'supplier_name', 'price_per_lb', 'ifra_category'],
            oils: ['product_name', 'supplier_name', 'flash_point', 'vanillin_pct', 'price_tier1'],
            vessels: ['name', 'vessel_type', 'size', 'price_per_unit', 'supplier_name']
        };
        return columnConfigs[type] || [];
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDeleteModule);
    } else {
        initDeleteModule();
    }

    // Re-initialize when tabs change
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-tab')) {
            setTimeout(() => {
                addDeleteButtons();
                addBulkDeleteControls();
            }, 100);
        }
    });

    // Export module
    window.DeleteModule = {
        ...window.DeleteModule,
        init: initDeleteModule,
        deleteItem,
        deleteSelected,
        deleteAll,
        clearSelection,
        toggleSelectAll,
        toggleItemSelection
    };
})();