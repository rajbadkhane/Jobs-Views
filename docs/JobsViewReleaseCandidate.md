# Jobs View Release Candidate

## Brand

Production brand: Jobs View

Tagline: YOUR CAREER. OUR MISSION.

## Applied

- Visible product naming migrated from the internal codename to Jobs View.
- Metadata, OpenGraph, Twitter, structured data, reports, and documentation use Jobs View naming.
- Official color tokens applied through the existing shared CSS variable system.
- Logo aliases added for favicon, Apple touch icon, PWA icons, loading/auth/sidebar/footer usage.
- Web, Admin, and Employer manifests added.
- Admin login route added at `/admin/login`.
- Employer login route added at `/employer/login`.
- Development demo account configuration added outside UI components.
- Portal middleware redirects unauthenticated admin and employer traffic to the correct portal login route.

## Official Tokens

- Primary Blue: `#0A3A7A`
- Primary Blue Hover: `#082E61`
- Primary Orange: `#F59E0B`
- Primary Orange Hover: `#D97706`
- Background: `#F8FAFC`
- Card: `#FFFFFF`
- Dark Background: `#0F172A`
- Text Primary: `#0F172A`
- Text Secondary: `#475569`
- Border: `#E2E8F0`

## Remaining Release Candidate Tasks

- Run browser-based responsive QA at the requested viewport widths.
- Replace copied logo aliases with physically resized icon files if the supplied production logo pack becomes available.
- Start Redis locally or in CI to move API readiness from degraded to healthy.
- Confirm employer approval email templates with a real mail provider.

