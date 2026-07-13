-- V26__add_image_to_categories.sql
-- Thêm cột image_url (nếu chưa có) và gán path ảnh local từ uploads/categories/*

ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

COMMENT ON COLUMN categories.image_url IS 'Đường dẫn hình ảnh đại diện / icon của category';

CREATE INDEX IF NOT EXISTS idx_categories_image_url ON categories(image_url);

-- Map slug seed (V3) → file trong uploads/categories/
UPDATE categories SET image_url = CASE slug
    WHEN 'laptop-gaming'      THEN '/uploads/categories/categories_laptop_gaming.webp'
    WHEN 'laptop-van-phong'   THEN '/uploads/categories/categories_laptop_van_phong.webp'
    WHEN 'ultrabook-mong-nhe' THEN '/uploads/categories/categories_ultrabook_mong_nhe.jpg'
    WHEN 'laptop-do-hoa'      THEN '/uploads/categories/categories_laptop_do_hoa.jpg'
    WHEN 'laptop-doanh-nhan'  THEN '/uploads/categories/categories_laptop_doanh_nhan.webp'
    WHEN 'laptop-sinh-vien'   THEN '/uploads/categories/categories_laptop_sinh_vien.jpg'
    ELSE image_url
END
WHERE slug IN (
    'laptop-gaming',
    'laptop-van-phong',
    'ultrabook-mong-nhe',
    'laptop-do-hoa',
    'laptop-doanh-nhan',
    'laptop-sinh-vien'
);
