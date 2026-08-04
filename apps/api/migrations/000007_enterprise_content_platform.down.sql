DROP TRIGGER IF EXISTS trg_media_library_updated_at ON media_library;

DROP TABLE IF EXISTS knowledge_graph_edges;
DROP TABLE IF EXISTS content_search_index;
DROP TABLE IF EXISTS media_library;
DROP TABLE IF EXISTS cms_revisions;

ALTER TABLE cms_entries DROP CONSTRAINT IF EXISTS cms_entries_content_type_check;
ALTER TABLE cms_entries DROP CONSTRAINT IF EXISTS cms_entries_status_check;

ALTER TABLE cms_entries
    DROP COLUMN IF EXISTS archived_at,
    DROP COLUMN IF EXISTS scheduled_at,
    DROP COLUMN IF EXISTS version,
    DROP COLUMN IF EXISTS suggested_internal_links,
    DROP COLUMN IF EXISTS short_summary,
    DROP COLUMN IF EXISTS ai_summary,
    DROP COLUMN IF EXISTS related,
    DROP COLUMN IF EXISTS entities,
    DROP COLUMN IF EXISTS blocks,
    DROP COLUMN IF EXISTS schema,
    DROP COLUMN IF EXISTS language,
    DROP COLUMN IF EXISTS reviewer_user_id,
    DROP COLUMN IF EXISTS categories,
    DROP COLUMN IF EXISTS tags,
    DROP COLUMN IF EXISTS gallery,
    DROP COLUMN IF EXISTS featured_image,
    DROP COLUMN IF EXISTS summary;

ALTER TABLE cms_entries
    ADD CONSTRAINT cms_entries_content_type_check CHECK (content_type IN ('article', 'blog', 'help', 'faq', 'landing_page', 'static_page')),
    ADD CONSTRAINT cms_entries_status_check CHECK (status IN ('draft', 'published', 'archived'));
