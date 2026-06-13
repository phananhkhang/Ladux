-- token_version: tang len de vo hieu hoa tuc thi moi access token cu cua user
-- (logout, doi mat khau, khoa tai khoan). Access token mang claim tokenVersion de doi chieu.
ALTER TABLE users
    ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0;
