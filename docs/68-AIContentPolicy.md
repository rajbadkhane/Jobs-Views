# 🤖 Jobs View - AI Content Policy & Governance

This document establishes the quality standards, verification rules, and spam prevention policies for AI-generated and AI-assisted content on Jobs View.

---

## 1. Core AI Content Principles

As AI tools are increasingly used to write job descriptions, generate resumes, and write career guides, Jobs View enforces three core pillars: **Accuracy, Human-in-the-Loop, and Transparency.**

### 1.1 Accuracy & Hallucination Prevention
- **Resumes:** When parsing resumes, the AI parser must only extract verified text. It is strictly forbidden to extrapolate or assume skills or experience not explicitly written in the uploaded PDF.
- **Job Postings:** If an employer uses our AI job description generator, the tool must require specific inputs (role, tech stack, experience, location) and cannot hallucinate benefits, salary ranges, or company details.

### 1.2 Human-in-the-Loop (HITL) Enforceability
- AI-generated content (e.g., an AI-drafted job description or an AI-generated resume summary) must be saved as a **draft**.
- The content **cannot** be published publicly until a human user (employer or candidate) reviews, edits, and manually clicks "Publish".

---

## 2. Spam Prevention & Quality Control

To prevent the platform from being flooded with low-quality, AI-spun job posts or candidate profiles:

- **Mass Posting Blocks:** We implement rate limits on job creation (max 3 jobs per hour for Pro accounts, 1 for Free accounts) to prevent script-driven AI job spam.
- **AI Content Detection (Internal):** We run basic heuristics (e.g., repeating phrases, lack of specific formatting, generic text) to flag suspicious job posts for manual admin review.
- **Reporting System:** Every public job posting features a prominent **"Report Job"** button, allowing candidates to flag suspicious, scam, or AI-spam listings.

---

## 3. Citations & Authority (E-E-A-T)
- **Salary Data:** All salary stats and calculators must cite their data sources (e.g., *"Based on 142 anonymous salary submissions on Jobs View"*).
- **Career Advice:** Blog posts and career guides must contain author bios showing real-world expertise (Experience, Expertise, Authoritativeness, Trustworthiness). Purely AI-written blog posts without human review and editing are disallowed.
