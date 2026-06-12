-- Add user_id to order_histories to match the current OrderHistory entity
-- which declares a required @ManyToOne to User (for direct "my history" queries
-- and repository findByUserId without always joining through orders).

-- This column was missing from V1 schema and no prior migration added it.
-- The entity was updated but schema and seed were not.

ALTER TABLE order_histories
    ADD COLUMN IF NOT EXISTS user_id INTEGER;

-- Backfill user_id from the parent order (safe even if some rows existed before)
UPDATE order_histories oh
SET user_id = o.user_id
FROM orders o
WHERE oh.order_id = o.id
  AND oh.user_id IS NULL;

-- Enforce NOT NULL to match the entity (@JoinColumn nullable = false)
ALTER TABLE order_histories
    ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key
ALTER TABLE order_histories
    ADD CONSTRAINT fk_order_histories_user
        FOREIGN KEY (user_id) REFERENCES users (id);

-- Helpful index for the user-scoped history queries
CREATE INDEX IF NOT EXISTS idx_order_histories_user_id ON order_histories (user_id);
