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

-- brands (20 rows, fixed ids)
INSERT INTO brands (id, name, slug, logo_url) VALUES
(1, 'Brand 1', 'brand-1', 'https://img.example.com/brand-1.png'),
(2, 'Brand 2', 'brand-2', 'https://img.example.com/brand-2.png'),
(3, 'Brand 3', 'brand-3', 'https://img.example.com/brand-3.png'),
(4, 'Brand 4', 'brand-4', 'https://img.example.com/brand-4.png'),
(5, 'Brand 5', 'brand-5', 'https://img.example.com/brand-5.png'),
(6, 'Brand 6', 'brand-6', 'https://img.example.com/brand-6.png'),
(7, 'Brand 7', 'brand-7', 'https://img.example.com/brand-7.png'),
(8, 'Brand 8', 'brand-8', 'https://img.example.com/brand-8.png'),
(9, 'Brand 9', 'brand-9', 'https://img.example.com/brand-9.png'),
(10, 'Brand 10', 'brand-10', 'https://img.example.com/brand-10.png'),
(11, 'Brand 11', 'brand-11', 'https://img.example.com/brand-11.png'),
(12, 'Brand 12', 'brand-12', 'https://img.example.com/brand-12.png'),
(13, 'Brand 13', 'brand-13', 'https://img.example.com/brand-13.png'),
(14, 'Brand 14', 'brand-14', 'https://img.example.com/brand-14.png'),
(15, 'Brand 15', 'brand-15', 'https://img.example.com/brand-15.png'),
(16, 'Brand 16', 'brand-16', 'https://img.example.com/brand-16.png'),
(17, 'Brand 17', 'brand-17', 'https://img.example.com/brand-17.png'),
(18, 'Brand 18', 'brand-18', 'https://img.example.com/brand-18.png'),
(19, 'Brand 19', 'brand-19', 'https://img.example.com/brand-19.png'),
(20, 'Brand 20', 'brand-20', 'https://img.example.com/brand-20.png');

-- categories (20 rows)
INSERT INTO categories (id, name, slug, parent_id) VALUES
(1, 'Category 1', 'category-1', NULL),
(2, 'Category 2', 'category-2', NULL),
(3, 'Category 3', 'category-3', NULL),
(4, 'Category 4', 'category-4', NULL),
(5, 'Category 5', 'category-5', NULL),
(6, 'Category 6', 'category-6', NULL),
(7, 'Category 7', 'category-7', NULL),
(8, 'Category 8', 'category-8', NULL),
(9, 'Category 9', 'category-9', NULL),
(10, 'Category 10', 'category-10', NULL),
(11, 'Category 11', 'category-11', NULL),
(12, 'Category 12', 'category-12', NULL),
(13, 'Category 13', 'category-13', NULL),
(14, 'Category 14', 'category-14', NULL),
(15, 'Category 15', 'category-15', NULL),
(16, 'Category 16', 'category-16', 1),
(17, 'Category 17', 'category-17', 2),
(18, 'Category 18', 'category-18', 3),
(19, 'Category 19', 'category-19', 4),
(20, 'Category 20', 'category-20', 5);

