# 🗣️ Jobs View - Voice Search Optimization

This document defines the strategies to optimize Jobs View for voice-activated search queries (e.g., Google Assistant, Apple Siri, Amazon Alexa, and voice inputs in AI search).

---

## 1. Conversational & Long-Tail Queries

Voice search queries are longer, more conversational, and typically framed as complete questions compared to text-based keyword searches.

- **Text Search:** `React jobs Bhopal`
- **Voice Search:** *"Find me a React developer job in Bhopal that pays more than six lakhs."*

### 1.1 Content Optimization
- **Natural Language Headings:** Use question-based headings (e.g., `<h3>How much does a React Developer make in Bhopal?</h3>`) rather than flat keywords.
- **Immediate Answers:** Directly follow question headings with a clear, concise answer sentence (under 30 words). This makes it easy for voice assistants to read the snippet aloud.

---

## 2. Structured FAQ & Speakable Schema

### 2.1 Speakable Schema (`Speakable`)
We implement the `Speakable` schema to identify sections of a page that are particularly suitable for audio playback by voice assistants.

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "React Developer Salaries in India",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [
      ".voice-summary",
      ".average-salary-text"
    ]
  }
}
```

---

## 3. Local Voice Search ("Near Me")
Many voice searches are location-bound (e.g., *"What companies are hiring software engineers near me?"*).
- We ensure our local city pages (`/jobs/in-bhopal`) and Google Business Listings are fully synchronized to capture local voice queries routed through mobile navigation assistants.
- Use simple, easy-to-pronounce city and state names in slugs and page titles.
