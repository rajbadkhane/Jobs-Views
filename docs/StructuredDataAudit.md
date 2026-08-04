# Jobs View Structured Data Audit

## Score

Structured data readiness: 93/100

## Schemas Covered

- `Organization`
- `WebSite`
- `WebPage`
- `BreadcrumbList`
- `FAQPage`
- `CollectionPage`
- `JobPosting`
- `Article`
- `Person`
- `DefinedTerm`
- `Dataset`
- `Course`
- `QAPage`

## Improvements Added

- Shared schema builders centralize JSON-LD generation.
- Programmatic pages map to the closest Schema.org type instead of generic placeholders.
- Breadcrumb structured data is emitted consistently on public programmatic pages.
- `llms.txt` documents the active schema vocabulary for AI crawlers.

## Validation Checklist

- JSON-LD is emitted as arrays where pages include multiple entities.
- URLs are absolute through `appConfig.siteUrl`.
- Public pages declare `inLanguage: en-IN` where applicable.
- Entity pages use canonical URLs as stable entity IDs through their page URL.

## Remaining Risks

- Some CMS-driven content is represented by placeholders until backend content feeds are fully populated.
- Rich Results validation must be performed against deployed rendered HTML.
