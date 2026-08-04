# 🧠 Jobs View - Generative Engine Optimization (GEO)

This document defines the strategies to optimize Jobs View for Generative AI search engines (e.g., ChatGPT Search, Gemini, Perplexity, Claude, Bing Copilot).

---

## 1. AI-Friendly Content & Architecture

Unlike traditional search engines that rely on keywords and backlink counts, generative engines extract facts and synthesize answers from highly structured, authoritative sources.

### 1.1 Factual and Direct Copywriting
- Avoid fluff, marketing jargon, and filler words. AI models prioritize direct, information-dense text.
- *Poor:* *"We are a highly disruptive startup looking for rockstar developers to synergize with our team."*
- *Excellent:* *"Acme Corp is hiring a remote React Developer with 3+ years of experience in TypeScript and Next.js. The role involves building dashboard interfaces and optimizing page performance."*

### 1.2 Semantic HTML & Hierarchy
- Enforce strict HTML5 semantic tags (`<article>`, `<section>`, `<aside>`) to help LLM parsers easily partition page content.
- Use clean table markup (`<table>`, `<thead>`, `<tbody>`) for salary data and job comparisons, as LLMs frequently extract data directly from tables.

---

## 2. Entity-First Content Strategy

Generative engines construct knowledge graphs by connecting entities (people, places, skills, organizations).

- **Entity Tagging:** Every job detail page must explicitly list and tag the core entities involved:
  - **Organization:** `Acme Corp`
  - **Location:** `Bhopal, India`
  - **Skills:** `Go`, `PostgreSQL`, `Docker`
- **Contextual Linking:** Link related entities together (e.g., in a salary guide, link the job title entity directly to the city entity and active job listings) to help LLMs map the relationships.

---

## 3. Knowledge Graph Feed
- **JSON-LD Schema:** Embed comprehensive schema markups on every page. This acts as a machine-readable translation of our page content, making it easy for LLMs to ingest and index without needing complex scraping or parsing algorithms.
- **Dynamic Cite Sourcing:** Format data so that when Perplexity or ChatGPT queries our pages, the text contains clear, quote-ready snippets that the engines can cite directly in their output.
