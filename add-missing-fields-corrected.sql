-- ============================================
-- CORRECTED Migration Script: Add Missing Fields
-- Run this on your Supabase product-info database
-- ============================================

-- Your database already has most fields! Just need to add a few missing ones:

-- ============================================
-- BASE PRODUCTS - Add missing tracking fields
-- ============================================

ALTER TABLE base_products
ADD COLUMN IF NOT EXISTS library_add_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS batch_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS base_type CHARACTER VARYING(50);

-- ============================================
-- FRAGRANCE OILS - Add missing fields
-- ============================================

ALTER TABLE fragrance_oils
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS categories TEXT;  -- For category tags like "Gourmand,Holiday"

-- ============================================
-- IFRA ENTRIES - Add category_id column for new format
-- ============================================

-- Add category_id column to support both old and new format
ALTER TABLE ifra_entries
ADD COLUMN IF NOT EXISTS category_id CHARACTER VARYING(50);

-- Update existing entries to populate category_id from product_type_key
UPDATE ifra_entries 
SET category_id = 
    CASE 
        WHEN product_type_key = 'lip_products' THEN 'Category 1'
        WHEN product_type_key = 'deodorant' THEN 'Category 2'
        WHEN product_type_key = 'eye_products' THEN 'Category 3'
        WHEN product_type_key = 'perfume' THEN 'Category 4'
        WHEN product_type_key = 'body_lotion' THEN 'Category 5A'
        WHEN product_type_key = 'face_cream' THEN 'Category 5B'
        WHEN product_type_key = 'hand_cream' THEN 'Category 5C'
        WHEN product_type_key = 'baby_cream' THEN 'Category 5D'
        WHEN product_type_key = 'mouthwash' THEN 'Category 6'
        WHEN product_type_key = 'hair_rinse' THEN 'Category 7A'
        WHEN product_type_key = 'hair_leave_in' THEN 'Category 7B'
        WHEN product_type_key = 'intimate_wipes' THEN 'Category 8'
        WHEN product_type_key = 'soap' THEN 'Category 9'
        WHEN product_type_key = 'household_cleaners' THEN 'Category 10A'
        WHEN product_type_key = 'air_freshener' THEN 'Category 10B'
        WHEN product_type_key = 'diapers' THEN 'Category 11A'
        WHEN product_type_key = 'scented_clothing' THEN 'Category 11B'
        WHEN product_type_key = 'candles' THEN 'Category 12'
        ELSE product_type_key  -- Keep original if no mapping
    END
WHERE category_id IS NULL;

-- ============================================
-- VESSELS - Add missing fields
-- ============================================

ALTER TABLE vessels
ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS case_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS case_price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS minimum_order_quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS weight_grams NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS is_in_library BOOLEAN DEFAULT FALSE;

-- ============================================
-- SUPPLIERS - Add missing field
-- ============================================

ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS website TEXT;

-- ============================================
-- Create indexes for better performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_base_products_supplier_id ON base_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_fragrance_oils_supplier_id ON fragrance_oils(supplier_id);
CREATE INDEX IF NOT EXISTS idx_vessels_supplier_id ON vessels(supplier_id);
CREATE INDEX IF NOT EXISTS idx_ifra_entries_fragrance_oil_id ON ifra_entries(fragrance_oil_id);
CREATE INDEX IF NOT EXISTS idx_ifra_entries_category_id ON ifra_entries(category_id);

-- ============================================
-- Verify the changes
-- ============================================

-- Check that all columns were added successfully
SELECT 
    'base_products' as table_name,
    EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'base_products' 
            AND column_name = 'library_add_count') as has_library_add_count,
    EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'base_products' 
            AND column_name = 'batch_count') as has_batch_count,
    EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'base_products' 
            AND column_name = 'base_type') as has_base_type
UNION ALL
SELECT 
    'fragrance_oils',
    EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'fragrance_oils' 
            AND column_name = 'is_favorite') as has_is_favorite,
    EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'fragrance_oils' 
            AND column_name = 'categories') as has_categories,
    NULL
UNION ALL
SELECT 
    'vessels',
    EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'vessels' 
            AND column_name = 'price_per_unit') as has_price_per_unit,
    EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'vessels' 
            AND column_name = 'is_in_library') as has_is_in_library,
    NULL;

-- Show summary
SELECT 'Migration completed! Added missing fields to support full import functionality.' as status;