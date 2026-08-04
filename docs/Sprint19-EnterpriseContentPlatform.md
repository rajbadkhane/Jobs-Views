# Sprint 19 - Enterprise Content Platform

## CMS Models

The generic content engine supports:

- Career
- Guidance
- Salary
- Interview
- Skill
- Learning
- Blog
- News
- Success story
- FAQ
- Landing page
- Announcement
- Policy page
- Static page

Every content item supports lifecycle status, slug, title, summary, excerpt, body, featured image, gallery, tags, categories, author, reviewer, language, SEO, schema, content blocks, entities, related content, AI summary, short summary, suggested internal links, analytics, version, revisions, and publish timestamps.

## Backend CMS

Added migration `000007_enterprise_content_platform`:

- Extends `cms_entries` for enterprise content fields.
- Adds `cms_revisions`.
- Adds `media_library`.
- Adds `content_search_index`.
- Adds `knowledge_graph_edges`.

Public content API:

- `GET /api/v1/content`
- `GET /api/v1/content/:type/:slug`

Admin CMS API remains compatible:

- `GET /api/v1/admin/cms`
- `POST /api/v1/admin/cms`

## New Dynamic Routes

CMS-backed public routes now resolve content first:

- `/career/[slug]`
- `/guidance/[topic]`
- `/salary/[role]`
- `/interview/[slug]`
- `/skills/[skill]`
- `/:slug` for landing/static/policy pages

Existing fallback SEO pages still render when content is missing.

## Search Index Updates

- `content_search_index` is updated after CMS saves.
- Frontend `globalSearchApi` now includes published content results.
- Shared `buildContentSearchIndex()` provides static/indexable records for generated content.

## SEO Improvements

- CMS content generates canonical metadata through existing metadata helpers.
- CMS pages emit JSON-LD through `buildContentSchemas()`.
- Sitemap now includes published content engine routes.
- `llms.txt` lists CMS-generated content and knowledge graph samples.

## Knowledge Graph

Content entities connect:

- Industry
- Department
- Role
- Skill
- Salary
- Interview
- Career
- Companies
- Jobs
- Learning
- Guidance

Shared `buildKnowledgeGraph()` generates source-target edges for public content.

## Versioning

- Every CMS save increments `version`.
- Every CMS save creates a `cms_revisions` snapshot.
- Rollback/compare UI can use `cms_revisions` in a later workflow pass.

## Workflow

Supported lifecycle:

- Draft
- Review
- Scheduled
- Published
- Archived
- Deleted

RBAC remains enforced through the existing admin route protection.

## Remaining Work

- Build dedicated admin forms for every content type using the new generic model.
- Add media upload endpoints for `media_library`.
- Add revision compare and rollback endpoints.
- Replace seeded frontend content with backend-published content during deployment.
- Add RSS/feed endpoints for published content.
