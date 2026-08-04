ALTER TABLE cms_entries DROP CONSTRAINT IF EXISTS cms_entries_content_type_check;
ALTER TABLE cms_entries DROP CONSTRAINT IF EXISTS cms_entries_status_check;

ALTER TABLE cms_entries
    ADD COLUMN IF NOT EXISTS summary TEXT,
    ADD COLUMN IF NOT EXISTS featured_image TEXT,
    ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb NOT NULL,
    ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb NOT NULL,
    ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]'::jsonb NOT NULL,
    ADD COLUMN IF NOT EXISTS reviewer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS language VARCHAR(20) DEFAULT 'en-IN' NOT NULL,
    ADD COLUMN IF NOT EXISTS schema JSONB DEFAULT '{}'::jsonb NOT NULL,
    ADD COLUMN IF NOT EXISTS blocks JSONB DEFAULT '[]'::jsonb NOT NULL,
    ADD COLUMN IF NOT EXISTS entities JSONB DEFAULT '[]'::jsonb NOT NULL,
    ADD COLUMN IF NOT EXISTS related JSONB DEFAULT '[]'::jsonb NOT NULL,
    ADD COLUMN IF NOT EXISTS ai_summary TEXT,
    ADD COLUMN IF NOT EXISTS short_summary TEXT,
    ADD COLUMN IF NOT EXISTS suggested_internal_links JSONB DEFAULT '[]'::jsonb NOT NULL,
    ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL,
    ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE cms_entries
    ADD CONSTRAINT cms_entries_content_type_check CHECK (content_type IN (
        'career', 'guidance', 'salary', 'interview', 'skill', 'learning', 'blog', 'news',
        'success_story', 'faq', 'landing_page', 'announcement', 'policy_page', 'static_page',
        'article', 'help'
    )),
    ADD CONSTRAINT cms_entries_status_check CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived', 'deleted'));

CREATE TABLE IF NOT EXISTS cms_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES cms_entries(id) ON DELETE CASCADE,
    version INT NOT NULL,
    snapshot JSONB DEFAULT '{}'::jsonb NOT NULL,
    edited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    change_note TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (entry_id, version)
);

CREATE TABLE IF NOT EXISTS media_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder VARCHAR(160) DEFAULT 'general' NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(120),
    size_bytes BIGINT DEFAULT 0 NOT NULL,
    alt_text TEXT,
    tags JSONB DEFAULT '[]'::jsonb NOT NULL,
    variants JSONB DEFAULT '{}'::jsonb NOT NULL,
    usage_count INT DEFAULT 0 NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS content_search_index (
    entry_id UUID PRIMARY KEY REFERENCES cms_entries(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    slug VARCHAR(280) NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    keywords JSONB DEFAULT '[]'::jsonb NOT NULL,
    url_path TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS knowledge_graph_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type VARCHAR(80) NOT NULL,
    source_id VARCHAR(160) NOT NULL,
    relation VARCHAR(80) NOT NULL,
    target_type VARCHAR(80) NOT NULL,
    target_id VARCHAR(160) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (source_type, source_id, relation, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_cms_entries_slug_status ON cms_entries (slug, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cms_entries_type_slug ON cms_entries (content_type, slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cms_revisions_entry ON cms_revisions (entry_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_content_search_index_type ON content_search_index (content_type, status);
CREATE INDEX IF NOT EXISTS idx_knowledge_graph_source ON knowledge_graph_edges (source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_graph_target ON knowledge_graph_edges (target_type, target_id);

CREATE TRIGGER trg_media_library_updated_at BEFORE UPDATE ON media_library FOR EACH ROW EXECUTE FUNCTION set_updated_at();
