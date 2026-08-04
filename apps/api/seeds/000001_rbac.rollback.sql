DELETE FROM role_permissions;
DELETE FROM permissions WHERE name IN (
    'job:create', 'job:edit', 'job:delete', 'job:approve', 'job:view_draft',
    'application:apply', 'application:view_all', 'application:update_status',
    'user:view_all', 'user:suspend', 'user:delete',
    'company:create', 'company:edit', 'company:verify',
    'settings:view_logs', 'settings:configure', 'job:publish', 'job:analytics'
);
DELETE FROM roles WHERE name IN ('SUPER_ADMIN', 'ADMIN', 'EMPLOYER', 'JOB_SEEKER');
