-- scripts/schema.sql
-- PostgreSQL schema for PerfectRatio

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    website VARCHAR(255),
    email VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Base products table
CREATE TABLE IF NOT EXISTS base_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    max_load_pct DECIMAL(5,2) NOT NULL,
    unit_mode VARCHAR(50) NOT NULL CHECK (unit_mode IN ('weight', 'volume')),
    specific_gravity DECIMAL(5,3),
    ifra_category VARCHAR(10),
    is_dual_purpose BOOLEAN DEFAULT FALSE,
    ifra_category_2 VARCHAR(10),
    notes TEXT,
    is_in_library BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fragrance oils table
CREATE TABLE IF NOT EXISTS fragrance_oils (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    flash_point_f INTEGER,
    solvent_note VARCHAR(100),
    ifra_version VARCHAR(50),
    ifra_date DATE,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_in_library BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- IFRA entries table
CREATE TABLE IF NOT EXISTS ifra_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oil_id UUID REFERENCES fragrance_oils(id) ON DELETE CASCADE,
    product_type_key VARCHAR(50) NOT NULL,
    category_id VARCHAR(10),
    max_pct DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fragrance categories (for discovery features)
CREATE TABLE IF NOT EXISTS fragrance_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oil_id UUID REFERENCES fragrance_oils(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User batches (for tracking formulations)
CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    base_id UUID REFERENCES base_products(id),
    bottle_size DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_mode VARCHAR(50) NOT NULL,
    product_type_key VARCHAR(50) NOT NULL,
    applied_max_pct DECIMAL(5,2) NOT NULL,
    limited_by VARCHAR(50),
    total_batch_ounces DECIMAL(10,2),
    fragrance_ounces DECIMAL(10,2),
    base_ounces DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Batch oil picks (blend components)
CREATE TABLE IF NOT EXISTS batch_oil_picks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
    oil_id UUID REFERENCES fragrance_oils(id),
    percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_base_supplier ON base_products(supplier_id);
CREATE INDEX idx_oil_supplier ON fragrance_oils(supplier_id);
CREATE INDEX idx_ifra_oil ON ifra_entries(oil_id);
CREATE INDEX idx_category_oil ON fragrance_categories(oil_id);
CREATE INDEX idx_batch_base ON batches(base_id);
CREATE INDEX idx_batch_pick ON batch_oil_picks(batch_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_base_products_updated_at BEFORE UPDATE ON base_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fragrance_oils_updated_at BEFORE UPDATE ON fragrance_oils
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