-- users (20 rows)
INSERT INTO users (id, email, username, password, full_name, phone, avatar, is_active, created_at) VALUES
(1, 'user1@auratech.com', 'user1', 'hash1', 'User 1', '0900000001', 'https://img.example.com/u1.png', true, '2026-05-01 10:00:00+00'),
(2, 'user2@auratech.com', 'user2', 'hash2', 'User 2', '0900000002', 'https://img.example.com/u2.png', true, '2026-05-01 10:05:00+00'),
(3, 'user3@auratech.com', 'user3', 'hash3', 'User 3', '0900000003', 'https://img.example.com/u3.png', true, '2026-05-01 10:10:00+00'),
(4, 'user4@auratech.com', 'user4', 'hash4', 'User 4', '0900000004', 'https://img.example.com/u4.png', true, '2026-05-01 10:15:00+00'),
(5, 'user5@auratech.com', 'user5', 'hash5', 'User 5', '0900000005', 'https://img.example.com/u5.png', true, '2026-05-01 10:20:00+00'),
(6, 'user6@auratech.com', 'user6', 'hash6', 'User 6', '0900000006', 'https://img.example.com/u6.png', true, '2026-05-01 10:25:00+00'),
(7, 'user7@auratech.com', 'user7', 'hash7', 'User 7', '0900000007', 'https://img.example.com/u7.png', true, '2026-05-01 10:30:00+00'),
(8, 'user8@auratech.com', 'user8', 'hash8', 'User 8', '0900000008', 'https://img.example.com/u8.png', true, '2026-05-01 10:35:00+00'),
(9, 'user9@auratech.com', 'user9', 'hash9', 'User 9', '0900000009', 'https://img.example.com/u9.png', true, '2026-05-01 10:40:00+00'),
(10, 'user10@auratech.com', 'user10', 'hash10', 'User 10', '0900000010', 'https://img.example.com/u10.png', true, '2026-05-01 10:45:00+00'),
(11, 'user11@auratech.com', 'user11', 'hash11', 'User 11', '0900000011', 'https://img.example.com/u11.png', true, '2026-05-01 10:50:00+00'),
(12, 'user12@auratech.com', 'user12', 'hash12', 'User 12', '0900000012', 'https://img.example.com/u12.png', true, '2026-05-01 10:55:00+00'),
(13, 'user13@auratech.com', 'user13', 'hash13', 'User 13', '0900000013', 'https://img.example.com/u13.png', true, '2026-05-01 11:00:00+00'),
(14, 'user14@auratech.com', 'user14', 'hash14', 'User 14', '0900000014', 'https://img.example.com/u14.png', true, '2026-05-01 11:05:00+00'),
(15, 'user15@auratech.com', 'user15', 'hash15', 'User 15', '0900000015', 'https://img.example.com/u15.png', true, '2026-05-01 11:10:00+00'),
(16, 'user16@auratech.com', 'user16', 'hash16', 'User 16', '0900000016', 'https://img.example.com/u16.png', true, '2026-05-01 11:15:00+00'),
(17, 'user17@auratech.com', 'user17', 'hash17', 'User 17', '0900000017', 'https://img.example.com/u17.png', true, '2026-05-01 11:20:00+00'),
(18, 'user18@auratech.com', 'user18', 'hash18', 'User 18', '0900000018', 'https://img.example.com/u18.png', true, '2026-05-01 11:25:00+00'),
(19, 'user19@auratech.com', 'user19', 'hash19', 'User 19', '0900000019', 'https://img.example.com/u19.png', false, '2026-05-01 11:30:00+00'),
(20, 'user20@auratech.com', 'user20', 'hash20', 'User 20', '0900000020', 'https://img.example.com/u20.png', false, '2026-05-01 11:35:00+00');

-- user_roles (20 rows)
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
(12, 2),
(13, 2),
(14, 2),
(15, 2),
(16, 2),
(17, 2),
(18, 2),
(19, 2),
(20, 2);

