# Guestapp Redesign 2.0 — Flow Spec for AI Agents

Machine-oriented specification of every prototype flow: states, transitions, and the
**decision logic** an implementation must reproduce. Written so an AI agent (or human)
can build the real feature from it without reverse-engineering the prototype HTML.

> **SYNC CONTRACT — read this first**
>
> This file is the source of truth for flow *behavior*; the HTML prototypes are the
> source of truth for *visuals*. Any change to a prototype file listed in the table
> below MUST be reflected here in the same commit (new/removed screens, renamed hashes,
> changed CTA labels or targets, changed auto-advance timings, new scenarios).
> When you change UI in `prototype/`, update:
> 1. The matching section of this spec (see file → section map).
> 2. The screen-id tables (they double as the deep-link hash registry used by `nav.js`).
> 3. `nav.js` `PAGES[...].subs` if screens were added/renamed.
> 4. "Last synced" below.
>
> | Prototype file | Spec section |
> |---|---|
> | `flow-registered-modal.html` + `deals.css` | §1 Guest-registered modal |
> | `flow-registration.html`, `guest-registration.html`, `reg.css` | §2 Guest registration hub |
> | `flow-iv-mobile.html`, `iv-flow.html`, `iv.css` | §3 Identity verification — mobile |
> | `flow-iv-desktop.html`, `iv-flow-desktop.html`, `ivd.css` | §4 Identity verification — desktop |
> | `home.html`, `home-desktop.html`, `home.css` | §5 Home & check-in list |
> | `vela.html`, vela blocks in other pages | §6 Vela helper |
>
> **Last synced:** 2026-07-07 · all sections match deployed prototypes at
> https://vlad-svr.github.io/guestapp-redesign-prototypes/

Real-code anchors are given as `path/to/Component.tsx` relative to
`apps/guestapp/src/` — the redesign must keep a 1:1 mapping to these components
(project constraint: incremental improvements only, no structural changes).

---

## §1 Guest-registered modal (offers during submission)

**Real components:** `components/GuestRegisteringModal/GuestRegisteringModal.tsx`,
`GuestsProcessingModal.tsx`, `DealsProcessingView.tsx`, `DealsLoadingState.tsx`,
`DealsEmptyState.tsx` · **Prototype:** `flow-registered-modal.html`

Opens when a guest form is submitted (create or edit). Data submission and the offers
fetch run **in parallel**; the status pill reports submission progress while the user
browses offers.

### 1.1 Which variant renders

| Condition (evaluate top-down) | Variant |
|---|---|
| `state === ERROR` | Error modal (§1.5) |
| `shouldShowDeals === false` (upselling off for reservation, non-default layout, or already shown this session — `useShowDealsOnRegistration`) | Plain status modal: pill only, **no offers header, no skeletons** (screens `dm-plain-loading` → `dm-plain-done`) |
| `shouldShowDeals && offers loading` | Skeleton stack + sending pill (`dm-loading`) |
| `shouldShowDeals && offers.length === 0` | No-offers sequence (§1.4) |
| `shouldShowDeals && offers.length > 0` | Offer stack (§1.3) |

Presentation: **bottom sheet on mobile, centered 560 px dialog on desktop**
(maps to `ResponsiveSheet` / `StatusModal maxWidth 560`). The desktop dialog must always
mirror the same logical state as mobile (prototype enforces this with the
`data-dk-var` mirror script).

### 1.2 Status pill (always present except cart/success bodies)

| Submission state | Pill | Copy pattern |
|---|---|---|
| sending | grey/blue, spinner | "Sending {firstName}'s details…" + "feel free to browse meanwhile" |
| success | green, check — **morphs in place ~2.2 s without interrupting browsing** | "{firstName} is registered!" + "{n} of {total} guests done" |
| error | red | "We couldn't register {firstName}" + "Her details are saved on this device" |

Rule: the pill must **never block** the offers UI; registration completing mid-browse
only swaps the pill.

### 1.3 Offer stack — screens & CTA rules

Screens: `dm-offers` (1/3) → `dm-offer-2` (2/3) → `dm-offer-3` (3/3) → `dm-cart` | `dm-done`.

- Progress: labeled segments ("1 of 3"), segments of decided offers turn green.
- Card buttons: ghost **"Not now"** (never red/destructive) advances; primary
  **"Add to cart"** adds then advances; adding shows a toast + persistent cart chip
  ("1 item · €15.00").
- Mobile: swipe left = skip, right = add; hint is a small on-card glass chip
  (non-blocking; replaces the old full-screen `SwipeTutorial`).
