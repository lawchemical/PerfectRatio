-- Complete PerfectRatio Database Schema
-- Based on iOS Core Data Model Requirements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS ifra_entries CASCADE;
DROP TABLE IF EXISTS price_tiers CASCADE;
DROP TABLE IF EXISTS vessel_specifications CASCADE;
DROP TABLE IF EXISTS vessel_inventory CASCADE;
DROP TABLE IF EXISTS vessels CASCADE;
DROP TABLE IF EXISTS fragrance_oils CASCADE;
DROP TABLE IF EXISTS base_products CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS product_details CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;

-- =====================
-- SUPPLIERS
-- =====================
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    website_url TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- BASE PRODUCTS
-- =====================
CREATE TABLE base_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    
    -- Core Fields
    name VARCHAR(255) NOT NULL,
    max_load_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
    unit_mode VARCHAR(20) NOT NULL CHECK (unit_mode IN ('weight', 'volume')),
    is_in_library BOOLEAN DEFAULT FALSE,
    is_custom BOOLEAN DEFAULT FALSE,
    
    -- Technical Properties
    specific_gravity DECIMAL(5,3),
    base_type VARCHAR(100),
    wax_type VARCHAR(100),
    
    -- IFRA Categories
    ifra_category VARCHAR(20),
    ifra_category_2 VARCHAR(20),
    is_dual_purpose BOOLEAN DEFAULT FALSE,
    
    -- Ratings
    ease_of_use_rating DECIMAL(3,2) CHECK (ease_of_use_rating >= 0 AND ease_of_use_rating <= 5),
    performance_rating DECIMAL(3,2) CHECK (performance_rating >= 0 AND performance_rating <= 5),
    total_ratings INTEGER DEFAULT 0,
    
    -- Custom Item Fields
    custom_created_date TIMESTAMP,
    custom_user_id VARCHAR(255),
    
    -- Additional Fields
    notes TEXT,
    sku VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(supplier_id, name, sku)
);

-- =====================
-- FRAGRANCE OILS
-- =====================
CREATE TABLE fragrance_oils (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    
    -- Core Fields
    product_name VARCHAR(255) NOT NULL,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_in_library BOOLEAN DEFAULT FALSE,
    is_custom BOOLEAN DEFAULT FALSE,
    
    -- Supplier Information
    sku VARCHAR(100),
    
    -- Technical Properties
    flash_point_f INTEGER,
    solvent_note VARCHAR(100),
    specific_gravity DECIMAL(5,3),
    vanillin_pct DECIMAL(5,2),
    
    -- IFRA Information
    ifra_version VARCHAR(100),
    ifra_date DATE,
    
    -- User Interaction Data
    is_favorite BOOLEAN DEFAULT FALSE,
    last_used_date TIMESTAMP,
    categories TEXT,
    
    -- Ratings & Analytics
    intensity_rating DECIMAL(3,2) CHECK (intensity_rating >= 0 AND intensity_rating <= 5),
    overall_rating DECIMAL(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
    total_ratings INTEGER DEFAULT 0,
    library_add_count INTEGER DEFAULT 0,
    recent_add_count INTEGER DEFAULT 0,
    unique_user_count INTEGER DEFAULT 0,
    batch_count INTEGER DEFAULT 0,
    
    -- Custom Item Fields
    custom_created_date TIMESTAMP,
    custom_user_id VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(supplier_id, product_name, sku)
);

-- =====================
-- PRODUCT DETAILS (for Fragrance Notes)
-- =====================
CREATE TABLE product_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    
    -- Fragrance Notes
    fragrance_notes_top TEXT,
    fragrance_notes_middle TEXT,
    fragrance_notes_base TEXT,
    theme_family VARCHAR(255),
    scent_description TEXT,
    
    -- Additional Properties
    soap_acceleration VARCHAR(100),
    product_url TEXT,
    usage_notes TEXT,
    blending_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(product_id, product_type)
);

