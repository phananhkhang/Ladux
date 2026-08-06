ALTER TABLE payments
ADD COLUMN IF NOT EXISTS merchant_txn_ref VARCHAR(100),
ADD COLUMN IF NOT EXISTS payment_url TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uk_payments_merchant_txn_ref
ON payments (merchant_txn_ref)
WHERE merchant_txn_ref IS NOT NULL;