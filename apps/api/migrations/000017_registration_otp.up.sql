ALTER TABLE users
    ADD COLUMN registration_otp_hash CHAR(64),
    ADD COLUMN registration_otp_expires_at TIMESTAMPTZ,
    ADD COLUMN registration_otp_attempts INT DEFAULT 0 NOT NULL;