- Desktop additions: prev/next arrows, clickable segments, keyboard ←/→; revisiting an
  added offer shows "✓ In your cart · {price}" with **Remove** instead of the buttons.
  Skipped offers stay reachable (skip is not final until the modal closes).
- "Skip offers — continue" link appears **only after** submission succeeded
  (`isRegistrationComplete`), same as today's `SkipAllButton` rule.

### 1.4 Exit CTA decision table (THE core rule)

Applies when the offers run out, "Skip offers" is clicked, or there were no offers.
Mirrors `GuestRegisteringModal.finishProcess` + `DealsProcessingView.handleSkipAll`:

| # | Condition (top-down) | Screen | Primary CTA | Target |
|---|---|---|---|---|
| 1 | cart has ≥1 item (any auto-approved deal added) | `dm-cart` | **"Review & pay"** | `PATHS.payments.main` (cart) |
| 2 | any other guest has `guestapp_status === verification_pending` | `dm-done` | **"Verify {name}'s ID"** | IV flow for that guest (`PATHS.verification.main/{guestId}`) |
| 3 | guests still missing details (`missingGuests > 0`) | `dm-done` | **"Register next guest"** | guest registration hub (`PATHS.guestRegistration`) — unless `hideGuestsSummaryView`, then home |
| 4 | all guests `COMPLETE` | `dm-done` | **"Back to check-in list"** | `PATHS.home`; fire `onAllGuestsRegistered`; kiosko layout → next-step modal instead of navigating |

Secondary link on `dm-cart`/`dm-done`: "Back to guest list" → hub.
Also preserved from today: if `!isLoggedIn && isInstantCheckInEnabled`, show the
sign-up suggestion modal (3 s delay) before executing rows 2–4.

Cart rules: adding never charges — copy must say so ("Nothing is charged yet");
items removable until payment. Deals with `confirmation_type === auto` are what
trigger row 1 (maps to `autoApprovedDealsCount > 0 → onNavigateToCart`).

### 1.5 No-offers & plain sequences

- No offers, upselling ON: `dm-empty-loading` (skeletons, ~2.4 s) → `dm-empty-wait`
  (blue sparkle ring, "Nothing else needed here", pill still sending, **no buttons** —
  resolves on its own) → `dm-empty` (success; CTA per table §1.4).
  Never render a bare "no deals available" text (reads as an error at the happiest moment).
- Upselling OFF: `dm-plain-loading` (~2.2 s) → `dm-plain-done` (success; CTA per §1.4).
  Offers are never fetched; no offers chrome may appear even briefly.
  The loading body is a **live 3-step timeline** (not a bare spinner): ✓ "Details
  encrypted" → ⟳ "Registering {name} with the property" → ○ "Confirmation — appears
  right here", plus the safety line "details are saved on this device until we confirm".

### 1.6 Error modal (`dm-error`)

Human-readable cause first, technical detail second (monospace box), then:
primary **"Try again"** (re-submits, → `dm-loading`), outline **"Edit details"**
(back to the form with values intact), trust line "Nothing was lost".
Never a lone "OK". Guest's typed data must survive the failure.

### 1.7 Screen-id registry (deep-link hashes)

`dm-loading`* · `dm-offers` · `dm-offer-2` · `dm-offer-3` · `dm-cart` · `dm-done` ·
`dm-empty-loading` · `dm-empty-wait` · `dm-empty` · `dm-plain-loading` · `dm-plain-done` ·
`dm-error`  (* = `data-start`; autonext: loading→offers 2.6 s, empty-loading→empty-wait 2.4 s,
empty-wait→empty 2.2 s, plain-loading→plain-done 2.2 s)

---

## §2 Guest registration hub ("Guest summary")

**Real components:** `pages/GuestRegistrationView/GuestRegistrationView.tsx`,
`components/GuestsPanel/*` (`GuestItem`, `GuestBox`), `HeaderGuestInformation.tsx`
· **Prototypes:** `flow-registration.html` (interactive), `guest-registration.html` (gallery)

### 2.1 Layout invariants

Kicker "Guest summary" · title "Who are we registering?" · glass summary card with
progress ring + one-line human summary · sections **Responsible for booking** (star icon)
→ **Other guests** (users icon) → **Minors — under 18** (user icon, only when
`ivEnabled && underageAllowedAge != null`) · share banner · docked primary CTA.

### 2.2 Guest row states (`GuestBox`)

| State (real `guestapp_status`) | Accent | Status label (action-oriented — NOT "Incomplete") | Row tap target |
|---|---|---|---|
| `complete` | green bar + green wash | "Complete" ✓ | none (row not clickable) |
| `verification_pending` | amber bar + amber wash | **"Verify ID"** + sub "Details saved · ID verification pending" | IV flow for guest |
| `incomplete` | amber bar + amber wash | **"Add details"** + sub "Waiting for details · ~2 min" | guest form |
| empty slot | plus badge | "Add guest" / "Register yourself" (leader) | new-guest flow |

