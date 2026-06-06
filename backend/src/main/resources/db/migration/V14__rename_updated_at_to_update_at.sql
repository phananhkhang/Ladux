DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['products', 'orders', 'coupons', 'users', 'payments']
    LOOP
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns c
            WHERE c.table_schema = 'public'
              AND c.table_name = t
              AND c.column_name = 'updated_at'
        ) AND NOT EXISTS (
            SELECT 1
            FROM information_schema.columns c
            WHERE c.table_schema = 'public'
              AND c.table_name = t
              AND c.column_name = 'update_at'
        ) THEN
            EXECUTE format('ALTER TABLE %I RENAME COLUMN updated_at TO update_at', t);
        END IF;
    END LOOP;
END $$;