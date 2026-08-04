DROP TRIGGER IF EXISTS trg_user_settings_updated_at ON user_settings;
DROP TRIGGER IF EXISTS trg_notification_preferences_updated_at ON notification_preferences;
DROP TRIGGER IF EXISTS trg_user_social_links_updated_at ON user_social_links;
DROP TRIGGER IF EXISTS trg_candidate_experiences_updated_at ON candidate_experiences;
DROP TRIGGER IF EXISTS trg_candidate_education_updated_at ON candidate_education;
DROP TRIGGER IF EXISTS trg_candidate_skills_updated_at ON candidate_skills;
DROP TRIGGER IF EXISTS trg_resumes_updated_at ON resumes;
DROP TRIGGER IF EXISTS trg_admin_profiles_updated_at ON admin_profiles;
DROP TRIGGER IF EXISTS trg_employer_profiles_updated_at ON employer_profiles;

DROP TABLE IF EXISTS audit_events;
DROP TABLE IF EXISTS login_history;
DROP TABLE IF EXISTS user_devices;
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS notification_preferences;
DROP TABLE IF EXISTS user_social_links;
DROP TABLE IF EXISTS candidate_experiences;
DROP TABLE IF EXISTS candidate_education;
DROP TABLE IF EXISTS candidate_skills;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS skill_categories;
DROP TABLE IF EXISTS resumes;
DROP TABLE IF EXISTS profile_uploads;
DROP TABLE IF EXISTS admin_profiles;
DROP TABLE IF EXISTS employer_profiles;

ALTER TABLE candidate_profiles
    DROP COLUMN IF EXISTS profile_strength,
    DROP COLUMN IF EXISTS avatar_url,
    DROP COLUMN IF EXISTS resume_url,
    DROP COLUMN IF EXISTS availability,
    DROP COLUMN IF EXISTS headline,
    DROP COLUMN IF EXISTS location;
