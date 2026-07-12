-- Reset data and identity sequences
TRUNCATE TABLE
    user_roles,
	order_histories,
	order_items,
	payments,
	reviews,
	wishlists,
	cart_items,
	carts,
	product_images,
	products,
	orders,
	coupons,
	user_addresses,
	users,
	categories,
	brands,
	roles
RESTART IDENTITY CASCADE;

-- roles (enum values)
INSERT INTO roles (id, name) VALUES
                                 (1, 'ADMIN'),
                                 (2, 'CUSTOMER');

-- brands (12 rows, fixed ids)
INSERT INTO brands (id, name, slug, logo_url) VALUES
                                                  (1, 'Apple', 'apple', 'https://img.example.com/brand-apple.png'),
                                                  (2, 'Lenovo', 'lenovo', 'https://img.example.com/brand-lenovo.png'),
                                                  (3, 'Dell', 'dell', 'https://img.example.com/brand-dell.png'),
                                                  (4, 'HP', 'hp', 'https://img.example.com/brand-hp.png'),
                                                  (5, 'ASUS', 'asus', 'https://img.example.com/brand-asus.png'),
                                                  (6, 'Acer', 'acer', 'https://img.example.com/brand-acer.png'),
                                                  (7, 'MSI', 'msi', 'https://img.example.com/brand-msi.png'),
                                                  (8, 'Razer', 'razer', 'https://img.example.com/brand-razer.png'),
                                                  (9, 'Samsung', 'samsung', 'https://img.example.com/brand-samsung.png'),
                                                  (10, 'LG', 'lg', 'https://img.example.com/brand-lg.png'),
                                                  (11, 'Microsoft', 'microsoft', 'https://img.example.com/brand-microsoft.png'),
                                                  (12, 'Huawei', 'huawei', 'https://img.example.com/brand-huawei.png');

-- categories (10 rows)
INSERT INTO categories (id, name, slug, parent_id) VALUES
                                                       (1, 'Laptop Gaming', 'laptop-gaming', NULL),
                                                       (2, 'Laptop Văn Phòng', 'laptop-van-phong', NULL),
                                                       (3, 'Ultrabook Mỏng Nhẹ', 'ultrabook-mong-nhe', NULL),
                                                       (4, 'Laptop Đồ Họa', 'laptop-do-hoa', NULL),
                                                       (5, 'Laptop Doanh Nhân', 'laptop-doanh-nhan', 2),
                                                       (6, 'Laptop Sinh Viên', 'laptop-sinh-vien', 2),
                                                       (7, 'Gaming Cao Cấp', 'gaming-cao-cap', 1),
                                                       (8, 'Workstation Kỹ Thuật', 'workstation-ky-thuat', 4),
                                                       (9, 'Phụ Kiện Laptop', 'phu-kien-laptop', NULL),
                                                       (10, 'Màn Hình', 'man-hinh', NULL);

