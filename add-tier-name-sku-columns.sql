-- Add missing tier name and SKU columns to oil_price_tiers table
-- These columns are expected by the frontend but missing from the database

ALTER TABLE oil_price_tiers 
ADD COLUMN IF NOT EXISTS tier1_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS tier1_sku VARCHAR(50),
ADD COLUMN IF NOT EXISTS tier2_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS tier2_sku VARCHAR(50),
ADD COLUMN IF NOT EXISTS tier3_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS tier3_sku VARCHAR(50),
ADD COLUMN IF NOT EXISTS tier4_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS tier4_sku VARCHAR(50),
ADD COLUMN IF NOT EXISTS tier5_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS tier5_sku VARCHAR(50);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'oil_price_tiers' 
ORDER BY column_name;