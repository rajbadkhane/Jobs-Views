-- Add multi-select job types list support to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_types_list JSONB DEFAULT '[]'::jsonb NOT NULL;

-- Insert experience, education, healthcare, and remote job type categorizations
INSERT INTO job_types (name, slug) VALUES
('10th pass jobs', '10th-pass-jobs'),
('12th pass jobs', '12th-pass-jobs'),
('ITI jobs', 'iti-jobs'),
('Fresher jobs', 'fresher-jobs'),
('Experienced jobs', 'experienced-jobs'),
('Nursing home care job', 'nursing-home-care-job'),
('Staff nurse job', 'staff-nurse-job'),
('Doctors job', 'doctors-job'),
('Work from home job', 'work-from-home-job'),
('Remote jobs', 'remote-jobs')
ON CONFLICT (slug) DO NOTHING;

-- Backfill job_types_list for existing jobs if empty
UPDATE jobs j
SET job_types_list = jsonb_build_array(jt.slug)
FROM job_types jt
WHERE j.job_type_id = jt.id AND (j.job_types_list IS NULL OR j.job_types_list = '[]'::jsonb);
