# 🏷️ Jobs View - Metadata Strategy

This document defines the metadata configurations, Open Graph (OG) tags, and Twitter Cards required on every public page of Jobs View.

---

## 1. Core Metadata Elements

Every public page must render a complete set of metadata tags in the HTML `<head>` to control how the page is displayed in search results and social media shares.

- **Title Tag:** Max 60 characters. Format: `{Page Title} | {Context} | Jobs View`.
- **Meta Description:** Max 155 characters. Summarizes the page and includes a call-to-action (CTA).
- **Keywords:** Focus on 3-5 highly relevant, long-tail terms (optional for Google, but useful for other search indexers).
- **Robots:** Defaults to `index, follow` unless flagged otherwise.

---

## 2. Social Media Tags (Open Graph & Twitter)

To ensure links look professional when shared on LinkedIn, Slack, Twitter, and other platforms.

```html
<!-- Open Graph (Facebook, LinkedIn, Slack) -->
<meta property="og:site_name" content="Jobs View" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://Jobs View.com/jobs/react-developer-bhopal" />
<meta property="og:title" content="React Developer Jobs in Bhopal | Active Openings" />
<meta property="og:description" content="Apply to the best React Developer jobs in Bhopal. Track your application status in real-time." />
<meta property="og:image" content="https://Jobs View.com/api/v1/og/jobs/react-developer-bhopal" />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@Jobs View" />
<meta name="twitter:title" content="React Developer Jobs in Bhopal" />
<meta name="twitter:description" content="Apply and track your application in real-time." />
<meta name="twitter:image" content="https://Jobs View.com/api/v1/og/jobs/react-developer-bhopal" />
```

---

## 3. Next.js Dynamic Metadata Implementation

Using the Next.js App Router, metadata is generated dynamically on the server side:

```typescript
import { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // 1. Fetch data from Go API
  const job = await fetchJobDetails(params.slug);

  if (!job) {
    return {
      title: 'Job Not Found | Jobs View',
    };
  }

  const title = `${job.title} at ${job.company.name} | Jobs View`;
  const description = `Apply for the ${job.title} position at ${job.company.name} in ${job.location}. Salary: ${job.salary_range}.`;
  const ogImage = `https://Jobs View.com/api/v1/og/jobs/${job.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://Jobs View.com/jobs/${params.slug}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
```
---

## 4. Dynamic OG Image Generation
We implement a Go service (or Next.js API route using `@vercel/og`) that dynamically generates PNG images containing the job title, company logo, salary range, and location. This ensures shared links are highly eye-catching and drive higher click-through rates.