-- products (20 rows)
INSERT INTO products
(id, brand_id, category_id, sku, name, slug, base_price, discount_price, stock_quantity, specs, thumbnail, is_active, created_at) VALUES
(1, 1, 1, 'SKU-0001', 'Aura Laptop 1', 'aura-laptop-1', 1200.00, 999.00, 50, '{"ram":"8GB","storage":"256GB"}', 'https://img.example.com/p1.png', true, '2026-05-01 09:00:00+00'),
(2, 1, 2, 'SKU-0002', 'Aura Laptop 2', 'aura-laptop-2', 1350.00, 1199.00, 40, '{"ram":"16GB","storage":"512GB"}', 'https://img.example.com/p2.png', true, '2026-05-01 09:05:00+00'),
(3, 2, 3, 'SKU-0003', 'Aura Laptop 3', 'aura-laptop-3', 1500.00, NULL, 30, '{"ram":"16GB","storage":"1TB"}', 'https://img.example.com/p3.png', true, '2026-05-01 09:10:00+00'),
(4, 2, 4, 'SKU-0004', 'Aura Laptop 4', 'aura-laptop-4', 1100.00, 950.00, 25, '{"ram":"8GB","storage":"512GB"}', 'https://img.example.com/p4.png', true, '2026-05-01 09:15:00+00'),
(5, 3, 5, 'SKU-0005', 'Aura Laptop 5', 'aura-laptop-5', 1800.00, 1599.00, 20, '{"ram":"32GB","storage":"1TB"}', 'https://img.example.com/p5.png', true, '2026-05-01 09:20:00+00'),
(6, 3, 1, 'SKU-0006', 'Aura Laptop 6', 'aura-laptop-6', 900.00, NULL, 60, '{"ram":"8GB","storage":"256GB"}', 'https://img.example.com/p6.png', true, '2026-05-01 09:25:00+00'),
(7, 4, 2, 'SKU-0007', 'Aura Laptop 7', 'aura-laptop-7', 1400.00, 1299.00, 35, '{"ram":"16GB","storage":"512GB"}', 'https://img.example.com/p7.png', true, '2026-05-01 09:30:00+00'),
(8, 4, 3, 'SKU-0008', 'Aura Laptop 8', 'aura-laptop-8', 1250.00, NULL, 45, '{"ram":"16GB","storage":"256GB"}', 'https://img.example.com/p8.png', true, '2026-05-01 09:35:00+00'),
(9, 5, 4, 'SKU-0009', 'Aura Laptop 9', 'aura-laptop-9', 1600.00, 1399.00, 22, '{"ram":"16GB","storage":"1TB"}', 'https://img.example.com/p9.png', true, '2026-05-01 09:40:00+00'),
(10, 5, 5, 'SKU-0010', 'Aura Laptop 10', 'aura-laptop-10', 1000.00, NULL, 70, '{"ram":"8GB","storage":"256GB"}', 'https://img.example.com/p10.png', true, '2026-05-01 09:45:00+00'),
(11, 6, 1, 'SKU-0011', 'Aura Laptop 11', 'aura-laptop-11', 1700.00, 1499.00, 18, '{"ram":"32GB","storage":"1TB"}', 'https://img.example.com/p11.png', true, '2026-05-01 09:50:00+00'),
(12, 6, 2, 'SKU-0012', 'Aura Laptop 12', 'aura-laptop-12', 1150.00, NULL, 55, '{"ram":"8GB","storage":"512GB"}', 'https://img.example.com/p12.png', true, '2026-05-01 09:55:00+00'),
(13, 7, 3, 'SKU-0013', 'Aura Laptop 13', 'aura-laptop-13', 1450.00, 1299.00, 32, '{"ram":"16GB","storage":"512GB"}', 'https://img.example.com/p13.png', true, '2026-05-01 10:00:00+00'),
(14, 7, 4, 'SKU-0014', 'Aura Laptop 14', 'aura-laptop-14', 1300.00, NULL, 48, '{"ram":"16GB","storage":"256GB"}', 'https://img.example.com/p14.png', true, '2026-05-01 10:05:00+00'),
(15, 8, 5, 'SKU-0015', 'Aura Laptop 15', 'aura-laptop-15', 1900.00, 1699.00, 15, '{"ram":"32GB","storage":"2TB"}', 'https://img.example.com/p15.png', true, '2026-05-01 10:10:00+00'),
(16, 8, 1, 'SKU-0016', 'Aura Laptop 16', 'aura-laptop-16', 980.00, NULL, 65, '{"ram":"8GB","storage":"256GB"}', 'https://img.example.com/p16.png', true, '2026-05-01 10:15:00+00'),
(17, 9, 2, 'SKU-0017', 'Aura Laptop 17', 'aura-laptop-17', 1550.00, 1399.00, 27, '{"ram":"16GB","storage":"1TB"}', 'https://img.example.com/p17.png', true, '2026-05-01 10:20:00+00'),
(18, 9, 3, 'SKU-0018', 'Aura Laptop 18', 'aura-laptop-18', 1220.00, NULL, 52, '{"ram":"16GB","storage":"256GB"}', 'https://img.example.com/p18.png', true, '2026-05-01 10:25:00+00'),
(19, 10, 4, 'SKU-0019', 'Aura Laptop 19', 'aura-laptop-19', 1650.00, 1499.00, 19, '{"ram":"32GB","storage":"1TB"}', 'https://img.example.com/p19.png', true, '2026-05-01 10:30:00+00'),
(20, 10, 5, 'SKU-0020', 'Aura Laptop 20', 'aura-laptop-20', 1050.00, NULL, 75, '{"ram":"8GB","storage":"512GB"}', 'https://img.example.com/p20.png', true, '2026-05-01 10:35:00+00');