-- users (12 rows)
INSERT INTO users (id, email, username, password, full_name, phone, avatar, is_active, created_at) VALUES
                                                                                                       (1, 'admin@auratech.vn', 'admin', 'seed-disabled-' || md5(random()::text || clock_timestamp()::text || 'admin'), 'Quản Trị Hệ Thống', '0901000001', 'https://img.example.com/u01.png', true, '2026-05-01 08:00:00+00'),
                                                                                                       (2, 'quanghuy@auratech.vn', 'quang_huy', 'seed-disabled-' || md5(random()::text || clock_timestamp()::text || 'quang_huy'), 'Trần Quang Huy', '0901000002', 'https://img.example.com/u02.png', true, '2026-05-01 08:05:00+00'),
                                                                                                       (3, 'thuha@auratech.vn', 'thu_ha', 'seed-disabled-' || md5(random()::text || clock_timestamp()::text || 'thu_ha'), 'Lê Thu Hà', '0901000003', 'https://img.example.com/u03.png', true, '2026-05-01 08:10:00+00'),
                                                                                                       (4, 'giabao@auratech.vn', 'gia_bao', 'seed-disabled-' || md5(random()::text || clock_timestamp()::text || 'gia_bao'), 'Phạm Gia Bảo', '0901000004', 'https://img.example.com/u04.png', true, '2026-05-01 08:15:00+00'),
                                                                                                       (5, 'nhatnam@auratech.vn', 'nhat_nam', 'seed-disabled-' || md5(random()::text || clock_timestamp()::text || 'nhat_nam'), 'Võ Nhật Nam', '0901000005', 'https://img.example.com/u05.png', true, '2026-05-01 08:20:00+00'),
                                                                                                       (6, 'khanhlinh@auratech.vn', 'khanh_linh', 'seed-disabled-' || md5(random()::text || clock_timestamp()::text || 'khanh_linh'), 'Đỗ Khánh Linh', '0901000006', 'https://img.example.com/u06.png', true, '2026-05-01 08:25:00+00'),
                                                                                                       (7, 'anhtuan@auratech.vn', 'anh_tuan', 'seed-disabled-' || md5(random()::text || clock_timestamp()::text || 'anh_tuan'), 'Bùi Anh Tuấn', '0901000007', 'https://img.example.com/u07.png', true, '2026-05-01 08:30:00+00'),
                                                                                                       (8, 'thaovy@auratech.vn', 'thao_vy', 'seed-disabled-' || md5(random()::text || clock_timestamp()::text || 'thao_vy'), 'Hồ Thảo Vy', '0901000008', 'https://img.example.com/u08.png', true, '2026-05-01 08:35:00+00'),
                                                                                                       (9, 'duclong@auratech.vn', 'duc_long', 'seed-disabled-' || md5(random()::text || clock_timestamp()::text || 'duc_long'), 'Vũ Đức Long', '0901000009', 'https://img.example.com/u09.png', true, '2026-05-01 08:40:00+00'),
                                                                                                       (10, 'thimai@auratech.vn', 'thi_mai', 'seed-disabled-' || md5(random()::text || clock_timestamp()::text || 'thi_mai'), 'Nguyễn Thị Mai', '0901000010', 'https://img.example.com/u10.png', true, '2026-05-01 08:45:00+00'),
                                                                                                       (11, 'haidang@auratech.vn', 'hai_dang', 'seed-disabled-' || md5(random()::text || clock_timestamp()::text || 'hai_dang'), 'Trịnh Hải Đăng', '0901000011', 'https://img.example.com/u11.png', false, '2026-05-01 08:50:00+00'),
                                                                                                       (12, 'ngocanh@auratech.vn', 'ngoc_anh', 'seed-disabled-' || md5(random()::text || clock_timestamp()::text || 'ngoc_anh'), 'Phan Ngọc Ánh', '0901000012', 'https://img.example.com/u12.png', false, '2026-05-01 08:55:00+00');

-- user_roles (12 rows)
INSERT INTO user_roles (user_id, role_id) VALUES
                                              (1, 1),
                                              (2, 2),
                                              (3, 2),
                                              (4, 2),
                                              (5, 2),
                                              (6, 2),
                                              (7, 2),
                                              (8, 2),
                                              (9, 2),
                                              (10, 2),
                                              (11, 2),
                                              (12, 2);

