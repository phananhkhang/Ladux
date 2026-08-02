CREATE TABLE email_verifications (
                                     id BIGSERIAL PRIMARY KEY,

                                     verification_id VARCHAR(36) NOT NULL UNIQUE,

                                     customer_id INTEGER NOT NULL,

                                     email VARCHAR(150) NOT NULL,

                                     otp_hash VARCHAR(100) NOT NULL,

                                     purpose VARCHAR(30) NOT NULL,

                                     status VARCHAR(30) NOT NULL,

                                     failed_attempts INTEGER NOT NULL DEFAULT 0,

                                     created_at TIMESTAMP WITH TIME ZONE NOT NULL,

                                     expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

                                     verified_at TIMESTAMP WITH TIME ZONE,

                                     consumed_at TIMESTAMP WITH TIME ZONE,

                                     CONSTRAINT fk_email_verification_customer
                                         FOREIGN KEY (customer_id)
                                             REFERENCES customers (user_id)
                                             ON DELETE CASCADE,

                                     CONSTRAINT ck_email_verification_purpose
                                         CHECK (
                                             purpose IN (
                                                         'EMAIL_UPDATE',
                                                         'PASSWORD_CHANGE'
                                                 )
                                             ),

                                     CONSTRAINT ck_email_verification_status
                                         CHECK (
                                             status IN (
                                                        'PENDING',
                                                        'VERIFIED',
                                                        'CONSUMED',
                                                        'EXPIRED',
                                                        'INVALIDATED',
                                                        'SEND_FAILED'
                                                 )
                                             ),

                                     CONSTRAINT ck_email_verification_attempts
                                         CHECK (failed_attempts >= 0)
);

CREATE INDEX idx_email_verification_customer_purpose
    ON email_verifications (
                            customer_id,
                            purpose,
                            created_at DESC
        );

CREATE INDEX idx_email_verification_lookup
    ON email_verifications (
                            verification_id,
                            customer_id
        );