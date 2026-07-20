# Chekin Guest SDK — design prototype

A static, zero-dependency prototype for the **embeddable Guest SDK (ChekinPro)**, sibling of
the guestapp redesign prototype one folder up. Open `index.html` in a browser — no build,
no server needed.

## Why a different design

The guestapp redesign is expressive (gradients, liquid glass, navy shell). The SDK renders
**inside a partner's website**, so this prototype uses the neutral language of the
hosts-sdk in `dashboard-chekin`:

- Muted slate brand `#505077`, cool lavender-gray neutrals, `#df0044` danger.
- **System font stack** — an SDK must not force a webfont download on the host page.
- No photography, no gradients, no glass. Depth comes from 1px borders; radii are 6–12px.
- Everything renders **inside the widget box** (the real SDK's iframe): modals, spinners,
  crashes. The mock partner page ("Nordica Stays") around it never breaks.

Token **names** are shared with the guestapp prototype (`--n-*`, `--border`, `--r-*` …),
plus compatibility aliases (`--navy`, `--blue-500`, `--tint-info`) so `flow.js` and
`modals.js` are copied **verbatim** from the parent prototype. Re-theming = repointing
surface values, same as `@chekinapp/tokens` base + surface files.

## Scope (confirmed)

Home hub · guests summary · guest form (police field sets, hiddenSections, prefillData,
signature) · autofill by OCR · identity verification (+ QR handoff, + QR-IV on property) ·
property link · guidebooks/FAQ · remote access · errors.
**Excluded:** payments, taxes, deposits/PP, upselling, chat, check-out, eSIM, auth, kiosk.

## Files

- `shared.css` — tokens (+ guestapp-name aliases), partner-page chrome, widget chrome, primitives.
- `flow.js`, `modals.js` — copied unchanged from `../`.
- `chrome.js` — Embed (Desktop/Mobile) and Widget-accent toggles (persisted), plus the
  **integration event console**: clicks on `[data-event]` log ChekinPro callbacks;
  screen changes log `onScreenChanged` via a MutationObserver on `.flow-screen.active`.
- `nav.js` — floating switcher (trimmed sibling of the parent one).
- `flow-*.html` — one file per flow; screens are `.sdk-widget.flow-screen` elements driven
  by `data-goto` / `data-scenario` / `data-autonext`, deep-linkable via `#hash`.

## Conventions

- Mock data is hard-coded in markup; JS is UI-only. No `Date.now()` / `Math.random()`.
- Each page ends with a `config-note` naming the real SDK options/events behind the screen
  (`mode`, `hiddenSections`, `enableGuestsRemoval`, `redirectIVQrUrl`, `onIVFinished` …).
- The **Embed: Mobile** toggle narrows the same DOM to a 404px host page — the widget is
  responsive by construction, no separate mobile files.
