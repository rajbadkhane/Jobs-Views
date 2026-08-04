INSERT INTO roles (name, description) VALUES
('SUPER_ADMIN', 'System owner with unrestricted access'),
('ADMIN', 'Platform moderator'),
('EMPLOYER', 'Company recruiter or hiring manager'),
('JOB_SEEKER', 'Candidate looking for opportunities')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO permissions (name, description) VALUES
('job:create', 'Allow creating job postings'),
('job:edit', 'Allow editing job postings'),
('job:delete', 'Allow deleting job postings'),
('job:approve', 'Allow approving jobs for publication'),
('job:view_draft', 'Allow viewing draft jobs'),
('application:apply', 'Allow applying to jobs'),
('application:view_all', 'Allow viewing applications'),
('application:update_status', 'Allow changing application status'),
('user:view_all', 'Allow viewing users'),
('user:suspend', 'Allow suspending users'),
('user:delete', 'Allow deleting users'),
('company:create', 'Allow creating companies'),
('company:edit', 'Allow editing companies'),
('company:verify', 'Allow verifying companies'),
('settings:view_logs', 'Allow viewing system logs'),
('settings:configure', 'Allow changing settings'),
('job:publish', 'Allow publishing job postings'),
('job:analytics', 'Allow viewing job analytics')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('job:approve', 'job:view_draft', 'job:publish', 'job:analytics', 'application:view_all', 'user:view_all', 'user:suspend', 'company:verify', 'settings:view_logs', 'settings:configure')
WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('job:create', 'job:edit', 'job:delete', 'job:publish', 'job:analytics', 'company:create', 'company:edit', 'application:view_all', 'application:update_status')
WHERE r.name = 'EMPLOYER'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('application:apply')
WHERE r.name = 'JOB_SEEKER'
ON CONFLICT DO NOTHING;
