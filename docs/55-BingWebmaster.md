# 🔍 Jobs View - Bing Webmaster & IndexNow Integration

This document defines the setup and real-time indexing integration with Bing Webmaster Tools, focusing on powering Bing Copilot and Bing Search.

---

## 1. Verification & Setup

We verify Jobs View on Bing Webmaster Tools using the **Google Search Console Import** feature. This matches our GSC verified domain instantly without requiring additional DNS records.

- **Fallback Method:** If import is unavailable, place the `BingSiteAuth.xml` file in the Next.js `/public` directory.

---

## 2. IndexNow Protocol Integration

Bing, Yandex, and other search engines utilize **IndexNow**, an open protocol that allows websites to notify search engines instantly when content is created, updated, or deleted. This is critical for powering real-time results in **Bing Copilot (AI Search)**.

### 2.1 Implementation Flow
1. **API Key Generation:** Generate a unique key string and host it as a static text file at the root of the site (e.g., `/Jobs View_indexnow_key.txt`).
2. **Post Request:** When a job is published or updated, the Go API sends a POST request to `https://api.indexnow.org/indexnow` containing the URL and the key.

### 2.2 Go Integration Code
```go
package service

import (
	"bytes"
	"encoding/json"
	"net/http"
)

type IndexNowPayload struct {
	Host        string   `json:"host"`
	Key         string   `json:"key"`
	KeyLocation string   `json:"keyLocation"`
	UrlList     []string `json:"urlList"`
}

func SubmitToIndexNow(url string) error {
	payload := IndexNowPayload{
		Host:        "Jobs View.com",
		Key:         "YOUR_INDEXNOW_API_KEY",
		KeyLocation: "https://Jobs View.com/Jobs View_indexnow_key.txt",
		UrlList:     []string{url},
	}

	body, _ := json.Marshal(payload)
	resp, err := http.Post("https://api.indexnow.org/indexnow", "application/json", bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}
```

---

## 3. Monitoring AI Visibility
- **Crawl Reports:** Monitor Bing Webmaster’s *Crawl Control* dashboard to ensure bots are not overloading the Go API.
- **Bing Copilot Referral Tracking:** Track incoming user-agents matching `BingPreview` or referring search parameters from Bing Chat to measure the impact of AI search indexing.
