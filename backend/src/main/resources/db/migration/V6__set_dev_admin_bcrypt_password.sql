-- Allow logging in as seed admin with password: Admin@123
UPDATE users
SET password = '$2b$10$JJZFhV4z1GEsvvSu3iHZye1Y2hFztqIIZkNpYyDfBbE2P1kDKwaN2'
WHERE username = 'admin'
  AND password LIKE 'seed-disabled-%';

-- Seed data inserts explicit IDs; resync sequences so new rows do not reuse existing PKs.
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval(pg_get_serial_sequence('carts', 'id'), COALESCE((SELECT MAX(id) FROM carts), 1));