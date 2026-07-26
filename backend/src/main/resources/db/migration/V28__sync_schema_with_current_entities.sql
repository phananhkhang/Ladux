-- ============================================================================
-- V28: Sync schema with current JPA entities.
--
-- Main changes:
-- - ProductVariant is now the holder of SKU, price and stock.
-- - Notifications are persisted as a first-class entity.
-- - Several audit/payment/coupon/customer/supply-chain columns were added or
--   renamed in entities after earlier migrations.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) PRODUCT_VARIANTS - migrate legacy product SKU/price/stock into one
--    default variant per product. Keep variant id equal to product id so
--    existing supply-chain rows that referenced products can be repointed.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_variants (
    id             SERIAL PRIMARY KEY,
    product_id     INTEGER NOT NULL,
    sku            VARCHAR(50) NOT NULL UNIQUE,
    color          VARCHAR(50),
    storage        VARCHAR(50),
    price          NUMERIC(15, 2) NOT NULL,
    discount_price NUMERIC(15, 2),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_product_variants_product
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

INSERT INTO product_variants (
    id,
    product_id,
    sku,
    price,
    discount_price,
    stock_quantity,
    is_active
)
SELECT
    p.id,
    p.id,
    COALESCE(p.sku, 'PRODUCT-' || p.id),
    COALESCE(p.base_price, 0),
    p.discount_price,
    COALESCE(p.stock_quantity, 0),
    p.is_active
FROM products p
WHERE NOT EXISTS (
    SELECT 1
    FROM product_variants pv
    WHERE pv.product_id = p.id
);

SELECT setval(
    pg_get_serial_sequence('product_variants', 'id'),
    COALESCE((SELECT MAX(id) FROM product_variants), 1)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id
    ON product_variants (product_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_is_active
    ON product_variants (is_active);

-- Legacy product columns are now represented by product_variants. Keep them for
-- data compatibility, but make them optional so Product inserts only need the
-- columns mapped by the current entity.
ALTER TABLE products
    ALTER COLUMN sku DROP NOT NULL,
    ALTER COLUMN base_price DROP NOT NULL,
    ALTER COLUMN stock_quantity DROP NOT NULL;

ALTER TABLE products
    DROP COLUMN IF EXISTS thumbnail;

-- ---------------------------------------------------------------------------
-- 2) CATEGORY / COUPON / PAYMENT / REFRESH TOKEN / USER ADDRESS deltas.
-- ---------------------------------------------------------------------------
ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE coupons
    ADD COLUMN IF NOT EXISTS max_discount_amount NUMERIC(15, 2);

UPDATE customers
SET total_spent = 0
WHERE total_spent IS NULL;

ALTER TABLE customers
    ALTER COLUMN level TYPE VARCHAR(20),
    ALTER COLUMN total_spent SET DEFAULT 0,
    ALTER COLUMN total_spent SET NOT NULL;

ALTER TABLE refresh_tokens
    ALTER COLUMN token TYPE VARCHAR(200);

ALTER TABLE user_addresses
    ADD COLUMN IF NOT EXISTS ward VARCHAR(100);

UPDATE user_addresses
SET ward = ''
WHERE ward IS NULL;

ALTER TABLE user_addresses
    ALTER COLUMN ward SET NOT NULL,
    ALTER COLUMN phone SET NOT NULL,
    ALTER COLUMN street TYPE VARCHAR(100);

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS payment_url TEXT;

-- Earlier migrations used update_at for several tables; entities now map
-- updated_at.
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['orders', 'coupons', 'payments']
    LOOP
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = t
              AND column_name = 'update_at'
        ) AND NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = t
              AND column_name = 'updated_at'
        ) THEN
            EXECUTE format('ALTER TABLE %I RENAME COLUMN update_at TO updated_at', t);
        ELSIF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = t
              AND column_name = 'updated_at'
        ) THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP', t);
        END IF;
    END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3) NOTIFICATIONS.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL,
    title       VARCHAR(200) NOT NULL,
    message     TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    type        VARCHAR(50) NOT NULL,
    target_type VARCHAR(50),
    target_id   INTEGER,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at
    ON notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read
    ON notifications (user_id, is_read);

