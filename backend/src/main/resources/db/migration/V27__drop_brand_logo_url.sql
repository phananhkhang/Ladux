-- Remove brand logo URL; brands only keep name + slug.
ALTER TABLE brands DROP COLUMN IF EXISTS logo_url;
