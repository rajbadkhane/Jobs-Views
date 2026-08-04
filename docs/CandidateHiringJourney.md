# Candidate Hiring Journey

## Flow

1. Candidate starts `/candidate/onboarding`.
2. Profile builder autosaves every step into `profile_onboarding_drafts`.
3. Resume upload can happen at any step.
4. Resume parsing writes reviewable extraction into `resume_parse_results`.
5. Candidate reviews extracted profile fields before saving.
6. Smart recommendations rank jobs using education, experience, skills, salary, location, distance, certificates, languages, shift, availability, industry, previous jobs, and career goal.
7. Candidate applies.
8. Application timeline emits status notifications from applied through hired/rejected/withdrawn.
9. Candidate can discuss interviews/offers through conversations.

## Status

Foundation implemented with shared engines, route, and persistence tables. UI can now wire step forms and review screens onto this structure.
