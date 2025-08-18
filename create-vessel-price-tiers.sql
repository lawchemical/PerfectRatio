-- Create vessel_price_tiers table to match oil_price_tiers and base_price_tiers
-- This table stores pricing tiers for vessels with support for 5 tiers
-- Each tier includes size, unit, price, name, and SKU

CREATE TABLE IF NOT EXISTS public.vessel_price_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  vessel_id UUID NULL,
  tier1_size NUMERIC(10, 2) NULL,
  tier1_unit VARCHAR(20) NULL,
  tier1_price NUMERIC(10, 2) NULL,
  tier1_name VARCHAR(100) NULL,
  tier1_sku VARCHAR(50) NULL,
  tier2_size NUMERIC(10, 2) NULL,
  tier2_unit VARCHAR(20) NULL,
  tier2_price NUMERIC(10, 2) NULL,
  tier2_name VARCHAR(100) NULL,
  tier2_sku VARCHAR(50) NULL,
  tier3_size NUMERIC(10, 2) NULL,
  tier3_unit VARCHAR(20) NULL,
  tier3_price NUMERIC(10, 2) NULL,
  tier3_name VARCHAR(100) NULL,
  tier3_sku VARCHAR(50) NULL,
  tier4_size NUMERIC(10, 2) NULL,
  tier4_unit VARCHAR(20) NULL,
  tier4_price NUMERIC(10, 2) NULL,
  tier4_name VARCHAR(100) NULL,
  tier4_sku VARCHAR(50) NULL,
  tier5_size NUMERIC(10, 2) NULL,
  tier5_unit VARCHAR(20) NULL,
  tier5_price NUMERIC(10, 2) NULL,
  tier5_name VARCHAR(100) NULL,
  tier5_sku VARCHAR(50) NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT vessel_price_tiers_pkey PRIMARY KEY (id),
  CONSTRAINT vessel_price_tiers_vessel_id_fkey FOREIGN KEY (vessel_id) 
    REFERENCES vessels (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create index for vessel_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_vessel_price_tiers_vessel 
  ON public.vessel_price_tiers USING btree (vessel_id) TABLESPACE pg_default;