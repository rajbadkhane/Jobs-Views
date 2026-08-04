-- Replaces the hardcoded plaintext super-admin accounts previously baked into
-- internal/auth/service.go with real, DB-backed accounts. Passwords are bcrypt
-- hashes generated out-of-band; the plaintext values were shared once and must
-- be rotated via the standard forgot-password flow after first login.
INSERT INTO users (email, password_hash, is_active, is_verified, email_verified_at)
VALUES
    ('admin.one@jobsview.local', '$2a$10$oSeQve.KmaF.lxTimHGV.ux2p95BF64XZrhpbiOX5ITaBvaVwnVeW', TRUE, TRUE, NOW()),
    ('admin.two@jobsview.local', '$2a$10$yMWikeNo6ogQDydpvD1vruBX0u7Mgnd2DbOg3pbu3ZdlinhuYticO', TRUE, TRUE, NOW()),
    ('admin.three@jobsview.local', '$2a$10$JX2p08I32hRykaoXJkK5EeToj9QPA3GY9HrTB2ISQae.KvaKp9G5e', TRUE, TRUE, NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'SUPER_ADMIN'
WHERE u.email IN ('admin.one@jobsview.local', 'admin.two@jobsview.local', 'admin.three@jobsview.local')
ON CONFLICT DO NOTHING;
