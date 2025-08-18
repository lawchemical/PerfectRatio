-- User Override Tables for the user-data database
-- These tables store user-specific customizations to product data
-- Values in these tables override the defaults from product-data database

-- =====================================================
-- USER FRAGRANCE OIL OVERRIDES
-- =====================================================
CREATE TABLE IF NOT EXISTS user_fragrance_oil_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    fragrance_oil_id UUID NOT NULL,
    
    -- Custom Technical Properties (override product-data values)
    custom_max_load_pct DECIMAL(5,2),
    custom_recommended_load_pct DECIMAL(5,2),
    custom_flash_point_f DECIMAL(5,1),
    custom_specific_gravity DECIMAL(10,3),
    custom_vanilla_content DECIMAL(5,2),
    
    -- Custom Pricing (user's actual cost)
    custom_price_per_unit DECIMAL(10,2),
    custom_price_unit VARCHAR(20),
    
    -- Custom IFRA overrides (for updated certificates)
    custom_ifra_category_1 DECIMAL(5,2),
    custom_ifra_category_2 DECIMAL(5,2),
    custom_ifra_category_3 DECIMAL(5,2),
    custom_ifra_category_4 DECIMAL(5,2),
    custom_ifra_category_5 DECIMAL(5,2),
    custom_ifra_category_5A DECIMAL(5,2),
    custom_ifra_category_5B DECIMAL(5,2),
    custom_ifra_category_5C DECIMAL(5,2),
    custom_ifra_category_5D DECIMAL(5,2),
    custom_ifra_category_6 DECIMAL(5,2),
    custom_ifra_category_7A DECIMAL(5,2),
    custom_ifra_category_7B DECIMAL(5,2),
    custom_ifra_category_8 DECIMAL(5,2),
    custom_ifra_category_9 DECIMAL(5,2),
    custom_ifra_category_10A DECIMAL(5,2),
    custom_ifra_category_10B DECIMAL(5,2),
    custom_ifra_category_11A DECIMAL(5,2),
    custom_ifra_category_11B DECIMAL(5,2),
    custom_ifra_category_12 DECIMAL(5,2),
    
    -- User-specific data (not overrides)
    personal_notes TEXT,
    personal_rating DECIMAL(3,1) CHECK (personal_rating >= 0 AND personal_rating <= 5),
    is_favorite BOOLEAN DEFAULT false,
    times_used INTEGER DEFAULT 0,
    last_used_date TIMESTAMP WITH TIME ZONE,
    purchase_date TIMESTAMP WITH TIME ZONE,
    expiry_date DATE,
    
    -- Inventory tracking
    quantity_on_hand DECIMAL(10,2),
    quantity_unit VARCHAR(20) DEFAULT 'oz',
    reorder_point DECIMAL(10,2),
    location VARCHAR(255),
    
    -- Performance notes
    performance_in_cp_soap TEXT,
    performance_in_mp_soap TEXT,
    performance_in_candles TEXT,
    performance_in_lotions TEXT,
    discoloration_notes TEXT,
    acceleration_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, fragrance_oil_id)
);

-- =====================================================
-- USER BASE PRODUCT OVERRIDES
-- =====================================================
CREATE TABLE IF NOT EXISTS user_base_product_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    base_product_id UUID NOT NULL,
    
    -- Custom Technical Properties
    custom_max_load_pct DECIMAL(5,2),
    custom_specific_gravity DECIMAL(5,3),
    
    -- Custom Pricing
    custom_price_per_unit DECIMAL(10,2),
    custom_price_unit VARCHAR(20),
    
    -- Custom IFRA for dual-purpose bases
    custom_ifra_category VARCHAR(20),
    custom_ifra_category_2 VARCHAR(20),
    
    -- User-specific data
    personal_notes TEXT,
    personal_rating DECIMAL(3,1) CHECK (personal_rating >= 0 AND personal_rating <= 5),
    is_favorite BOOLEAN DEFAULT false,
    times_used INTEGER DEFAULT 0,
    last_used_date TIMESTAMP WITH TIME ZONE,
    
    -- Inventory tracking
    quantity_on_hand DECIMAL(10,2),
    quantity_unit VARCHAR(20) DEFAULT 'lb',
    reorder_point DECIMAL(10,2),
    location VARCHAR(255),
    
    -- Performance notes
    ease_of_use_notes TEXT,
    performance_notes TEXT,
    mixing_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, base_product_id)
);

-- =====================================================
-- USER VESSEL OVERRIDES
-- =====================================================
CREATE TABLE IF NOT EXISTS user_vessel_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    vessel_id UUID NOT NULL,
    
    -- Custom Pricing (user's actual cost)
    custom_price_per_unit DECIMAL(10,2),
    custom_case_price DECIMAL(10,2),
    custom_minimum_order_quantity INTEGER,
    
    -- User-specific data
    personal_notes TEXT,
    personal_rating DECIMAL(3,1) CHECK (personal_rating >= 0 AND personal_rating <= 5),
    is_favorite BOOLEAN DEFAULT false,
    times_used INTEGER DEFAULT 0,
    last_used_date TIMESTAMP WITH TIME ZONE,
    
    -- Inventory tracking
    quantity_on_hand INTEGER,
    quantity_unit VARCHAR(20) DEFAULT 'units',
    reorder_point INTEGER,
    location VARCHAR(255),
    
    -- Usage notes
    works_well_with TEXT,
    labeling_notes TEXT,
    filling_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, vessel_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_user_oil_overrides ON user_fragrance_oil_overrides(user_id, fragrance_oil_id);
CREATE INDEX idx_user_oil_favorites ON user_fragrance_oil_overrides(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_user_oil_last_used ON user_fragrance_oil_overrides(user_id, last_used_date);

CREATE INDEX idx_user_base_overrides ON user_base_product_overrides(user_id, base_product_id);
CREATE INDEX idx_user_base_favorites ON user_base_product_overrides(user_id, is_favorite) WHERE is_favorite = true;

CREATE INDEX idx_user_vessel_overrides ON user_vessel_overrides(user_id, vessel_id);
CREATE INDEX idx_user_vessel_favorites ON user_vessel_overrides(user_id, is_favorite) WHERE is_favorite = true;

-- =====================================================
-- UPDATE TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_override_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_oil_overrides_updated_at 
    BEFORE UPDATE ON user_fragrance_oil_overrides
    FOR EACH ROW EXECUTE FUNCTION update_user_override_updated_at();

CREATE TRIGGER update_user_base_overrides_updated_at 
    BEFORE UPDATE ON user_base_product_overrides
    FOR EACH ROW EXECUTE FUNCTION update_user_override_updated_at();

CREATE TRIGGER update_user_vessel_overrides_updated_at 
    BEFORE UPDATE ON user_vessel_overrides
    FOR EACH ROW EXECUTE FUNCTION update_user_override_updated_at();