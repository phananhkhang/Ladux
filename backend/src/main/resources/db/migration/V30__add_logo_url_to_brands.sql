-- Add logo_url column back to brands table
ALTER TABLE brands ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255);

-- Ensure order_items has product_variant_id column matching OrderItem entity
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_variant_id INT REFERENCES product_variants(id);
