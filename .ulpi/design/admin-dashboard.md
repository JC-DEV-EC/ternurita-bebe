# Admin Dashboard — Component Spec

Builds on `.ulpi/design/DESIGN.md`. Every screen must read as the same product if placed side by side.

## State Model

| state | trigger | UI |
|-------|---------|----|
| loading | initial render | stat cards show pulsing skeleton (neutral bg, no text) |
| loaded | data resolved | cards animate in staggered, counters count up |
| empty | zero products/pedidos | summary shows "0" values naturally; no empty-state banner needed |
| error | API fails | cards show previous values (if any) or "—" silently; no toast/alert |
| refresh | user navigates back | cached data shown immediately, updated in background |

## Components

### StatCard
- **purpose**: Single metric with icon, label, value, trend hint
- **variants**: 4 — orders (blue icon bg), products (purple), users (green), revenue (orange)
- **states**: entering (translateY 12px → 0, opacity 0→1, stagger 100ms), loaded (value animates via anime.js 800ms outQuart), hover (border darkens, translateY -2px)
- **data**: `label`, `value`, `trend`, `icon` (Lucide name), `iconBg` (class for bg color)
- **interaction**: hover lifts card, icon bg stays static
- **responsive**: 4-col → 2-col at 1024px → 1-col at 480px

### ActionsGrid
- **purpose**: 2×2 grid of quick-action links
- **states**: default, hover (accent border + light bg)
- **data**: array of `{ href, icon, label }`
- **responsive**: 2×2 → 4×1 stack at 480px

### SummaryList
- **purpose**: Label-value rows with double-border total row
- **states**: default (rows separated by light border), total (2px top border, accent value)
- **data**: array of `{ label, value, accent? }`
- **accessibility**: tabular-nums for value alignment

## Build Handoff

**Target agent**: me (current session) — implement the dashboard components per spec above, keeping existing Apple-inspired tokens and Lucide/anime.js setup. Acceptance: stat cards animate in with stagger, counters animate from 0, summary shows data clearly, responsive breakpoints match spec.
