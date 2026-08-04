-- Backfill legacy product specs JSON into the columns used by the current API.
-- Older seed/import data stored laptop specs in products.specs, while the
-- Product entity now exposes dedicated product and variant columns.

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS cpu VARCHAR(255),
    ADD COLUMN IF NOT EXISTS gpu VARCHAR(255),
    ADD COLUMN IF NOT EXISTS display VARCHAR(255),
    ADD COLUMN IF NOT EXISTS battery VARCHAR(255),
    ADD COLUMN IF NOT EXISTS weight VARCHAR(255),
    ADD COLUMN IF NOT EXISTS os VARCHAR(255);

ALTER TABLE product_variants
    ADD COLUMN IF NOT EXISTS ram VARCHAR(50),
    ADD COLUMN IF NOT EXISTS rom VARCHAR(50);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'products'
          AND column_name = 'specs'
    ) THEN
        UPDATE products
        SET cpu = COALESCE(NULLIF(cpu, ''), NULLIF(specs ->> 'cpu', ''), NULLIF(specs ->> 'processor', ''), NULLIF(specs ->> 'bo_xu_ly', '')),
            gpu = COALESCE(NULLIF(gpu, ''), NULLIF(specs ->> 'gpu', ''), NULLIF(specs ->> 'graphics', ''), NULLIF(specs ->> 'do_hoa', '')),
            display = COALESCE(NULLIF(display, ''), NULLIF(specs ->> 'display', ''), NULLIF(specs ->> 'screen', ''), NULLIF(specs ->> 'man_hinh', '')),
            battery = COALESCE(NULLIF(battery, ''), NULLIF(specs ->> 'battery', ''), NULLIF(specs ->> 'pin', '')),
            weight = COALESCE(NULLIF(weight, ''), NULLIF(specs ->> 'weight', ''), NULLIF(specs ->> 'can_nang', '')),
            os = COALESCE(NULLIF(os, ''), NULLIF(specs ->> 'os', ''), NULLIF(specs ->> 'he_dieu_hanh', ''))
        WHERE specs IS NOT NULL;

        UPDATE product_variants pv
        SET ram = COALESCE(NULLIF(pv.ram, ''), NULLIF(p.specs ->> 'ram', ''), NULLIF(p.specs ->> 'memory', '')),
            rom = COALESCE(NULLIF(pv.rom, ''), NULLIF(p.specs ->> 'rom', ''), NULLIF(p.specs ->> 'storage', ''), NULLIF(p.specs ->> 'ssd', ''))
        FROM products p
        WHERE pv.product_id = p.id
          AND p.specs IS NOT NULL;
    END IF;
END $$;
