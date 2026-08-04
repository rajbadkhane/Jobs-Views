# 🖼️ Jobs View - Image SEO & Optimization Strategy

This document defines the image optimization standards, alt text rules, and delivery strategies for all visual assets on Jobs View.

---

## 1. Alt Text Strategy

Alt text provides context to search engine bots and screen readers. Every image on Jobs View must have descriptive, keyword-rich alt text.

- **Logo Alt Text:** Format: `{Company Name} Logo - Careers on Jobs View`.
  - *Example:* `Acme Corp Logo - Careers on Jobs View`
- **Avatar Alt Text:** Format: `Profile photo of {Candidate Name} - {Title}`.
- **Illustration Alt Text:** Describe the function of the graphic (e.g., `Illustration showing candidate tracking applications on a Kanban board`).
- **Rule:** Never use generic phrases like *"image"* or *"icon"*.

---

## 2. Next-Gen Formats & Compression

We convert all user-uploaded images (logos, profile photos) into modern, highly compressed formats to reduce page weight:

- **WebP:** Used as the baseline standard due to wide browser compatibility and ~30% smaller size than PNG/JPEG.
- **AVIF:** Used for high-quality banners and illustrations where supported (offers ~50% savings over JPEG).
- **Processing Pipeline:** When an employer uploads a logo, a background worker in the Go API resizes the image to a maximum dimension of `512px` (width/height), strips metadata, converts it to WebP at `80%` quality, and saves it to Cloudflare R2.

---

## 3. Next.js Image Component Standards

All frontend images must be rendered using the Next.js `<Image>` component, which automates responsive sizes and lazy loading.

- **Lazy Loading:** Enabled by default. The browser only downloads images as they approach the viewport.
- **Priority Loading:** For above-the-fold images (like the hero banner or primary company logo on a job page), disable lazy loading and set `priority={true}` to improve Largest Contentful Paint (LCP).
- **Sizes Attribute:** Always define the `sizes` attribute to prevent serving desktop-sized images to mobile devices.
  ```tsx
  <Image
    src={company.logo_url}
    alt={`${company.name} Logo`}
    width={80}
    height={80}
    sizes="(max-width: 640px) 48px, 80px"
    priority={true}
  />
  ```

---

## 4. CDN Delivery (Cloudflare)
All assets are served via Cloudflare, caching images at the edge. Cloudflare's Polish or Mirage features are enabled to automatically optimize image delivery based on the user's device and connection speed.
