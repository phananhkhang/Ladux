-- V48: Add return_reason column to orders table for customer return requests
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_reason TEXT;
