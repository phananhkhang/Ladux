-- V31: Add shipping_fee and carrier_name columns to orders table if not exists

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS carrier_name VARCHAR(255);
