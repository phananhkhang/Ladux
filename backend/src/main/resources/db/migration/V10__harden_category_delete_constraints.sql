-- 1. FK từ products -> categories (nếu chưa có hoặc cần sửa)
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS fk_products_category;

ALTER TABLE products 
ADD CONSTRAINT fk_products_category 
FOREIGN KEY (category_id) 
REFERENCES categories(id) 
ON DELETE RESTRICT;           -- Mặc định là RESTRICT, nhưng viết rõ để chắc

-- 2. Self-referencing cho category con (parent_id)
ALTER TABLE categories 
DROP CONSTRAINT IF EXISTS fk_category_parent;

ALTER TABLE categories 
ADD CONSTRAINT fk_category_parent 
FOREIGN KEY (parent_id) 
REFERENCES categories(id) 
ON DELETE RESTRICT;

-- Tăng tốc kiểm tra existsByCategoryId và existsByParentId
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);