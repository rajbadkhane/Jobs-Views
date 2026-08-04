# 🎨 Jobs View - UI Design System

This design system defines the visual language, design tokens, and core components of Jobs View. It is optimized for a premium, high-contrast, glassmorphic look in both Light and Dark modes.

---

## 1. Typography & Hierarchy

We use **Inter** for body copy and UI elements, and **Outfit** for headings (sourced from Google Fonts).

- **Headings (Outfit):**
  - `h1`: 2.25rem (36px) | Bold | Line-height: 1.2
  - `h2`: 1.75rem (28px) | SemiBold | Line-height: 1.25
  - `h3`: 1.25rem (20px) | Medium | Line-height: 1.3
- **Body & UI (Inter):**
  - `body-large`: 1rem (16px) | Regular/Medium | Line-height: 1.5
  - `body-base`: 0.875rem (14px) | Regular | Line-height: 1.5
  - `body-small`: 0.75rem (12px) | Regular/Medium | Line-height: 1.4

---

## 2. Color Tokens (HSL Palette)

We utilize a sophisticated HSL color palette to support seamless dark-mode transitions and modern aesthetics.

### 2.1 Dark Mode (Primary Theme)
- **Background (Deep Slate):** `hsl(222, 47%, 11%)` (`#0f172a`)
- **Card/Surface:** `hsl(223, 47%, 15%)` (`#1e293b`) with `rgba(255, 255, 255, 0.03)` glassmorphic borders.
- **Text Primary:** `hsl(210, 40%, 98%)` (`#f8fafc`)
- **Text Secondary:** `hsl(215, 25%, 70%)` (`#94a3b8`)

### 2.2 Light Mode (Alternative Theme)
- **Background (Soft Gray):** `hsl(210, 40%, 98%)` (`#f8fafc`)
- **Card/Surface:** `hsl(0, 0%, 100%)` (`#ffffff`) with subtle shadows (`0 4px 6px -1px rgba(0,0,0,0.05)`).
- **Text Primary:** `hsl(222, 47%, 11%)` (`#0f172a`)
- **Text Secondary:** `hsl(215, 16%, 47%)` (`#64748b`)

### 2.3 Brand & Accents (Shared)
- **Primary (Electric Indigo):** `hsl(243, 75%, 59%)` (`#4f46e5`) | Hover: `hsl(243, 75%, 49%)`
- **Secondary (Vibrant Teal):** `hsl(172, 66%, 50%)` (`#14b8a6`)
- **Success (Emerald):** `hsl(142, 72%, 40%)` (`#10b981`)
- **Warning (Amber):** `hsl(38, 92%, 50%)` (`#f59e0b`)
- **Danger (Rose):** `hsl(350, 89%, 60%)` (`#f43f5e`)

---

## 3. Layout, Spacing & Borders

### 3.1 Spacing Grid
We use a **4px base grid** for all margins, paddings, and gaps:
- `xs`: 4px | `sm`: 8px | `md`: 12px | `lg`: 16px | `xl`: 24px | `2xl`: 32px | `3xl`: 48px

### 3.2 Border Radius
Rounded corners soften the UI and feel premium:
- `radius-sm`: 6px (Inputs, Badges)
- `radius-md`: 10px (Buttons, Small Cards)
- `radius-lg`: 16px (Job Cards, Modals)
- `radius-xl`: 24px (Large Containers, Dashboards)
- `radius-full`: 9999px (Pills, Avatars)

---

## 4. UI Elements & Components

### 4.1 Buttons
All buttons feature a subtle transition (`transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`) and scaling micro-animations on hover and active clicks.

- **Primary Button:** Indigo background, white text. Scale up 2% on hover, down 1% on click.
- **Secondary Button:** Dark gray background (Dark mode) or light gray (Light mode) with subtle borders.
- **Glassmorphic Button:** Transparent background, thin border, backdrop-blur (`backdrop-filter: blur(8px)`).
- **Styles:**
  ```css
  .btn-primary {
    background: linear-gradient(135deg, hsl(243, 75%, 59%), hsl(262, 80%, 50%));
    color: white;
    border-radius: var(--radius-md);
    box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.3);
  }
  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px 0 rgba(79, 70, 229, 0.4);
  }
  ```

### 4.2 Inputs
Inputs have clean borders and transition to a glowing primary accent color on focus.
- **Normal State:** Thin gray border.
- **Focus State:** Indigo border, `box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15)`.

### 4.3 Cards (Glassmorphic Card)
Used for jobs, companies, and applications.
```css
.card-glass {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
  transition: transform 0.2s, border-color 0.2s;
}
.card-glass:hover {
  transform: translateY(-2px);
  border-color: rgba(79, 70, 229, 0.3);
}
```

### 4.4 Status Badges
Badges reflect the current state in a clean, pill format with low-opacity backgrounds.

- **Applied:** Background: `rgba(148, 163, 184, 0.1)`, Text: `#94a3b8` (Slate)
- **Reviewed:** Background: `rgba(59, 130, 246, 0.1)`, Text: `#3b82f6` (Blue)
- **Shortlisted:** Background: `rgba(139, 92, 246, 0.1)`, Text: `#8b5cf6` (Purple)
- **Interviewing:** Background: `rgba(245, 158, 11, 0.1)`, Text: `#f59e0b` (Amber)
- **Offered:** Background: `rgba(16, 185, 129, 0.1)`, Text: `#10b981` (Emerald)
- **Rejected:** Background: `rgba(244, 63, 94, 0.1)`, Text: `#f43f5e` (Rose)

---

## 5. Micro-Animations & Transitions

1. **Page Transitions:** Fade and slide-in from bottom (`transform: translateY(10px) -> 0`, `opacity: 0 -> 1`) in 300ms using CSS easing.
2. **Tab Switching:** Sliding underline indicator for tabs on dashboards.
3. **Command Palette (`Cmd + K`):** Instantly appears with a spring animation (`scale: 0.95 -> 1.0` and fade-in).
4. **Notifications:** Toast notifications slide in from the top-right corner, remaining for 4 seconds before fading out.
