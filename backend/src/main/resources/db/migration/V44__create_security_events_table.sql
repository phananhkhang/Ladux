-- Migration: V44__create_security_events_table.sql
-- Description: Create security_events audit table with relevant indexes

CREATE TABLE security_events (
                                 id BIGSERIAL PRIMARY KEY,
                                 user_id INTEGER NULL,
                                 event_type VARCHAR(50) NOT NULL,
                                 ip_address VARCHAR(64),
                                 user_agent VARCHAR(500),
                                 success BOOLEAN NOT NULL,
                                 created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 CONSTRAINT fk_security_events_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for querying and analytics
CREATE INDEX idx_sec_events_user_id ON security_events(user_id);
CREATE INDEX idx_sec_events_event_type ON security_events(event_type);
CREATE INDEX idx_sec_events_ip_address ON security_events(ip_address);
CREATE INDEX idx_sec_events_created_at ON security_events(created_at DESC);
CREATE INDEX idx_sec_events_user_created ON security_events(user_id, created_at DESC);