-- products (12 rows)
INSERT INTO products
(id, brand_id, category_id, sku, name, slug, base_price, discount_price, stock_quantity, specs, thumbnail, is_active, created_at) VALUES
                                                                                                                                      (1, 1, 3, 'LAP-0001', 'Laptop Apple MacBook Air M3 13 inch', 'laptop-apple-macbook-air-m3-13', 2899.00, 2699.00, 25, '{"ram":"16GB","storage":"512GB","cpu":"Apple M3","man_hinh":"13.6 inch"}', 'https://img.example.com/p-01.png', true, '2026-05-01 09:00:00+00'),
                                                                                                                                      (2, 2, 1, 'LAP-0002', 'Laptop Gaming Lenovo Legion 5 Pro 16', 'laptop-gaming-lenovo-legion-5-pro-16', 2499.00, 2299.00, 18, '{"ram":"16GB","storage":"1TB","cpu":"Ryzen 7 7840H","man_hinh":"16 inch"}', 'https://img.example.com/p-02.png', true, '2026-05-01 09:05:00+00'),
                                                                                                                                      (3, 3, 4, 'LAP-0003', 'Laptop Đồ Họa Dell Precision 5680', 'laptop-do-hoa-dell-precision-5680', 3599.00, NULL, 10, '{"ram":"32GB","storage":"1TB","cpu":"Intel i7-13800H","gpu":"RTX 2000 Ada"}', 'https://img.example.com/p-03.png', true, '2026-05-01 09:10:00+00'),
                                                                                                                                      (4, 4, 2, 'LAP-0004', 'Laptop Văn Phòng HP ProBook 450 G10', 'laptop-van-phong-hp-probook-450-g10', 1899.00, 1749.00, 30, '{"ram":"16GB","storage":"512GB","cpu":"Intel i5-1340P","man_hinh":"15.6 inch"}', 'https://img.example.com/p-04.png', true, '2026-05-01 09:15:00+00'),
                                                                                                                                      (5, 5, 1, 'LAP-0005', 'Laptop Gaming ASUS TUF Gaming F15', 'laptop-gaming-asus-tuf-gaming-f15', 2199.00, 2099.00, 22, '{"ram":"16GB","storage":"512GB","cpu":"Intel i7-12700H","gpu":"RTX 4060"}', 'https://img.example.com/p-05.png', true, '2026-05-01 09:20:00+00'),
                                                                                                                                      (6, 6, 6, 'LAP-0006', 'Laptop Sinh Viên Acer Aspire 7 A715', 'laptop-sinh-vien-acer-aspire-7-a715', 1599.00, NULL, 40, '{"ram":"8GB","storage":"512GB","cpu":"Ryzen 5 7535HS","man_hinh":"15.6 inch"}', 'https://img.example.com/p-06.png', true, '2026-05-01 09:25:00+00'),
                                                                                                                                      (7, 7, 8, 'LAP-0007', 'Workstation MSI Creator Z16', 'workstation-msi-creator-z16', 3299.00, 3099.00, 12, '{"ram":"32GB","storage":"1TB","cpu":"Intel i9-13900H","gpu":"RTX 4070"}', 'https://img.example.com/p-07.png', true, '2026-05-01 09:30:00+00'),
                                                                                                                                      (8, 8, 7, 'LAP-0008', 'Gaming Cao Cấp Razer Blade 16', 'gaming-cao-cap-razer-blade-16', 4899.00, NULL, 6, '{"ram":"32GB","storage":"2TB","cpu":"Intel i9-13950HX","gpu":"RTX 4080"}', 'https://img.example.com/p-08.png', true, '2026-05-01 09:35:00+00'),
                                                                                                                                      (9, 9, 3, 'LAP-0009', 'Ultrabook Samsung Galaxy Book 4', 'ultrabook-samsung-galaxy-book-4', 2299.00, 2099.00, 16, '{"ram":"16GB","storage":"512GB","cpu":"Intel i7-1355U","man_hinh":"14 inch"}', 'https://img.example.com/p-09.png', true, '2026-05-01 09:40:00+00'),
                                                                                                                                      (10, 10, 10, 'MON-0010', 'MSI Thin 15 B13UC Thin 15 B13U', 'man-hinh-lg-ultragear-27', 699.00, 649.00, 35, '{"kich_thuoc":"27 inch","tan_so":"165Hz","tam_nen":"IPS"}', 'https://img.example.com/p-10.png', true, '2026-05-01 09:45:00+00'),
                                                                                                                                      (11, 11, 5, 'LAP-0011', 'Laptop Doanh Nhân Microsoft Surface Laptop 6', 'laptop-doanh-nhan-microsoft-surface-laptop-6', 2599.00, 2399.00, 14, '{"ram":"16GB","storage":"512GB","cpu":"Intel Core Ultra 7","man_hinh":"13.5 inch"}', 'https://img.example.com/p-11.png', true, '2026-05-01 09:50:00+00'),
                                                                                                                                      (12, 12, 9, 'PHU-0012', 'Acer Aspire 5', 'chuot-khong-day-huawei-multi-device', 399.00, 349.00, 80, '{"ket_noi":"Bluetooth 5.0","pin":"24 tháng","trong_luong":"85g"}', 'https://img.example.com/p-12.png', true, '2026-05-01 09:55:00+00');

-- product_images (12 rows)
INSERT INTO product_images (id, product_id, image_url, is_primary) VALUES
                                                                       (1, 1, 'https://img.example.com/p-01-1.png', true),
                                                                       (2, 2, 'https://img.example.com/p-02-1.png', true),
                                                                       (3, 3, 'https://img.example.com/p-03-1.png', true),
                                                                       (4, 4, 'https://img.example.com/p-04-1.png', true),
                                                                       (5, 5, 'https://img.example.com/p-05-1.png', true),
                                                                       (6, 6, 'https://img.example.com/p-06-1.png', true),
                                                                       (7, 7, 'https://img.example.com/p-07-1.png', true),
                                                                       (8, 8, 'https://img.example.com/p-08-1.png', true),
                                                                       (9, 9, 'https://img.example.com/p-09-1.png', true),
                                                                       (10, 10, 'https://img.example.com/p-10-1.png', true),
                                                                       (11, 11, 'https://img.example.com/p-11-1.png', true),
                                                                       (12, 12, 'https://img.example.com/p-12-1.png', true);

