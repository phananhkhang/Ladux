-- V41__update_brand_and_category_image_urls.sql
-- Cập nhật đường dẫn logo cho Brands và hình ảnh đại diện cho Categories từ uploads/

UPDATE brands SET logo_url = CASE slug
    WHEN 'apple'     THEN '/uploads/brands/Apple_logo.svg'
    WHEN 'lenovo'    THEN '/uploads/brands/Lenovo_logo.png'
    WHEN 'dell'      THEN '/uploads/brands/Dell_logo.svg.webp'
    WHEN 'hp'        THEN '/uploads/brands/Hp_logo.webp'
    WHEN 'asus'      THEN '/uploads/brands/Asus_logo.png'
    WHEN 'acer'      THEN '/uploads/brands/Acer_logo.png'
    WHEN 'msi'       THEN '/uploads/brands/MSI_logo.jpg'
    WHEN 'razer'     THEN '/uploads/brands/Razer_logo.png'
    WHEN 'samsung'   THEN '/uploads/brands/Samsung_logo.svg'
    WHEN 'lg'        THEN '/uploads/brands/Lg_logo.webp'
    WHEN 'microsoft' THEN '/uploads/brands/Microsoft_logo.webp'
    WHEN 'huawei'    THEN '/uploads/brands/Huawei_logo.webp'
    ELSE logo_url
END;

UPDATE categories SET image_url = CASE slug
    WHEN 'laptop-gaming'      THEN '/uploads/categories/categories_laptop_gaming.webp'
    WHEN 'laptop-van-phong'   THEN '/uploads/categories/categories_laptop_van_phong.webp'
    WHEN 'ultrabook-mong-nhe' THEN '/uploads/categories/categories_ultrabook_mong_nhe.jpg'
    WHEN 'laptop-do-hoa'      THEN '/uploads/categories/categories_laptop_do_hoa.png'
    WHEN 'laptop-doanh-nhan'  THEN '/uploads/categories/categories_laptop_doanh_nhan.webp'
    WHEN 'laptop-sinh-vien'   THEN '/uploads/categories/categories_laptop_sinh_vien.jpg'
    ELSE image_url
END;
