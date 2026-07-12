-- Cập nhật URL ảnh sản phẩm seed về file tĩnh local (/uploads/products/*).
-- Idempotent: an toàn khi chạy lại trên DB đã seed (V3) hoặc đã link sẵn.

UPDATE products SET thumbnail = '/uploads/products/laptop-apple-macbook-air-m3-13.webp', slug = 'laptop-apple-macbook-air-m3-13' WHERE id = 1;
UPDATE products SET thumbnail = '/uploads/products/laptop-gaming-lenovo-legion-5-pro-16.jpg', slug = 'laptop-gaming-lenovo-legion-5-pro-16' WHERE id = 2;
UPDATE products SET thumbnail = '/uploads/products/laptop-do-hoa-dell-precision-5680.webp', slug = 'laptop-do-hoa-dell-precision-5680' WHERE id = 3;
UPDATE products SET thumbnail = '/uploads/products/laptop-van-phong-hp-probook-450-g10.jpg', slug = 'laptop-van-phong-hp-probook-450-g10' WHERE id = 4;
UPDATE products SET thumbnail = '/uploads/products/laptop-gaming-asus-tuf-gaming-f15.png', slug = 'laptop-gaming-asus-tuf-gaming-f15' WHERE id = 5;
UPDATE products SET thumbnail = '/uploads/products/laptop-sinh-vien-acer-aspire-7-a715.jpg', slug = 'laptop-sinh-vien-acer-aspire-7-a715' WHERE id = 6;
UPDATE products SET thumbnail = '/uploads/products/workstation-msi-creator-z16.jpg', slug = 'workstation-msi-creator-z16' WHERE id = 7;
UPDATE products SET thumbnail = '/uploads/products/gaming-cao-cap-razer-blade-16.jpg', slug = 'gaming-cao-cap-razer-blade-16' WHERE id = 8;
UPDATE products SET thumbnail = '/uploads/products/ultrabook-samsung-galaxy-book-4.png', slug = 'ultrabook-samsung-galaxy-book-4' WHERE id = 9;
UPDATE products SET thumbnail = '/uploads/products/msi-thin-15-b13uc.webp', slug = 'msi-thin-15-b13uc' WHERE id = 10;
UPDATE products SET thumbnail = '/uploads/products/laptop-doanh-nhan-microsoft-surface-laptop-6.png', slug = 'laptop-doanh-nhan-microsoft-surface-laptop-6' WHERE id = 11;
UPDATE products SET thumbnail = '/uploads/products/acer-aspire-5.jpg', slug = 'acer-aspire-5' WHERE id = 12;

UPDATE product_images SET image_url = '/uploads/products/laptop-apple-macbook-air-m3-13.webp' WHERE id = 1;
UPDATE product_images SET image_url = '/uploads/products/laptop-gaming-lenovo-legion-5-pro-16.jpg' WHERE id = 2;
UPDATE product_images SET image_url = '/uploads/products/laptop-do-hoa-dell-precision-5680.webp' WHERE id = 3;
UPDATE product_images SET image_url = '/uploads/products/laptop-van-phong-hp-probook-450-g10.jpg' WHERE id = 4;
UPDATE product_images SET image_url = '/uploads/products/laptop-gaming-asus-tuf-gaming-f15.png' WHERE id = 5;
UPDATE product_images SET image_url = '/uploads/products/laptop-sinh-vien-acer-aspire-7-a715.jpg' WHERE id = 6;
UPDATE product_images SET image_url = '/uploads/products/workstation-msi-creator-z16.jpg' WHERE id = 7;
UPDATE product_images SET image_url = '/uploads/products/gaming-cao-cap-razer-blade-16.jpg' WHERE id = 8;
UPDATE product_images SET image_url = '/uploads/products/ultrabook-samsung-galaxy-book-4.png' WHERE id = 9;
UPDATE product_images SET image_url = '/uploads/products/msi-thin-15-b13uc.webp' WHERE id = 10;
UPDATE product_images SET image_url = '/uploads/products/laptop-doanh-nhan-microsoft-surface-laptop-6.png' WHERE id = 11;
UPDATE product_images SET image_url = '/uploads/products/acer-aspire-5.jpg' WHERE id = 12;