-- product_images (20 rows)
INSERT INTO product_images (id, product_id, image_url, is_primary) VALUES
(1, 1, 'https://img.example.com/p1-1.png', false),
(2, 2, 'https://img.example.com/p2-1.png', false),
(3, 3, 'https://img.example.com/p3-1.png', false),
(4, 4, 'https://img.example.com/p4-1.png', false),
(5, 5, 'https://img.example.com/p5-1.png', false),
(6, 6, 'https://img.example.com/p6-1.png', false),
(7, 7, 'https://img.example.com/p7-1.png', false),
(8, 8, 'https://img.example.com/p8-1.png', false),
(9, 9, 'https://img.example.com/p9-1.png', false),
(10, 10, 'https://img.example.com/p10-1.png', false),
(11, 11, 'https://img.example.com/p11-1.png', false),
(12, 12, 'https://img.example.com/p12-1.png', false),
(13, 13, 'https://img.example.com/p13-1.png', false),
(14, 14, 'https://img.example.com/p14-1.png', false),
(15, 15, 'https://img.example.com/p15-1.png', false),
(16, 16, 'https://img.example.com/p16-1.png', false),
(17, 17, 'https://img.example.com/p17-1.png', false),
(18, 18, 'https://img.example.com/p18-1.png', false),
(19, 19, 'https://img.example.com/p19-1.png', false),
(20, 20, 'https://img.example.com/p20-1.png', false);

-- carts (20 rows)
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
(12, 12),
(13, 13),
(14, 14),
(15, 15),
(16, 16),
(17, 17),
(18, 18),
(19, 19),
(20, 20);

-- cart_items (20 rows)
INSERT INTO cart_items (id, cart_id, product_id, quantity) VALUES
(1, 1, 1, 1),
(2, 2, 2, 2),
(3, 3, 3, 1),
(4, 4, 4, 3),
(5, 5, 5, 1),
(6, 6, 6, 2),
(7, 7, 7, 1),
(8, 8, 8, 2),
(9, 9, 9, 1),
(10, 10, 10, 3),
(11, 1, 11, 1),
(12, 2, 12, 2),
(13, 3, 13, 1),
(14, 4, 14, 2),
(15, 5, 15, 1),
(16, 6, 16, 2),
(17, 7, 17, 1),
(18, 8, 18, 2),
(19, 9, 19, 1),
(20, 10, 20, 2);

-- coupons (20 rows)
INSERT INTO coupons (id, code, discount_type, discount_value, min_order_value, usage_limit, used_count, expires_at) VALUES
(1, 'SAVE10', 'PERCENT', 10.00, 0.00, 100, 0, '2026-12-31 23:59:59+00'),
(2, 'SAVE15', 'PERCENT', 15.00, 200.00, 100, 2, '2026-12-31 23:59:59+00'),
(3, 'SAVE20', 'PERCENT', 20.00, 300.00, 100, 1, '2026-12-31 23:59:59+00'),
(4, 'OFF50', 'FIXED_AMOUNT', 50.00, 500.00, 50, 3, '2026-12-31 23:59:59+00'),
(5, 'OFF75', 'FIXED_AMOUNT', 75.00, 700.00, 50, 4, '2026-12-31 23:59:59+00'),
(6, 'OFF100', 'FIXED_AMOUNT', 100.00, 800.00, 50, 0, '2026-12-31 23:59:59+00'),
(7, 'SAVE5', 'PERCENT', 5.00, 0.00, 200, 5, '2026-12-31 23:59:59+00'),
(8, 'SAVE12', 'PERCENT', 12.00, 150.00, 200, 6, '2026-12-31 23:59:59+00'),
(9, 'SAVE18', 'PERCENT', 18.00, 250.00, 150, 7, '2026-12-31 23:59:59+00'),
(10, 'OFF30', 'FIXED_AMOUNT', 30.00, 300.00, 150, 8, '2026-12-31 23:59:59+00'),
(11, 'OFF60', 'FIXED_AMOUNT', 60.00, 600.00, 120, 1, '2026-12-31 23:59:59+00'),
(12, 'SAVE8', 'PERCENT', 8.00, 120.00, 180, 2, '2026-12-31 23:59:59+00'),
(13, 'SAVE25', 'PERCENT', 25.00, 400.00, 80, 0, '2026-12-31 23:59:59+00'),
(14, 'OFF90', 'FIXED_AMOUNT', 90.00, 900.00, 60, 2, '2026-12-31 23:59:59+00'),
(15, 'SAVE7', 'PERCENT', 7.00, 100.00, 140, 1, '2026-12-31 23:59:59+00'),
(16, 'SAVE22', 'PERCENT', 22.00, 350.00, 90, 4, '2026-12-31 23:59:59+00'),
(17, 'OFF40', 'FIXED_AMOUNT', 40.00, 450.00, 110, 3, '2026-12-31 23:59:59+00'),
(18, 'SAVE9', 'PERCENT', 9.00, 90.00, 160, 2, '2026-12-31 23:59:59+00'),
(19, 'SAVE30', 'PERCENT', 30.00, 500.00, 70, 1, '2026-12-31 23:59:59+00'),
(20, 'OFF120', 'FIXED_AMOUNT', 120.00, 1000.00, 40, 0, '2026-12-31 23:59:59+00');

