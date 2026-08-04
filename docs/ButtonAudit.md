# Button Audit

## Rule

Every clickable element must do one of these:

- Navigate
- Open a dialog
- Perform a backend mutation
- Upload or download
- Be intentionally disabled

## Contracted Actions

- Search jobs navigates to `/jobs`.
- Apply uses `applicationsApi.apply`.
- Save job uses `applicationsApi.saveJob`.
- Share job uses `jobsApi.share`.
- Upload resume uses `profileApi.uploadResume`.
- Save profile uses `profileApi.updateCandidate`.
- Withdraw uses `applicationsApi.updateStatus`.
- Register company uses `companyApi.register`.
- Create/publish job uses `jobsApi.create` and `jobsApi.setStatus`.
- Shortlist, interview, offer, and hire use application APIs.
- Admin approval, moderation, feature job, report export, and CMS actions use admin APIs.
- Notifications can be marked read or deleted.

## Score

Button contract score: 100% for the registered Sprint 23 action map.

## Remaining Manual QA

Run click-through QA in browser with seeded candidate, employer, and admin accounts to confirm each rendered button is wired to the registered contract.

