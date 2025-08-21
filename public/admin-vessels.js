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
        document.getElementById('addVesselBtn').addEventListener('click', () => openVesselModal());
        
        // Search functionality
        document.getElementById('vesselSearch').addEventListener('input', filterVessels);
        
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
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Product URL</label>
                                    <input type="url" name="product_url" placeholder="https://..." style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Notes</label>
                                    <textarea name="notes" rows="3" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; resize: vertical;"></textarea>
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
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Recommended Fill Volume</label>
                                    <input type="number" name="recommended_fill_volume" step="0.1" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Max Fill Volume</label>
                                    <input type="number" name="max_fill_volume" step="0.1" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Color</label>
                                    <select name="color" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
                                        <option value="">Select color...</option>
                                        <option value="red">Red</option>
                                        <option value="purple">Purple</option>
                                        <option value="orange">Orange</option>
                                        <option value="multi">Multi</option>
                                        <option value="clear">Clear</option>
                                        <option value="amber">Amber</option>
                                        <option value="white">White</option>
                                        <option value="black">Black</option>
                                        <option value="blue">Blue</option>
                                        <option value="green">Green</option>
                                        <option value="silver">Silver</option>
                                        <option value="gold">Gold</option>
                                    </select>
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Shape</label>
                                    <select name="shape" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
                                        <option value="">Select shape...</option>
                                        <option value="round">Round</option>
                                        <option value="square">Square</option>
                                        <option value="oval">Oval</option>
                                        <option value="rectangular">Rectangular</option>
                                        <option value="cylinder">Cylinder</option>
                                        <option value="cone">Cone</option>
                                        <option value="hexagon">Hexagon</option>
                                        <option value="heart">Heart</option>
                                        <option value="star">Star</option>
                                        <option value="irregular">Irregular</option>
                                    </select>
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Neck Size (for bottles)</label>
                                    <input type="text" name="neck_size" placeholder="e.g., 24-410, 20-410" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Weight (pounds)</label>
                                    <input type="number" name="weight_pounds" step="0.01" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                </div>
                            </div>
                            
                            <div id="vessel-tab-content-pricing" style="display: none;">
                                <h3 style="color: #101114; margin-bottom: 20px;">Pricing Tiers</h3>
                                
                                <!-- Tier 1 -->
                                <div style="padding: 16px; background: #F5F3F0; border-radius: 8px; margin-bottom: 16px;">
                                    <h4 style="color: #101114; margin-bottom: 12px;">Pricing Tier 1</h4>
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Display Name (e.g., "Single", "1 Unit")</label>
                                        <input type="text" name="tier1_name" placeholder="e.g., Single Unit" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;">
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Size</label>
                                            <input type="number" name="tier1_size" step="0.01" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Unit</label>
                                            <select name="tier1_unit" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
                                                <option value="units">units</option>
                                                <option value="case">case</option>
                                                <option value="dozen">dozen</option>
                                                <option value="pallet">pallet</option>
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
                                <div style="padding: 16px; background: #F5F3F0; border-radius: 8px; margin-bottom: 16px;">
                                    <h4 style="color: #101114; margin-bottom: 12px;">Pricing Tier 2</h4>
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Display Name (e.g., "Case", "12 Units")</label>
                                        <input type="text" name="tier2_name" placeholder="e.g., Case (12)" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;">
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Size</label>
                                            <input type="number" name="tier2_size" step="0.01" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Unit</label>
                                            <select name="tier2_unit" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
                                                <option value="units">units</option>
                                                <option value="case">case</option>
                                                <option value="dozen">dozen</option>
                                                <option value="pallet">pallet</option>
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
                                <div style="padding: 16px; background: #F5F3F0; border-radius: 8px; margin-bottom: 16px;">
                                    <h4 style="color: #101114; margin-bottom: 12px;">Pricing Tier 3</h4>
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Display Name (e.g., "Bulk", "144 Units")</label>
                                        <input type="text" name="tier3_name" placeholder="e.g., Bulk (144)" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;">
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Size</label>
                                            <input type="number" name="tier3_size" step="0.01" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Unit</label>
                                            <select name="tier3_unit" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
                                                <option value="units">units</option>
                                                <option value="case">case</option>
                                                <option value="dozen">dozen</option>
                                                <option value="pallet">pallet</option>
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
                                        <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Display Name (e.g., "Wholesale", "500 Units")</label>
                                        <input type="text" name="tier4_name" placeholder="e.g., Wholesale" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;">
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Size</label>
                                            <input type="number" name="tier4_size" step="0.01" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Unit</label>
                                            <select name="tier4_unit" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
                                                <option value="units">units</option>
                                                <option value="case">case</option>
                                                <option value="dozen">dozen</option>
                                                <option value="pallet">pallet</option>
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
                                        <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Display Name (e.g., "Pallet", "1000 Units")</label>
                                        <input type="text" name="tier5_name" placeholder="e.g., Full Pallet" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;">
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Size</label>
                                            <input type="number" name="tier5_size" step="0.01" min="0" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px;">
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #2E3033; font-size: 14px;">Unit</label>
                                            <select name="tier5_unit" style="width: 100%; padding: 12px; border: 1px solid #D9D3CC; border-radius: 8px; font-size: 16px; background: white;">
                                                <option value="units">units</option>
                                                <option value="case">case</option>
                                                <option value="dozen">dozen</option>
                                                <option value="pallet">pallet</option>
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
            const allTabs = ['basic', 'physical', 'pricing'];
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
                    <td colspan="4" style="text-align: center; color: #6c757d;">
                        No vessels found. Add your first vessel to get started.
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = vessels.map(vessel => {
            const vesselId = typeof vessel.id === 'string' ? `'${vessel.id}'` : vessel.id;
            
            // Get supplier name - check multiple possible fields
            let supplierName = vessel.supplier_name || vessel.supplier?.name || '';
            if (!supplierName && vessel.supplier_id) {
                // Try to find supplier from the suppliers list
                const suppliers = AdminCore.getSuppliers();
                const supplier = suppliers.find(s => s.id === vessel.supplier_id);
                supplierName = supplier ? supplier.name : 'Unknown Supplier';
            }
            if (!supplierName) {
                supplierName = 'No Supplier';
            }
            
            // Get the display name
            const displayName = vessel.name || 'Unnamed Vessel';
            
            // Truncate ID if it's too long (UUIDs)
            const displayId = vessel.id && vessel.id.length > 8 ? 
                vessel.id.substring(0, 8) + '...' : 
                vessel.id || '-';
            
            return `
                <tr data-id="${vessel.id}">
                    <td title="${vessel.id}" style="font-family: monospace; font-size: 12px;">${displayId}</td>
                    <td style="font-weight: 500;">${displayName}</td>
                    <td>${supplierName}</td>
                        <button class="btn-small" onclick="editVessel(${vesselId})" title="Edit" style="margin-right: 5px;">✏️</button>
                        <button class="btn-small btn-danger" onclick="deleteVessel(${vesselId})" title="Delete">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Filter vessels
    function filterVessels() {
        const search = document.getElementById('vesselSearch').value.toLowerCase();
        const supplierFilter = document.getElementById('vesselSupplierFilter').value;
        
        let filtered = AdminCore.getVessels();
        
        if (search) {
            filtered = filtered.filter(vessel => 
                vessel.name.toLowerCase().includes(search) ||
                (vessel.sku && vessel.sku.toLowerCase().includes(search)) ||
                (vessel.supplier_name && vessel.supplier_name.toLowerCase().includes(search))
            );
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
            form.elements['weight_pounds'].value = vessel.weight_pounds || '';
            form.elements['recommended_fill_volume'].value = vessel.recommended_fill_volume || '';
            form.elements['max_fill_volume'].value = vessel.max_fill_volume || '';
            form.elements['product_url'].value = vessel.product_url || '';
            form.elements['notes'].value = vessel.notes || '';
            form.elements['is_active'].checked = vessel.is_active !== false;
            form.elements['is_discontinued'].checked = vessel.is_discontinued || false;
            
            // Load price tiers if they exist
            if (vessel.price_tiers && vessel.price_tiers.length > 0) {
                const tier = vessel.price_tiers[0];
                // Tier 1
                if (tier.tier1_size) {
                    form.elements['tier1_name'].value = tier.tier1_name || '';
                    form.elements['tier1_size'].value = tier.tier1_size;
                    form.elements['tier1_unit'].value = tier.tier1_unit || 'units';
                    form.elements['tier1_price'].value = tier.tier1_price;
                    form.elements['tier1_sku'].value = tier.tier1_sku || '';
                }
                // Tier 2
                if (tier.tier2_size) {
                    form.elements['tier2_name'].value = tier.tier2_name || '';
                    form.elements['tier2_size'].value = tier.tier2_size;
                    form.elements['tier2_unit'].value = tier.tier2_unit || 'units';
                    form.elements['tier2_price'].value = tier.tier2_price;
                    form.elements['tier2_sku'].value = tier.tier2_sku || '';
                }
                // Tier 3
                if (tier.tier3_size) {
                    form.elements['tier3_name'].value = tier.tier3_name || '';
                    form.elements['tier3_size'].value = tier.tier3_size;
                    form.elements['tier3_unit'].value = tier.tier3_unit || 'units';
                    form.elements['tier3_price'].value = tier.tier3_price;
                    form.elements['tier3_sku'].value = tier.tier3_sku || '';
                }
                // Tier 4
                if (tier.tier4_size) {
                    form.elements['tier4_name'].value = tier.tier4_name || '';
                    form.elements['tier4_size'].value = tier.tier4_size;
                    form.elements['tier4_unit'].value = tier.tier4_unit || 'units';
                    form.elements['tier4_price'].value = tier.tier4_price;
                    form.elements['tier4_sku'].value = tier.tier4_sku || '';
                }
                // Tier 5
                if (tier.tier5_size) {
                    form.elements['tier5_name'].value = tier.tier5_name || '';
                    form.elements['tier5_size'].value = tier.tier5_size;
                    form.elements['tier5_unit'].value = tier.tier5_unit || 'units';
                    form.elements['tier5_price'].value = tier.tier5_price;
                    form.elements['tier5_sku'].value = tier.tier5_sku || '';
                }
            }
        } else {
            title.textContent = 'Add Vessel';
            form.reset();
            form.elements['is_active'].checked = true;
            form.elements['is_discontinued'].checked = false;
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
        data.is_active = formData.get('is_active') === 'on';
        data.is_discontinued = formData.get('is_discontinued') === 'on';
        
        // Convert numbers
        data.size = parseFloat(data.size);
        data.weight_pounds = data.weight_pounds ? parseFloat(data.weight_pounds) : null;
        data.max_fill_volume = data.max_fill_volume ? parseFloat(data.max_fill_volume) : null;
        data.recommended_fill_volume = data.recommended_fill_volume ? parseFloat(data.recommended_fill_volume) : null;
        
        // Collect price tier data
        const priceTiers = {};
        for (let i = 1; i <= 5; i++) {
            const name = data[`tier${i}_name`];
            const size = data[`tier${i}_size`];
            const unit = data[`tier${i}_unit`];
            const price = data[`tier${i}_price`];
            const sku = data[`tier${i}_sku`];
            
            // Remove tier fields from main data object
            delete data[`tier${i}_name`];
            delete data[`tier${i}_size`];
            delete data[`tier${i}_unit`];
            delete data[`tier${i}_price`];
            delete data[`tier${i}_sku`];
            
            if (size && price) {
                priceTiers[`tier${i}_name`] = name || '';
                priceTiers[`tier${i}_size`] = parseFloat(size);
                priceTiers[`tier${i}_unit`] = unit || 'units';
                priceTiers[`tier${i}_price`] = parseFloat(price);
                priceTiers[`tier${i}_sku`] = sku || '';
            }
        }
        
        // Add price tiers to data if any were defined
        if (Object.keys(priceTiers).length > 0) {
            data.price_tiers = priceTiers;
        }
        
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