-- carts (12 rows)
INSERT INTO carts (id, user_id) VALUES
                                    (1, 1),
                                    (2, 2),
                                    (3, 3),
                                    (4, 4),
                                    (5, 5),
                                    (6, 6),
                                    (7, 7),
                                    (8, 8),
                                    (9, 9),
                                    (10, 10),
                                    (11, 11),
                                    (12, 12);

-- cart_items (12 rows)
INSERT INTO cart_items (id, cart_id, product_id, quantity) VALUES
                                                               (1, 1, 2, 1),
                                                               (2, 2, 4, 1),
                                                               (3, 3, 1, 1),
                                                               (4, 4, 5, 1),
                                                               (5, 5, 6, 2),
                                                               (6, 6, 3, 1),
                                                               (7, 7, 8, 1),
                                                               (8, 8, 9, 1),
                                                               (9, 9, 7, 1),
                                                               (10, 10, 10, 1),
                                                               (11, 11, 11, 1),
                                                               (12, 12, 12, 2);

-- coupons (12 rows)
INSERT INTO coupons (id, code, discount_type, discount_value, min_order_value, usage_limit, used_count, expires_at) VALUES
                                                                                                                        (1, 'GIAM10', 'PERCENT', 10.00, 0.00, 200, 5, '2026-12-31 23:59:59+00'),
                                                                                                                        (2, 'GIAM15', 'PERCENT', 15.00, 200.00, 150, 12, '2026-12-31 23:59:59+00'),
                                                                                                                        (3, 'GIAM20', 'PERCENT', 20.00, 300.00, 100, 8, '2026-12-31 23:59:59+00'),
                                                                                                                        (4, 'GIAM30', 'PERCENT', 30.00, 500.00, 80, 3, '2026-12-31 23:59:59+00'),
                                                                                                                        (5, 'TRU500', 'FIXED_AMOUNT', 500.00, 5000.00, 50, 4, '2026-12-31 23:59:59+00'),
                                                                                                                        (6, 'TRU300', 'FIXED_AMOUNT', 300.00, 3000.00, 70, 9, '2026-12-31 23:59:59+00'),
                                                                                                                        (7, 'GIAM5', 'PERCENT', 5.00, 0.00, 300, 20, '2026-12-31 23:59:59+00'),
                                                                                                                        (8, 'GIAM12', 'PERCENT', 12.00, 150.00, 180, 6, '2026-12-31 23:59:59+00'),
                                                                                                                        (9, 'FREESHIP', 'FIXED_AMOUNT', 50.00, 1000.00, 200, 40, '2026-12-31 23:59:59+00'),
                                                                                                                        (10, 'GIAM25', 'PERCENT', 25.00, 800.00, 60, 2, '2026-12-31 23:59:59+00'),
                                                                                                                        (11, 'TRU800', 'FIXED_AMOUNT', 800.00, 8000.00, 30, 1, '2026-12-31 23:59:59+00'),
                                                                                                                        (12, 'GIAM18', 'PERCENT', 18.00, 400.00, 90, 7, '2026-12-31 23:59:59+00');

