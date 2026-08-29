CREATE TABLE login_history (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    ip_address VARCHAR(64) NOT NULL,
    device_id_hash VARCHAR(64) NOT NULL,
    user_agent VARCHAR(500),
    login_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mfa_used BOOLEAN NOT NULL,
    new_ip BOOLEAN NOT NULL,
    new_device BOOLEAN NOT NULL,
    CONSTRAINT fk_login_history_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_login_history_user_ip ON login_history(user_id, ip_address);
CREATE INDEX idx_login_history_user_device ON login_history(user_id, device_id_hash);
CREATE INDEX idx_login_history_user_login_at ON login_history(user_id, login_at DESC);
