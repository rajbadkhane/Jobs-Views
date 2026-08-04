CREATE TABLE salary_import_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_id UUID NOT NULL REFERENCES salary_imports(id) ON DELETE CASCADE,
    row_number INT NOT NULL,
    payload JSONB NOT NULL,
    is_valid BOOLEAN DEFAULT FALSE NOT NULL,
    validation_errors JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (import_id, row_number)
);
CREATE INDEX idx_salary_import_rows_import ON salary_import_rows(import_id, is_valid, row_number);