-- orders (20 rows)
INSERT INTO orders
(id, user_id, coupon_id, sub_total, discount_amount, final_amount, status, shipping_address, tracking_number, created_at) VALUES
(1, 1, NULL, 2000.00, 0.00, 2000.00, 'PENDING', '123 Main St, District 1, Hanoi', NULL, '2026-05-02 09:00:00+00'),
(2, 2, 1, 2100.00, 100.00, 2000.00, 'CONFIRMED', '124 Main St, District 1, Hanoi', 'TRK0002', '2026-05-02 09:05:00+00'),
(3, 3, NULL, 2200.00, 0.00, 2200.00, 'SHIPPED', '125 Main St, District 1, Hanoi', 'TRK0003', '2026-05-02 09:10:00+00'),
(4, 4, 2, 2300.00, 150.00, 2150.00, 'DELIVERED', '126 Main St, District 1, Hanoi', 'TRK0004', '2026-05-02 09:15:00+00'),
(5, 5, NULL, 2400.00, 0.00, 2400.00, 'CANCELLED', '127 Main St, District 1, Hanoi', NULL, '2026-05-02 09:20:00+00'),
(6, 6, 3, 2500.00, 200.00, 2300.00, 'PENDING', '128 Main St, District 1, Hanoi', NULL, '2026-05-02 09:25:00+00'),
(7, 7, NULL, 2600.00, 0.00, 2600.00, 'CONFIRMED', '129 Main St, District 1, Hanoi', 'TRK0007', '2026-05-02 09:30:00+00'),
(8, 8, 4, 2700.00, 50.00, 2650.00, 'SHIPPED', '130 Main St, District 1, Hanoi', 'TRK0008', '2026-05-02 09:35:00+00'),
(9, 9, NULL, 2800.00, 0.00, 2800.00, 'DELIVERED', '131 Main St, District 1, Hanoi', 'TRK0009', '2026-05-02 09:40:00+00'),
(10, 10, 5, 2900.00, 75.00, 2825.00, 'CANCELLED', '132 Main St, District 1, Hanoi', NULL, '2026-05-02 09:45:00+00'),
(11, 11, NULL, 3000.00, 0.00, 3000.00, 'PENDING', '133 Main St, District 1, Hanoi', NULL, '2026-05-02 09:50:00+00'),
(12, 12, 6, 3100.00, 100.00, 3000.00, 'CONFIRMED', '134 Main St, District 1, Hanoi', 'TRK0012', '2026-05-02 09:55:00+00'),
(13, 13, NULL, 3200.00, 0.00, 3200.00, 'SHIPPED', '135 Main St, District 1, Hanoi', 'TRK0013', '2026-05-02 10:00:00+00'),
(14, 14, 7, 3300.00, 150.00, 3150.00, 'DELIVERED', '136 Main St, District 1, Hanoi', 'TRK0014', '2026-05-02 10:05:00+00'),
(15, 15, NULL, 3400.00, 0.00, 3400.00, 'CANCELLED', '137 Main St, District 1, Hanoi', NULL, '2026-05-02 10:10:00+00'),
(16, 16, 8, 3500.00, 120.00, 3380.00, 'PENDING', '138 Main St, District 1, Hanoi', NULL, '2026-05-02 10:15:00+00'),
(17, 17, NULL, 3600.00, 0.00, 3600.00, 'CONFIRMED', '139 Main St, District 1, Hanoi', 'TRK0017', '2026-05-02 10:20:00+00'),
(18, 18, 9, 3700.00, 180.00, 3520.00, 'SHIPPED', '140 Main St, District 1, Hanoi', 'TRK0018', '2026-05-02 10:25:00+00'),
(19, 19, NULL, 3800.00, 0.00, 3800.00, 'DELIVERED', '141 Main St, District 1, Hanoi', 'TRK0019', '2026-05-02 10:30:00+00'),
(20, 20, 10, 3900.00, 30.00, 3870.00, 'CANCELLED', '142 Main St, District 1, Hanoi', NULL, '2026-05-02 10:35:00+00');

