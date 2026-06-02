CREATE INDEX IF NOT EXISTS idx_products_brand_id
    ON products (brand_id);

CREATE INDEX IF NOT EXISTS idx_products_category_id
    ON products (category_id);

CREATE INDEX IF NOT EXISTS idx_products_is_active
    ON products (is_active);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id
    ON product_images (product_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_product_id
    ON cart_items (product_id);

CREATE INDEX IF NOT EXISTS idx_orders_user_created_at
    ON orders (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status_created_at
    ON orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_pending_payment_expires_at
    ON orders (payment_expires_at)
    WHERE status = 'PENDING' AND payment_expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
    ON order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id
    ON order_items (product_id);

CREATE INDEX IF NOT EXISTS idx_order_histories_order_id
    ON order_histories (order_id);

CREATE INDEX IF NOT EXISTS idx_payments_order_created_at
    ON payments (order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_status
    ON payments (status);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id
    ON user_addresses (user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_product_created_at
    ON reviews (product_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_user_created_at
    ON reviews (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wishlists_product_id
    ON wishlists (product_id);
