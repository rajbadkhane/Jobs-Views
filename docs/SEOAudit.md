# Jobs View SEO Audit

## Score

Production SEO score: 92/100

## Implemented

- Canonical metadata is generated through `buildMetadata` for homepage, jobs, companies, salary, skills, career, interview, and public career hubs.
- OpenGraph and Twitter Cards are generated consistently with large image previews.
- `en-IN` and `x-default` alternates are included in shared metadata.
- Public sitemap excludes auth/private pages and includes public programmatic SEO clusters.
- Robots protects candidate-private, auth, API, admin, and employer surfaces.
- Admin and employer apps now publish `noindex, nofollow` metadata and disallow-all robots.
- Homepage, job search, job detail, company, salary, skill, career, interview, and candidate profile pages emit JSON-LD.

## Public Page Coverage

- Homepage: canonical, OG, Twitter, Organization, WebSite, WebPage, FAQ, Breadcrumb.
- `/jobs`: canonical, CollectionPage, FAQ, Breadcrumb.
- `/jobs/[slug]`: canonical, CollectionPage, FAQ, Breadcrumb, JobPosting.
- `/companies`: canonical, CollectionPage, FAQ, Breadcrumb.
- `/companies/[slug]`: canonical, Organization, FAQ, Breadcrumb.
- `/candidate/[slug]`: canonical, Person, Breadcrumb.
- `/salary/[role]`: canonical, Dataset, FAQ, Breadcrumb.
- `/skills/[skill]`: canonical, DefinedTerm, FAQ, Breadcrumb.
- `/career/[slug]`: canonical, Article, FAQ, Breadcrumb.
- `/interview/[slug]`: canonical, QAPage, FAQ, Breadcrumb.
- Public hubs: canonical metadata and crawlable sitemap entries.

## Remaining Risks

- Dynamic sitemap entries are seeded from static examples until backend SEO feeds are exposed.
- Search Console and Bing verification tokens are placeholders via environment/config, not live vendor validation.
- Some private candidate route metadata exists for UX pages, but robots blocks them from indexing.
