-- schema-update.sql
-- Updates to add missing fields for enhanced features

-- Add missing fields to fragrance_oils table
ALTER TABLE fragrance_oils 
ADD COLUMN IF NOT EXISTS specific_gravity DECIMAL(5,3),
ADD COLUMN IF NOT EXISTS vanillin_pct DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS library_add_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS batch_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS intensity_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS overall_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add missing fields to base_products table
ALTER TABLE base_products
ADD COLUMN IF NOT EXISTS ease_of_use_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS performance_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS library_add_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS batch_count INTEGER DEFAULT 0;

-- Product details table for extended information
CREATE TABLE IF NOT EXISTS product_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    product_type VARCHAR(10) NOT NULL CHECK (product_type IN ('base', 'oil')),
    theme_family VARCHAR(100),
    fragrance_notes_top TEXT,
    fragrance_notes_middle TEXT,
    fragrance_notes_base TEXT,
    scent_description TEXT,
    soap_acceleration VARCHAR(50),
    usage_notes TEXT,
    blending_notes TEXT,
    product_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, product_type)
);

-- Price tiers table for pricing structure
CREATE TABLE IF NOT EXISTS price_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    product_type VARCHAR(10) NOT NULL CHECK (product_type IN ('base', 'oil')),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    tier1_size DECIMAL(10,2) DEFAULT 0,
    tier1_unit VARCHAR(10) DEFAULT 'oz',
    tier1_price DECIMAL(10,2) DEFAULT 0,
    tier2_size DECIMAL(10,2) DEFAULT 0,
    tier2_unit VARCHAR(10) DEFAULT 'oz',
    tier2_price DECIMAL(10,2) DEFAULT 0,
    tier3_size DECIMAL(10,2) DEFAULT 0,
    tier3_unit VARCHAR(10) DEFAULT 'oz',
    tier3_price DECIMAL(10,2) DEFAULT 0,
    tier4_size DECIMAL(10,2) DEFAULT 0,
    tier4_unit VARCHAR(10) DEFAULT 'oz',
    tier4_price DECIMAL(10,2) DEFAULT 0,
    tier5_size DECIMAL(10,2) DEFAULT 0,
    tier5_unit VARCHAR(10) DEFAULT 'oz',
    tier5_price DECIMAL(10,2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, product_type, supplier_id)
);

-- Inventory tracking table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    product_type VARCHAR(10) NOT NULL CHECK (product_type IN ('base', 'oil')),
    quantity_on_hand DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(10) DEFAULT 'oz',
    location VARCHAR(255),
    notes TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, product_type)
);

-- Shopping lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shopping list items table
CREATE TABLE IF NOT EXISTS shopping_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
    item_id UUID NOT NULL,
    item_type VARCHAR(10) NOT NULL CHECK (item_type IN ('base', 'oil')),
    item_name VARCHAR(255) NOT NULL,
    supplier_name VARCHAR(255),
    quantity_to_purchase DECIMAL(10,2) NOT NULL,
    quantity_on_hand DECIMAL(10,2) DEFAULT 0,
    unit_type VARCHAR(10) DEFAULT 'oz',
    direct_cost DECIMAL(10,2) DEFAULT 0,
    indirect_cost DECIMAL(10,2) DEFAULT 0,
    is_purchased BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Formulas table
CREATE TABLE IF NOT EXISTS formulas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    notes TEXT,
    tags TEXT,
    product_type_id VARCHAR(50),
    bottle_size DECIMAL(10,2) DEFAULT 4,
    bottle_unit VARCHAR(10) DEFAULT 'oz',
    quantity INTEGER DEFAULT 1,
    use_custom_max_pct BOOLEAN DEFAULT FALSE,
    custom_max_pct DECIMAL(5,2) DEFAULT 0,
    use_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Formula bases table
CREATE TABLE IF NOT EXISTS formula_bases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    formula_id UUID REFERENCES formulas(id) ON DELETE CASCADE,
    base_product_id UUID REFERENCES base_products(id),
    base_product_name VARCHAR(255),
    percentage DECIMAL(5,2) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Formula oils table
CREATE TABLE IF NOT EXISTS formula_oils (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    formula_id UUID REFERENCES formulas(id) ON DELETE CASCADE,
    fragrance_oil_id UUID REFERENCES fragrance_oils(id),
    oil_name VARCHAR(255),
    percentage DECIMAL(5,2) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for new tables
CREATE INDEX idx_product_details_product ON product_details(product_id, product_type);
CREATE INDEX idx_price_tiers_product ON price_tiers(product_id, product_type);
CREATE INDEX idx_price_tiers_supplier ON price_tiers(supplier_id);
CREATE INDEX idx_inventory_product ON inventory(product_id, product_type);
CREATE INDEX idx_shopping_list_items_list ON shopping_list_items(shopping_list_id);
CREATE INDEX idx_formula_bases_formula ON formula_bases(formula_id);
CREATE INDEX idx_formula_oils_formula ON formula_oils(formula_id);

-- Add triggers for new tables
CREATE TRIGGER update_product_details_updated_at BEFORE UPDATE ON product_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_tiers_updated_at BEFORE UPDATE ON price_tiers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at BEFORE UPDATE ON shopping_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_list_items_updated_at BEFORE UPDATE ON shopping_list_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_formulas_updated_at BEFORE UPDATE ON formulas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();