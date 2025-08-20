# Setup Extended Fragrance Oil Fields

To support all the fields from the import template, you need to add these columns to your Supabase database.

## Steps to Add Columns

1. **Go to your Supabase Dashboard**
   - Navigate to your Product Data project: https://djffqywhousbhdmibuek.supabase.co
   - Go to the SQL Editor

2. **Run this SQL migration**:

```sql
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
```

3. **Click "Run" to execute the migration**

## Fields Added

### Technical Properties
- **discoloration** - Color changes in products
- **ethyl_vanillin** - Ethyl vanillin percentage (separate from vanillin_pct)

### Descriptive Fields
- **categories** - Fragrance categories/tags
- **scent_description** - Full description of the scent
- **is_favorite** - Mark as favorite

### Ratings (1-5 scale)
- **scent_strength_rating** - Overall scent strength
- **cold_throw_rating** - Scent throw when cold
- **hot_throw_rating** - Scent throw when heated

### Soap-Making Properties
- **acceleration** - Acceleration behavior in soap
- **ricing** - Ricing behavior in soap
- **separation** - Separation behavior in soap

### Fragrance Notes
- **top_notes** - Initial scent notes
- **middle_notes** - Heart/middle notes
- **base_notes** - Base/bottom notes

### Additional Information
- **blends_well_with** - Other fragrances that blend well
- **usage_notes** - Special usage instructions or notes

### Documentation
- **ifra_url** - URL to IFRA certificate
- **sds_url** - URL to SDS document
- **image_url** - URL to product image

## After Adding Columns

Once you've added these columns to the database, the import will automatically support all these fields from your CSV template.