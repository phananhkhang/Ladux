-- Refresh tokens created before mandatory MFA cannot prove the MFA step.
-- Revoke them once at rollout; new privileged sessions are created only after TOTP success.
UPDATE refresh_tokens token
SET revoked = TRUE
FROM user_roles user_role
JOIN roles role ON role.id = user_role.role_id
WHERE token.user_id = user_role.user_id
  AND role.name IN ('ADMIN', 'STAFF')
  AND token.revoked = FALSE;

UPDATE users app_user
SET token_version = token_version + 1
FROM user_roles user_role
JOIN roles role ON role.id = user_role.role_id
WHERE app_user.id = user_role.user_id
  AND role.name IN ('ADMIN', 'STAFF');
