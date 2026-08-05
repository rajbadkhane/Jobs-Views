-- Replaces the hardcoded plaintext super-admin accounts previously baked into
-- internal/auth/service.go with real, DB-backed accounts. Passwords are bcrypt
-- hashes generated out-of-band; the plaintext values were shared once and must
-- be rotated via the standard forgot-password flow after first login.
INSERT INTO users (email, password_hash, is_active, is_verified, email_verified_at)
VALUES
    ('admin.one@jobsview.local', '$2b$10$h5otB22EhzZENTktUUM7zOCdHwI8TcAJGl1roSGJ2IbzrXkylUhvq', TRUE, TRUE, NOW()),
    ('admin.two@jobsview.local', '$2b$10$OGTaUNSEd72kUpFKWKSTR.9P4FO93eoIrwpZnQQ9nZ.bD4ibAcFk.', TRUE, TRUE, NOW()),
    ('admin.three@jobsview.local', '$2b$10$xX5BBIpMz7C3QbrB5bJ7.OkHnlQ15zx2YA4LeBJYlULUrjjMtKide', TRUE, TRUE, NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'SUPER_ADMIN'
WHERE u.email IN ('admin.one@jobsview.local', 'admin.two@jobsview.local', 'admin.three@jobsview.local')
ON CONFLICT DO NOTHING;
