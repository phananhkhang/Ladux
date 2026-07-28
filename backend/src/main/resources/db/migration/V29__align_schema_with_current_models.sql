-- ============================================================================
-- V29: Align database schema with the current JPA model package.
--
-- This migration finishes the ProductVariant refactor introduced by V28 and
-- adds columns required by the current Product/Order embeddable mappings.
-- It is intentionally forward-only and keeps legacy columns when harmless,
-- because Hibernate validation tolerates extra DB columns but fails on missing
-- mapped columns or incompatible foreign keys.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) COLORS + PRODUCT_VARIANTS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS colors (
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(255) NOT NULL UNIQUE,
    hex_code VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO colors (name, hex_code)
VALUES ('Default', '#000000')
ON CONFLICT DO NOTHING;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'product_variants'
          AND column_name = 'color'
    ) THEN
        INSERT INTO colors (name, hex_code)
        SELECT legacy_color.name,
               '#' || lpad(to_hex(1000 + row_number() OVER (ORDER BY legacy_color.name)::integer), 6, '0')
        FROM (
            SELECT DISTINCT trim(color) AS name
            FROM product_variants
            WHERE color IS NOT NULL
              AND trim(color) <> ''
        ) legacy_color
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

ALTER TABLE product_variants
    ADD COLUMN IF NOT EXISTS color_id INTEGER,
    ADD COLUMN IF NOT EXISTS ram VARCHAR(50),
    ADD COLUMN IF NOT EXISTS rom VARCHAR(50);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'product_variants'
          AND column_name = 'storage'
    ) THEN
        UPDATE product_variants
        SET rom = storage
        WHERE rom IS NULL
          AND storage IS NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'product_variants'
          AND column_name = 'color'
    ) THEN
        UPDATE product_variants pv
        SET color_id = c.id
        FROM colors c
        WHERE pv.color_id IS NULL
          AND c.name = trim(pv.color);
    END IF;
END $$;

UPDATE product_variants
SET color_id = (SELECT id FROM colors WHERE name = 'Default' ORDER BY id LIMIT 1)
WHERE color_id IS NULL;

ALTER TABLE product_variants
    ALTER COLUMN color_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'product_variants'
          AND constraint_name = 'fk_product_variants_color'
    ) THEN
        ALTER TABLE product_variants
            ADD CONSTRAINT fk_product_variants_color
                FOREIGN KEY (color_id) REFERENCES colors (id);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'product_variants'
          AND constraint_name = 'ck_product_variants_stock_quantity_non_negative'
    ) THEN
        ALTER TABLE product_variants
            ADD CONSTRAINT ck_product_variants_stock_quantity_non_negative
                CHECK (stock_quantity >= 0);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_product_variants_color_id
    ON product_variants (color_id);

-- Keep default variants for products that still do not have any variant.
INSERT INTO product_variants (
    id,
    product_id,
    sku,
    color_id,
    price,
    discount_price,
    stock_quantity,
    is_active
)
SELECT
    p.id,
    p.id,
    'PRODUCT-' || p.id || '-DEFAULT',
    (SELECT id FROM colors WHERE name = 'Default' ORDER BY id LIMIT 1),
    COALESCE(p.base_price, 0),
    p.discount_price,
    COALESCE(p.stock_quantity, 0),
    p.is_active
FROM products p
WHERE NOT EXISTS (
    SELECT 1
    FROM product_variants pv
    WHERE pv.product_id = p.id
)
  AND NOT EXISTS (
    SELECT 1
    FROM product_variants pv
    WHERE pv.id = p.id
)
ON CONFLICT DO NOTHING;

SELECT setval(
    pg_get_serial_sequence('product_variants', 'id'),
    COALESCE((SELECT MAX(id) FROM product_variants), 1)
);

