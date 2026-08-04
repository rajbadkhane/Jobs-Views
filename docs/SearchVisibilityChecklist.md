# Jobs View Search Visibility Checklist

## Technical SEO

- [x] Canonical URLs generated from `appConfig.siteUrl`.
- [x] OpenGraph metadata present.
- [x] Twitter Card metadata present.
- [x] `en-IN` and `x-default` alternates present.
- [x] Public sitemap excludes auth/private pages.
- [x] Robots blocks private and API surfaces.
- [x] Admin and employer apps are noindex.

## Structured Data

- [x] WebSite and SearchAction.
- [x] Organization.
- [x] WebPage.
- [x] BreadcrumbList.
- [x] FAQPage.
- [x] CollectionPage.
- [x] JobPosting.
- [x] Article.
- [x] Person.
- [x] DefinedTerm.
- [x] Dataset.
- [x] QAPage.

## Google Jobs

- [x] Job title.
- [x] Description.
- [x] Hiring organization.
- [x] Location.
- [x] Remote eligibility.
- [x] Salary.
- [x] Employment type.
- [x] Date posted.
- [x] Valid through.
- [x] Apply URL.
- [x] Identifier.

## AI Discoverability

- [x] `llms.txt`.
- [x] Public/private source boundaries.
- [x] Entity clusters.
- [x] Citation guidance.
- [x] FAQ answer targets.

## Deployment Validation

- [ ] Run Google Rich Results Test on deployed job URLs.
- [ ] Submit sitemap in Google Search Console.
- [ ] Submit sitemap in Bing Webmaster Tools.
- [ ] Confirm production `NEXT_PUBLIC_SITE_URL`.
- [ ] Replace seeded sitemap examples with backend/CMS-generated dynamic entries.
