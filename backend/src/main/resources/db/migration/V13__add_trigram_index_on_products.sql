CREATE INDEX idx_products_name_trgm 
ON products USING gin (name gin_trgm_ops); -- gin_trgm_ops là toán tử đặc biệt của trigram
