-- V40: Drop target_type and target_id columns from notifications table
ALTER TABLE notifications
    DROP COLUMN IF EXISTS target_type,
    DROP COLUMN IF EXISTS target_id;
