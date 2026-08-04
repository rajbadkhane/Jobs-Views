DROP TRIGGER IF EXISTS trg_companies_updated_at ON companies;
DROP TRIGGER IF EXISTS trg_candidate_profiles_updated_at ON candidate_profiles;
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
DROP TRIGGER IF EXISTS trg_permissions_updated_at ON permissions;
DROP TRIGGER IF EXISTS trg_roles_updated_at ON roles;
DROP FUNCTION IF EXISTS set_updated_at();

DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS verification_tokens;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS company_users;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS candidate_profiles;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;
