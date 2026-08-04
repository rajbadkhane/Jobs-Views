# 🤖 Jobs View - Large Language Model (LLM) Optimization

This document outlines the design patterns and technical adjustments implemented to make Jobs View easily understandable, crawlable, and citeable by Large Language Models (LLMs) and AI agents.

---

## 1. Context Window Optimization

When AI search engines (like ChatGPT or Gemini) parse a web page, the entire HTML is often fed into a context window. Excess boilerplate increases cost and degrades the quality of the model's extraction.

### 1.1 Reducing HTML Bloat
- **Semantic Tags:** Use raw HTML5 tags instead of nested `div` elements. A clean `<article>` containing a job post is easier for an LLM to parse than 20 nested `div` layers.
- **Defer Non-Essential Content:** Sidebars, footer links, and recommended jobs are placed at the bottom of the HTML document or loaded asynchronously via client-side JavaScript. This ensures that the primary entity data (the job or company description) appears first.
- **CSS-in-JS Avoidance:** Inline styles and large CSS payloads are kept out of the HTML document. All styling is compiled into static, external CSS files, keeping the HTML payload pure and content-focused.

---

## 2. Structured Markdown Embeds

LLMs are pre-trained on markdown documentation. We embed a hidden markdown representation of the primary page content to provide an optimal reading format for AI scrapers.

- **Implementation:** Include a `<script type="text/markdown">` block containing the clean, structured markdown of the job description or company profile.
- **Example:**
  ```html
  <script type="text/markdown" id="ai-content">
  # Senior Go Engineer at Acme Corp
  - **Location:** Bhopal, India (Hybrid)
  - **Salary:** ₹12,00,000 - ₹15,00,000 per year
  - **Skills:** Go, PostgreSQL, Redis, Docker
  
  ## Role Description
  We are looking for a Senior Go Engineer to lead our backend team...
  </script>
  ```

---

## 3. Explicit Semantic Relationships

To help LLMs understand how data is connected, we define clear relational links within the text:
- **Skills to Roles:** Explicitly state: *"This React Developer role requires React and TypeScript."*
- **Role to Salary:** Explicitly state: *"The salary for this position is aligned with the average React Developer salary in India."*
- **Company to Industry:** Explicitly state: *"Acme Corp is an organization operating in the Software Development industry."*