-- orders (12 rows)
INSERT INTO orders
(id, user_id, coupon_id, sub_total, discount_amount, final_amount, status, shipping_address, tracking_number, created_at) VALUES
                                                                                                                              (1, 1, 1, 2899.00, 289.90, 2609.10, 'CONFIRMED', '12 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh', NULL, '2026-05-02 09:00:00+00'),
                                                                                                                              (2, 2, 2, 2499.00, 374.85, 2124.15, 'SHIPPED', '45 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội', 'VN0002', '2026-05-02 09:05:00+00'),
                                                                                                                              (3, 3, NULL, 3599.00, 0.00, 3599.00, 'PENDING', '88 Điện Biên Phủ, Hải Châu, Đà Nẵng', NULL, '2026-05-02 09:10:00+00'),
                                                                                                                              (4, 4, 7, 1899.00, 94.95, 1804.05, 'DELIVERED', '120 Trần Phú, Nha Trang, Khánh Hòa', 'VN0004', '2026-05-02 09:15:00+00'),
                                                                                                                              (5, 5, 3, 2199.00, 439.80, 1759.20, 'CONFIRMED', '25 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', NULL, '2026-05-02 09:20:00+00'),
                                                                                                                              (6, 6, NULL, 1599.00, 0.00, 1599.00, 'PENDING', '9 Cách Mạng Tháng 8, Quận 3, TP. Hồ Chí Minh', NULL, '2026-05-02 09:25:00+00'),
                                                                                                                              (7, 7, 10, 3299.00, 824.75, 2474.25, 'SHIPPED', '77 Lê Lợi, Hồng Bàng, Hải Phòng', 'VN0007', '2026-05-02 09:30:00+00'),
                                                                                                                              (8, 8, 4, 4899.00, 1469.70, 3429.30, 'CONFIRMED', '31 Phan Chu Trinh, Hoàn Kiếm, Hà Nội', NULL, '2026-05-02 09:35:00+00'),
                                                                                                                             (9, 9, NULL, 2299.00, 0.00, 2299.00, 'DELIVERED', '16 Trần Hưng Đạo, Ninh Kiều, Cần Thơ', 'VN0009', '2026-05-02 09:40:00+00'),
                                                                                                                              (10, 10, 9, 699.00, 50.00, 649.00, 'CONFIRMED', '52 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', NULL, '2026-05-02 09:45:00+00'),
                                                                                                                              (11, 11, 6, 2599.00, 300.00, 2299.00, 'PENDING', '6 Nguyễn Du, Hai Bà Trưng, Hà Nội', NULL, '2026-05-02 09:50:00+00'),
                                                                                                                              (12, 12, NULL, 399.00, 0.00, 399.00, 'CANCELLED', '101 Võ Văn Tần, Quận 3, TP. Hồ Chí Minh', NULL, '2026-05-02 09:55:00+00');

-- order_items (12 rows)
INSERT INTO order_items (id, order_id, product_id, quantity, price_at_purchase) VALUES
                                                                                    (1, 1, 1, 1, 2899.00),
                                                                                    (2, 2, 2, 1, 2499.00),
                                                                                    (3, 3, 3, 1, 3599.00),
                                                                                    (4, 4, 4, 1, 1899.00),
                                                                                    (5, 5, 5, 1, 2199.00),
                                                                                    (6, 6, 6, 1, 1599.00),
                                                                                    (7, 7, 7, 1, 3299.00),
                                                                                    (8, 8, 8, 1, 4899.00),
                                                                                    (9, 9, 9, 1, 2299.00),
                                                                                    (10, 10, 10, 1, 699.00),
                                                                                    (11, 11, 11, 1, 2599.00),
                                                                                    (12, 12, 12, 1, 399.00);

-- order_histories (12 rows)
INSERT INTO order_histories (id, order_id, status, description, created_at) VALUES
                                                                                (1, 1, 'CONFIRMED', 'Đơn hàng đã xác nhận.', '2026-05-02 09:00:00+00'),
                                                                                (2, 2, 'SHIPPED', 'Đơn hàng đang giao.', '2026-05-02 09:05:00+00'),
                                                                                (3, 3, 'PENDING', 'Đơn hàng đã tạo.', '2026-05-02 09:10:00+00'),
                                                                                (4, 4, 'DELIVERED', 'Đơn hàng đã giao.', '2026-05-02 09:15:00+00'),
                                                                                (5, 5, 'CONFIRMED', 'Đơn hàng đã xác nhận.', '2026-05-02 09:20:00+00'),
                                                                                (6, 6, 'PENDING', 'Đơn hàng đã tạo.', '2026-05-02 09:25:00+00'),
                                                                                (7, 7, 'SHIPPED', 'Đơn hàng đang giao.', '2026-05-02 09:30:00+00'),
                                                                                (8, 8, 'CONFIRMED', 'Đơn hàng đã xác nhận.', '2026-05-02 09:35:00+00'),
                                                                                (9, 9, 'DELIVERED', 'Đơn hàng đã giao.', '2026-05-02 09:40:00+00'),
                                                                                (10, 10, 'CONFIRMED', 'Đơn hàng đã xác nhận.', '2026-05-02 09:45:00+00'),
                                                                                (11, 11, 'PENDING', 'Đơn hàng đã tạo.', '2026-05-02 09:50:00+00'),
                                                                                (12, 12, 'CANCELLED', 'Đơn hàng đã hủy.', '2026-05-02 09:55:00+00');

