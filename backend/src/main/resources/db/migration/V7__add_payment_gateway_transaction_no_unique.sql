-- Unique index tren ma giao dich Gateway (transaction_no / gateway_transaction_no).
-- Chi ap dung khi transaction_no IS NOT NULL de cho phep nhieu payment PENDING chua co ma.
-- Ho tro idempotency: hai webhook cung gateway_transaction_no se bi DB chan, service bat exception va tra 200.
CREATE UNIQUE INDEX uk_payments_transaction_no
    ON payments (transaction_no)
    WHERE transaction_no IS NOT NULL;