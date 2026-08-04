# 🌐 Jobs View - International SEO Strategy (Future Roadmap)

This document outlines the internationalization (i18n) and localization (l10n) strategies to scale Jobs View across different countries and languages.

---

## 1. URL Structure for International Markets

We use a **subfolder** structure rather than country-specific top-level domains (ccTLDs) or subdomains to consolidate domain authority.

- **Primary Domain:** `https://Jobs View.com` (Defaults to India market `/in` or global `/en`)
- **Regional Paths:**
  - United States: `https://Jobs View.com/us/`
  - United Kingdom: `https://Jobs View.com/gb/`
  - India (English): `https://Jobs View.com/in/`
- **Benefits:** All backlinks and SEO authority benefit the primary domain `Jobs View.com` rather than being split across multiple domains.

---

## 2. Multilingual Targeting (`hreflang`)

To serve the correct language and regional version of a page to users based on their location and language settings, we implement `hreflang` tags.

- **Implementation:** Every localized page must include `hreflang` links in the HTML `<head>` pointing to all regional variations of that page, plus an `x-default` fallback.
- **Example:**
  ```html
  <link rel="alternate" hreflang="en-US" href="https://Jobs View.com/us/jobs/react-developer" />
  <link rel="alternate" hreflang="en-IN" href="https://Jobs View.com/in/jobs/react-developer" />
  <link rel="alternate" hreflang="x-default" href="https://Jobs View.com/jobs/react-developer" />
  ```

---

## 3. Dynamic Currency & Localization

- **Currency Conversion:** Salaries are stored in the database in their native currency (e.g., USD, INR, GBP). The Go API detects the user's location via IP address (using Cloudflare headers like `CF-IPCountry`) and dynamically displays the salary in the user's local currency alongside the original currency:
  - *Example:* `$80,000 USD (~₹66,00,000 INR)`
- **Date Formatting:** Dates, times, and numbers are formatted using the browser's local settings (`Intl.DateTimeFormat` and `Intl.NumberFormat`) in the frontend.
- **Language Detection:** The server detects the browser's `Accept-Language` header and redirects the user to the appropriate subfolder if a translation is available, while allowing the user to manually override their language preference.
