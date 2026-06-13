-- Index trigram cu tao tren cot `name` (V13) khong duoc query search su dung,
-- vi ProductRepository.search loc theo LOWER(p.name) LIKE LOWER(...).
-- Khi cot bi boc trong ham LOWER(), Postgres khong dung duoc index tren `name`.
-- => Thay bang functional index tren lower(name) de search case-insensitive
--    co the tan dung pg_trgm (GIN).
DROP INDEX IF EXISTS idx_products_name_trgm;

CREATE INDEX idx_products_name_lower_trgm
    ON products USING gin (lower(name) gin_trgm_ops);
