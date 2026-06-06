ALTER TABLE products
ADD CONSTRAINT chk_stock_quantity_non_negative 
CHECK (stock_quantity >= 0);