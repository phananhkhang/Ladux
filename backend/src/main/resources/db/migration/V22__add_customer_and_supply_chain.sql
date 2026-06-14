-- ============================================================================
-- V22: Tach ho so khach hang (Customer) khoi User + them chuoi cung ung
--      (Supplier, ProductSupplier, PurchaseOrder, PurchaseOrderItem, StockMovement).
--
-- AN TOAN DU LIEU: di tru full_name/phone/avatar tu bang users sang customers
-- TRUOC khi drop cac cot do.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) CUSTOMERS — shared primary key voi users (user_id vua la PK vua la FK)
-- ---------------------------------------------------------------------------
CREATE TABLE customers (
    user_id        INTEGER PRIMARY KEY,
    full_name      VARCHAR(150),
    phone          VARCHAR(20),
    avatar_url     VARCHAR(255),
    loyalty_points BIGINT NOT NULL DEFAULT 0,
    level          VARCHAR(10) DEFAULT 'BROWSER',
    total_spent    NUMERIC(15, 2) DEFAULT 0,
    CONSTRAINT fk_customers_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Di tru du lieu ho so hien co tu users -> customers (khong mat data).
INSERT INTO customers (user_id, full_name, phone, avatar_url, loyalty_points, level, total_spent)
SELECT id, full_name, phone, avatar, 0, 'BROWSER', 0
FROM users;

-- ---------------------------------------------------------------------------
-- 2) USERS — bo cac cot ho so (da chuyen sang customers) + noi rong username
-- ---------------------------------------------------------------------------
ALTER TABLE users DROP COLUMN full_name;
ALTER TABLE users DROP COLUMN phone;
ALTER TABLE users DROP COLUMN avatar;
ALTER TABLE users DROP COLUMN created_at;
ALTER TABLE users ALTER COLUMN username TYPE VARCHAR(150);

-- ---------------------------------------------------------------------------
-- 3) PRODUCTS — them mo ta + nguong canh bao ton kho; doi ten update_at
-- ---------------------------------------------------------------------------
ALTER TABLE products ADD COLUMN description TEXT;
ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER DEFAULT 5;
ALTER TABLE products RENAME COLUMN update_at TO updated_at;

-- ---------------------------------------------------------------------------
-- 4) SUPPLIERS — nha cung cap
-- ---------------------------------------------------------------------------
CREATE TABLE suppliers (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    address    VARCHAR(255),
    phone      VARCHAR(20),
    email      VARCHAR(150),
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- ---------------------------------------------------------------------------
-- 5) PRODUCT_SUPPLIERS — N-N giua product va supplier (kem gia nhap, lead time)
-- ---------------------------------------------------------------------------
CREATE TABLE product_suppliers (
    id             BIGSERIAL PRIMARY KEY,
    product_id     INTEGER NOT NULL,
    supplier_id    INTEGER NOT NULL,
    cost_price     NUMERIC(15, 2),
    lead_time_days INTEGER,
    CONSTRAINT uk_product_suppliers UNIQUE (product_id, supplier_id),
    CONSTRAINT fk_ps_product  FOREIGN KEY (product_id)  REFERENCES products (id),
    CONSTRAINT fk_ps_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
);
CREATE INDEX idx_product_suppliers_product  ON product_suppliers (product_id);
CREATE INDEX idx_product_suppliers_supplier ON product_suppliers (supplier_id);

-- ---------------------------------------------------------------------------
-- 6) PURCHASE_ORDERS — don mua hang tu nha cung cap
-- ---------------------------------------------------------------------------
CREATE TABLE purchase_orders (
    id                     SERIAL PRIMARY KEY,
    supplier_id            INTEGER NOT NULL,
    status                 VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    expected_delivery_date TIMESTAMP WITH TIME ZONE,
    total_amount           NUMERIC(15, 2) DEFAULT 0,
    note                   VARCHAR(500),
    created_by             INTEGER,
    created_at             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_po_supplier   FOREIGN KEY (supplier_id) REFERENCES suppliers (id),
    CONSTRAINT fk_po_created_by FOREIGN KEY (created_by)  REFERENCES users (id)
);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders (supplier_id);
CREATE INDEX idx_purchase_orders_status   ON purchase_orders (status);

-- ---------------------------------------------------------------------------
-- 7) PURCHASE_ORDER_ITEMS — dong san pham trong don mua (ho tro nhan tung phan)
-- ---------------------------------------------------------------------------
CREATE TABLE purchase_order_items (
    id                SERIAL PRIMARY KEY,
    purchase_order_id INTEGER NOT NULL,
    product_id        INTEGER NOT NULL,
    quantity          INTEGER NOT NULL,
    cost_price        NUMERIC(15, 2) NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    note              VARCHAR(255),
    CONSTRAINT fk_poi_po      FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id),
    CONSTRAINT fk_poi_product FOREIGN KEY (product_id)        REFERENCES products (id)
);
CREATE INDEX idx_purchase_order_items_po ON purchase_order_items (purchase_order_id);

-- ---------------------------------------------------------------------------
-- 8) STOCK_MOVEMENTS — so cai bien dong ton kho (nhap/xuat/dieu chinh)
-- ---------------------------------------------------------------------------
CREATE TABLE stock_movements (
    id             SERIAL PRIMARY KEY,
    product_id     INTEGER NOT NULL,
    quantity       INTEGER NOT NULL,
    movement_type  VARCHAR(30) NOT NULL,
    reference_type VARCHAR(30),
    reference_id   BIGINT,
    note           VARCHAR(500),
    created_by     INTEGER,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sm_product    FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT fk_sm_created_by FOREIGN KEY (created_by) REFERENCES users (id)
);
CREATE INDEX idx_stock_movements_product ON stock_movements (product_id);