Kebab menu per registered guest: Edit (if editable), Delete.

### 2.3 Hub cases (gallery `guest-registration.html`)

| Case | Ring | CTA |
|---|---|---|
| nobody registered (`number_of_fully_registered_guests === 0`) | 0/N grey | "Register yourself" (leader first) |
| partial (some pending / IV pending) | n/N blue | "Register next guest" — or "Verify {name}'s ID" if that's the only remaining task |
| everyone complete | green celebration banner replaces ring card | "Back to check-in list" |
| single guest (`known_number_of_guests === 1`) | 0/1 | "Register yourself"; **hide** Other guests section + share banner |

### 2.4 Interactive flow screens (`flow-registration.html`)

`r-hub`* → `r-details` → `r-review` → (submit → **§1 modal**, prototype links to
`flow-registered-modal.html`) → `r-done` (hub, 2/3, Carlos still `verification_pending`).
Scan-to-autofill card in `r-details` deep-links to the IV flow (§3).

---

## §3 Identity verification — mobile

**Prototypes:** `flow-iv-mobile.html` (interactive), `iv-flow.html` (gallery, 14 screens)

Branch rule (set at `s-doc`): `passport` → front capture → **liveness** sequence;
`dni`/ID card → front → back → quick selfie. Encoded via `data-set-doc` +
`data-goto-doc-passport` / `data-goto-doc-dni`.

Screens: `s-start`* → `s-doc` → `s-front` (auto 2.4 s) → `s-front-captured`
→ [passport: `s-live-1..3` (auto) → `s-live-passed`] | [dni: `s-back` → `s-back-captured`
→ `s-selfie`] → `s-contacts` (OTP) → `s-complete`.
Detours: `s-front-failed` (validation retry), `s-unavailable` (outside check-in window),
`s-qr-scan` (entry from desktop QR handoff).
Skip is always available behind a confirm modal (`m-skip`) — skipping IV keeps the guest
`verification_pending` and returns to the hub (feeds §2.2 row 2 and §1.4 row 2).
Camera chrome: light shell; dark gradient only **inside** the capture frame.

---

## §4 Identity verification — desktop

**Prototypes:** `flow-iv-desktop.html` (interactive), `iv-flow-desktop.html` (gallery)

Method choice at `d-choice`* (Vela rail visible): **Continue on phone** (recommended,
QR + live sync `d-qr` → auto `d-qr-done`) · **Webcam** (`d-cam` → auto `d-cam-captured`)
· **Upload files** (`d-upload`, front/back dropzones + quality checks) → `d-complete`.
Modals: `m-qr` (handoff), `m-share`, `m-privacy`. Completing on the phone must resolve
the desktop session in real time (websocket), shown as the simulated sync.

---

## §5 Home & check-in list

**Prototypes:** `home.html`, `home-desktop.html`

Task list = one row per remaining step (guest registration, IV, payments, taxes…),
"next up" spotlight, progress ring, glass top bar + bottom dock (mobile) / navy sidebar
with per-task badges (desktop). All-done state celebrates and surfaces booking info.
Row targets mirror §1.4 rows 2–4 targets.

---

## §6 Vela helper

**Prototype:** `vela.html` + embedded in registration/IV pages.

Desktop: right rail (324 px) — progress module, quick actions (Share booking link → `m-share`,
QR mobile-switch → `m-qr`, chat), contextual tips, ask box. Mobile: FAB in the top bar →
right sheet (`m-vela`); inline `vela-box` tips under focused form fields.
Vela never blocks task UI; glass styling allowed (it's chrome, not reading surface).

---

## Appendix A — Global UI rules (apply to every flow)

1. Liquid glass only on chrome (top bars, docks, on-camera pills, Vela) — never on
   reading surfaces; keep list/cards opaque for contrast.
2. Declining/skipping is never styled destructive-red; red = errors only.
3. Every waiting state names what's happening and what the user may do meanwhile.
4. Success states always propose the next action (decision table §1.4 is the canonical
   priority order: pay → verify ID → register next → home).
5. Status colors: green `--green-700` complete · amber `--amber-500/700` action needed ·
   red `--red-500` error; icon + label together (never color alone).
6. Mobile forms: single-column full-width fields; two-column pairs allowed on desktop only.
7. Screen ids in flow pages are the deep-link/hash API — `nav.js` flyouts and this spec
   must list the same ids.