-- =====================
-- VESSELS/CONTAINERS
-- =====================
CREATE TABLE vessels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    
    -- Core Fields
    name VARCHAR(255) NOT NULL,
    vessel_type VARCHAR(50) NOT NULL CHECK (vessel_type IN ('jar', 'bottle', 'spray_bottle', 'roller_bottle', 'tin', 'tube', 'pouch', 'other')),
    size DECIMAL(10,2) NOT NULL,
    size_unit VARCHAR(10) DEFAULT 'oz' CHECK (size_unit IN ('oz', 'ml', 'g', 'L')),
    price_per_unit DECIMAL(10,2) NOT NULL,
    is_in_library BOOLEAN DEFAULT FALSE,
    is_custom BOOLEAN DEFAULT FALSE,
    
    -- Supplier Information
    sku VARCHAR(100),
    
    -- Physical Properties
    material VARCHAR(50) CHECK (material IN ('glass', 'plastic', 'aluminum', 'tin', 'paper', 'other')),
    color VARCHAR(50),
    shape VARCHAR(50),
    neck_size VARCHAR(20),
    weight_grams DECIMAL(10,2),
    
    -- Volume Specifications
    max_fill_volume DECIMAL(10,2),
    recommended_fill_size DECIMAL(10,2),
    overflow_fill_size DECIMAL(10,2),
    
    -- Ordering Information
    case_count INTEGER DEFAULT 1,
    case_price DECIMAL(10,2),
    minimum_order_quantity INTEGER DEFAULT 1,
    
    -- Custom Item Fields
    custom_created_date TIMESTAMP,
    custom_user_id VARCHAR(255),
    
    -- Additional Fields
    notes TEXT,
    product_url TEXT,
    image_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(supplier_id, name, size)
);

-- =====================
-- VESSEL INVENTORY
-- =====================
CREATE TABLE vessel_inventory (
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

-- =====================
-- VESSEL SPECIFICATIONS
-- =====================
CREATE TABLE vessel_specifications (
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

-- =====================
-- PRICE TIERS
-- =====================
CREATE TABLE price_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    product_type VARCHAR(50) NOT NULL CHECK (product_type IN ('base', 'oil', 'vessel')),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    
    -- Tier 1
    tier1_size DECIMAL(10,2),
    tier1_unit VARCHAR(20),
    tier1_price DECIMAL(10,2),
    
    -- Tier 2
    tier2_size DECIMAL(10,2),
    tier2_unit VARCHAR(20),
    tier2_price DECIMAL(10,2),
    
    -- Tier 3
    tier3_size DECIMAL(10,2),
    tier3_unit VARCHAR(20),
    tier3_price DECIMAL(10,2),
    
    -- Tier 4
    tier4_size DECIMAL(10,2),
    tier4_unit VARCHAR(20),
    tier4_price DECIMAL(10,2),
    
    -- Tier 5
    tier5_size DECIMAL(10,2),
    tier5_unit VARCHAR(20),
    tier5_price DECIMAL(10,2),
    
    notes TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(product_id, product_type)
);

-- =====================
-- IFRA ENTRIES
-- =====================
CREATE TABLE ifra_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oil_id UUID REFERENCES fragrance_oils(id) ON DELETE CASCADE,
    product_type_key VARCHAR(100) NOT NULL,
    category_id VARCHAR(20),
    max_pct DECIMAL(5,2) NOT NULL,
    certificate_date DATE,
    certificate_version VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(oil_id, product_type_key)
);

-- =====================
-- INVENTORY
-- =====================
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    quantity_on_hand DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'oz',
    location VARCHAR(255),
    expiration_date DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(product_id, product_type)
);

-- =====================
-- INDEXES FOR PERFORMANCE
-- =====================
CREATE INDEX idx_suppliers_name ON suppliers(name);

CREATE INDEX idx_bases_supplier ON base_products(supplier_id);
CREATE INDEX idx_bases_library ON base_products(is_in_library);
CREATE INDEX idx_bases_custom ON base_products(is_custom);

CREATE INDEX idx_oils_supplier ON fragrance_oils(supplier_id);
CREATE INDEX idx_oils_library ON fragrance_oils(is_in_library);
CREATE INDEX idx_oils_custom ON fragrance_oils(is_custom);
CREATE INDEX idx_oils_name ON fragrance_oils(product_name);

CREATE INDEX idx_vessels_supplier ON vessels(supplier_id);
CREATE INDEX idx_vessels_type ON vessels(vessel_type);
CREATE INDEX idx_vessels_size ON vessels(size);
CREATE INDEX idx_vessels_library ON vessels(is_in_library);

CREATE INDEX idx_price_tiers_product ON price_tiers(product_id, product_type);
CREATE INDEX idx_ifra_oil ON ifra_entries(oil_id);
CREATE INDEX idx_inventory_product ON inventory(product_id, product_type);
CREATE INDEX idx_product_details_product ON product_details(product_id, product_type);

-- =====================
-- UPDATE TRIGGERS
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bases_updated_at BEFORE UPDATE ON base_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oils_updated_at BEFORE UPDATE ON fragrance_oils
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vessels_updated_at BEFORE UPDATE ON vessels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_tiers_updated_at BEFORE UPDATE ON price_tiers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_details_updated_at BEFORE UPDATE ON product_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();