-- order_items (20 rows)
INSERT INTO order_items (id, order_id, product_id, quantity, price_at_purchase) VALUES
(1, 1, 1, 1, 1200.00),
(2, 2, 2, 1, 1350.00),
(3, 3, 3, 2, 1500.00),
(4, 4, 4, 1, 1100.00),
(5, 5, 5, 1, 1800.00),
(6, 6, 6, 2, 900.00),
(7, 7, 7, 1, 1400.00),
(8, 8, 8, 2, 1250.00),
(9, 9, 9, 1, 1600.00),
(10, 10, 10, 2, 1000.00),
(11, 11, 11, 1, 1700.00),
(12, 12, 12, 2, 1150.00),
(13, 13, 13, 1, 1450.00),
(14, 14, 14, 2, 1300.00),
(15, 15, 15, 1, 1900.00),
(16, 16, 16, 2, 980.00),
(17, 17, 17, 1, 1550.00),
(18, 18, 18, 2, 1220.00),
(19, 19, 19, 1, 1650.00),
(20, 20, 20, 2, 1050.00);

-- order_histories (20 rows)
INSERT INTO order_histories (id, order_id, status, description, created_at) VALUES
(1, 1, 'PENDING', 'Order created', '2026-05-02 09:00:00+00'),
(2, 2, 'CONFIRMED', 'Order confirmed', '2026-05-02 09:05:00+00'),
(3, 3, 'SHIPPED', 'Order shipped', '2026-05-02 09:10:00+00'),
(4, 4, 'DELIVERED', 'Order delivered', '2026-05-02 09:15:00+00'),
(5, 5, 'CANCELLED', 'Order cancelled', '2026-05-02 09:20:00+00'),
(6, 6, 'PENDING', 'Order created', '2026-05-02 09:25:00+00'),
(7, 7, 'CONFIRMED', 'Order confirmed', '2026-05-02 09:30:00+00'),
(8, 8, 'SHIPPED', 'Order shipped', '2026-05-02 09:35:00+00'),
(9, 9, 'DELIVERED', 'Order delivered', '2026-05-02 09:40:00+00'),
(10, 10, 'CANCELLED', 'Order cancelled', '2026-05-02 09:45:00+00'),
(11, 11, 'PENDING', 'Order created', '2026-05-02 09:50:00+00'),
(12, 12, 'CONFIRMED', 'Order confirmed', '2026-05-02 09:55:00+00'),
(13, 13, 'SHIPPED', 'Order shipped', '2026-05-02 10:00:00+00'),
(14, 14, 'DELIVERED', 'Order delivered', '2026-05-02 10:05:00+00'),
(15, 15, 'CANCELLED', 'Order cancelled', '2026-05-02 10:10:00+00'),
(16, 16, 'PENDING', 'Order created', '2026-05-02 10:15:00+00'),
(17, 17, 'CONFIRMED', 'Order confirmed', '2026-05-02 10:20:00+00'),
(18, 18, 'SHIPPED', 'Order shipped', '2026-05-02 10:25:00+00'),
(19, 19, 'DELIVERED', 'Order delivered', '2026-05-02 10:30:00+00'),
(20, 20, 'CANCELLED', 'Order cancelled', '2026-05-02 10:35:00+00');

