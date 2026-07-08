# Redesign 2.0 — UX Prototypes

Static HTML/CSS mockups (no build, no app logic, mock data) of the redesigned guest flows with proposed UX improvements layered on top of the existing `@chekinapp/tokens` design system.

## How to view

Open `index.html` in a browser — it links to all prototypes and documents every proposed change with its rationale.

One canonical prototype per feature and form factor — organized by feature, with 📱 mobile and 🖥 desktop grouped together. Most are click-through flows; two are static screen sets (Home, desktop registration). `index.html` and the floating nav on every page follow the same feature-first grouping.

| File | Feature / form factor | Contents |
| --- | --- | --- |
| `SPEC.md` | — | **Flow spec for AI agents** — states, transitions, CTA decision tables. Must be updated in the same commit as any UI change here (see its sync contract) |
| `index.html` | — | Overview + "what changed and why" for each improvement |
| `home.html` | Home · 📱 | Home / check-in list (static screens): glass chrome, arrival countdown, "next up" spotlight, all-done state, "Handpicked for your trip" recommendations (native offers + Mozio "HOT DEAL" + Airalo eSIM banners) and a GuruWalk Free-offers FAB |
| `home-desktop.html` | Home · 🖥 | Home (static screens): navy sidebar with progress module, hero, checklist with ring + timeline, right rail, "Handpicked for your trip" 3-col recommendations with the Mozio wide banner + Airalo eSIM banner, Free-offers FAB |
| `flow-iv-mobile.html` | Identity verification · 📱 | Interactive IV flow: passport/ID branches, liveness, upload → crop, QR entry, email + SMS contacts, all detours |
| `flow-iv-desktop.html` | Identity verification · 🖥 | Interactive desktop IV flow: webcam vs phone choice, QR live sync, document choice, back side, contacts, detours |
| `flow-registration.html` | Guest registration · 📱 | Interactive registration flow: hub → add details (scan-to-autofill) → review & sign with agreements + contract opt-in |
| `guest-registration-desktop.html` | Guest registration · 🖥 | Desktop hub + two-column review form with auto tags, signature and agreement clauses (static screens) |
| `flow-registered-modal.html` | Registration complete · 📱🖥 | Interactive "guest registered" modal: offers load during the wait, status flips mid-browse, cart, no-offers, error |
| `flow-payments-mobile.html` | Payments · 📱 | Interactive payments flow: cart with charges-vs-holds ledger, pay later, wallet/card form, 3-D Secure bank step, live confirmation timeline (+ slow fallback), receipt, decline recovery, order history, empty cart, deposit chooser |
| `flow-payments-desktop.html` | Payments · 🖥 | Interactive desktop payments: two-column cart with sticky ledger, card form, confirmation timeline, receipt celebration, decline recovery, order history, deposit chooser — stage-aware Vela rail |
| `flow-taxes-mobile.html` | Tourist taxes · 📱 | Interactive taxes flow: per-guest math card (taxed nights × rate, dashed €0.00 exempt rows), exemption picker with live new-total preview, new-guest exemption, edit-from-cart mode, age-priced region, paid/locked state |
| `flow-taxes-desktop.html` | Tourist taxes · 🖥 | Interactive desktop taxes: math card + sticky total ledger with the confirm CTA, exemption picker with delta preview, edit-from-cart mode, paid/locked state — stage-aware Vela rail |
| `flow-upselling-mobile.html` | Upselling · 📱 | Interactive extras & experiences flow: category pill rail, offer grid with ⚡ Instant / 🕗 On request lane chips, exclusive featured card, instant detail with quantity + "nothing charged now", on-request detail with inline reply email, "My requests" lifecycle tracker (dashed waiting amounts), declined-with-plan-B, partner offers (dashed, external), no-extras empty state |
| `flow-upselling-desktop.html` | Upselling · 🖥 | Interactive desktop upselling: sidebar "Extras & experiences" destination, 3-column grid with lane chips, detail pages with sticky booking box, request tracker in the booking box, "My requests" with sticky ledger (waiting = dashed row), declined state — stage-aware Vela rail |
| `flow-faq-mobile.html` | FAQ & language · 📱 | Interactive FAQ + language: task-grouped accordion with action links, highlight search, no-results with escape actions, language bottom sheet (18 languages, "Suggested" group), instant switch to Español in place |
| `flow-faq-desktop.html` | FAQ & language · 🖥 | Desktop FAQ as a sidebar "Support" destination, highlight search, language dialog (two-column grid), full-shell Español switch — stage-aware Vela rail |
| `vela.html` | Building blocks | Vela helper: desktop glass rail, mobile FAB + sheet, and every building block isolated |
| `modals-demo.html` | Building blocks | QR handoff, share link, photo privacy, skip confirm and the Vela sheet — dialogs vs bottom/right sheets |
| `scroll-demo.html` | Building blocks | Sticky glass chrome / CTA dock / pinned nav scroll behavior on long mobile and desktop layouts |
| `shared.css` | — | Design tokens (copied from `@chekinapp/tokens` values) + shared primitives + liquid-glass + Vela + desktop shell |
| `iv.css` / `ivd.css` / `reg.css` / `deals.css` / `home.css` | — | Per-flow styles for IV mobile / IV desktop / registration / offers modal / home |
| `pay.css` / `payd.css` | — | Payments styles: mobile + shared primitives (`pay.css`), desktop additions (`payd.css` — desktop page loads both) |
| `tax.css` | — | Taxes styles (math card, exemption form, delta preview, paid banner) — layered on `pay.css` primitives; the desktop page also reuses `payd.css` |
| `upsell.css` | — | Upselling styles (category rail, lane chips, offer/partner/request cards, approval tracker, booking box) **plus the partner banners & "Handpicked for your trip" recommendations** (Mozio "HOT DEAL" transfer banner, Airalo eSIM banner, GuruWalk free-offer cards, reco grid, Free-offers FAB) — the banner/reco classes depend only on `shared.css`, so the Home pages load `upsell.css` without `pay.css`; the flow pages layer it on `pay.css` (desktop also `payd.css`) |
| `faq.css` | — | FAQ & language styles (search pill, `<details>` accordion, highlight mark, empty state, language panel + option rows) — layered on `pay.css` primitives; both form factors load it |
| `flow.js` / `modals.js` / `nav.js` | — | Scenario/screen switcher for flows, modal triggers, and the floating feature-first prototype nav |

## Ground rules used

- **No new colors** — every value comes from `packages/tokens` in `../chekin-ui` (brand `#385bf8`, navy `#161643`, cool lavender neutrals, Poppins).
- **Liquid glass is chrome-only** — `backdrop-filter` on top bars, bottom nav, on-camera pills and CTA docks; never on reading surfaces. Solid `rgba` fallbacks included.
- **Motion respects `prefers-reduced-motion`.**
- Poppins is loaded from Google Fonts for the prototype only; the app self-hosts the same family.
