# Redesign 2.0 — UX Prototypes

Static HTML/CSS mockups (no build, no app logic, mock data) of the redesigned guest flows with proposed UX improvements layered on top of the existing `@chekinapp/tokens` design system.

## How to view

Open `index.html` in a browser — it links to all prototypes and documents every proposed change with its rationale.

| File | Contents |
| --- | --- |
| `index.html` | Overview + "what changed and why" for each improvement |
| `home.html` | Home / check-in list (mobile): glass chrome, arrival countdown, "next up" spotlight, all-done state |
| `iv-flow.html` | 14 IV screens (mobile): happy path, edge cases (validation fail, camera denied, upload), full liveness sequence |
| `guest-registration.html` | Registration hub, pre-filled review form with auto tags, manual form with autofill card (mobile) |
| `home-desktop.html` | Desktop home: navy sidebar with progress module, hero, checklist with ring + timeline, right rail |
| `iv-flow-desktop.html` | Desktop IV: webcam vs phone choice, QR handoff with live sync, Vela rail in context |
| `guest-registration-desktop.html` | Desktop hub + two-column review form |
| `vela.html` | Vela helper: desktop glass rail, mobile FAB + sheet, and every building block isolated |
| `shared.css` | Design tokens (copied from `@chekinapp/tokens` values) + shared primitives + liquid-glass + Vela + desktop shell |

## Ground rules used

- **No new colors** — every value comes from `packages/tokens` in `../chekin-ui` (brand `#385bf8`, navy `#161643`, cool lavender neutrals, Poppins).
- **Liquid glass is chrome-only** — `backdrop-filter` on top bars, bottom nav, on-camera pills and CTA docks; never on reading surfaces. Solid `rgba` fallbacks included.
- **Motion respects `prefers-reduced-motion`.**
- Poppins is loaded from Google Fonts for the prototype only; the app self-hosts the same family.
