# Production QA

## Implemented QA Improvements

- Added a reusable production journey contract in shared code.
- Added route audit scoring.
- Added button action audit scoring.
- Added candidate, employer, and admin journey audit scoring.
- Added regression tests so future route/action gaps fail quickly.

## Areas Covered

- Routes
- Buttons
- Forms
- Tables
- Modals
- Mutations
- Uploads
- Downloads
- Notifications
- Messaging
- Search
- Company pages
- Job pages
- Career pages
- Admin operations

## Verification Required Before Launch

- Browser smoke test with local PostgreSQL seed data.
- Candidate journey with a real candidate account.
- Employer journey with a pending and approved company.
- Admin journey with company/job moderation.
- Upload/download validation for resume, offer letter, certificates, and verification documents.

