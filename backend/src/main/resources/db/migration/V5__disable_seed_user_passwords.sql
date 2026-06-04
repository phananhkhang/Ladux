UPDATE users
SET password = 'seed-disabled-' || md5(random()::text || clock_timestamp()::text || username)
WHERE id BETWEEN 1 AND 12;
