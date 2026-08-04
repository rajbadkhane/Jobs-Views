# 🎨 Jobs View - Design Philosophy

This document defines the design principles that guide the user interface (UI) and user experience (UX) of Jobs View, drawing inspiration from industry leaders like Apple, Stripe, Linear, Vercel, and Notion.

---

## 1. Core UI/UX Principles

### 1.1 Aesthetic Minimalism (Vercel & Apple Inspiration)
- **High Contrast:** Pure dark backgrounds paired with crisp white text and vibrant accents. Avoid muddy grays.
- **Visual Hierarchy:** Use font size, weight, and color opacity (not borders) to separate information.
- **Glassmorphic Depth:** Use semi-transparent layers (`backdrop-filter: blur(12px)`) with thin, low-opacity borders (`rgba(255, 255, 255, 0.05)`) to create a stackable, premium 3D desktop feel.

### 1.2 High-Velocity Utility (Linear Inspiration)
- **Keyboard-First Navigation:** Every major action (switching tabs, searching jobs, opening profiles) must be achievable via keyboard shortcuts. A global command palette (`Cmd/Ctrl + K`) acts as the navigation hub.
- **Optimistic Updates:** UI state changes (like moving an applicant from "Applied" to "Shortlisted" on the Kanban board) must update instantly on the screen before the server response completes, reverting only on failure.
- **Zero Page Reloads:** Seamless client-side transitions to maintain focus.

### 1.3 Radical Context-Awareness (Stripe & Notion Inspiration)
- **Side Drawers over Modals:** When viewing a job description or candidate profile, slide open a side-drawer instead of a full-screen modal or navigating to a new page. This preserves the user's search or listing context.
- **Inline Editing:** Allow employers and candidates to edit profile sections inline rather than forcing them through complex multi-step forms.

---

## 2. Mobile-First & Responsive Strategy

- **Fluid Layouts:** Grids must reflow dynamically from a 1-column layout on mobile (320px–425px) to multi-column layouts on ultra-wide screens.
- **Touch-Friendly Targets:** Interactive elements on mobile must have a minimum touch target of `48px x 48px`.
- **Bottom Sheets:** Replace desktop side-drawers with slide-up bottom sheets on mobile devices to align with native mobile patterns.

---

## 3. Accessibility & Trust

- **WCAG 2.1 AA Compliance:** Maintain a minimum contrast ratio of `4.5:1` for normal text and `3:1` for large text.
- **Keyboard Focus Indicators:** Visible, high-contrast focus rings on all interactive elements (e.g., `focus-visible:ring-2 focus-visible:ring-indigo-500`).
- **Screen Reader Support:** Semantic HTML5 elements (`<main>`, `<nav>`, `<header>`, `<article>`) and descriptive `aria-label` tags on icon-only buttons.
- **Trust Indicators:** Clear badges showing company verification status and public responsiveness metrics to eliminate skepticism.
