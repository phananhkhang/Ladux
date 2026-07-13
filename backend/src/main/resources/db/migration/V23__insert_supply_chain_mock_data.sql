-- ============================================================================
-- V25 (devdata): Du lieu mau cho chuoi cung ung — chi chay o moi truong dev/test
-- (Flyway location db/devdata). Production KHONG nap file nay.
--
-- Phu thuoc: V22 da tao cac bang suppliers / product_suppliers va products da co
-- san 12 dong tu V3. Chay sau V22 (version 23 > 22).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- suppliers (3 nha cung cap)
-- ---------------------------------------------------------------------------
INSERT INTO suppliers (id, name, address, phone, email, is_active) VALUES
    (1, 'Cong ty TNHH Phan Phoi Cong Nghe FPT', '261 Khanh Hoi, Quan 4, TP. Ho Chi Minh', '02873002222', 'sales@fpt-dist.vn', TRUE),
    (2, 'Cong ty CP The Gioi So Digiworld',     '102 Nguyen Dinh Chinh, Phu Nhuan, TP. Ho Chi Minh', '02839971234', 'b2b@digiworld.vn', TRUE),
    (3, 'Cong ty TNHH Synnex Viet Nam',          '459 Su Van Hanh, Quan 10, TP. Ho Chi Minh', '02838334455', 'order@synnex.vn', TRUE);

-- Dong bo sequence id cua suppliers (vi insert id thu cong).
SELECT setval(pg_get_serial_sequence('suppliers', 'id'), (SELECT MAX(id) FROM suppliers));

-- ---------------------------------------------------------------------------
-- product_suppliers (gan moi san pham toi 1-2 nha cung cap, kem gia nhap & lead time)
-- cost_price ~ 70-80% base_price de mo phong bien loi nhuan.
-- ---------------------------------------------------------------------------
INSERT INTO product_suppliers (product_id, supplier_id, cost_price, lead_time_days) VALUES
    (1, 1, 2300.00, 7),
    (1, 2, 2350.00, 5),
    (2, 1, 1950.00, 10),
    (3, 3, 2900.00, 14),
    (4, 2, 1500.00, 7),
    (5, 1, 1750.00, 7),
    (6, 2, 1280.00, 5),
    (7, 3, 2650.00, 12),
    (8, 3, 3950.00, 21),
    (9, 1, 1850.00, 7),
    (10, 2, 540.00, 5),
    (11, 1, 2050.00, 9),
    (12, 2, 280.00, 3);
