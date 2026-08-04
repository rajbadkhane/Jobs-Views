# 📍 Jobs View - Local SEO Strategy

This document outlines the strategy to capture localized search traffic (e.g., "jobs near me" or "software jobs in Bhopal") on Jobs View.

---

## 1. "Jobs Near Me" & Location Pages

Localized search queries represent high-intent traffic. We capture this through a dedicated location hierarchy.

### 1.1 City & State Pages
- **URL Structure:**
  - State Page: `/jobs/in-{state-slug}` (e.g., `/jobs/in-madhya-pradesh`)
  - City Page: `/jobs/{role-slug}-in-{city-slug}` (e.g., `/jobs/react-developer-in-bhopal`)
- **Content:** These pages are programmatically generated and contain:
  - Local job listings.
  - Average salary metrics for that specific city.
  - A list of the top hiring companies located in that city.

### 1.2 Geolocation Routing (`/jobs/near-me`)
- When a user visits `/jobs/near-me`, the frontend requests the user's location via the browser's Geolocation API.
- The system resolves the latitude/longitude to the nearest city in our database and performs a client-side redirect to the corresponding city page (e.g., `/jobs/in-bhopal`).
- If geolocation permission is denied, the page falls back to a general search input with a list of major metro cities.

---

## 2. Location Schema & Structured Data

To help Google understand where jobs are located, we embed precise location schemas.

- **Postal Address:** Every job posting must include a verified `postalAddress` inside the `JobPosting` schema, even for hybrid roles.
- **Remote / Telecommute:** For fully remote jobs, the `jobLocation` schema must be configured as:
  ```json
  "jobLocationType": "TELECOMMUTE",
  "applicantLocationRequirements": {
    "@type": "Country",
    "name": "IN"
  }
  ```
  This tells Google that the job is remote but restricted to applicants residing in India.

---

## 3. Google Business Profile & Citations
- **Company Office Schema:** For verified companies with physical offices, we encourage them to link their Google Business Profile to their Jobs View company profile.
- **Local Citations:** Ensure company addresses listed on Jobs View match their official listings across the web to build local search trust.
