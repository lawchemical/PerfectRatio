-- Add extended fields to fragrance_oils table
-- These fields support comprehensive fragrance information including scent profiles, 
-- soap-making properties, ratings, and documentation

-- Add discoloration field
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS discoloration TEXT;

-- Add categories field for fragrance categories/tags
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS categories TEXT;

-- Add scent description
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS scent_description TEXT;

-- Add favorite flag
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- Add rating fields
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS scent_strength_rating DECIMAL(3,2);
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS cold_throw_rating DECIMAL(3,2);
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS hot_throw_rating DECIMAL(3,2);

-- Add soap-making properties
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS acceleration TEXT;
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS ricing TEXT;
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS separation TEXT;

-- Add fragrance notes (in addition to any existing fragrance_notes relationship)
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS top_notes TEXT;
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS middle_notes TEXT;
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS base_notes TEXT;

-- Add blending and usage information
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS blends_well_with TEXT;
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS usage_notes TEXT;

-- Add document URLs
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS ifra_url TEXT;
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS sds_url TEXT;
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add ethyl_vanillin field if missing (separate from vanillin_pct)
ALTER TABLE fragrance_oils ADD COLUMN IF NOT EXISTS ethyl_vanillin DECIMAL(10,4);