-- payments (12 rows)
INSERT INTO payments (id, order_id, provider, transaction_no, amount, status, created_at) VALUES
                                                                                              (1, 1, 'VNPAY', 'VNP001', 2609.10, 'SUCCESS', '2026-05-02 09:00:00+00'),
                                                                                              (2, 2, 'VNPAY', 'VNP002', 2124.15, 'SUCCESS', '2026-05-02 09:05:00+00'),
                                                                                              (3, 3, 'COD', NULL, 3599.00, 'PENDING', '2026-05-02 09:10:00+00'),
                                                                                              (4, 4, 'VNPAY', 'VNP004', 1804.05, 'SUCCESS', '2026-05-02 09:15:00+00'),
                                                                                              (5, 5, 'MOMO', 'MOMO005', 1759.20, 'SUCCESS', '2026-05-02 09:20:00+00'),
                                                                                              (6, 6, 'COD', NULL, 1599.00, 'PENDING', '2026-05-02 09:25:00+00'),
                                                                                              (7, 7, 'VNPAY', 'VNP007', 2474.25, 'SUCCESS', '2026-05-02 09:30:00+00'),
                                                                                              (8, 8, 'VNPAY', 'VNP008', 3429.30, 'SUCCESS', '2026-05-02 09:35:00+00'),
                                                                                              (9, 9, 'COD', NULL, 2299.00, 'SUCCESS', '2026-05-02 09:40:00+00'),
                                                                                              (10, 10, 'MOMO', 'MOMO010', 649.00, 'SUCCESS', '2026-05-02 09:45:00+00'),
                                                                                              (11, 11, 'VNPAY', 'VNP011', 2299.00, 'PENDING', '2026-05-02 09:50:00+00'),
                                                                                              (12, 12, 'COD', NULL, 399.00, 'FAILED', '2026-05-02 09:55:00+00');

-- user_addresses (12 rows)
INSERT INTO user_addresses (id, user_id, receiver_name, phone, street, district, city, is_default) VALUES
                                                                                                       (1, 1, 'Quản Trị Hệ Thống', '0901000001', '12 Nguyễn Trãi', 'Quận 1', 'TP. Hồ Chí Minh', true),
                                                                                                       (2, 2, 'Trần Quang Huy', '0901000002', '45 Lý Thường Kiệt', 'Hoàn Kiếm', 'Hà Nội', true),
                                                                                                       (3, 3, 'Lê Thu Hà', '0901000003', '88 Điện Biên Phủ', 'Hải Châu', 'Đà Nẵng', true),
                                                                                                       (4, 4, 'Phạm Gia Bảo', '0901000004', '120 Trần Phú', 'Nha Trang', 'Khánh Hòa', true),
                                                                                                       (5, 5, 'Võ Nhật Nam', '0901000005', '25 Nguyễn Huệ', 'Quận 1', 'TP. Hồ Chí Minh', true),
                                                                                                       (6, 6, 'Đỗ Khánh Linh', '0901000006', '9 Cách Mạng Tháng 8', 'Quận 3', 'TP. Hồ Chí Minh', true),
                                                                                                       (7, 7, 'Bùi Anh Tuấn', '0901000007', '77 Lê Lợi', 'Hồng Bàng', 'Hải Phòng', true),
                                                                                                       (8, 8, 'Hồ Thảo Vy', '0901000008', '31 Phan Chu Trinh', 'Hoàn Kiếm', 'Hà Nội', true),
                                                                                                       (9, 9, 'Vũ Đức Long', '0901000009', '16 Trần Hưng Đạo', 'Ninh Kiều', 'Cần Thơ', true),
                                                                                                       (10, 10, 'Nguyễn Thị Mai', '0901000010', '52 Nguyễn Văn Linh', 'Hải Châu', 'Đà Nẵng', true),
                                                                                                       (11, 11, 'Trịnh Hải Đăng', '0901000011', '6 Nguyễn Du', 'Hai Bà Trưng', 'Hà Nội', true),
                                                                                                       (12, 12, 'Phan Ngọc Ánh', '0901000012', '101 Võ Văn Tần', 'Quận 3', 'TP. Hồ Chí Minh', true);

