# 💬 Jobs View - Answer Engine Optimization (AEO)

This document outlines the design and content structures optimized to capture featured snippets and direct answers in traditional and AI search engines.

---

## 1. Structured Snippets & Quick Answers

To win "Position Zero" (Featured Snippets) on Google and direct citations in AI engines, we implement target content blocks.

### 1.1 The "Definition" Snippet
For salary and career path pages, include a concise, 40–50 word summary paragraph directly below the main heading answering the core question.
- *Example (Salary Page):* *"The average salary for a React Developer in Bhopal is ₹6,50,000 per year. Salaries range from a minimum of ₹4,00,000 for junior roles to ₹12,00,000 for senior positions, depending on experience and skills."*

### 1.2 Table & List Snippets
- **Job Requirements:** Always format job requirements and benefits as clean bulleted lists (`<ul>` / `<li>`), which search engines scrape for quick lists.
- **Salary Overviews:** Present salary ranges, city comparisons, and experience tiers in structured `<table>` formats.

---

## 2. Q&A and FAQ Integration

Every career, salary, and company page must include a structured **Frequently Asked Questions (FAQ)** section at the bottom.

### 2.1 Content Structure
FAQs must use direct, natural language questions as headings (`h3`) followed by immediate, clear answers:
- *Q: What is the starting salary for a React Developer in Bhopal?*
- *A: The starting salary for an entry-level React Developer in Bhopal is approximately ₹4,00,000 per year.*

### 2.2 FAQ Schema (`FAQPage`)
Accompany all FAQ sections with the corresponding JSON-LD schema to help search engines render dropdown Q&A rich snippets in search results:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is the starting salary for a React Developer in Bhopal?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "The starting salary for an entry-level React Developer in Bhopal is approximately ₹4,00,000 per year."
    }
  }]
}
```
---

## 3. Voice-Search Optimization
- Keep sentences short and conversational.
- Target long-tail, question-based keywords (e.g., *"where can I find remote Go developer jobs?"* rather than just *"Go developer jobs"*).
- Include natural language headings that mirror voice queries.
