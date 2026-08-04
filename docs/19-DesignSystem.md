# 🎨 Jobs View - Design System Specification

This document details the exact design tokens, typography scales, and component specifications to ensure visual consistency across all Jobs View applications.

---

## 1. Color Tokens (HSL Specification)

| Token | Light Mode | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | `hsl(243, 75%, 59%)` | `hsl(243, 75%, 65%)` | Brand accent, active states, CTA buttons |
| **Secondary**| `hsl(172, 66%, 50%)` | `hsl(172, 66%, 45%)` | Highlights, badges, secondary actions |
| **Success**  | `hsl(142, 72%, 40%)` | `hsl(142, 72%, 45%)` | Accepted states, offers, success messages |
| **Warning**  | `hsl(38, 92%, 50%)` | `hsl(38, 92%, 55%)` | Pending states, alerts, warnings |
| **Error**    | `hsl(350, 89%, 60%)` | `hsl(350, 89%, 65%)` | Rejections, critical errors, delete actions |
| **Neutral Bg**| `hsl(210, 40%, 98%)` | `hsl(222, 47%, 11%)` | Main app backgrounds |
| **Neutral Surf**| `hsl(0, 0%, 100%)` | `hsl(223, 47%, 15%)` | Cards, sidebars, modals |
| **Text Pri** | `hsl(222, 47%, 11%)` | `hsl(210, 40%, 98%)` | Headers, body text |
| **Text Sec** | `hsl(215, 16%, 47%)` | `hsl(215, 25%, 70%)` | Captions, secondary info, placeholders |

---

## 2. Typography Scale

- **Display:** `3.00rem` (48px) | Bold | Line-height: 1.1 | Tracking: `-0.02em` | *Font: Outfit*
- **Heading 1:** `2.25rem` (36px) | Bold | Line-height: 1.2 | Tracking: `-0.015em` | *Font: Outfit*
- **Heading 2:** `1.75rem` (28px) | SemiBold | Line-height: 1.25 | Tracking: `-0.01em` | *Font: Outfit*
- **Heading 3:** `1.25rem` (20px) | Medium | Line-height: 1.3 | Tracking: `0` | *Font: Outfit*
- **Body Large:** `1.00rem` (16px) | Regular | Line-height: 1.5 | *Font: Inter*
- **Body Base:** `0.875rem` (14px) | Regular | Line-height: 1.5 | *Font: Inter*
- **Caption:** `0.75rem` (12px) | Medium | Line-height: 1.4 | *Font: Inter*

---

## 3. Component Specifications

### 3.1 Buttons
- **Primary:** Gradient `from(primary) to(indigo-700)`. White text. Border radius `8px`. Active press effect (`scale: 0.98`).
- **Secondary:** Neutral surface color, thin border, text primary.
- **Outline:** Transparent background, `1px` border (neutral-border), text primary.
- **Ghost:** No background or border. Text primary. Background changes to low-opacity gray on hover.

### 3.2 Inputs & Textareas
- **Border:** `1px` solid neutral border. Transition to primary color on focus.
- **Focus Ring:** `0 0 0 3px rgba(79, 70, 229, 0.15)`.
- **States:** Hover, Focus, Disabled, Error (red border + message).

### 3.3 Cards
- **Desktop:** `card-glass` style. `background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.05);`.
- **Hover:** Translation `translateY(-2px)` with shadow transition.

### 3.4 Tables
- **Header:** Background low-opacity gray, text secondary, bold, uppercase.
- **Rows:** Alternating rows or thin bottom borders. Hover state highlights row.
- **Action Cells:** Right-aligned icon buttons.

### 3.5 Modals & Dialogs
- **Backdrop:** `rgba(0, 0, 0, 0.6)` with `backdrop-filter: blur(8px)`.
- **Container:** Centered, slide-in from bottom-center animation, max-width options (`sm`: 400px, `md`: 600px, `lg`: 800px).

### 3.6 Navigation (Sidebar & Navbar)
- **Navbar:** Sticky, glassmorphic backdrop. Houses logo, global search, notifications, and user avatar.
- **Sidebar:** Left-aligned. Houses navigation links. Active link has a vertical primary indicator line and a low-opacity primary background fill.

### 3.7 Feedback & Loaders
- **Toast:** Small cards sliding in from top-right. Success (green icon), Error (red icon), Info (blue icon). Auto-dismiss in 4 seconds.
- **Skeleton Loader:** Pulsing gray blocks (`animation: pulse 1.5s infinite`). Used for content loading states.
- **Empty State:** Centered illustration, title, description, and a clear CTA button (e.g., "Post a Job" or "Browse Jobs").
- **Badges & Chips:** Badges indicate application status. Chips represent skills (with an optional close icon for removal).
