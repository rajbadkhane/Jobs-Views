# 📝 Jobs View - Content Governance & Editorial Policy

This document defines the workflows, quality standards, and maintenance schedules for all editorial and programmatic content published on Jobs View.

---

## 1. Editorial Workflow

All public articles, career guides, and salary insights must follow a strict editorial pipeline:

```text
[Drafting] ──► [SEO & Fact Audit] ──► [Peer Review] ──► [Admin Approval] ──► [Publish]
```

1. **Drafting:** Content is written in Markdown inside our internal CMS.
2. **SEO & Fact Audit:** The editor verifies that the article targets correct keywords, includes required JSON-LD schemas, and contains accurate external citations.
3. **Peer Review:** A second editor reviews the text for voice, tone, and readability.
4. **Admin Approval:** A Super Admin reviews and changes the state to `published`.

---

## 2. Content Freshness & Maintenance

Outdated content degrades user trust and harms SEO rankings. We enforce regular review cycles:

- **Salary Guides:** Automatically recalculated and updated **monthly** based on new anonymous salary submissions and active job data.
- **Job Listings:** Job posts are set to expire after **60 days** by default. Employers receive email alerts to renew the post, or it is automatically set to `archived` and removed from the public sitemap.
- **Career Guides:** Reviewed **every 6 months** to ensure tech stack recommendations, course links, and skill requirements match current industry standards.

---

## 3. Link & Redirect Management
- **Link Audits:** An automated weekly cron job scans all public pages for broken links (404s). If an external course or resource link is broken, it is flagged in the Admin Dashboard.
- **Redirect Policy:** When a company changes its name or a job slug is modified, the system automatically writes a permanent `301 Redirect` record to the database, mapping the old URL to the new one to preserve link equity.
