# Career Intelligence Platform

Sprint 13 adds an AI-ready Career Intelligence layer without executing AI models.

## Routes

- `/career-intelligence` - career dashboard and health score overview
- `/resume-insights` - ATS score, keywords, missing skills, missing sections and version history
- `/salary-insights` - market salary, city comparison, skill premium and future projection
- `/skill-intelligence` - trending skills, demand graph, gaps and certifications
- `/career-roadmaps` - role roadmaps for frontend, backend, full stack, DevOps, AI, cloud and other tracks
- `/interview-hub` - interview question groups and mock interview placeholder
- `/learning-center` - courses, books, videos, blogs, communities and certifications
- `/career-analytics` - applications, interviews, offers, response rate and profile views
- `/career-recommendations` - jobs, companies, skills, courses, roadmaps and article recommendations
- `/career-guides` - CMS-driven public guide placeholders

## API Aggregation

`GET /api/career-intelligence`

Returns:

```json
{
  "success": true,
  "message": "Career Intelligence data loaded from backend sources.",
  "data": {
    "profile": {},
    "completion": {},
    "skills": [],
    "applications": {},
    "source": "backend"
  }
}
```

The response aggregates existing backend profile, completion, skills and application endpoints. Future AI scoring, ranking and recommendation services can extend this shape without changing the UI contract.

## Component Architecture

- Display content lives in `apps/web/content/career-intelligence.ts` until backend CMS records are available.
- UI lives in `apps/web/app/components/career-intelligence-platform.tsx`.
- Route pages pass a `view` prop into the shared component.
- Charts use Recharts with local static data.
- Candidate navigation is extended from `packages/config/src/index.ts`.

## SEO Notes

Public career guide pages are prepared for CMS-driven metadata, canonical URLs, schema, AEO, GEO and LLM templates. Current pages ship static metadata per route and can later be backed by CMS records.

## Future AI Notes

- Career Health Score can be computed from live profile, resume, skills, projects, portfolio, experience, education, certifications and languages.
- Resume insights can connect to parsing, ATS scoring and keyword extraction services.
- Salary insights can connect to market compensation datasets.
- Recommendations can be ranked by future AI models while preserving the current grouped response shape.
