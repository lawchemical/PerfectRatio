-- Initialize database with basic tables if they don't exist
-- This ensures the admin panel can load even with empty database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create suppliers table if not exists
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    website_url TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create base_products table if not exists
CREATE TABLE IF NOT EXISTS base_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    max_load_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
    unit_mode VARCHAR(20) NOT NULL DEFAULT 'weight',
    specific_gravity DECIMAL(5,3),
    ifra_category VARCHAR(20),
    ifra_category_2 VARCHAR(20),
    is_dual_purpose BOOLEAN DEFAULT FALSE,
    notes TEXT,
    is_in_library BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create fragrance_oils table if not exists  
CREATE TABLE IF NOT EXISTS fragrance_oils (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    flash_point_f INTEGER,
    solvent_note VARCHAR(100),
    ifra_version VARCHAR(100),
    ifra_date DATE,
    is_in_library BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vessels table if not exists
CREATE TABLE IF NOT EXISTS vessels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    vessel_type VARCHAR(50) NOT NULL DEFAULT 'bottle',
    size DECIMAL(10,2) NOT NULL DEFAULT 0,
    size_unit VARCHAR(10) DEFAULT 'oz',
    price_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_in_library BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ifra_entries table if not exists
CREATE TABLE IF NOT EXISTS ifra_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oil_id UUID REFERENCES fragrance_oils(id) ON DELETE CASCADE,
    product_type_key VARCHAR(100) NOT NULL,
    category_id VARCHAR(20),
    max_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data if tables are empty
DO $$
BEGIN
    -- Check if suppliers table is empty
    IF NOT EXISTS (SELECT 1 FROM suppliers LIMIT 1) THEN
        -- Insert sample supplier
        INSERT INTO suppliers (name, email, website_url) 
        VALUES ('Sample Supplier', 'info@example.com', 'https://example.com');
    END IF;
END $$;