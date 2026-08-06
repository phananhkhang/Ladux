-- V39: Add is_deleted_by_user column to notifications table for user soft delete
ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS is_deleted_by_user BOOLEAN NOT NULL DEFAULT FALSE;
