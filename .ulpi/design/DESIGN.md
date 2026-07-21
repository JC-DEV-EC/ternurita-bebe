---
project: Ternurita Bebé — Admin Panel
register: product
aesthetic_direction: editorial / magazine
color_strategy: restrained
design_system: bespoke (Apple-inspired tokens)
design_variance: 3
motion_intensity: 4
visual_density: 5
---

## Design Read

Calm, editorial clarity — the admin feels like a precision instrument, not a dashboard. Generous whitespace, quiet borders, one accent moment per view.

## Signature

The accent icon tile on stat cards — a 40px rounded square (10px radius) with a single Lucide icon in the brand rose. It is the only color on the card; everything else is monochrome text. One warm note against a neutral field.

## Color (locked)

| role | OKLCH | hex | use |
|------|-------|-----|-----|
| background | oklch(0.99 0.005 80) | #FFFFFF | page / card surfaces |
| surface | oklch(0.97 0.008 80) | #F5F5F7 | secondary fills, code |
| elevated | oklch(0.98 0.006 80) | #FAFAFA | hover / overlay |
| text | oklch(0.2 0.01 280) | #1D1D1F | headings, body |
| text-secondary | oklch(0.55 0.015 280) | #86868B | labels, meta |
| text-tertiary | oklch(0.7 0.012 280) | #B0B0B6 | placeholders, disabled |
| accent (rose) | oklch(0.72 0.09 20) | #E8A0A0 | primary action, active states |
| accent-hover | oklch(0.65 0.1 20) | #D48888 | hover |
| accent-light | oklch(0.92 0.03 20) | #F5E6E6 | light fill (active bg) |
| border-light | oklch(0.92 0.005 280) | #E8E8ED | card borders |
| border-medium | oklch(0.85 0.008 280) | #D2D2D7 | prominent dividers |
| success | oklch(0.6 0.15 145) | #27AE60 | positive metrics |
| warning | oklch(0.75 0.12 80) | #E67E22 | pending attention |
| danger | oklch(0.55 0.18 30) | #DC2626 | destructive actions |

Neutrals tinted +0.005 chroma toward rose/warm. 60-30-10: backgrounds 60%, text/cards 30%, accent 10%.

## Type (locked)

| role | family | use |
|------|--------|-----|
| display | `SF Pro Display`, `-apple-system`, sans-serif | dashboard title, hero numerals |
| body | `SF Pro Text`, `-apple-system`, sans-serif | reading, labels, table content |
| utility | `SF Mono`, `Menlo`, monospace | data values (tabular-nums) |

Paired on weight axis within one family. Measure 65–75ch for body.

## Scales (locked)

- **spacing**: 0.5 / 1 / 2 / 4 / 6 / 8 / 12 rem (xs / sm / md / lg / xl / 2xl / 3xl)
- **radius**: 8px (pill) / 10px (icon) / 12px (card) / 16px (sidebar) / 18px (modal) / 24px (hero)
- **motion**: durations 0.3s / 0.5s / 0.8s; easing `cubic-bezier(0.32, 0.94, 0.6, 1)` for UI, `cubic-bezier(0.34, 1.56, 0.64, 1)` for spring; `prefers-reduced-motion` honored

## Voice

`register:` plain, confident, warm-neutral. `action vocabulary:` consistent Spanish imperative — "Nuevo producto", "Ver pedidos", "Gestionar usuarios". No buzzwords. Titles are nouns; labels are concise; data speaks for itself.