-- payments (20 rows)
INSERT INTO payments (id, order_id, provider, transaction_no, amount, status, created_at) VALUES
(1, 1, 'COD', NULL, 2000.00, 'PENDING', '2026-05-02 09:00:00+00'),
(2, 2, 'VNPAY', 'TXN0002', 2000.00, 'SUCCESS', '2026-05-02 09:05:00+00'),
(3, 3, 'COD', NULL, 2200.00, 'PENDING', '2026-05-02 09:10:00+00'),
(4, 4, 'VNPAY', 'TXN0004', 2150.00, 'SUCCESS', '2026-05-02 09:15:00+00'),
(5, 5, 'COD', NULL, 2400.00, 'FAILED', '2026-05-02 09:20:00+00'),
(6, 6, 'VNPAY', 'TXN0006', 2300.00, 'PENDING', '2026-05-02 09:25:00+00'),
(7, 7, 'COD', NULL, 2600.00, 'PENDING', '2026-05-02 09:30:00+00'),
(8, 8, 'VNPAY', 'TXN0008', 2650.00, 'SUCCESS', '2026-05-02 09:35:00+00'),
(9, 9, 'COD', NULL, 2800.00, 'SUCCESS', '2026-05-02 09:40:00+00'),
(10, 10, 'VNPAY', 'TXN0010', 2825.00, 'FAILED', '2026-05-02 09:45:00+00'),
(11, 11, 'COD', NULL, 3000.00, 'PENDING', '2026-05-02 09:50:00+00'),
(12, 12, 'VNPAY', 'TXN0012', 3000.00, 'SUCCESS', '2026-05-02 09:55:00+00'),
(13, 13, 'COD', NULL, 3200.00, 'PENDING', '2026-05-02 10:00:00+00'),
(14, 14, 'VNPAY', 'TXN0014', 3150.00, 'SUCCESS', '2026-05-02 10:05:00+00'),
(15, 15, 'COD', NULL, 3400.00, 'FAILED', '2026-05-02 10:10:00+00'),
(16, 16, 'VNPAY', 'TXN0016', 3380.00, 'PENDING', '2026-05-02 10:15:00+00'),
(17, 17, 'COD', NULL, 3600.00, 'SUCCESS', '2026-05-02 10:20:00+00'),
(18, 18, 'VNPAY', 'TXN0018', 3520.00, 'SUCCESS', '2026-05-02 10:25:00+00'),
(19, 19, 'COD', NULL, 3800.00, 'SUCCESS', '2026-05-02 10:30:00+00'),
(20, 20, 'VNPAY', 'TXN0020', 3870.00, 'FAILED', '2026-05-02 10:35:00+00');

-- user_addresses (20 rows)
INSERT INTO user_addresses (id, user_id, receiver_name, phone, street, district, city, is_default) VALUES
(1, 1, 'User 1', '0900000001', '1 Main St', 'District 1', 'Hanoi', true),
(2, 2, 'User 2', '0900000002', '2 Main St', 'District 1', 'Hanoi', true),
(3, 3, 'User 3', '0900000003', '3 Main St', 'District 2', 'Hanoi', true),
(4, 4, 'User 4', '0900000004', '4 Main St', 'District 2', 'Hanoi', true),
(5, 5, 'User 5', '0900000005', '5 Main St', 'District 3', 'Hanoi', true),
(6, 6, 'User 6', '0900000006', '6 Main St', 'District 3', 'Hanoi', false),
(7, 7, 'User 7', '0900000007', '7 Main St', 'District 4', 'Hanoi', false),
(8, 8, 'User 8', '0900000008', '8 Main St', 'District 4', 'Hanoi', false),
(9, 9, 'User 9', '0900000009', '9 Main St', 'District 5', 'Hanoi', false),
(10, 10, 'User 10', '0900000010', '10 Main St', 'District 5', 'Hanoi', false),
(11, 11, 'User 11', '0900000011', '11 Main St', 'District 6', 'Hanoi', false),
(12, 12, 'User 12', '0900000012', '12 Main St', 'District 6', 'Hanoi', false),
(13, 13, 'User 13', '0900000013', '13 Main St', 'District 7', 'Hanoi', false),
(14, 14, 'User 14', '0900000014', '14 Main St', 'District 7', 'Hanoi', false),
(15, 15, 'User 15', '0900000015', '15 Main St', 'District 8', 'Hanoi', false),
(16, 16, 'User 16', '0900000016', '16 Main St', 'District 8', 'Hanoi', false),
(17, 17, 'User 17', '0900000017', '17 Main St', 'District 9', 'Hanoi', false),
(18, 18, 'User 18', '0900000018', '18 Main St', 'District 9', 'Hanoi', false),
(19, 19, 'User 19', '0900000019', '19 Main St', 'District 10', 'Hanoi', false),
(20, 20, 'User 20', '0900000020', '20 Main St', 'District 10', 'Hanoi', false);

