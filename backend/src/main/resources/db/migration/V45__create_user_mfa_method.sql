CREATE TABLE user_mfa_methods (
                                  id BIGSERIAL PRIMARY KEY,
                                  user_id INTEGER NOT NULL,
                                  type VARCHAR(30) NOT NULL,
                                  secret_encrypted TEXT NOT NULL,
                                  enabled BOOLEAN NOT NULL DEFAULT FALSE,
                                  verified_at TIMESTAMP WITH TIME ZONE NULL,
                                  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE user_mfa_methods
    ADD CONSTRAINT fk_user_mfa_methods_user_id
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
