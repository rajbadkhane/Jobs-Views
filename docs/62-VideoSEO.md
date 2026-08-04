# 📹 Jobs View - Video SEO Strategy (Future Roadmap)

This document outlines the SEO and technical implementation strategy for future video features on Jobs View, including company culture videos, video resumes, and course previews.

---

## 1. Video Hosting Strategy

To prevent video payloads from slowing down page load times, we avoid self-hosting raw video files on our main servers.

- **Primary Provider:** **Cloudflare Stream**
  - *Rationale:* Offers adaptive bitrate streaming (HLS/DASH), global CDN delivery, customizable HTML5 players, and allows us to upload videos via API. It keeps video streaming traffic completely isolated from our Go API.
- **Alternative:** Embedded YouTube or Vimeo players for marketing and blog pages.

---

## 2. Video Schema (`VideoObject` JSON-LD)

To help search engines index our videos and display them in the "Videos" search tab, every page containing a video must embed a `VideoObject` schema.

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Acme Corp Office Culture & Team Tour",
  "description": "Take a look inside the Acme Corp office in Bhopal and meet the engineering team.",
  "thumbnailUrl": [
    "https://r2.Jobs View.com/videos/thumbnails/acme-tour.jpg"
  ],
  "uploadDate": "2026-06-27T12:00:00Z",
  "contentUrl": "https://stream.cloudflare.com/acme-tour/manifest.mpd",
  "embedUrl": "https://iframe.videodelivery.net/acme-tour",
  "interactionStatistic": {
    "@type": "InteractionCounter",
    "interactionType": { "@type": "WatchAction" },
    "userInteractionCount": 1420
  }
}
```

---

## 3. Performance & Lazy Loading
- **Lazy Load Players:** Video players must be lazy-loaded. Instead of loading the heavy video player script on page load, render a static preview image (thumbnail) with a "Play" button overlay. The actual player iframe or video element is only injected when the user clicks the play button.
- **Preconnect:** Add `<link rel="preconnect" href="https://iframe.videodelivery.net" />` to resolve DNS lookups early for Cloudflare Stream.
- **Autoplay Restrictions:** Videos must not autoplay with sound, complying with browser policies and preventing Cumulative Layout Shift (CLS) during page loading.
