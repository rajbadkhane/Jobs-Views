# Jobs View Google Jobs Audit

## Score

Google Jobs readiness: 90/100

## Implemented

- Job detail pages emit `JobPosting` JSON-LD.
- Required fields are present: `title`, `description`, `datePosted`, `validThrough`, `hiringOrganization`, `jobLocation`, `employmentType`, `baseSalary`, `identifier`, and canonical `url`.
- Remote/hybrid readiness is represented with `jobLocationType` and `applicantLocationRequirements`.
- Salary is represented as INR yearly `MonetaryAmount`.
- Direct apply is declared with `directApply: true`.
- Skills, qualifications, responsibilities, and benefits are present in machine-readable fields.

## Compliance Notes

- Production backend job data should replace fallback salary, location, company, and valid-through values where available.
- Expired, closed, archived, and private jobs should be excluded from sitemap and return noindex metadata when backend status is connected.
- Each published job should have a stable identifier from the backend job ID or slug.

## Remaining Risks

- Current frontend-only job pages use fallback values for some Google Jobs fields.
- Google Rich Results validation must be run against deployed URLs after production domain setup.
