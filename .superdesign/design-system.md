---
product: Khoj
audience: "College students (18-24), mobile-first"
style: "Editorial campus bulletin board meets modern web app"
last_updated: "2026-04-01"
---

# Khoj Design System (Campus Bulletin)

## Brand idea

Khoj should feel like a campus bulletin board you’d actually trust: warm, high-contrast, a little “printed poster” editorial — but still fast and modern on mobile.

## Non-negotiables (hard constraints)

- No purple gradients.
- No generic blue primary buttons.
- No Inter / Roboto.
- Mobile-first touch targets (44px+).

## Typography

- **Headings**: `Saira Condensed` (bold, condensed, poster-like)
  - Use for: page titles, section headers, stat numbers, key CTAs.
- **Body/UI**: `Source Sans 3` (warm-neutral UI sans, highly readable)
  - Use for: body text, form labels, helper text, metadata.

Hierarchy (mobile):
- H1: 30–34px, 700–800, tight leading
- H2: 22–26px, 700
- H3: 18–20px, 700
- Body: 14–16px, 400–600
- Meta: 12–13px, 500

## Color system

### Base (deep neutral)
- Background: `surface.50`
- Card: `surface.0` (white)
- Text: `ink.950`
- Muted text: `ink.600`
- Borders: `ink.200`

### Brand accent (saffron/amber)
- `primary` is warm amber (not blue).
- Use sparingly but consistently: focus rings, active tabs, primary CTA, key highlights.

### Semantic energy (lost vs found)

- **Lost** (urgent): red → amber energy (attention, urgency)
  - Use for: “Lost” badges, urgent labels, lost CTA blocks.
- **Found** (hopeful): warm green energy (optimistic, actionable)
  - Use for: “Found” badges, claim flows, success CTAs.

## Components (styling rules)

### Buttons
- Primary: amber fill, dark text or white depending on contrast; subtle shadow.
- Secondary: neutral fill.
- Outline: neutral border; hover uses warm tint.
- Never use default “blue button” styling.

### Cards
- Slightly “paper” feel: warm background tint options, crisp border, soft shadow.
- Bulletin vibe: optional pinned corner marker / label chip; use restrained.

### Badges
- Found/Lost are semantically colored.
- Category badges are neutral, not loud.

### Forms
- Inputs: rounded 14–16px, strong focus ring in amber, subtle background tint.
- Group fields into sections like a posting form on a noticeboard.

## Layout patterns

- Sticky header stays clean; primary actions are obvious.
- Feed: tight, scannable cards; metadata is secondary; type (lost/found) is immediate.
- Filters: “drawer / panel” feel; avoid generic filter blocks.

## Motion

- Use short, tactile transitions (100–200ms) for hover/tap.
- Prefer subtle y/scale micro-interactions already present via framer-motion.

