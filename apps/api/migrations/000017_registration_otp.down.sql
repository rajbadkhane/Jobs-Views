ALTER TABLE users
    DROP COLUMN IF EXISTS registration_otp_hash,
    DROP COLUMN IF EXISTS registration_otp_expires_at,
    DROP COLUMN IF EXISTS registration_otp_attempts;