-- ---------------------------------------------------------------------------
-- 4) SUPPLY CHAIN alignment with ProductVariant and renamed User join columns.
-- ---------------------------------------------------------------------------
ALTER TABLE product_suppliers
    ALTER COLUMN id TYPE INTEGER;

ALTER TABLE purchase_orders
    ADD COLUMN IF NOT EXISTS received_date TIMESTAMP WITH TIME ZONE,
    ALTER COLUMN note TYPE TEXT,
    ALTER COLUMN total_amount SET DEFAULT 0;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'purchase_orders'
          AND column_name = 'created_by'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'purchase_orders'
          AND column_name = 'user_id'
    ) THEN
        ALTER TABLE purchase_orders RENAME COLUMN created_by TO user_id;
    END IF;
END $$;

UPDATE purchase_orders
SET user_id = (SELECT id FROM users ORDER BY id LIMIT 1)
WHERE user_id IS NULL
  AND EXISTS (SELECT 1 FROM users);

UPDATE purchase_orders
SET total_amount = 0
WHERE total_amount IS NULL;

ALTER TABLE purchase_orders
    ALTER COLUMN total_amount SET NOT NULL,
    ALTER COLUMN user_id SET NOT NULL;

UPDATE purchase_order_items
SET received_quantity = 0
WHERE received_quantity IS NULL;

ALTER TABLE purchase_order_items
    ALTER COLUMN received_quantity SET DEFAULT 0,
    ALTER COLUMN received_quantity SET NOT NULL,
    ALTER COLUMN note TYPE TEXT;

DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    SELECT tc.constraint_name
    INTO constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
     AND tc.table_name = kcu.table_name
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
     AND tc.table_schema = ccu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'purchase_order_items'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'product_id'
      AND ccu.table_name = 'products'
    LIMIT 1;

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE purchase_order_items DROP CONSTRAINT %I', constraint_name);
    END IF;
END $$;

ALTER TABLE purchase_order_items
    ADD CONSTRAINT fk_poi_product_variant
        FOREIGN KEY (product_id) REFERENCES product_variants (id);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'stock_movements'
          AND column_name = 'product_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'stock_movements'
          AND column_name = 'product_variant_id'
    ) THEN
        ALTER TABLE stock_movements RENAME COLUMN product_id TO product_variant_id;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'stock_movements'
          AND column_name = 'created_by'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'stock_movements'
          AND column_name = 'user_id'
    ) THEN
        ALTER TABLE stock_movements RENAME COLUMN created_by TO user_id;
    END IF;
END $$;

UPDATE stock_movements
SET user_id = (SELECT id FROM users ORDER BY id LIMIT 1)
WHERE user_id IS NULL
  AND EXISTS (SELECT 1 FROM users);

DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    SELECT tc.constraint_name
    INTO constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
     AND tc.table_name = kcu.table_name
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
     AND tc.table_schema = ccu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'stock_movements'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'product_variant_id'
      AND ccu.table_name = 'products'
    LIMIT 1;

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE stock_movements DROP CONSTRAINT %I', constraint_name);
    END IF;
END $$;

ALTER TABLE stock_movements
    ALTER COLUMN product_variant_id SET NOT NULL,
    ALTER COLUMN movement_type TYPE VARCHAR(80),
    ALTER COLUMN reference_type TYPE VARCHAR(80),
    ALTER COLUMN reference_id TYPE INTEGER,
    ALTER COLUMN note TYPE TEXT,
    ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE stock_movements
    ADD CONSTRAINT fk_sm_product_variant
        FOREIGN KEY (product_variant_id) REFERENCES product_variants (id);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_variant
    ON stock_movements (product_variant_id);

CREATE INDEX IF NOT EXISTS idx_stock_movements_user_id
    ON stock_movements (user_id);
