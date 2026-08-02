ALTER TABLE phone_verifications
    ADD COLUMN IF NOT EXISTS purpose VARCHAR(30) NOT NULL DEFAULT 'PHONE_UPDATE',
    ADD COLUMN IF NOT EXISTS consumed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE phone_verifications
    DROP CONSTRAINT IF EXISTS ck_phone_verifications_status;

ALTER TABLE phone_verifications
    ADD CONSTRAINT ck_phone_verifications_status
        CHECK (status IN (
            'PENDING',
            'VERIFIED',
            'CONSUMED',
            'EXPIRED',
            'INVALIDATED',
            'SEND_FAILED'
        ));

ALTER TABLE phone_verifications
    DROP CONSTRAINT IF EXISTS ck_phone_verifications_purpose;

ALTER TABLE phone_verifications
    ADD CONSTRAINT ck_phone_verifications_purpose
        CHECK (purpose IN ('PHONE_UPDATE', 'PASSWORD_CHANGE'));

CREATE INDEX IF NOT EXISTS idx_phone_verifications_customer_purpose_created
    ON phone_verifications (customer_id, purpose, created_at DESC);
