# 📊 Jobs View - AI Analytics & Referral Tracking

This document defines the metrics and tracking mechanisms used to measure Jobs View visibility and traffic originating from Generative AI search engines and LLM agents.

---

## 1. Tracking AI Search Referrals

We track incoming visitors originating from conversational AI platforms using HTTP referrer headers and query parameters.

### 1.1 Referrer Domain Analysis
We log and categorize traffic from the following domains in our analytics database:
- `chatgpt.com` / `chat.openai.com` (ChatGPT Search)
- `perplexity.ai` (Perplexity)
- `claude.ai` / `claude.app` (Claude)
- `copilot.microsoft.com` / `bing.com/chat` (Microsoft Copilot)
- `gemini.google.com` (Google Gemini)

### 1.2 Custom UTM Tracking for AI Links
If an AI engine extracts links from our sitemaps or schemas, we encourage tracking by appending `utm_source=ai_search` or specific engine tags where possible, allowing us to segment this traffic in our Plausible/GA4 dashboards.

---

## 2. Bot Traffic & Crawler Monitoring

We monitor how frequently AI search bots crawl our pages to ensure they have access while protecting server resources.

### 2.1 AI Bot User-Agents
We track and log requests from the following user-agents in our Go middleware:
- `GPTBot` / `ChatGPT-User` (OpenAI)
- `ClaudeBot` (Anthropic)
- `PerplexityBot` (Perplexity)
- `Google-Extended` (Google Gemini crawler)
- `BingPreview` (Bing Copilot)

### 2.2 Rate Limit Exclusions
While we rate-limit aggressive scraper bots, verified AI search indexers (like `GPTBot` and `PerplexityBot`) are granted higher rate-limit thresholds, provided they respect the `crawl-delay` directives in our `robots.txt`.

---

## 3. Share of Voice (SOV) Benchmarking
- **Manual/Automated Prompt Audits:** We run weekly automated scripts that query LLM APIs (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro) with target queries (e.g., *"What are the best Go developer jobs in Bhopal?"* or *"What is the average salary of a React developer in India?"*).
- **Metric:** We record whether Jobs View is mentioned, cited, or linked in the AI's response to measure our organic AI search visibility over time.
