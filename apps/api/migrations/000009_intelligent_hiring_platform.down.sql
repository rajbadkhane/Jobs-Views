DROP TRIGGER IF EXISTS trg_conversations_updated_at ON conversations;
DROP TRIGGER IF EXISTS trg_profile_onboarding_drafts_updated_at ON profile_onboarding_drafts;

DROP TABLE IF EXISTS salary_calculations;
DROP TABLE IF EXISTS conversation_messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS candidate_view_events;
DROP TABLE IF EXISTS recommendation_events;
DROP TABLE IF EXISTS resume_parse_results;
DROP TABLE IF EXISTS profile_onboarding_drafts;
