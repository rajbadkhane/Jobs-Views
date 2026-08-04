# 📱 Jobs View - Responsive Strategy

This document outlines the responsive grid system, screen size breakpoints, and layout adaptation rules for Jobs View across mobile, tablet, desktop, and ultra-wide screens.

---

## 1. Breakpoints & Grid System

We use a mobile-first, fluid layout. Below are the standard breakpoints:

| Breakpoint | Range | Label | Device Target | Columns |
| :--- | :--- | :--- | :--- | :--- |
| **xs** | `320px - 374px` | Mobile (Small) | iPhone SE, small devices | 4 |
| **sm** | `375px - 424px` | Mobile (Medium) | iPhone 13/14, Galaxy S Series | 4 |
| **md** | `425px - 639px` | Mobile (Large) | Pixel Fold, large phones | 4 |
| **lg** | `640px - 767px` | Tablet (Portrait) | iPad mini, phablets | 8 |
| **xl** | `768px - 1023px` | Tablet (Landscape) | iPad, iPad Pro | 8 |
| **2xl** | `1024px - 1279px`| Laptop (Small) | MacBook Air 11", small laptops | 12 |
| **3xl** | `1280px - 1535px`| Desktop | Standard monitors, laptops | 12 |
| **4xl** | `1536px - 1919px`| Desktop (Large) | 24" Monitors, iMacs | 12 |
| **5xl** | `1920px+` | Ultra-Wide | 34" Curved monitors, high-res | 12 |

---

## 2. Layout Adaptation Rules

### 2.1 Mobile Viewport (`320px` to `639px`)
- **Navigation:** Main sidebar is completely hidden. It is replaced by a bottom tab bar (Home, Jobs, Applications, Profile) for candidates, and a bottom tab bar or a top-bar hamburger menu for employers.
- **Modals:** All desktop side-drawers and centered modals become **full-screen slide-up bottom sheets** to match native iOS and Android experiences.
- **Grids:** Strict 1-column layouts for job listings, cards, and forms.
- **Buttons:** Primary action buttons are full-width (stacked vertically if there are multiple buttons) to make them easily clickable.

### 2.2 Tablet Viewport (`640px` to `1023px`)
- **Navigation:** Sidebar collapses into an **icons-only vertical bar** to maximize content area.
- **Grids:** 2-column layouts for job cards and dashboard metrics.
- **Tables:** Horizontal scrolling is enabled for data tables, or less important columns are hidden (`display: none`).

### 2.3 Desktop & Ultra-Wide Viewport (`1024px` and above)
- **Navigation:** Fully expanded left sidebar showing icons and text labels.
- **Grids:** 3-column layouts (Left: Navigation, Center: Primary Feed/Table, Right: Detailed Widgets/Filters).
- **Max-Width Container:** On ultra-wide screens (`1920px+`), the main content is wrapped in a `max-w-7xl` (1280px) or `max-w-[1440px]` container and centered on the screen. This prevents text lines from stretching too long, maintaining readability.

---

## 3. Typography & Images

- **Fluid Typography:** Font sizes use CSS `clamp()` to scale smoothly between mobile and desktop without abrupt jumps:
  - *Example:* `font-size: clamp(1.5rem, 4vw, 2.25rem);` for `h1` headings.
- **Responsive Images:** Next.js `<Image>` component must use the `sizes` attribute to prevent loading unnecessarily large images on mobile:
  - *Example:* `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`
