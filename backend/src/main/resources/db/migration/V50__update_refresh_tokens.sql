-- Migration: V50__update_refresh_tokens.sql
-- Description: Update refresh_tokens table for token hashing, token family hierarchy, and reuse detection.

-- 1) Rename column token to token_hash if it exists, preserving existing data and unique constraints
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'refresh_tokens'
          AND column_name = 'token'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'refresh_tokens'
          AND column_name = 'token_hash'
    ) THEN
        ALTER TABLE refresh_tokens RENAME COLUMN token TO token_hash;
    END IF;
END $$;

-- 2) Rename existing unique constraint to match token_hash if present
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        WHERE t.relname = 'refresh_tokens'
          AND c.conname = 'refresh_tokens_token_key'
    ) THEN
        ALTER TABLE refresh_tokens RENAME CONSTRAINT refresh_tokens_token_key TO refresh_tokens_token_hash_key;
    END IF;
END $$;

-- 3) Ensure token_hash column exists with VARCHAR(200)
ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS token_hash VARCHAR(200);

-- 4) Ensure unique constraint on token_hash exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        WHERE t.relname = 'refresh_tokens'
          AND (c.conname = 'refresh_tokens_token_hash_key'
               OR c.conname = 'refresh_tokens_token_key'
               OR c.conname = 'uq_refresh_tokens_token_hash')
    ) THEN
        ALTER TABLE refresh_tokens ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);
    END IF;
END $$;

-- 5) Add new columns for token family tracking and reuse detection
ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS family_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS parent_id BIGINT,
    ADD COLUMN IF NOT EXISTS replace_by_token_id BIGINT,
    ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE;

-- 6) Backfill family_id for existing tokens if null to ensure rotation/reuse logic works
UPDATE refresh_tokens
SET family_id = md5(id::text || created_at::text)
WHERE family_id IS NULL;

-- 7) Add performance indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family_id ON refresh_tokens (family_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_parent_id ON refresh_tokens (parent_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_replace_by_token_id ON refresh_tokens (replace_by_token_id);
