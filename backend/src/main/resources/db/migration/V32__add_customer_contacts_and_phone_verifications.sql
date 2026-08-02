-- Email là thông tin liên hệ của customer, không còn là credential đăng nhập.
ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS email VARCHAR(150);

UPDATE customers c
SET email = u.email
FROM users u
WHERE c.user_id = u.id
  AND c.email IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_email_ci
    ON customers (LOWER(email))
    WHERE email IS NOT NULL;

ALTER TABLE users
    DROP COLUMN IF EXISTS email;

-- Phiên xác thực số điện thoại bằng OTP.
CREATE TABLE IF NOT EXISTS phone_verifications (
    id                       BIGSERIAL PRIMARY KEY,
    verification_id          VARCHAR(36) NOT NULL UNIQUE,
    provider_verification_id VARCHAR(64) NOT NULL,
    customer_id              INTEGER NOT NULL,
    phone_number             VARCHAR(20) NOT NULL,
    status                   VARCHAR(20) NOT NULL,
    created_at               TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at               TIMESTAMP WITH TIME ZONE NOT NULL,
    failed_attempts           INTEGER NOT NULL DEFAULT 0,
    verified_at              TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_phone_verifications_customer
        FOREIGN KEY (customer_id) REFERENCES customers (user_id) ON DELETE CASCADE,
    CONSTRAINT ck_phone_verifications_status
        CHECK (status IN ('PENDING', 'VERIFIED', 'EXPIRED', 'INVALIDATED', 'SEND_FAILED')),
    CONSTRAINT ck_phone_verifications_failed_attempts
        CHECK (failed_attempts >= 0)
);

CREATE INDEX IF NOT EXISTS idx_phone_verifications_customer_created
    ON phone_verifications (customer_id, created_at DESC);

-- Chuẩn hóa dữ liệu cũ trước khi áp dụng uniqueness cho số điện thoại.
UPDATE customers
SET phone = '+84' || SUBSTRING(phone FROM 2)
WHERE phone ~ '^0[35789][0-9]{8}$';

UPDATE customers
SET phone = '+' || phone
WHERE phone ~ '^84[35789][0-9]{8}$';

CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_phone
    ON customers (phone)
    WHERE phone IS NOT NULL;
