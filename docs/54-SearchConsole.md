# 🔍 Jobs View - Google Search Console Integration

This document defines the setup, verification, and monitoring protocols for Google Search Console (GSC) to optimize Jobs View crawl efficiency and indexation status.

---

## 1. Domain Verification & Setup

To manage indexing and view search performance across all subdomains and protocol variations, we verify ownership at the **Domain level** (not URL prefix).

- **Method:** **DNS TXT Record**
- **Record Details:**
  - **Host/Name:** `@` (or leave blank)
  - **Type:** `TXT`
  - **Value:** `google-site-verification=GSC_VERIFICATION_TOKEN_HERE`
- **TTL:** `3600`
- **Fallback:** If DNS access is restricted, use the **HTML File Verification** method, placing the verification file in the Next.js `/public` directory.

---

## 2. Sitemap Submission

Once verified, the primary sitemap index is submitted to GSC:
- **Sitemap URL:** `https://Jobs View.com/sitemap.xml`
- **Monitoring:** Set up automated alerts to check for *Sitemap could not be read* errors or *Disallowed by robots.txt* warnings.

---

## 3. URL Inspection & Indexing API Integration

For job postings, waiting for Google's standard crawl cycle is too slow. Jobs can be filled or expire in days.

- **Google Indexing API:** We integrate the Go backend directly with the Google Indexing API.
- **Trigger Events:**
  - **Job Published:** Send a `URL_UPDATED` request to notify Google to crawl and index the new job immediately.
  - **Job Closed/Archived:** Send a `URL_DELETED` request to notify Google to remove the expired job page from search results.
- **Go API Implementation:**
  ```go
  package service
  
  import (
      "golang.org/x/oauth2/google"
      "google.golang.org/api/indexing/v3"
  )
  
  func NotifyGoogleOfJobUpdate(url string, action string) error {
      // Authenticate using service account JSON credentials
      ctx := context.Background()
      client, err := google.DefaultClient(ctx, indexing.MetadataScope)
      service, err := indexing.NewService(ctx, option.WithHTTPClient(client))
      
      req := &indexing.UrlNotification{
          Url:  url,
          Type: action, // "URL_UPDATED" or "URL_DELETED"
      }
      
      _, err = service.UrlNotifications.Publish(req).Do()
      return err
  }
  ```

---

## 4. Rich Results & Coverage Monitoring

We monitor GSC dashboards weekly for:
- **Merchant Listings & Jobs:** Ensure no errors in the `JobPosting` schema (e.g., missing `hiringOrganization` or `jobLocation`).
- **FAQ Rich Results:** Ensure `FAQPage` schemas are parsed correctly.
- **Index Coverage:** Monitor the *Excluded* tab for pages blocked by `robots.txt` or marked as *Crawled - currently not indexed*, indicating potential thin content issues.
