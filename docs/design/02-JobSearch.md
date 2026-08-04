# 02 - Job Search

## Goal

Redesign only the job search experience. Preserve search route, filters, query behavior, pagination/infinite loading assumptions, and job card actions.

## Search Experience

Use a prominent search bar with keyword, location, experience, salary, remote/work mode, and submit action. Search should feel fast and reliable.

## Advanced Filters

Filters include category, company, industry, city, state, country, salary, experience, job type, remote, and posted date. Use sidebar on desktop and drawer on mobile.

## Sidebar

Desktop sidebar should be sticky and scannable. Mobile sidebar becomes a filter drawer.

## Sort

Support latest, relevance, salary, and company sorting. Use compact select or segmented control.

## Pagination and Infinite Scroll

Use pagination for deterministic lists and infinite scroll where already implemented. Preserve existing behavior.

## Job Cards

Cards show title, company, location, work mode, salary, job type, skills, posted date, save/share/apply actions, and status where relevant.

## Company Cards

Use small company cards in suggestions or sidebar with logo, verification badge, open jobs, and industry.

## Suggestions

Show autocomplete, related roles, similar skills, and related locations where available.

## Search History

Show recent searches if data exists. Provide clear action to rerun search.

## Trending Searches

Show trending roles, skills, and cities as chips.

## Loading

Use skeleton job cards and filter skeletons.

## Empty State

Show no-results guidance, remove filters action, and related searches.

## Accessibility

Filters must be keyboard operable and labeled. Results count should be announced visibly.

## Responsive

Mobile results should be single-column. Filters open in drawer. Sticky search can remain at top.

## Animation

Use quick filter drawer transition, card hover, and result fade only.

## Prompt For Stitch

Read `00-DesignSystem.md` then redesign ONLY Job Search. Preserve existing search, filter, sort, pagination, save, share, and apply behavior.
