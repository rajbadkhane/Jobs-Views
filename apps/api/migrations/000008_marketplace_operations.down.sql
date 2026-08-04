DROP TRIGGER IF EXISTS trg_automation_rules_updated_at ON automation_rules;
DROP TRIGGER IF EXISTS trg_notification_templates_updated_at ON notification_templates;
DROP TRIGGER IF EXISTS trg_operations_queue_updated_at ON operations_queue;
DROP TRIGGER IF EXISTS trg_webhook_endpoints_updated_at ON webhook_endpoints;
DROP TRIGGER IF EXISTS trg_document_templates_updated_at ON document_templates;
DROP TRIGGER IF EXISTS trg_recruiter_crm_items_updated_at ON recruiter_crm_items;
DROP TRIGGER IF EXISTS trg_employer_leads_updated_at ON employer_leads;
DROP TRIGGER IF EXISTS trg_marketplace_products_updated_at ON marketplace_products;
DROP TRIGGER IF EXISTS trg_plan_entitlements_updated_at ON plan_entitlements;
DROP TRIGGER IF EXISTS trg_organizations_updated_at ON organizations;

DROP TABLE IF EXISTS automation_rules;
DROP TABLE IF EXISTS notification_templates;
DROP TABLE IF EXISTS operations_queue;
DROP TABLE IF EXISTS webhook_endpoints;
DROP TABLE IF EXISTS employer_api_keys;
DROP TABLE IF EXISTS document_templates;
DROP TABLE IF EXISTS recruiter_crm_items;
DROP TABLE IF EXISTS employer_leads;
DROP TABLE IF EXISTS resume_database_unlocks;
DROP TABLE IF EXISTS job_boosts;
DROP TABLE IF EXISTS marketplace_purchases;
DROP TABLE IF EXISTS wallet_transactions;
DROP TABLE IF EXISTS company_wallets;
DROP TABLE IF EXISTS tax_rules;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS marketplace_products;
DROP TABLE IF EXISTS plan_entitlements;

ALTER TABLE company_users
    DROP COLUMN IF EXISTS department_id,
    DROP COLUMN IF EXISTS branch_id,
    DROP COLUMN IF EXISTS organization_id;

ALTER TABLE company_departments
    DROP COLUMN IF EXISTS branch_id,
    DROP COLUMN IF EXISTS organization_id;

ALTER TABLE company_branches
    DROP COLUMN IF EXISTS organization_id;

ALTER TABLE companies
    DROP COLUMN IF EXISTS organization_id;

DROP TABLE IF EXISTS organizations;
