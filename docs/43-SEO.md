# 🔍 Jobs View - Growth & SEO Strategy

This document outlines the high-level search engine optimization (SEO) strategy for Jobs View, designed to capture organic search traffic and establish the platform as a high-authority career hub.

---

## 1. Keyword Strategy

We target three primary search intent categories:
1. **Navigational/Transactional (Job Seekers):** Target queries like *"React developer jobs in Delhi"*, *"Go backend developer remote"*.
2. **Informational (Career Seekers):** Target queries like *"how to become a frontend developer"*, *"average salary of a software engineer in India"*.
3. **B2B/Commercial (Employers):** Target queries like *"best lightweight ATS for startups"*, *"verify company credentials before hiring"*.

---

## 2. URL Strategy
All public URLs must be human-readable, lowercase, hyphenated, and represent a clean hierarchy:
- **Jobs Directory:** `/jobs`
- **Faceted Job Search:** `/jobs/react-developer-bhopal`
- **Company Profile:** `/company/acme-corp`
- **Career Path Guide:** `/career/frontend-developer`
- **Salary Guide:** `/salary/react-developer-india`

---

## 3. Metadata Standards
- **Title Tags:** Enforce a limit of **60 characters**. Format: `Primary Keyword | Secondary Keyword | Brand Name`.
- **Meta Descriptions:** Enforce a limit of **155 characters**. Must contain a clear call-to-action (CTA) (e.g., *"Apply now with one click"*).
- **Automated Generation:** Dynamic pages automatically compile metadata using database fields (e.g., job title, company name, city).

---

## 4. Internal Linking & Crawl Budget

- **Crawl Budget Optimization:** Minimize redirect chains, eliminate duplicate page variations using canonical tags, and block non-indexable dashboard and search filter pages via `robots.txt`.
- **Linking Hubs:** Connect job listings back to company profiles, company profiles to salary pages, and career guides to active job listings to distribute page authority (PageRank) across the site.