-- reviews (12 rows)
INSERT INTO reviews (id, user_id, product_id, rating, comment, created_at) VALUES
                                                                               (1, 1, 1, 5, 'Máy nhẹ, pin rất tốt.', '2026-05-03 09:00:00+00'),
                                                                               (2, 2, 2, 5, 'Chơi game mượt, tản nhiệt ổn.', '2026-05-03 09:05:00+00'),
                                                                               (3, 3, 3, 4, 'Hiệu năng mạnh, màn hình đẹp.', '2026-05-03 09:10:00+00'),
                                                                               (4, 4, 4, 4, 'Phù hợp làm việc văn phòng.', '2026-05-03 09:15:00+00'),
                                                                               (5, 5, 5, 5, 'Thiết kế đẹp, hiệu năng cao.', '2026-05-03 09:20:00+00'),
                                                                               (6, 6, 6, 4, 'Giá hợp lý cho sinh viên.', '2026-05-03 09:25:00+00'),
                                                                               (7, 7, 7, 5, 'Xử lý đồ họa rất ổn.', '2026-05-03 09:30:00+00'),
                                                                               (8, 8, 8, 4, 'Cấu hình mạnh, hơi nóng.', '2026-05-03 09:35:00+00'),
                                                                               (9, 9, 9, 4, 'Mỏng nhẹ, chạy êm.', '2026-05-03 09:40:00+00'),
                                                                               (10, 10, 10, 5, 'Màn hình sắc nét, màu đẹp.', '2026-05-03 09:45:00+00'),
                                                                               (11, 11, 11, 4, 'Bàn phím tốt, pin ổn.', '2026-05-03 09:50:00+00'),
                                                                               (12, 12, 12, 3, 'Chuột dùng ổn, kết nối nhanh.', '2026-05-03 09:55:00+00');

-- wishlists (12 rows)
INSERT INTO wishlists (id, user_id, product_id) VALUES
                                                    (1, 1, 2),
                                                    (2, 2, 1),
                                                    (3, 3, 5),
                                                    (4, 4, 6),
                                                    (5, 5, 3),
                                                    (6, 6, 8),
                                                    (7, 7, 9),
                                                    (8, 8, 7),
                                                    (9, 9, 10),
                                                    (10, 10, 11),
                                                    (11, 11, 12),
                                                    (12, 12, 4);

-- Resync identity sequences after explicit-ID seed inserts
-- (prevents duplicate key / nextval conflicts when creating new entities after seed)
SELECT setval(pg_get_serial_sequence('roles', 'id'), COALESCE((SELECT MAX(id) FROM roles), 1));
SELECT setval(pg_get_serial_sequence('brands', 'id'), COALESCE((SELECT MAX(id) FROM brands), 1));
SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 1));
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1));
SELECT setval(pg_get_serial_sequence('product_images', 'id'), COALESCE((SELECT MAX(id) FROM product_images), 1));
SELECT setval(pg_get_serial_sequence('coupons', 'id'), COALESCE((SELECT MAX(id) FROM coupons), 1));
SELECT setval(pg_get_serial_sequence('carts', 'id'), COALESCE((SELECT MAX(id) FROM carts), 1));
SELECT setval(pg_get_serial_sequence('cart_items', 'id'), COALESCE((SELECT MAX(id) FROM cart_items), 1));
SELECT setval(pg_get_serial_sequence('orders', 'id'), COALESCE((SELECT MAX(id) FROM orders), 1));
SELECT setval(pg_get_serial_sequence('order_items', 'id'), COALESCE((SELECT MAX(id) FROM order_items), 1));
SELECT setval(pg_get_serial_sequence('order_histories', 'id'), COALESCE((SELECT MAX(id) FROM order_histories), 1));
SELECT setval(pg_get_serial_sequence('payments', 'id'), COALESCE((SELECT MAX(id) FROM payments), 1));
SELECT setval(pg_get_serial_sequence('user_addresses', 'id'), COALESCE((SELECT MAX(id) FROM user_addresses), 1));
SELECT setval(pg_get_serial_sequence('reviews', 'id'), COALESCE((SELECT MAX(id) FROM reviews), 1));
SELECT setval(pg_get_serial_sequence('wishlists', 'id'), COALESCE((SELECT MAX(id) FROM wishlists), 1));

