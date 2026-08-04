# Jobs View GEO Audit

## Score

Generative engine optimization: 90/100

## Implemented

- Entity consistency is improved through shared structured data helpers.
- Jobs, companies, skills, salary, career, and interview pages now form explicit topic clusters.
- `llms.txt` describes relationships between entities and preferred citation behavior.
- Public pages expose canonical URLs, breadcrumbs, language signals, and machine-readable metadata.
- Admin, employer, auth, API, and private candidate areas are excluded from generative crawl surfaces.

## Knowledge Graph Signals

- Jobs View is the platform entity.
- Jobs connect to roles, companies, locations, salary, employment type, requirements, skills, and benefits.
- Companies connect to verification, industry, jobs, and locations.
- Skills connect to learning, salary, jobs, and career paths.
- Career guides connect to roadmaps, projects, interviews, salary, and learning.

## Remaining Risks

- Backend/CMS should eventually expose entity IDs, related entities, and freshness timestamps.
- Topic authority depends on actual editorial content volume and internal links after CMS migration.
