-- V25__update_category_images.sql
-- Đảm bảo cột image_url tồn tại trước khi gán path (tránh fail nếu V26 chưa chạy trên DB cũ).
-- Path ảnh local chính thức nằm ở V26; V25 giữ idempotent fallback cùng path.

ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

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
