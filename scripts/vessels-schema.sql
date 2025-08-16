-- Vessels/Bottles Schema for PerfectRatio
-- Add these tables to support vessel/bottle management

-- Vessels table (jars, bottles, containers)
CREATE TABLE IF NOT EXISTS vessels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    vessel_type VARCHAR(50) NOT NULL CHECK (vessel_type IN ('jar', 'bottle', 'spray_bottle', 'roller_bottle', 'tin', 'tube', 'pouch', 'other')),
    material VARCHAR(50) CHECK (material IN ('glass', 'plastic', 'aluminum', 'tin', 'paper', 'other')),
    color VARCHAR(50),
    size DECIMAL(10,2) NOT NULL, -- Size in oz or ml
    size_unit VARCHAR(10) DEFAULT 'oz' CHECK (size_unit IN ('oz', 'ml', 'g', 'L')),
    neck_size VARCHAR(20), -- For bottles (e.g., "20-410", "24-410")
    shape VARCHAR(50), -- round, square, oval, etc.
    price_per_unit DECIMAL(10,2) NOT NULL,
    case_count INTEGER DEFAULT 1, -- Number of units per case
    case_price DECIMAL(10,2), -- Price per case (if different from unit price * case count)
    minimum_order_quantity INTEGER DEFAULT 1,
    weight_grams DECIMAL(10,2), -- Weight of empty vessel
    max_fill_volume DECIMAL(10,2), -- Maximum fill volume
    is_in_library BOOLEAN DEFAULT FALSE,
    notes TEXT,
    product_url TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(supplier_id, name, size)
);

-- Vessel inventory tracking
CREATE TABLE IF NOT EXISTS vessel_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
    quantity_on_hand INTEGER DEFAULT 0,
    quantity_unit VARCHAR(20) DEFAULT 'units' CHECK (quantity_unit IN ('units', 'cases')),
    location VARCHAR(255),
    reorder_point INTEGER,
    last_ordered_date DATE,
    expiry_date DATE,
    notes TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vessel_id)
);

-- Vessel specifications (additional technical details)
CREATE TABLE IF NOT EXISTS vessel_specifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
    diameter_mm DECIMAL(10,2),
    height_mm DECIMAL(10,2),
    opening_diameter_mm DECIMAL(10,2),
    wall_thickness_mm DECIMAL(10,2),
    label_panel_height_mm DECIMAL(10,2),
    label_panel_width_mm DECIMAL(10,2),
    temperature_range_min_c INTEGER,
    temperature_range_max_c INTEGER,
    is_food_safe BOOLEAN DEFAULT TRUE,
    is_leak_proof BOOLEAN DEFAULT FALSE,
    is_child_resistant BOOLEAN DEFAULT FALSE,
    uv_protection BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vessel_id)
);

-- Compatible closures/lids for vessels
CREATE TABLE IF NOT EXISTS vessel_closures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
    closure_type VARCHAR(50), -- cap, pump, sprayer, dropper, roller
    closure_size VARCHAR(20), -- neck size compatibility
    closure_color VARCHAR(50),
    closure_material VARCHAR(50),
    price_per_unit DECIMAL(10,2),
    case_count INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shopping list items for vessels
ALTER TABLE shopping_list_items 
ADD COLUMN IF NOT EXISTS vessel_id UUID REFERENCES vessels(id),
ADD COLUMN IF NOT EXISTS vessel_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS vessel_case_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS vessel_units_needed INTEGER DEFAULT 0;

-- Add vessel support to formulas
ALTER TABLE formulas
ADD COLUMN IF NOT EXISTS vessel_id UUID REFERENCES vessels(id),
ADD COLUMN IF NOT EXISTS vessel_quantity INTEGER DEFAULT 1;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vessels_supplier ON vessels(supplier_id);
CREATE INDEX IF NOT EXISTS idx_vessels_type ON vessels(vessel_type);
CREATE INDEX IF NOT EXISTS idx_vessels_size ON vessels(size);
CREATE INDEX IF NOT EXISTS idx_vessels_library ON vessels(is_in_library);
CREATE INDEX IF NOT EXISTS idx_vessel_inventory_vessel ON vessel_inventory(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_specs_vessel ON vessel_specifications(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_closures_vessel ON vessel_closures(vessel_id);

-- Add trigger for updated_at
CREATE TRIGGER update_vessels_updated_at BEFORE UPDATE ON vessels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vessel_inventory_updated_at BEFORE UPDATE ON vessel_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();