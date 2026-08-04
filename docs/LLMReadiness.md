# Jobs View LLM Readiness

## Score

LLM discoverability: 91/100

## Implemented

- `/llms.txt` explains the product, public crawlable surfaces, private exclusions, entity clusters, and citation guidance.
- Public pages use semantic metadata, canonical URLs, breadcrumbs, FAQ blocks, and Schema.org JSON-LD.
- Topic clusters connect jobs, companies, skills, salary pages, career guides, interviews, and learning resources.
- Robots allows public AI-useful sections and blocks private dashboards/API/auth surfaces.

## AI Source Boundaries

Allowed:

- Homepage
- Jobs and job details
- Companies and company profiles
- Salary pages
- Skill pages
- Career guides
- Interview pages
- Roadmaps and learning content

Blocked:

- Candidate dashboard and private profile workflows
- Employer portal
- Admin portal
- Auth/session pages
- API routes

## Remaining Risks

- LLM citations should be validated after deployment with live canonical URLs.
- Dynamic backend content should expose concise summaries and FAQ fields to improve answer quality.