-- reviews (20 rows)
INSERT INTO reviews (id, user_id, product_id, rating, comment, created_at) VALUES
(1, 1, 1, 5, 'Great product', '2026-05-03 09:00:00+00'),
(2, 2, 2, 4, 'Good value', '2026-05-03 09:05:00+00'),
(3, 3, 3, 5, 'Excellent', '2026-05-03 09:10:00+00'),
(4, 4, 4, 3, 'Average', '2026-05-03 09:15:00+00'),
(5, 5, 5, 5, 'Very good', '2026-05-03 09:20:00+00'),
(6, 6, 6, 4, 'Solid build', '2026-05-03 09:25:00+00'),
(7, 7, 7, 5, 'Fast and smooth', '2026-05-03 09:30:00+00'),
(8, 8, 8, 4, 'Nice design', '2026-05-03 09:35:00+00'),
(9, 9, 9, 5, 'Love it', '2026-05-03 09:40:00+00'),
(10, 10, 10, 3, 'Okay', '2026-05-03 09:45:00+00'),
(11, 11, 11, 5, 'Great', '2026-05-03 09:50:00+00'),
(12, 12, 12, 4, 'Good', '2026-05-03 09:55:00+00'),
(13, 13, 13, 5, 'Excellent', '2026-05-03 10:00:00+00'),
(14, 14, 14, 3, 'Average', '2026-05-03 10:05:00+00'),
(15, 15, 15, 5, 'Very good', '2026-05-03 10:10:00+00'),
(16, 16, 16, 4, 'Nice', '2026-05-03 10:15:00+00'),
(17, 17, 17, 5, 'Great', '2026-05-03 10:20:00+00'),
(18, 18, 18, 4, 'Good', '2026-05-03 10:25:00+00'),
(19, 19, 19, 5, 'Excellent', '2026-05-03 10:30:00+00'),
(20, 20, 20, 3, 'Okay', '2026-05-03 10:35:00+00');

-- wishlists (20 rows)
INSERT INTO wishlists (id, user_id, product_id, added_at) VALUES
(1, 1, 20, '2026-05-03 11:00:00+00'),
(2, 2, 19, '2026-05-03 11:05:00+00'),
(3, 3, 18, '2026-05-03 11:10:00+00'),
(4, 4, 17, '2026-05-03 11:15:00+00'),
(5, 5, 16, '2026-05-03 11:20:00+00'),
(6, 6, 15, '2026-05-03 11:25:00+00'),
(7, 7, 14, '2026-05-03 11:30:00+00'),
(8, 8, 13, '2026-05-03 11:35:00+00'),
(9, 9, 12, '2026-05-03 11:40:00+00'),
(10, 10, 11, '2026-05-03 11:45:00+00'),
(11, 11, 10, '2026-05-03 11:50:00+00'),
(12, 12, 9, '2026-05-03 11:55:00+00'),
(13, 13, 8, '2026-05-03 12:00:00+00'),
(14, 14, 7, '2026-05-03 12:05:00+00'),
(15, 15, 6, '2026-05-03 12:10:00+00'),
(16, 16, 5, '2026-05-03 12:15:00+00'),
(17, 17, 4, '2026-05-03 12:20:00+00'),
(18, 18, 3, '2026-05-03 12:25:00+00'),
(19, 19, 2, '2026-05-03 12:30:00+00'),
(20, 20, 1, '2026-05-03 12:35:00+00');

-- Reset sequences to max ids
SELECT setval(pg_get_serial_sequence('roles','id'), (SELECT MAX(id) FROM roles));
SELECT setval(pg_get_serial_sequence('brands','id'), (SELECT MAX(id) FROM brands));
SELECT setval(pg_get_serial_sequence('categories','id'), (SELECT MAX(id) FROM categories));
SELECT setval(pg_get_serial_sequence('users','id'), (SELECT MAX(id) FROM users));
SELECT setval(pg_get_serial_sequence('products','id'), (SELECT MAX(id) FROM products));
SELECT setval(pg_get_serial_sequence('product_images','id'), (SELECT MAX(id) FROM product_images));
SELECT setval(pg_get_serial_sequence('carts','id'), (SELECT MAX(id) FROM carts));
SELECT setval(pg_get_serial_sequence('cart_items','id'), (SELECT MAX(id) FROM cart_items));
SELECT setval(pg_get_serial_sequence('coupons','id'), (SELECT MAX(id) FROM coupons));
SELECT setval(pg_get_serial_sequence('orders','id'), (SELECT MAX(id) FROM orders));
SELECT setval(pg_get_serial_sequence('order_items','id'), (SELECT MAX(id) FROM order_items));
SELECT setval(pg_get_serial_sequence('order_histories','id'), (SELECT MAX(id) FROM order_histories));
SELECT setval(pg_get_serial_sequence('payments','id'), (SELECT MAX(id) FROM payments));
SELECT setval(pg_get_serial_sequence('user_addresses','id'), (SELECT MAX(id) FROM user_addresses));
SELECT setval(pg_get_serial_sequence('reviews','id'), (SELECT MAX(id) FROM reviews));
SELECT setval(pg_get_serial_sequence('wishlists','id'), (SELECT MAX(id) FROM wishlists));