-- ---------------------------------------------------------------------------
-- 2) PRODUCT columns mapped by the current Product entity.
-- ---------------------------------------------------------------------------
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS cpu VARCHAR(255),
    ADD COLUMN IF NOT EXISTS gpu VARCHAR(255),
    ADD COLUMN IF NOT EXISTS display VARCHAR(255),
    ADD COLUMN IF NOT EXISTS battery VARCHAR(255),
    ADD COLUMN IF NOT EXISTS weight VARCHAR(255),
    ADD COLUMN IF NOT EXISTS number_of_fans INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS os VARCHAR(255);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'products'
          AND column_name = 'update_at'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'products'
          AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE products RENAME COLUMN update_at TO updated_at;
    END IF;
END $$;

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

UPDATE products
SET number_of_fans = 0
WHERE number_of_fans IS NULL;

ALTER TABLE products
    ALTER COLUMN number_of_fans SET NOT NULL;

-- ---------------------------------------------------------------------------
-- 3) ORDER embedded ShippingAddress columns.
-- ---------------------------------------------------------------------------
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS carrier_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS shipping_receiver_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS shipping_street VARCHAR(255),
    ADD COLUMN IF NOT EXISTS shipping_ward VARCHAR(100),
    ADD COLUMN IF NOT EXISTS shipping_district VARCHAR(100),
    ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100);

UPDATE orders
SET shipping_receiver_name = COALESCE(NULLIF(shipping_receiver_name, ''), 'Unknown'),
    shipping_phone = COALESCE(NULLIF(shipping_phone, ''), '0000000000'),
    shipping_street = COALESCE(NULLIF(shipping_street, ''), NULLIF(shipping_address, ''), 'Unknown'),
    shipping_ward = COALESCE(NULLIF(shipping_ward, ''), 'Unknown'),
    shipping_district = COALESCE(NULLIF(shipping_district, ''), 'Unknown'),
    shipping_city = COALESCE(NULLIF(shipping_city, ''), 'Unknown');

ALTER TABLE orders
    ALTER COLUMN shipping_receiver_name SET NOT NULL,
    ALTER COLUMN shipping_phone SET NOT NULL,
    ALTER COLUMN shipping_street SET NOT NULL,
    ALTER COLUMN shipping_ward SET NOT NULL,
    ALTER COLUMN shipping_district SET NOT NULL,
    ALTER COLUMN shipping_city SET NOT NULL;

-- ---------------------------------------------------------------------------
-- 4) CartItem and OrderItem now map product_id to ProductVariant.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
         AND tc.table_name = kcu.table_name
        JOIN information_schema.constraint_column_usage ccu
          ON tc.constraint_name = ccu.constraint_name
         AND tc.table_schema = ccu.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = 'cart_items'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'product_id'
          AND ccu.table_name <> 'product_variants'
    LOOP
        EXECUTE format('ALTER TABLE cart_items DROP CONSTRAINT %I', r.constraint_name);
    END LOOP;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'cart_items'
          AND constraint_name = 'fk_cart_items_product_variant'
    ) THEN
        ALTER TABLE cart_items
            ADD CONSTRAINT fk_cart_items_product_variant
                FOREIGN KEY (product_id) REFERENCES product_variants (id);
    END IF;
END $$;

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
         AND tc.table_name = kcu.table_name
        JOIN information_schema.constraint_column_usage ccu
          ON tc.constraint_name = ccu.constraint_name
         AND tc.table_schema = ccu.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = 'order_items'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'product_id'
          AND ccu.table_name <> 'product_variants'
    LOOP
        EXECUTE format('ALTER TABLE order_items DROP CONSTRAINT %I', r.constraint_name);
    END LOOP;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'order_items'
          AND constraint_name = 'fk_order_items_product_variant'
    ) THEN
        ALTER TABLE order_items
            ADD CONSTRAINT fk_order_items_product_variant
                FOREIGN KEY (product_id) REFERENCES product_variants (id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cart_items_product_variant_id
    ON cart_items (product_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_variant_id
    ON order_items (product_id);
