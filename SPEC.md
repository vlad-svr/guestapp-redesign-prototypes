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
> | `flow-guests-v2.html`, `flow-guests-desktop-v2.html`, `guests-v2.css`, `guests-v2.js` | §2.0 Guests summary (**current**) |
> | `flow-registration.html`, `guest-registration-desktop.html`, `reg.css`, `sign.css`, `sign.js` | §2 Guest registration; its hub is **superseded** by §2.0 (signature: §2.5.1) |
> | `flow-autofill-mobile.html`, `flow-autofill-desktop.html`, `autofill.css` | §2.6 Autofill (MRZ scan modal) |
> | `flow-iv-mobile.html`, `iv.css` | §3 Identity verification — mobile |
> | `flow-iv-desktop.html`, `ivd.css` | §4 Identity verification — desktop |
> | `flow-housing-iv-v2.html`, `flow-housing-iv-desktop-v2.html`, `housing-iv-v2.css`, `housing-iv-v2.js` | §4.5 IV QR (**current**) |
> | `home-v2.html`, `home-desktop-v2.html`, `home-v2.css` (+`upsell.css`, `home-glass.css`, `home-glass.js`) | §5 Home & check-in list (**proposal**) |
> | `home.html`, `home-desktop.html`, `home.css` (+`upsell.css`, `home-glass.css`, `home-glass.js`) | §5 Home & check-in list (**current**) |
> | `vela.html`, vela blocks in other pages | §6 Vela helper |
> | `flow-payments-mobile.html`, `pay.css` | §7 Payments — mobile |
> | `flow-payments-desktop.html`, `payd.css` (+`pay.css`) | §8 Payments — desktop |
> | `flow-taxes-mobile.html`, `tax.css` (+`pay.css`) | §9 Tourist taxes — mobile |
> | `flow-taxes-desktop.html`, `tax.css` (+`pay.css`, `payd.css`) | §10 Tourist taxes — desktop |
> | `flow-faq-mobile.html`, `faq.css` (+`pay.css`) | §11 FAQ & language — mobile |
> | `flow-faq-desktop.html`, `faq.css` (+`pay.css`) | §12 FAQ & language — desktop |
> | `flow-upselling-mobile.html`, `upsell.css` (+`pay.css`) | §13 Upselling — mobile |
> | `flow-upselling-desktop.html`, `upsell.css` (+`pay.css`, `payd.css`) | §14 Upselling — desktop |
> | `flow-remote-access-mobile.html`, `keys.css` (+`pay.css`) | §15 Remote access — mobile |
> | `flow-remote-access-desktop.html`, `keys.css` (+`pay.css`, `payd.css`) | §16 Remote access — desktop |
> | `flow-search-v2.html`, `flow-search-desktop-v2.html`, `search-v2.css`, `search-v2.js` | §17.0 Find booking (**proposal**) |
> | `flow-search-mobile.html`, `search.css` | §17 Find booking — mobile (V1, superseded by §17.0) |
> | `flow-search-desktop.html`, `search.css` | §18 Find booking — desktop (V1, superseded by §17.0) |
> | `flow-error-mobile.html`, `err.css` (+`search.css`) | §19 Error & recovery — mobile |
> | `flow-error-desktop.html`, `err.css` (+`search.css`) | §20 Error & recovery — desktop |
> | `flow-guidebooks-mobile.html`, `guide.css`, `guide-toggle.js` | §21 Guidebooks — mobile |
> | `flow-guidebooks-desktop.html`, `guide.css`, `guide-toggle.js` | §22 Guidebooks — desktop |
> | `flow-auth-mobile.html`, `auth.css`, `glass-toggle.js` | §23 Sign in & onboarding — mobile |
> | `flow-auth-desktop.html`, `auth.css`, `glass-toggle.js` | §24 Sign in & onboarding — desktop |
> | `flow-chat-mobile.html`, `chat.css`, `chat-demo.js`, `chat-toggle.js` | §27 Chat with host — mobile |
> | `flow-chat-desktop.html`, `chat.css`, `chat-demo.js`, `chat-toggle.js` | §28 Chat with host — desktop |
> | `flow-esim-v2.html`, `esim-v2.css`, `esim-v2.js` | §29 Travel eSIM — mobile (**current**) |
> | `flow-esim-desktop-v2.html`, `esim-v2.css`, `esim-v2.js` | §30 Travel eSIM — desktop (**current**) |
> | `flow-housing-guidebooks-mobile.html`, `flow-housing-guidebooks-desktop.html`, `hguide.css` (+`guide.css`) | §31 Housing guidebooks (property link) |
> | `flow-keycards-kiosko.html`, `keycards.css` | §32 Key cards — kiosk (`/remote-keys`) |
> | `flow-travel-guide-v2.html`, `flow-travel-guide-desktop-v2.html`, `travel-guide-v2.css`, `travel-guide-v2.js` | §35 AI Travel Guide (**current**) |
> | `flow-deposit-mobile.html`, `flow-deposit-desktop.html`, `deposit.css` (+`pay.css`, `payd.css`) | §33 Property protection (standalone `DepositView`) |
> | `flow-book-experience-mobile.html`, `book.css` (+`pay.css`, `upsell.css`) | §34 Book an experience (+ the `/:slug` deep link) |
>
> Property protection added (§33) — the standalone `DepositView` at `/deposit`, which
> only ever existed in the prototype as the payments deposit-chooser (§7 `p-deposit`).
> Covers the three shapes the backend can produce (one protection · two protections ·
> optional), the payment-type split, the decline path, edit-from-cart and the paid
> state that today is a silent redirect home.
>
> Book an experience added (§34) — the mobile booking chain behind an offer
> (`BookExperienceView` → `EnterContactEmailView` → `CreateDealCompleteModal`) plus
> `OfferSlugRedirectView`. Resolves Appendix C gaps **15** (delivery date/time picker
> + time-based slots), **16** (multi-item `MULTIPLE_PRICE` offers) and the deep-link
> half of **17**.
>
> Housing guidebooks added (§31) — the property-link surface `/housing-guidebooks`,
> which had no prototype at all: guidebooks for a **home**, opened without a booking.
> The reservation chrome is replaced by the host's brand, the hamburger opens the nav
> drawer the real `GuidebooksNavigation` already ships, and three real faults are fixed
> in the mock — PDF/HTML guidebooks escaping the layout, a mobile header with no way
> back, and a silent per-language fallback.
>
> Kiosk key cards added (§32) — `/remote-keys` (`components/RemoteAccess/RemoteKeys`),
> which is **not** virtual keys despite the route name: it drives the physical card
> dispenser. The `ProgressTaskBar` becomes a stack of real cards, the dispense moment
> points at the slot, and the two failure states (dispenser jam, no room assigned)
> route to a human instead of a disabled button.
>
> Remote access added (§15/§16) — the "virtual keys" flow: the two honest
> states (gated → a conditions checklist that deep-links the blocking task;
> live but time-boxed → per-door "Open now" / "Opens 15:00" state), the
> tactile slide-to-open (the real `OpenDoorSwitch`) driving the
> OpenLockStatusModal (opening → opened → connection-issue), copyable keypad
> codes, the Keyless partner-app path, and the Salto multi-door building. The
> desktop sidebar's existing "Virtual keys" item is now the destination.
>
> Signature capture made interactive (§2.5.1) — `sign.css` + `sign.js` add real
> freehand drawing and the form-factor split: **desktop draws inline**, **mobile taps
> to open the `SignatureModal` sheet** then shows an `<img>` preview; plus the empty /
> signed / clear / required-error states. The static pre-filled cursive mock is gone.
>
> Autofill redesigned (§2.6) — a dedicated prototype of the **`AutoFillFlowModal`**
> (`flow-autofill-{mobile,desktop}.html` + `autofill.css`): the document-in-frame with a
> highlighted **MRZ band** as the hero, the honest OCR read (align → read → done), and the
> **review-with-confidence** payoff (✦ Scanned tags + a Check flag). Covers the select
> (barcode) step, couldn't-read and camera-denied detours, and the Need-help MRZ sheet.
> Glass on chrome only.
>
> Find booking added (§17/§18) — the pre-check-in `pages/SearchReservation` flow:
> the method select as descriptive tap-to-continue cards (property-context chip from
> `useHousing` up front), the booking-code entry with a real "where's my code?" sheet,
> the date+email branch, the `SearchingBookingModal` LOADING/SUCCESS states as a radar →
> check, the `ReservationNotFoundModal` turned into next-step rows, the grouped
> `NewReservationView` (property-link) with "From your search" preload tags, and the
> `DirectReservationView` deep-link auto-search. Desktop is a centered pre-auth card
> (no app shell — search runs before a reservation exists). Incremental only: same
> routes, 1:1 component mapping.
>
> Error & recovery added (§19/§20) — the full-page `ErrorView` (+ `ErrorFallback`,
> `SDKErrorView`) turned from a dead end into recoverable, variant-aware states: a
> broken link routes into the §17 search flow, the `too_many_requests` variant gets a
> countdown + retry, a crash exposes a copyable error reference for support, and the
> embedded SDK error becomes a compact recoverable card inside a mock host site. Reuses
> the §18 pre-auth glass shell (`search.css`). Also: the Find-booking flow (§17/§18)
> leaned further into liquid glass — the floating auth card, method cards, property chip
> and language pill are now frosted over color orbs, with input fields kept solid. Both
> the Find-booking and Error pages ship a **Full · Minimal glass A/B toggle**
> (`glass-toggle.js` → `html.glass-lite`, overrides in `search.css`): Minimal reverts
> those extra frosted surfaces to solids and flattens the stage, keeping only baseline
> chrome glass; the choice persists via localStorage. Prototype-only chrome — the real
> components are unchanged, so no screen/hash/CTA in the registries moves.
>
> Home V2 added (§5) — the **"check-in cockpit"** rebuild of Home
(`home-v2.html`, `home-desktop-v2.html` + `home-v2.css`), superseding the V1
`home.html`/`home-desktop.html` (kept for reference). The greeting, progress meter,
the single **next action** (`NextActionCard`) and the reward it unlocks are fused into
one `CommandHero` (`.cockpit`); the flat checklist becomes an honest
`ChecklistTimeline` (done / active-spotlight / to-do / locked rows, status by text+icon
not colour); a new `UnlockStrip` ties finishing check-in to what it unlocks (keys gated,
guidebook available now); the Handpicked upsells are demoted below the core job under an
"Optional" eyebrow. Adds a `SkeletonBlock` loading state and accessibility upgrades
(`role="progressbar"`, `aria-current`, labelled icon buttons, focus-visible rings).
Same 1:1 component mapping and row targets as V1 (§5.1 unchanged) — no route/hash/CTA
target in the registries moves.

**Last synced:** 2026-07-09 · AI Travel Guide added (§35) — `pages/TravelGuideView` had no prototype; the generated itinerary becomes a **document the guest can change** (the shipped app force-forwards past the questions and ships no regenerate control), the build screen gets an honest clock and a cancel, failure gets three exits, and every `web_search` slot gets the directions and hours the loading screen already promises. · Property protection (§33) and Book an experience (§34) added — the standalone `DepositView` and the mobile offer-booking chain; between them they close Appendix C gaps **15**, **16** and the deep-link half of **17**. Housing guidebooks added (§31) and kiosk key cards added (§32) — the two app surfaces that had no prototype at all; the `/remote-keys` route is documented as the **card dispenser**, not virtual keys. · IV QR (§4.5) reworked around the **single thing being proved** — the guest is at the door — with the check-in-link path cut, the scanner and `IVUnavailableView` rendered verbatim from the IV flow, the invented pre-auth step rail removed (the IV step count is unknowable before the reservation is matched), and the confirmed `?scanned=true` defect documented. Guests summary (§2.0) is the **current** roster and renders beside the older hub on both form factors for comparison. **Home (§5.0) and Find booking "the arrival card" (§17.0) are the only proposals** — §5 and §17/§18 stay authoritative for what ships; nav + `index.html` badge those four pages and nothing else. Chat with host added (§27/§28). Travel eSIM added (§29/§30) — the three eSIM views re-cast around the install ladder. All other sections match deployed prototypes at
> https://vlad-svr.github.io/guestapp-redesign-prototypes/ · duplicate static galleries
> (`iv-flow.html`, `iv-flow-desktop.html`, `guest-registration.html`) removed — the
> interactive flows are now the single source per feature. Payments flows added
> (§7/§8) — `dm-cart` "Review & pay" now links into them (Appendix C gap 6 resolved).
> Taxes flows added (§9/§10) — the carts' "Add exemptions" now links into them and the
> tourist-tax cart meta reads "2 of 3 guests · 5 taxed nights" (Appendix C gap 10
> resolved). FAQ & language flows added (§11/§12) — FAQ answers deep-link into the
> IV/taxes/payments/registration flows; the desktop sidebar gains a "Support" group
> (Language · FAQs · Privacy policy) in the FAQ prototype. Upselling flows added
> (§13/§14) — the two-lane booking model (⚡ Instant / 🕗 On request), the 3-step
> request tracker with dashed un-approved amounts, partner hand-off, and the
> "Extras & experiences" sidebar destination; the mock story reconciles with the §7
> cart (late check-out €15.00 + breakfast basket €12.50 = its extras lines). Home
> (§5.1) and the offer list now carry the live partner banners — Mozio "HOT DEAL"
> transfers, Airalo eSIM, GuruWalk free tours + a Free-offers FAB — interleaved as
> `BANNER_AFTER_CARD = [2, 5]` on the list and mixed into "Handpicked for your trip"
> on Home. Guidebooks flows added (§21/§22) — the flat `GuidebooksListView` becomes
> browsable cover cards with a `content_type` badge (Guide / Web / PDF) and preview
> chips; the EDITOR `GuidebookView` gains a chapter rail built from its heading blocks,
> a surfaced Wi-Fi copy card, a map block with a Directions sheet, and place-card
> recommendations; the PDF/HTML readers get document chrome; the `UnavailableFeature`
> gate deep-links the blocking task and the empty state points to Ask Vela / FAQ. The
> desktop sidebar's existing "Guidebooks" item is now the destination, with the chapter
> index living in the Vela rail. Both Guidebooks pages carry a **"Version: Classic ·
> Liquid glass"** A/B switch (`guide-toggle.js` → `html.glass-max`) that frosts the
> reading surfaces over color orbs — the mirror of the Search/Error Full·Minimal switch.
> Sign in & onboarding added (§23/§24) — the instant check-in entry (`pages/Auth`, gated by
> `isInstantCheckInEnabled`): the hidden email→password→code sign-up machine now shows its
> step count, the password gets show/hide + strength, the OTP gets a resend countdown, and
> the account is sold with value-prop perks (+ an honest "continue without an account"); the
> four onboarding steps become icon/avatar choice cards on a labelled rail (trip type, guest
> counters, who's-coming with registered guests locked-checked, lead guest with the Crown),
> ending in the guest-creation success that hands off to registration. Pre-auth uses the
> branded gradient + liquid-glass card on mobile and a brand-panel split on desktop, and
> both carry the shared Full · Minimal glass switch (`glass-toggle.js` → `html.glass-lite`,
> overrides now in `auth.css`) — Full is the default/current look, Minimal flattens it.

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

The desktop dialog mirrors the same pill states **including the sending→success morph**.
On success screens (`dm-done`, `dm-empty`, `dm-plain-done` and their desktop variants) the
pill carries group progress ("2 of 3 guests done") while the heading celebrates the guest —
the same message never appears twice in one dialog.

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

- `dm-empty` / `dm-plain-done` resolve their primary CTA by the same §1.4 table (row 2
  beats row 3): with another guest `verification_pending`, primary = **"Verify {name}'s ID"**;
  "Back to guest list" is the secondary link. They must not fall back to a generic "Continue".
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

## §2.0 Guests summary — "the roster" (**current**)

**Real components:** `pages/GuestRegistrationView/GuestRegistrationView.tsx`,
`components/GuestsPanel/*` (`GuestItem`, `GuestBox`), `HeaderGuestInformation.tsx`,
`components/ReservationSettingsModal/*`, `components/ShareButton/*`
· **Prototypes:** `flow-guests-v2.html` (mobile), `flow-guests-desktop-v2.html` (desktop)
· The **current** Guests-summary prototype. It supersedes the hub in §2.1–§2.3, which stays documented
because both render side by side on the same page for comparison.

### 2.0.1 Screen ids (deep-link hash registry)

| Mobile | Desktop | Case |
|---|---|---|
| `g2-hub`* | `gd2-hub`* | partial — 1 registered, 1 `verification_pending`, 1 `incomplete`, 1 missing |
| `g2-none` | `gd2-none` | `added_number_of_guests === 0` |
| `g2-solo` | — | `known_number_of_guests === 1` |
| `g2-done` | `gd2-done` | `isRegistrationComplete` |
| `g2-loading` | `gd2-loading` | `isLoading` — auto-advances to the hub after 2200 ms |
| `g2-syncing` | — | `isFetching` on an already-loaded list |

`*` = `data-start`.

### 2.0.2 State vocabulary (replaces the duplicated "Incomplete")

Each state is **icon + word + rail shape** — never colour alone.

| `guestapp_status` | Row class | Label | Icon | Rail | Tap target |
|---|---|---|---|---|---|
| `complete` | `.is-done` | **Registered** | check-circle | solid green | guest detail (read-only) |
| `verification_pending` | `.is-verify` | **Verify ID** | shield | solid amber | IV flow for that guest |
| `incomplete` | `.is-details` | **Add details** | pencil | solid blue | guest form for that guest |
| missing slot | `.is-empty` | **Not started** | plus | dashed grey | new-guest flow |

One `.is-empty` row is rendered **per missing guest** (`missingGuests`), each labelled
by ordinal ("Fourth guest") — not a single generic "Add guest" row.

`.gv-meta` (the row's second line) appears **only where it says something the status pill
cannot** — "You · primary guest" on the lead guest, "Minor" on an under-18. It is never
used to restate the status or to estimate durations.

### 2.0.3 Progress

One line — `"{n} of {N} registered"` — plus one `.gv-meter` carrying one `.seg` per
guest, in roster order, class = that guest's state class. **There is no legend, no
second percentage and no separate counter**, so the pill and the bar cannot disagree —
the rows below are the legend. Denominator is `known_number_of_guests`; when it is
absent, no segments are drawn (never a hard-coded fallback).

### 2.0.4 Next-action decision table (drives the dock / ledger)

Evaluate in order; the first match wins. The chosen guest's row gets `.is-next` — a soft
blue wash and nothing else. **The CTA is the "next" marker**; the row only echoes it, so
there is no chip, no pulsing segment and no third signal.

| Condition | CTA label | Target |
|---|---|---|
| lead guest not registered | "Register yourself" | guest form (leader flag) |
| any `verification_pending` | "Verify {first name}'s ID" | IV flow for that guest |
| any `incomplete` | "Finish {first name}'s details" | guest form for that guest |
| any missing slot | "Add {ordinal} guest" | new-guest flow |
| `isRegistrationComplete` | "Back to check-in" | home |

The desktop ledger states the same next step, offers "Share the link instead", and names
the reward ("virtual keys unlock automatically").

### 2.0.5 Destructive actions

Delete is **two-step and reversible** (the V1 kebab mutated immediately):

1. Kebab (`aria-haspopup="menu"`, a **sibling** of the row — never nested inside it) →
   actions sheet: Verify ID now · Edit details · **Remove from booking**.
2. `role="alertdialog"` naming the consequences: details + ID photos deleted ·
   *undoable for 10 seconds*.
3. Confirm → row hides optimistically → **Undo toast** for 10 s (`guests-v2.js`), and a
   `role="status"` live region announces both the removal and the undo.

### 2.0.6 Loading vs refetching

- `isLoading` → **shape-matched skeletons** (avatar square + name bar + pill), so nothing
  reflows when data lands.
- `isFetching` → a 2 px sweep on the top bar + "Checking for updates…". Rows stay
  full-contrast and interactive. **Never** `opacity:.5` on the list.

### 2.0.7 Layout & a11y invariants

Kicker "Guest summary" · title "Who's checking in?" · progress card → **Responsible for
booking** (crown) → **Other guests** (users) + inline "Add a minor under 18" → docked CTA.
Share stays where it is today: a **text link in the header**, not a card and not an icon.
Solo booking hides the other-guests section **and** the Share link.

- Rows are `<a>`/`<button>` with a visible focus ring; the guest name never truncates.
- On mobile the chevron is hidden when a kebab is present
  (`.phone .gv-row-wrap .gv-chev`); desktop keeps both.
- Group size lives behind an explicit **Edit group** button, which is *absent* (not
  disabled-but-focusable) when `checkCanEditReservationDetails()` is false. The settings
  sheet never auto-opens over the page.

### 2.0.8 Restraint budget

The page states the guest count **once**. Anything that repeats a fact already carried by
another element was cut: no avatar stack, no meter legend, no "Next" chip, no per-row
duration estimates, no second share surface, no dock reassurance line. When adding to this
screen, remove something first.

`flow-guests-v2.html` renders **today's hub beside V2** — the `#r-hub` screen copied
verbatim from `flow-registration.html`, made static (no `data-goto` / `data-modal` /
`data-back`) so the scenario chips drive only the V2 phone. It loads `reg.css` solely for
that comparison column. Keep the two in sync if `#r-hub` changes.

---

## §2 Guest registration hub ("Guest summary")

**Real components:** `pages/GuestRegistrationView/GuestRegistrationView.tsx`,
`components/GuestsPanel/*` (`GuestItem`, `GuestBox`), `HeaderGuestInformation.tsx`
· **Prototypes:** `flow-registration.html` (mobile flow), `guest-registration-desktop.html` (desktop, static screens)

### 2.1 Layout invariants

Kicker "Guest summary" · title "Who are we registering?" · glass summary card with
progress ring + one-line human summary · sections **Responsible for booking** (star icon)
→ **Other guests** (users icon) → **Minors — under 18** (user icon, only when
`ivEnabled && underageAllowedAge != null`) · share banner · docked primary CTA.

Review form rules: the consent checkbox is **never pre-checked** (explicit tap required);
required-but-still-empty fields use the amber `.field.needed` treatment tied to the
"N left to complete" banner — red `.field.error` appears only after user interaction/submit.

### 2.2 Guest row states (`GuestBox`)

| State (real `guestapp_status`) | Accent | Status label (action-oriented — NOT "Incomplete") | Row tap target |
|---|---|---|---|
| `complete` | green bar + green wash | "Complete" ✓ | none (row not clickable) |
| `verification_pending` | amber bar + amber wash | **"Verify ID"** + sub "Details saved · ID verification pending" | IV flow for guest |
| `incomplete` | amber bar + amber wash | **"Add details"** + sub "Waiting for details · ~2 min" | guest form |
| empty slot | plus badge | "Add guest" / "Register yourself" (leader) | new-guest flow |

Kebab menu per registered guest: Edit (if editable), Delete.

### 2.3 Hub cases

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

### 2.5 Form composition (bottom of `r-review` + the desktop review form)

The real form is **schema-driven per property & country**
(`hooks/useGuestFormFields/useDefaultFieldsMapper.tsx`, groups via `GroupedFields.tsx`) —
the prototype shows a typical Spain set (names, birth date, nationality, document,
email/phone, residence city). Italy adds fiscal code / tax-exemption / invoicing fields;
never hard-code the field list.

Fixed tail order after the field groups (mirrors `SignBlock.tsx`):

1. **Signature** group (pen icon) — hand-drawn canvas (`SignatureCanvas`, which wraps
   `react-signature-canvas`; pen colour `#161643`). The prototype implements the real
   form-factor split and the full state set (see §2.5.1) — `sign.css` + `sign.js`,
   loaded by both registration files.
2. **Agreements** group (shield icon) — backend-driven clauses (`AgreementClausesBox`,
   `agreement_clauses.agreement_clause_<id>`): count and wording vary per property;
   required clauses block submission until checked; optional ones carry an
   `optional` pill (`.pill-opt`). **Never pre-checked.**
   Plus the contract opt-in (`ContractBox`): "Send me a copy of the signed contract by
   email" — reveals a `contract_email` input when the guest has no email on file; shown
   only when `summary.is_contract_enabled`.
3. **Disclosure fine print** (`.fine-print`) — "By tapping *Complete registration* you sign
   the check-in form with the signature above and accept the [rental contract] and our
   [privacy policy]." Contract link downloads `contracts[0].file`; privacy-policy link is
   property-custom when configured (`PrivacyPolicyLink`).
4. **Submit** — on invalid form opens the incomplete-data modal; leader conflicts open
   `LeaderConflictModal`; success opens the §1 registered modal.

### 2.5.1 Signature — form-factor split & states (THE signature rule)

Maps to `SignBlock.tsx` (form-factor branch on `useScreenResize(laptop)`), `SignatureCanvas`
(`@chekinapp/ui`) and `SignatureModal`. The click behaviour differs by device and every
state is honest about what's captured.

| Form factor | Click behaviour | Real mapping |
|---|---|---|
| **Desktop** (`!isMobile`) | Draw **inline** on the pad (`enabled`, `maxHeight 220`) — no modal. | inline `SignatureCanvas` with the ref |
| **Mobile** (`isMobile`) | The inline pad is disabled with placeholder **"Tap to open the signature form"** (`tap_to_open_signature_form`). Tapping opens a **bottom sheet** (`m-sign` = `ResponsiveSheet` + `SignatureModal`); after **Confirm signature** the inline area shows an **`<img>` preview** + Clear. | placeholder → sheet → preview thumbnail |

States (both form factors share `sign.css` classes; ids `#sig-review`):

| State | Trigger | Treatment |
|---|---|---|
| **empty** | not yet signed | dashed pad, `Signature`-icon placeholder + "Required by local regulations"; baseline `× ____`; Clear disabled |
| **drawing** | pointer on canvas | freehand ink in `#161643`; marks the container `.inked` |
| **signed** | desktop: drew; mobile: Confirm | ink/preview shown, placeholder + baseline fade, green **"✓ Signed"** chip, Clear active |
| **clear** | Clear tool / sheet Cancel | resets to empty (`SignatureCanvas.clear()` + `resetSignature()`) |
| **required-missing** | Submit while empty **and** the field is active + required + not auto | pad turns red (`--red-soft`, real `#f84b7a`), inline error **"The signature is required"** (`the_signature_is_required`) |

The **sheet** (`m-sign`, mirrors `SignatureModal`): title "Draw your signature"
(`draw_your_signature`), subtitle (`signature_subtitle`), the drawing surface + Clear,
and **Confirm signature** (`confirm_signature`, disabled until there's ink) · **Cancel**
(`cancel`, clears + closes). Confirm renders the trimmed drawing back into `#sig-review`.

Not visually mocked (documented only): **`auto_signature`** — when `reservation.auto_signature`
is on, `SignBlock` renders **no signature section at all** (the property signs on the guest's
behalf; the disclosure switches to the "Sign now" wording). It's an uncommon config that adds
no distinct UI, so the prototype omits it. **`fakeSignature`** — when the schema has **no**
active `signature` field, Submit sends the hard-coded placeholder PNG (`SignBlock/index.ts`)
rather than showing any pad. The drawn value is a trimmed PNG data-URL → `Blob` for the
multipart guest-create request (`toTrimmedDataURL`, `SIGNATURES_QUALITY = 0.8`).

---

## §2.6 Autofill — MRZ document scan (the AutoFillFlowModal)

**Real components:** `components/AutoFillFlowModal/{AutoFillFlowModal,MRZScanContent,AutoFillDocumentSelection}.tsx`,
`pages/AddPersonalDataForm/AutoFill/AutoFillBox.tsx` (entry card),
`packages/shared/src/components/capture/CameraCapture.tsx` (+ `CaptureProcessFrame`),
`hooks/iv/useDocumentSelfieDetection.tsx`, `packages/shared/src/hooks/useOCR.ts`,
`hooks/useBuildOCRDetectedData.ts` (`buildFormData`) ·
**Prototypes:** `flow-autofill-mobile.html` / `flow-autofill-desktop.html` (+ `autofill.css`)

The **Autofill card** (`AutoFillBox`, ScanLine icon, "Autofill guest details" /
"Scan a passport or identity card to automatically fill in details.") lives **inside the
personal-data form** and opens the **`AutoFillFlowModal`** — a `Dialog` that is a
**full-screen sheet on mobile** and a **centred 530 px dialog on desktop** (header = back
chevron + centred title; outside-click disabled). It is **not gated by IV**.

### 2.6.1 The modal steps

Two steps (`Step = 'select' | 'scan'`); the modal starts on `select` **only** when
`isBarcodeScanCountry(countryCode)` (US / Canada / Colombia), else straight to `scan`.

| Step | Title | Content |
|---|---|---|
| `select` | "Choose your document" (`choose_your_document`) | `AutoFillDocumentSelection` — nationality + document-type selects → **Continue** (barcode docs are read from a barcode, not an MRZ) |
| `scan` | "Autofill the form" (`auto_fill_form`) | `MRZScanContent` — helper (`upload_document_helper_text`) + **Need help?** sheet (MRZ tips + Lottie) + `CameraCapture` |

### 2.6.2 The scan (THE autofill rule)

Same scanner as IV, invoked with **`onlyScanning: true`** → OCR only, **no
selfie/liveness/biomatch**, no IV-intent updates, no image persistence; it fills the form
and closes. The read is a **backend OCR service** (capture → base64 →
`sendImageForOCR` → poll `checkImageOCRStatus`, 1 s × up to 40) → `OCRDetectedData`;
`buildFormData` maps name/surname/second_surname, document number + support number,
document type, nationality, birth/issue/expiry dates (only when the `valid_*` flag is set),
sex→gender. Unread/invalid fields are omitted (left blank) — the prototype flags them as
the amber **Check** row (an improvement).

`CameraCapture` states → prototype screens: **idle** (document in frame, highlighted **MRZ
band**, scan line, glass "Fit the code inside the frame" pill, auto-capture note, upload
alt) → **scanning/reading** (`CaptureProcessFrame` loading: green MRZ + spinner "Reading
the code…" + decoded MRZ strip) → **success** ("Document read!") → the form as **"Review
your details"** (`review_your_details`): scan summary, per-field **✦ Scanned** tags, the
Check flag, and an IV note ("if IV is on we reuse this scan — a selfie follows separately").
Detours: **couldn't read** (`!mrz_detected` / blurry → CaptureProcessFrame error → Try
again / Upload / Type it in) and **camera denied** (`CameraDenied` → enable steps /
upload / manual). Liquid glass is chrome-only (modal header, on-camera pills, Need-help
sheet, CTA dock), with `@supports` solid fallbacks.

### 2.6.3 Screen-id registry (deep-link hashes)

Mobile: `af-form`* · `af-scan` · `af-reading` · `af-success` · `af-done` · `af-select` ·
`af-fail` · `af-denied` · modal `m-help`
(autonext: `af-scan`→`af-reading` 3.0 s, `af-reading`→`af-success` 2.4 s,
`af-success`→`af-done` 1.4 s).
Desktop: `afd-form`* (the guest form with the AutoFillBox card — the flow starts here;
clicking the card opens the dialog) · `afd-scan` · `afd-reading` · `afd-success` ·
`afd-select` · `afd-fail` · `afd-done` · modal `m-help` (same autonext; the dialog sits
over a dimmed form backdrop). Both form factors begin on the guest form and open the
modal from the card (`af-form`* / `afd-form`*).

---

## §3 Identity verification — mobile

**Prototype:** `flow-iv-mobile.html` (interactive; scenario chips reach all 14 screens/states)

Branch rule (set at `s-doc`): `passport` → front capture → **liveness** sequence;
`dni`/ID card → front → back → quick selfie. Encoded via `data-set-doc` +
`data-goto-doc-passport` / `data-goto-doc-dni`.

Screens: `s-start`* → `s-doc` → `s-front` (auto 2.4 s) → `s-front-captured`
→ [passport: `s-live-1..3` (auto) → `s-live-passed`] | [dni: `s-back` → `s-back-captured`
→ `s-selfie`] → contacts verification (§3.1) → `s-complete`.
Upload path: "Upload a file instead" on `s-front` opens the **native file picker
directly** (no upload view) → `s-crop` (crop & confirm, one file per side,
`PhotoUpload` + `ImageCropper`) → confirm → `s-front-captured`.
Detours: `s-front-failed` (validation retry), `s-denied` (camera permission denied —
Try again / upload fallback), `s-unavailable` (outside check-in window),
`s-qr-scan` (entry from desktop QR handoff, `IVQRScannerView`).

### 3.1 Contacts verification (`ContactsVerificationView`)

Channels enabled per property (`useVerificationSettings`: `isEmailEnabled` /
`isPhoneEnabled`); each enabled channel runs **two steps** — when both are enabled the
header shows "contact 1 of 2 / 2 of 2" (real: `step_of`):

1. **CONTACTS_INPUT** — "Verify your email / phone": pre-filled input (email, or phone
   with country code), info note "We'll send a 6-digit verification code by email/SMS",
   CTA **"Send verification code"**.
2. **CODES_VERIFICATION** — "Enter the code": expiry note ("code expires in 2 minutes"),
   6-slot OTP, masked "sent to" value, actions **Verify code** (primary) ·
   **Resend code** · **✎ Change email / phone number** (returns to step 1).
   Wrong code → inline red error on the OTP row ("that code didn't match"), retry in
   place — never a modal.

Mobile ids: `s-contact-email` → `s-code-email` (error variant `s-code-email-error`)
→ `s-contact-phone` → `s-code-phone` → `s-complete`.
Desktop ids: `d-contact-email` → `d-code-email` (`d-code-email-error`)
→ `d-contact-phone` → `d-code-phone` → `d-complete`.
On success the verified email/phone are written back to the reservation
(`default_invite_email` / `default_phone_number`).
Skip is always available behind a confirm modal (`m-skip`) — skipping IV keeps the guest
`verification_pending` and returns to the hub (feeds §2.2 row 2 and §1.4 row 2).
Camera chrome: light shell; dark gradient only **inside** the capture frame.
Intro copy avoids hard-coded step totals ("A few quick steps") — the stepper is the only
step counter (Step N of 4), since the real step count varies by document type.
Vela: a `vela-fab` in the top bar opens the IV help sheet (`m-vela` — photo tips,
privacy note, upload escape, ask box) on **non-camera screens only**: `s-start`,
`s-doc`, `s-crop`, `s-denied`, `s-unavailable` and the five contacts screens. Camera,
crop-source capture, selfie and liveness screens never show the FAB (§6 placement rule).

---

## §4 Identity verification — desktop

**Prototype:** `flow-iv-desktop.html` (interactive; scenario chips reach every screen/state)

Method choice at `d-choice`* (Vela rail visible), then desktop mirrors the full mobile
case set:

- **Continue on phone** (recommended): QR + live sync `d-qr` → auto `d-qr-done` →
  `d-complete`. The phone side (doc choice, capture, contacts) happens in §3; completing
  on the phone must resolve the desktop session in real time (websocket), shown as the
  simulated sync.
- **Webcam**: `d-doc` (document choice — same `data-set-doc` branch point as `s-doc`)
  → `d-cam` (auto) → `d-cam-captured` → branch: [passport: `d-live-1..3` (auto) →
  `d-live-passed`] | [dni: `d-back` (auto) → `d-back-captured` → `d-selfie`]
  → contacts (§3.1 desktop ids) → `d-complete`.
- **Upload a file** — there is **no separate upload view**: the "Upload a file" action
  opens the native file picker directly (one file per side), and the chosen photo lands
  on crop & confirm: `d-crop` (front) → `d-crop-back` (back) → `d-selfie` → contacts →
  `d-complete`. Maps 1:1 to `packages/shared/src/components/capture/CameraCapture.tsx`
  (`openFileDialog` via `useImageFileUpload`, single image) rendering `PhotoUpload` +
  `ImageCropper` (react-easy-crop). Crop screen actions: **Confirm {side} side**
  (primary) · Choose a different file (reopens picker) · Use the webcam instead
  (`d-cam`). Never infer front/back from filenames or upload order — each side is its
  own picker + crop pass.

Detours: `d-front-failed` (validation retry — recovery is primary blue, offers upload
fallback), `d-cam-denied` (webcam permission blocked — enable steps + QR/upload
alternatives), `d-unavailable` (outside check-in window).
**Vela rail (stage-aware):** every desktop screen carries the 324 px Vela rail except
`d-complete` (full-bleed celebration) and deprecated `d-upload`. Rail content swaps per
stage — progress module (4 nodes: Choose your document → Scan your document → Selfie &
liveness → Confirm details) plus stage tips and escape actions:
| Stage (screens) | Tips eyebrow | Escape actions |
|---|---|---|
| `d-qr`/`d-qr-done` | While your phone connects | webcam (`d-doc`), upload (`d-crop`) |
| `d-doc` | Choosing your document | — (ask chips) |
| `d-cam`/`d-cam-captured` | Getting a sharp photo | phone (`d-qr`) |
| `d-front-failed` | Why photos get rejected | phone (`d-qr`), upload (`d-crop`) |
| `d-back`/`d-back-captured` | Now the back side | — |
| `d-crop`/`d-crop-back` | Uploading a file | — (ask chips) |
| `d-selfie` | Getting a good selfie (incl. privacy tip) | — |
| `d-live-1..3`/`d-live-passed` | Liveness check (single tip — kept minimal) | — |
| contacts/code screens | Why we verify this / About your code / Wrong code? | — |
| `d-cam-denied` | Camera blocked | phone (`d-qr`), upload (`d-crop`) |
| `d-unavailable` | Why you can't start yet (no progress module) | share link (`m-share`) |
`d-upload` (the old standalone dropzone view with a multi-file list) is **deprecated**
but kept in the prototype behind a crossed-out overlay for reference — no entry links
point to it; do not implement it.
Modals: `m-qr` (handoff), `m-share`, `m-privacy`.

---

## §4.5 IV QR — "verify at the door" (**current**)

**Real components:** `pages/VerifyOnHousing/VerifyOnHousingView.tsx`,
`pages/FindReservationsByName/FindReservationsByNameView.tsx` (+ `IncompleteDataModal.tsx`,
`NotFoundReservationModal.tsx`, `constants.ts`, `types.ts`, `utils.ts`),
`routes/OnlyQRIVOnPropertyRoutes.tsx`, `API.guest.searchForIV`,
`pages/IdentityVerification/views/IVQRScannerView/*` (+ `useQRScanner.ts`, `InvalidQRModal.tsx`),
`pages/IdentityVerification/views/IVUnavailableView/*`,
`pages/IdentityVerification/IdentityVerificationLayout.tsx`,
`components/guards/IVQRGuard.tsx`, `hooks/useIVOnProperty.ts`,
`pages/GuestRegistrationView/components/IVOnPropertyAlertBoxes.tsx`,
`components/GuestRegisteringModal/ScanQrAtPropertyInfoBox.tsx`
· **Prototypes:** `flow-housing-iv-v2.html` (mobile), `flow-housing-iv-desktop-v2.html`
(desktop / door kiosk). Mobile loads `search-v2.css` + **`iv.css`** + `housing-iv-v2.css`;
desktop loads `search-v2.css` + **`ivd.css`** + `housing-iv-v2.css` — the IV stylesheets
because the scanner and the unavailable view *are* IV screens. Scripts: `search-v2.js` +
`housing-iv-v2.js`
· A **proposal**; nothing here ships until chosen. Routes are unchanged.

### 4.5.0 The real flow — one thing being proved

Everything here establishes a single fact: **the guest is at the door right now.**

**The entrance QR (`QR_IV_ON_PROPERTY`)** — the arrival
1. The guest scans the sticker at the door with their phone camera. It opens a host page
   running the SDK: `verify-on-housing` → `find-reservations-by-name`.
2. `searchForIV` returns `{guest_name, guest_id, guest_iv_link, reservation_id?}`.
3. `window.location.href = guest_iv_link + '?splash=true&scanned=true'` — a full page
   redirect into the guest's own, authenticated check-in session, where they run **the
   regular IV flow**. The scan at the door *was* the proof of presence.

**The in-app gate (`IVQRScannerView`)** — whenever that proof is missing
`IVQRGuard` wraps every IV route; when `isIVOnPropertyAvailable` and
`!isPropertyQRScanned` it redirects to `verification/qr-scan` → `IVQRScannerView`,
which opens the **in-app camera**, `jsqr`-decodes the sticker and requires an exact
match against `housing.identity_verification_link`. Success →
`setPropertyQRScanned(true)` → the regular IV flow.

> **Scope.** The emailed check-in link — the guest registering their details from home,
> days early — is a **different feature** (`GuestRegistrationView`, §4.6 Guests summary).
> It is not prototyped here. This flow starts at the door.

**Always.** IV only opens on the check-in date:
`isIVOnPropertyAvailable = ivEnabled && housing.identity_verification_process_type ===
onProperty && today ∈ [check_in, check_out]`. Otherwise `IdentityVerificationLayout`
renders `IVUnavailableView`, and `IVOnPropertyAlertBoxes` on the summary switches to
*"Verification required upon arrival — When you arrive, scan the QR code at the entrance
to complete your identity verification."*

> **Defect (confirmed by grep).** A guest who arrived via the entrance QR is supposed to
> skip the scanner, and the `?scanned=true` parameter clearly intends to say so.
> **Nothing reads it.**
> `setPropertyQRScanned(true)` is called from exactly one place in the repo —
> `IVQRScannerView.tsx:31` (the only other writer is `useIVRemoteSync`, rehydrating an
> IV intent). So a guest who just scanned the door sticker reaches `IVQRGuard` with
> `isPropertyQRScanned === false` and is sent to `verification/qr-scan` to scan the
> sticker they are standing in front of. The prototype shows the **intended** behaviour
> and flags the gap on the handoff screen.

### 4.5.1 The rules

| Element | Real source | V2 treatment |
|---|---|---|
| Property identity | `objectId` (housing) is in context on both pre-auth screens | a **`.s2-hero` / `.s2-canvas` photo canvas** (reused from §17.0) with a **"Scanned at this door"** seal. Today neither pre-auth screen names the property |
| The intro | `VerifyOnHousingView`: icon + one sentence + one `AlertBox` + **Start** | a **`.hv-journey`** preview of the three steps, drawn from the app's own `ScanQrAtPropertyInfoBox` copy (verify your presence · access identity verification · complete your check-in), a `~2 min` **`.hv-eta`**, and the "you'll need your ID and a device with a camera" note |
| Did my door scan count | nothing | a **`.hv-path`** presence banner — *"Entrance QR · scanned. That's your proof of presence — no second scan."* |
| Progress | none anywhere | **no stepper before IV, and IV's own stepper inside it.** An earlier draft drew a three-step `.hv-rail` (*find you · scan ID · selfie*) on the pre-auth screens. It was removed: those screens run **before** the reservation is matched, so `useSchema().identityVerificationDetails` is not loaded and **nothing about the IV configuration is known**. Worse, the count is unknowable in principle — `ivCaptureCopy.tsx` types a capture as `'front' \| 'back' \| 'document' \| 'selfie' \| 'liveness'`: an ID card has a back side and a passport does not, and the face step is a plain selfie *or* a liveness challenge *or* absent. Progress is carried by copy. Once inside IV the flow uses **IV's own stepper** — `.cam-progress` / `.progress-track` on mobile, `.vela-rail` `.vela-progress` on desktop — with the door scan prepended: **1 verify you're at the property · 2 choose your document · 3 scan your document · 4 selfie & liveness · 5 confirm details**. ⚠ That 5 inherits §4's own "Step 2 of 4" assumption and is **also** config-dependent; it is knowingly left until the IV prototypes are reworked |
| Name search | two `Input`s, both `autoComplete="off"` | real `<label for>` + `<input>` — `autocomplete="given-name" / "family-name"`, `16px` type (no iOS zoom), `52px` targets |
| Searching | the submit button's label is swapped for a spinner | the **`.s2-scan`** property card under a scan line + the **`.s2-steps`** checklist (`data-s2-steps`), and a spoken `aria-live` announcement |
| More than 1 guest | `"More than 1 guest found"` → `next_required_field` reveals `id_number` \| `date_of_birth` \| `checkout_date`, **and** opens `IncompleteDataModal` — which takes no props, so its body always reads "provide your document number" | **no modal.** An amber **`.hv-notice`** sits above the revealed field, names *why*, and heading/body/hint all follow `next_required_field`. Field outlined (`.hv-field.asked`), **auto-focused**, announced. **`.hv-known`** chips echo what was already given. Two screens (`hv-more`, `hv-more-dob`) demonstrate the copy tracking the field |
| Success | `window.location.href = guest_iv_link` immediately; `guest_name` discarded | a **`.hv-match`** card built from the `guest_name` the API already returns, with **Continue to check-in** / **That's not me** |
| The handoff | a bare `?splash=true` splash screen | `hv-handoff`: "your scan at the door already proved you're here, so identity verification opens straight away", with the `?scanned=true` defect called out in a **`.hv-bug`** |
| Entrance QR scan | `IVQRScannerView` — title "Scan QR code at your accommodation", no explanation, no Vela | **the IV flow's camera, verbatim.** In code this screen renders the same `<CaptureCamera variant="document">` as the document step, so it gets the same chrome: `.cam-screen` / `.cam-topbar` / `.cam-progress` / `.cam-head` / `.doc-frame` + `.brackets` + `.scan-line` + `.status-pill` / `.frame-overlay` / `.cam-footer` (`.desk-cam` + `.cam-hint-row` on desktop), all from `iv.css` / `ivd.css`. Two things are new: **`.hv-sticker`** (the printed wall sticker, standing in for the `.mock-doc` the document step shows in the same frame) and **`.hv-cam-why`**, a `.hv-notice` that earns the second scan: *"identity verification happens at the property, and we can't yet confirm you're there. The sticker at the entrance is the proof — guests who scanned it to get here skip this step entirely."* On desktop it renders in the full IV shell — `.desktop-shell.with-rail` plus the **`.vela-rail`**, carrying the five-step progress and sticker-finding tips, exactly as `d-cam` does |
| Invalid QR | `InvalidQRModal` — correct title, but body reads **"Please complete all the required data before continuing."** (wrong error entirely; wrong in `apps/guestapp` *and* `packages/shared` en) | body names the two real causes — a screenshot instead of the printed sticker, or the wrong door in a multi-unit building — with **Try again** / **Message the host** |
| Not found | `NotFoundReservationModal`: **Try again** (only closes) · **Back to start** (discards input) | a screen: **`.hv-typed`** shows the searched name with an inline **Edit**, above `.s2-nf` rows — check the spelling · use your check-in link · message the named host |
| Missing housing | `if (!objectId) throw …` → falls through `onError` to the **same not-found modal** | its own screen (`hv-badqr`) + `ERR-HOUSING-MISSING` to send the host |
| Before check-in day | `IVUnavailableView` — the date and a single **Back to summary** | **unchanged, and deliberately so.** `IVUnavailableView` is one component rendered by `IdentityVerificationLayout` for every IV route, so this flow reuses the IV flow's screen **verbatim** (`.card` + `.privacy-note`, one way out) rather than drawing a second design. The only on-property addition: the be-ready note also names **the QR code at the property entrance** |
| Glass A/B | — | the shared `glass-toggle.js`; `search-v2.css` carries the overrides, `housing-iv-v2.css` adds `.hv-typed` and — since it loads after `iv.css` — the `.status-pill` fallbacks |

### 4.5.2 Transitions

| Screen (mobile · desktop) | data-autonext | CTA / rows |
|---|---|---|
| `hv-start`* · `hvd-start`* | — | Start → `…-find`; "Why is this asked?" → `m-why` / `md-why` |
| `hv-find` · `hvd-find` | — | Find my reservation → `…-searching`; ghost → `m-link` / `md-link` |
| `hv-searching` · `hvd-searching` | → `…-found` (2700 ms) | — (checklist runs) |
| `hv-found` · `hvd-found` | — | Continue to check-in → `…-handoff`; "That's not me" → `…-find` |
| `hv-more` · `hvd-more` | — | Continue → `…-searching`; "Why?" → `m-why-more` / `md-why-more` |
| `hv-more-dob` · `hvd-more-dob` | — | Continue → `…-searching`; back → `…-more` |
| `hv-searching-nf` · `hvd-searching-nf` | → `…-notfound` (2400 ms) | — (checklist runs) |
| `hv-notfound` · `hvd-notfound` | — | Edit / check spelling → `…-find`; check-in link → `m-link`; host → `m-contact` |
| `hv-badqr` · `hvd-badqr` | — | Scan again → `…-start`; host → `m-contact` / `md-contact` |
| `hv-handoff` · `hvd-handoff` | → `…-iv` (2600 ms) | the `guest_iv_link` redirect — **the door scan should skip the scanner** |
| `hv-scan` · `hvd-scan` | — | Simulate a scan → `…-scan-ok`; Simulate a wrong QR → `m-invalid-qr` / `md-invalid-qr` |
| `hv-scan-ok` · `hvd-scan-ok` | → `…-iv` (1800 ms) | — (success overlay) |
| `hv-iv` · `hvd-iv` | — | Scan my ID → `flow-iv-mobile.html#s-start` / `flow-iv-desktop.html#d-choice` |
| `hv-unavailable` · `hvd-unavailable` | — | Back to summary (`data-back`) |

### 4.5.3 Screen-id registry (deep-link hashes)

Mobile: `hv-start`* · `hv-find` · `hv-searching` · `hv-found` · `hv-more` · `hv-more-dob` ·
`hv-searching-nf` · `hv-notfound` · `hv-badqr` · `hv-handoff` · `hv-scan` ·
`hv-scan-ok` · `hv-iv` · `hv-unavailable` · modals `m-why`, `m-why-more`, `m-link`,
`m-contact`, `m-invalid-qr`
Desktop: the same ids prefixed `hvd-`; modals `md-why`, `md-why-more`, `md-link`,
`md-contact`, `md-invalid-qr`  (* = `data-start`)

### 4.5.4 `housing-iv-v2.js` — prototype-only hooks

`data-hv-announce` (screen) → pushed into the frame's `[data-hv-live]`
`role="status" aria-live="polite"` region on activation · `[data-hv-focus]` (field) →
receives focus when its screen activates, **suppressed on first paint** so a `#hash`
deep link never hijacks the page · `data-hv-url` (screen) → repaints the desktop browser
frame's `[data-hv-urltext]`, so the URL tracks the crossing from the SDK page into the
guest's own session · `[data-hv-noop]` (form) → `preventDefault` on submit.
Screen activation is observed with a `MutationObserver` on `.flow-screen[class]`, the
same composition trick `search-v2.js` uses. No business logic anywhere.

### 4.5.5 Out of scope here

The **desktop → phone handoff** QR (`verification/scan-qr-code`, `ScanQRCodeView`,
`qrcode.react`, the `IVCO_49_MOVE_IV_TO_MOBILE` flag and the
`IV_STARTED_ON_MOBILE` / `IV_COMPLETED_*` WebSocket events) is a **different feature**
that happens to share the IV route table. It has no prototype. Do not conflate
`ScanQRCodeView` (`scan-qr-code`, the app *shows* a QR) with `IVQRScannerView`
(`qr-scan`, the app *scans* one).

---

## §5 Home & check-in list

**Prototypes (current):** `home-v2.html`, `home-desktop-v2.html` (+ `home-v2.css`, `upsell.css`)
**Prototypes (V1, superseded):** `home.html`, `home-desktop.html`

**Real components:** `pages/HomeView/components/*` — the layout is `HomeContent.tsx`
(`HomeHeader`, `CheckinHeroStrip`, `CheckinChecklist`, `YourStaySection`,
`RecommendationsSection`, `ContactCards`, `FreeOffersFab`); state comes from
`useChecklistSteps.ts` / `useHomeData.ts`. V2 keeps this component set and its data
model — it re-composes them, it does not restructure the code.

The Home job, in priority order: **(1) what do I do next, (2) what does finishing
unlock, (3) everything else.** V2 makes that hierarchy literal.

### 5.0 V2 — the check-in cockpit

The greeting + progress + next step + reward are one **`CommandHero`** (`.cockpit`,
maps to `HomeHeader` + `CheckinHeroStrip` recomposed) so the primary action is above the
fold on mobile:

- **Progress meter** — a single honest bar (`role="progressbar"`) with
  "N of M done · ~X min left". Removes V1's triple-redundant progress (sidebar % + section
  counter + ring). `useChecklistSteps` fractions drive it.
- **`NextActionCard`** (`.next-action`) — the one next step as a prominent embedded CTA
  (icon + eyebrow "Next step · ~1 min" + title + why). Target = the same resolved next
  step as V1's "next up" row (§1.4 priority: cart → verify → register → taxes/etc.).
- **Reward line** (`.ck-reward`) — "Finish check-in to unlock your keys on arrival",
  making the effort→reward link explicit.
- **Arrival strip** (`.ck-arrival`) — check-in/out, nights, location as a compact
  secondary row (was V1's full-width hero block).
- **Ready variant** (`.cockpit.ready`) — all-done state: 100% meter + a primary
  "Open your door" CTA (→ remote access) instead of a next step.

**`ChecklistTimeline`** (`.timeline` / `.tl-row`, maps to `CheckinChecklist`): one row per
remaining step with four honest states — **done** (de-emphasised, green check chip),
**active** (brand-wash spotlight + inline "Continue" CTA — the row *is* the next action),
**to-do**, **locked** (e.g. keys, with the reason). Status is conveyed by **text + icon,
never colour alone**. Rows are real links with `aria-current="step"` on the active one;
targets mirror §1.4 rows 2–4.

**`UnlockStrip`** (`.unlocks` / `.unlock-card`, maps to `YourStaySection`): the stay tools
framed as rewards — **locked** (keys gated until check-in done, deep-links the "why?"
gate §15), **available now** (guidebook), and in the all-done state **live** (keys
unlocked → "Open"). Desktop renders it 3-up.

**Optional extras** — the §5.1 Handpicked section is unchanged in content but demoted
below the core job under an **"Optional"** eyebrow, so commercial content never competes
with the check-in task.

**Loading** — a `SkeletonBlock` state (`.skeleton`) shows the hero/timeline/unlocks shape
while `useHomeData`/`useChecklistSteps` resolve (`aria-busy`), removing layout shift.

Chrome unchanged from V1: glass top bar + bottom dock (mobile), navy sidebar with
per-task badges + host-contact right rail (desktop), left menu drawer (mobile).
Row targets mirror §1.4 rows 2–4 targets.

**Glass A/B toggle** (`home-glass.js` → `html.glass-strong`, overrides in
`home-glass.css`): both Home V1 and V2 carry a **Standard · Liquid glass** switch, the
mirror of the Check-out and Guidebooks toggles. **Standard** (default) keeps the shipped
rule — liquid glass on chrome only, reading surfaces solid. **Liquid glass** frosts the
reading surfaces (checklist/timeline card, unlock/stay cards, reco + contact cards) over
soft color orbs with deeper blur+saturation; the navy chrome, hero and branded partner
banners keep their fills. Prototype-only chrome, persists via localStorage
(`protoHomeGlass`), with an `@supports` near-opaque fallback so text never loses
contrast — no real component or route changes.

### 5.1 "Handpicked for your trip" — upsell surfaces on Home

**Real components:** `pages/HomeView/components/RecommendationsSection.tsx`
(+`UpsellCarousel.tsx`, `AiraloPromoBanner.tsx`, `FreeOffersFab.tsx`,
`useUpsellItems.ts`). The prototype consolidates these into one section per page.

- **Section** titled **"✨ Handpicked for your trip"** with a **"See all"** link →
  `flow-upselling-{mobile,desktop}.html`. Renders `useUpsellItems.slice(0, 7)`
  (`MAX_RECO_CARDS`).
- **Card mix (one grid, same source array):**
  - **Native offers** → `.reco-card` (photo, category chip, title, 2-line desc,
    price, "Add"/"View" — CTA from `UpsellItem.ctaLabel`). Tap → the matching offer
    detail in the upselling flow.
  - **Mozio** (`source: 'mozio'`) → full-width **`.mozio-banner`** (the live
    `WideCard`): navy gradient, `🔥 Hot deal` amber tag (`--amber-500`), "Powered by
    Mozio · books on the partner site", subtitle, "✨ Discover unbeatable rates"
    accent, and three trust pills (Free cancellation · 24/7 support · Instant
    confirmation). External → partner site.
  - **Airalo** (`source: 'esim'`) → full-width **`.airalo-banner`**: 📶 brand mark,
    "Activate your eSIM instantly and forget about roaming.", side "Starting from
    €4.00" / "View plans". In-app in the live app (`PATHS.esim.manage`); the
    prototype routes into the upselling flow.
  - **GuruWalk** (`source: 'guruwalk'`) → `.reco-card` with a green **`Free`** badge
    + star **rating** (`★ 4.9 (326)`, from `guruwalk.rating`) instead of a price.
    External.
- **Free-offers FAB** (`.free-fab`, GuruWalk): floating green pulsing pill —
  gift + "Free offers" + dismiss ✕. Shows when any `guruwalk` item exists; links to
  the free-tours category. Bottom-right, above the mobile bottom nav / inside the
  desktop browser frame.
- Colors stay on the token palette (amber tokens for the Mozio "HOT DEAL", the brand
  gradient/violet tint for Airalo eSIM) — partner brand hexes are not imported.

---

## §6 Vela helper

**Prototype:** `vela.html` + embedded in registration/IV pages.

Desktop: right rail (324 px) — progress module, quick actions (Share booking link → `m-share`,
QR mobile-switch → `m-qr`, chat), contextual tips, ask box. Mobile: FAB in the top bar →
right sheet (`m-vela`); inline `vela-box` tips under focused form fields.
Vela never blocks task UI; glass styling allowed (it's chrome, not reading surface).

**Placement rule:** Vela is present on every screen of every flow **except** (a) over
active camera / crop-source / liveness surfaces on mobile (attention must stay in the
frame — the on-camera glass pills own that space), (b) full-bleed celebration screens
(`d-complete`, `s-complete` — the next-step CTA *is* the screen), (c) inside modals
(never stack Vela on an overlay), and (d) deprecated screens. On desktop the rail may
stay beside camera screens (it sits outside the task column) but goes **minimal during
liveness** — one tip, no actions, no ask box.
**Rail content is stage-aware, never generic** — tips, escape actions and ask-chips must
match what the guest is doing on that screen (see the §4 stage table); detour screens
(failed / denied / unavailable) always offer at least one alternative path out.

---

## §7 Payments — mobile

**Real components:** `pages/Payments/views/PaymentsView.tsx` (+ `components/MyCart/*`,
`components/OrderHistory/*`), `pages/Payments/views/PaymentFormView.tsx`
(+ `components/PaymentForm/*`, `context/stripe.tsx`),
`components/PaymentProcessingModal/PaymentProcessingModal.tsx`,
`hooks/payments/usePayment.ts`, `pages/DepositView/DepositView.tsx`
· **Prototype:** `flow-payments-mobile.html`

Happy path: `p-cart`* → `p-form` → `p-3ds` → `p-processing` (auto 3.0 s) → `p-success`.

### 7.1 The ledger rule (THE core rule)

Money is one of three kinds and each has a fixed treatment — never mix them:

| Kind | Real source | Treatment |
|---|---|---|
| Charge (pay now) | `pay_now_payments[]`, `total_amount_to_pay` | solid card rows; summed into the payable total; the total is quoted **in the CTA label** ("Pay €380.00") |
| Hold (pre-auth / retention) | `pre_auth_payments_total`, `retention_payments_total` | **dashed** card + dashed amount chip ("€300.00 hold"); NEVER summed into the payable total; always one plain sentence: "reserved on your card, released after checkout"; "How holds work" opens `m-hold` |
| Already paid outside | `outside_paid_amount` | muted ledger row with a green check ("Already paid to Booking.com") |

Every paying CTA (cart, card form, 3-DS sheet) quotes the same amount; the amount
changes only when the cart changes (e.g. pay-later move: €380.00 → €367.50).

### 7.2 Cart (`p-cart`, `p-later`, `p-empty`)

- Tabs "My cart {n}" / "Order history" map to the `Tabs` routes (index / `order-history`);
  styled as **underline tabs** (brand-blue indicator on a hairline), mirroring the real
  `@chekinapp/ui` `Tabs`/`TabsList` — never a segmented/pill control.
- Item rows mirror `useBuildDisplayedPayments`: icon + name + human meta; tourist taxes
  carry "+ Add exemptions" (→ §9 `t-edit` / §10 `td-edit`, the edit-from-payments mode)
  and the meta "2 of 3 guests · 5 taxed nights" (quotes the §9 money story);
  deposit hold carries "Edit protection"
  (→ `p-deposit`); PMS-origin items (booking stay) have **no kebab** (`isPMSorigin`);
  removable upsells get kebab ⋯ = remove / move to pay later.
- Pay later (`store/payments/usePaymentsStore`): moving an item shows a toast, the item
  lands in a "Pay later" box ("Nothing here is charged"), each row has "Send back to
  cart", and the CTA amount updates. Prototype simulates via kebab on Breakfast basket
  → `p-later`.
- Empty cart (`p-empty`): success-toned "Nothing to pay" (never an error look), link to
  order history, CTA "Back to check-in list".

### 7.3 Pay (`p-form`, `p-3ds`)

- **HARD CONSTRAINT — the payment method UI is Stripe's `<PaymentElement>`**
  (`StripePaymentForm`: layout `tabs`, wallets applePay/googlePay `auto`). It's an
  embedded Stripe iframe that cannot be restructured — only *themed* through the
  Appearance API (`context/stripe.tsx`: `colorPrimary`, `colorText`, `borderRadius`;
  proposal: also pass the brand font so it stops rendering `system-ui`). The prototype
  draws it as a fenced "Rendered by Stripe" block (`.stripe-el`) with method tabs
  (Card / Apple Pay / Google Pay) — treat the inside as Stripe's, byte for byte.
  While the iframe loads, keep `PaymentFormSkeleton`.
- Every improvement therefore lives **around** the element (all ours in the real code):
  the **hold pre-warning above the element** — bank registers the €300.00 hold, may
  appear as a €0.00 verification (replaces the mid-payment
  `PreAuthorization3DSInfoModal`); the ledger repeating total + hold; the CTA (the real
  `StyledButton` sits outside the element) quoting the amount; the trust line
  "3-D Secure · Powered by Stripe".
- `p-3ds` mocks the bank challenge (Stripe `confirmPaymentSetup` → `dataRequired`) —
  also not our UI (bank/Stripe-rendered); it's specced only so the €0.00-hold copy and
  the decline path are designed. Approve → `p-processing`, Decline → `p-error`.
  Direct `location.state` guard from the real code applies: entering the form without
  cart state returns to the cart.

### 7.4 Confirmation (`p-processing`, `p-slow`), receipt (`p-success`), decline (`p-error`)

- Processing is a 3-step live timeline: ✓ "Payment approved by your bank" → ⟳
  "Confirming with Villa Serena" → ○ "Your receipt — appears right here", plus
  "Don't refresh — you won't be charged twice". Maps to `usePayment` websocket
  (`multiPaymentUpdated`) with 2 s polling fallback.
- `p-slow` is the polling-fallback state (websocket silent): same timeline + amber note
  "taking longer than usual… receipt will also be emailed"; never looks frozen.
- `p-success`: "€380.00 paid" + itemized receipt (items, dashed hold line, card ····4242,
  date) + "Receipt sent to {email}" + download PDF. Primary CTA follows the §1.4
  priority table (mock story: Carlos `verification_pending` → "Verify Carlos's ID");
  secondary "Back to check-in list".
- `p-error`: human cause first, raw code second (monospace), primary blue "Try again"
  (→ `p-form`), "Use a different card", trust line "Nothing was charged — your cart is
  unchanged", ghost "Back to cart". Never a lone "OK".

### 7.5 Order history (`p-history`) & deposit chooser (`p-deposit`)

- History rows grouped by date with badges: green **Paid**, dashed **Hold** (active),
  blue **Refunded** (+ "back on Visa ···· 4242 within 5–10 days"). Footer note explains
  "pending" statement lines. Maps to `useBuildDisplayedOrderHistory` categories.
- `p-deposit` (DepositView): each option leads with the cost **today** — "€0.00 today"
  (security-deposit hold, ⚡ Recommended) vs "€39.00 one-time" (damage protection,
  amber "non-refundable" caveat); consequence bullets per option; ghost "Continue
  without protection" (never destructive-red); confirm returns to the cart
  (`confirm_and_go_back_to_payment`).

### 7.6 Vela & chrome

`vela-fab` on every screen except `p-3ds`, `p-processing`/`p-slow` (attention stays on
the wait) and `p-success` (celebration). `m-vela` tips: what's a hold (→ `m-hold`),
is paying safe, where's the receipt. 3-segment `progress-track` on `p-form`/`p-3ds`/
`p-processing` (review → pay → receipt).

### 7.7 Screen-id registry (deep-link hashes)

`p-cart`* · `p-later` · `p-history` · `p-empty` · `p-form` · `p-3ds` · `p-processing` ·
`p-slow` · `p-success` · `p-error` · `p-deposit` · modals `m-vela`, `m-hold`
(* = `data-start`; autonext: processing→success 3.0 s, slow→success 3.4 s)

---

## §8 Payments — desktop

**Prototype:** `flow-payments-desktop.html` (loads `pay.css` + `payd.css`)

Desktop mirrors §7 with the desktop shell (navy sidebar, Payments active) and these
differences:

- `pd-cart`: two-column grid — item list left, **sticky ledger** right with the CTA
  inside it (mirrors MyCart's 852 px list/summary split). Tabs to `pd-history`.
- `pd-form`: centered column with the same fenced Stripe `<PaymentElement>` block
  (§7.3 constraint applies — theme-only); the 3-DS bank challenge is **not** a
  separate desktop screen (Stripe renders it as an overlay) — "Pay €380.00" goes
  straight to `pd-processing`; the mobile `p-3ds` mock documents the challenge copy.
- `pd-success` is **full-bleed** (no Vela rail, per §6 placement rule); sidebar flips
  Payments/protection/taxes badges to ✓ and progress to 75%.
- Vela rail is stage-aware on all other screens:

| Stage (screens) | Rail content | Escape actions |
|---|---|---|
| `pd-cart` | progress (Review cart → Pay → Receipt) + what's-a-hold (`m-hold`), pay-later tip | — |
| `pd-history` | hold-isn't-a-charge, refund timing, invoice tip | — |
| `pd-form` | progress step 2 + security tips (Stripe, 3-DS, statement descriptor) | back to cart (back-pill) |
| `pd-processing` | **minimal** — one patience tip, no ask box (liveness precedent) | — |
| `pd-error` | decline causes (banking app, limits) + "cart is saved" | back to cart |
| `pd-deposit` | pick-the-hold-if / pick-protection-if | back to cart |

### 8.1 Screen-id registry (deep-link hashes)

`pd-cart`* · `pd-history` · `pd-form` · `pd-processing` · `pd-success` · `pd-error` ·
`pd-deposit` · modal `m-hold` (* = `data-start`; autonext: processing→success 3.0 s)

---

## §9 Tourist taxes — mobile

**Real components:** `pages/Taxes/TaxesTouristView/TaxesTouristView.tsx` (+ its
`modals/*`: TaxesInformationModal, ExemptionsListModal, RemoveExemptionModal,
ExemptionAddedModal, SuccessModal, shared SettingsModalPayment),
`pages/Taxes/TaxesExemptionView/TaxesExemptionView.tsx`
(+ `components/GuestTaxesForm/*`, `components/ExemptionUser/ExemptionUser.tsx`),
`hooks/taxes/*`, `entities/taxes/*` · **Prototype:** `flow-taxes-mobile.html`

Happy path: `t-setup`* → (optional `t-exemption` → `t-added`) → confirm opens
`m-success` → "Continue to payment" → `flow-payments-mobile.html#p-cart`.

### 9.1 The math-card rule (THE core rule)

The tax total is never shown as a bare number — it is **visible math**:

| Element | Real source | Treatment |
|---|---|---|
| Season rule | `Season.price_per_night`, `rules[]` (age brackets), `is_max_nights_taxed`/`max_nights` | one sentence pinned on top of the card: "€3.10 per adult per night — only the first 5 nights are taxed" |
| Taxable guest | `GuestsTaxes.guest_list[]` (no exemption) | row with avatar initials, "Adult · 5 taxed nights", amount + calc line "5 × €3.10" |
| Exempt guest | `guest_list[]` entry with `exemption ≠ NONE` | **stays on the list** as a dashed "Exempt · €0.00" chip row (same dashed = never-charged language as §7 holds); meta names the exemption **and its proof**; ✕ opens `m-remove` |
| Total | `GuestsTaxes.amount` (server-computed) + commission | ledger: tax + Chekin service fee + dashed exempt row; header "To your payments cart" — never "to pay" (nothing is charged on this screen) |

The confirm CTA quotes amount and destination: "Confirm — €32.50 to my cart"
(real i18n `confirm`; edit mode uses the real `confirm_and_go_back_to_payment`).

### 9.2 Setup (`t-setup`, `t-added`, `t-empty`, `t-paid`)

- `t-setup`: page intro carries the legal line (`please_be_advised`) with "Why this
  tax?" → `m-info`; "3 guests · 7 nights" section header with "Edit guests"
  (EditGuestsModal — not mocked); math card; exemptions section ("Who can be exempt"
  → `m-exemptions`, dashed "Add guest with exemption" row → `t-exemption`, disabled
  in real code when all guests are exempt — `disabledAddingExemptions`); ledger; CTA
  opens `m-success`.
- `t-added`: toast "Ana's exemption added — new total €17.00"; Ana flips to a dashed
  exempt row (meta "Registered resident · certificate at check-in"); ledger recomputes
  (€15.50 + €1.50 = €17.00); intro reminds about the proof. Maps to the
  `?exemption-added` return navigation.
- `t-empty` (`hasExemptions === false`): the whole exemptions block is hidden (real
  behavior); the math card instead shows **age-bracket pricing** (`SeasonRule`
  lessThan/between/moreThan): Carlos at the reduced under-18 rate (5 × €1.55 = €7.75),
  total €40.25. Note: "No exemption types are defined in this region."
- `t-paid` (`summary.taxes.status === 'COMPLETE'`): green paid banner ("€32.50 paid ·
  12 Aug 2026 · with your booking payment · receipt sent to {email}"); math card
  read-only (no ✕, no add row, no edit); lock note "Paid taxes can't be edited";
  primary CTA → order history (`flow-payments-mobile.html#p-history`).

### 9.3 Exemption picker (`t-exemption`, `t-newguest`)

- `t-exemption` (GuestTaxesForm): Select "Exemption" (options =
  `Season.exemptions[].exemption_name` — **API-driven, not in locale files**; mock
  types: Under 18 / Registered resident / Disability ≥ 33% / Subsidized program stay)
  + Select "Exempted guest" (already-exempt guests excluded/disabled — real code marks
  them `exempted`). Every exemption names its **proof document** in the select helper,
  the list modal and the exempt row.
- Amber proof warning sits above the confirm, not in fine print: verified at check-in,
  unverifiable exemptions are added back.
- **Delta preview** (improvement — real app recalculates only after confirm): a green
  card "New total if confirmed — €17.00 · Was €32.50" so the money consequence is read
  before the tap. Confirm → `t-added`; Cancel → `t-setup`.
- `t-newguest` (NewGuestForm via `guest_not_in_the_list`/`add_new_guest`): exemption
  select + Name + Surname only (`useMutateShortGuest`); note that the guest joins as
  unregistered; delta preview shows "Total stays €32.50" (exempt from night one).
  Confirm opens `m-added` (real ExemptionAddedModal) — primary "Finish Lucía's
  registration" → `flow-registration.html#r-hub` (§1.4 next-task priority), ghost
  "Later — back to taxes" → `t-setup`.

### 9.4 Edit-from-payments mode (`t-edit`)

Maps to `location.state.edit` (set by the cart's "Add exemptions" /
`handlePaymentEdit`): back button and confirm CTA both return to
`flow-payments-mobile.html#p-cart`; CTA label is the real
"Confirm and go back to payment"; the intro block is hidden (real mobile behavior);
ledger header reads "Tourist taxes in your cart".

### 9.5 Modals & Vela

- `m-info` (TaxesInformationModal): three answers — law not property fee / math fixed
  by the season / exemptions need proof — + privacy-policy link.
- `m-exemptions` (ExemptionsListModal): exemption types **with their documents**;
  primary "Add an exemption" chains into `t-exemption`.
- `m-remove` (RemoveExemptionModal): consequence stated ("back to the full rate, total
  updates right away; re-add any time before you pay"); "Remove exemption" is primary
  blue (Appendix A rule 2 — never destructive-red), ghost "Keep it".
- `m-added` (ExemptionAddedModal), `m-success` (SuccessModal — "the tax is in your
  payments cart… one payment, one receipt"; primary → payments cart, ghost → home).
  SettingsModalPayment (missing-setups variant) is not mocked — see Appendix C.
- `m-vela` tips: why am I paying (→ `m-info`), who can be exempt (→ `m-exemptions`),
  when do I pay (never here — the cart). `vela-fab` on every screen.

### 9.6 Screen-id registry (deep-link hashes)

`t-setup`* · `t-exemption` · `t-newguest` · `t-added` · `t-edit` · `t-empty` ·
`t-paid` · modals `m-vela`, `m-info`, `m-exemptions`, `m-remove`, `m-added`,
`m-success` (* = `data-start`; no autonext — taxes has no waiting states)

---

## §10 Tourist taxes — desktop

**Prototype:** `flow-taxes-desktop.html` (loads `pay.css` + `payd.css` + `tax.css`)

Desktop mirrors §9 with the desktop shell (navy sidebar, Tourist taxes active with an
amber "!" badge; Payments links to `flow-payments-desktop.html#pd-cart`) and these
differences:

- `td-setup`: `payd-grid` two-column — math card + exemptions left, **sticky ledger**
  right with the confirm CTA inside it (mirrors `pd-cart`). Confirm opens `m-success`
  (centered dialog) → "Continue to payment" → `#pd-cart`.
- `td-exemption`: centered `payd-form-col` with the same picker, proof warning and
  delta preview; "Add a new guest" stays inline (no separate desktop screen —
  `t-newguest` documents the fields).
- `td-edit`: back-pill and ledger CTA return to `flow-payments-desktop.html#pd-cart`
  ("Confirm and go back to payment").
- `td-paid`: sidebar flips Payments/protection/taxes badges to ✓ and progress to 75%
  (consistent with `pd-success`); paid banner + read-only math card + lock note;
  CTA → `#pd-history`.
- Vela rail is stage-aware:

| Stage (screens) | Rail content | Escape actions |
|---|---|---|
| `td-setup` | progress (Confirm the setup → Pay with your cart) + why-this-tax (`m-info`), who-can-be-exempt (`m-exemptions`) | — |
| `td-exemption` | which-document tip (`m-exemptions`), "nothing is locked" | back to taxes (back-pill) |
| `td-edit` | "you came from the cart", cart-is-safe | back to cart |
| `td-paid` | receipt location, Carlos's proof reminder — no ask box | — |

### 10.1 Screen-id registry (deep-link hashes)

`td-setup`* · `td-exemption` · `td-edit` · `td-paid` · modals `m-info`,
`m-exemptions`, `m-remove`, `m-success` (* = `data-start`)

---

## §11 FAQ & language — mobile

**Real components:** `pages/FAQView/FAQView.tsx` (+ `Questions.tsx`,
`renderRichText.ts`, `utils.ts` highlight helpers),
`components/LanguageModal/LanguageModal.tsx` (+ `useLanguageModalStore.ts`),
`utils/i18n/constants.ts` (`languageOptions`, `appLocaleNamespaces`),
`configs/i18n/i18n.ts`, `hooks/useNavigationLinks.tsx`
· **Prototype:** `flow-faq-mobile.html`

Two features, one surface: the FAQ page (route `PATHS.faq`, nav item gated by
`housing.faq_enabled`) and the language modal (global zustand modal mounted once in
`App.tsx`, opened from menu/footer triggers). The prototype promotes a **globe button
onto the FAQ top bar** (improvement — real triggers live in the sidebar menu, welcome
footer, universal-link footer, kiosko header only).

### 11.1 The FAQ rules

| Element | Real source | Treatment |
|---|---|---|
| Question set | `Questions.tsx` — 6 general + conditional: IV pair (`isIVEnabled`), taxes (`data.taxes.active`), pay-later (`arePaymentsAvailable`); minors answer swaps to the Spain variant ("from age 14") when Spain + police active | grouped under **task section labels** (improvement — real list is flat): Your data & registration · Identity verification · Taxes & payments; a `sim-note` states the conditionality |
| Answers | `renderRichText` (line breaks + Privacy-Policy link slots) | prose + `a.inline` privacy links; task-describing answers close with a **`.fq-action` pill into that task** (improvement): share link → `flow-registration.html#r-hub`, IV → `flow-iv-mobile.html#s-start`, taxes → `flow-taxes-mobile.html#t-setup`, payments → `flow-payments-mobile.html#p-cart` |
| Search | filters question + answer plain text (`searchText`), **auto-opens** matches, highlights via `highlightNode` | pill search; `h-search` shows query "minors" → 2 matches open with `<mark>` on the term; count line "2 articles · matching “minors”"; ✕ clears → `h-faq` |
| No results | SearchX + "No results for …" + try-a-different-word hint | `h-empty` adds escape actions (improvement): "Ask Vela instead" (`m-vela`) + "Browse all questions" (→ `h-faq`) — never a dead end |

### 11.2 The language rules

- Sheet maps to `ResponsiveSheet` — **bottom sheet on mobile** (`h-lang`), dialog on
  desktop (§12). Title "Select your language" (`select_your_language`); the sub
  "Switches instantly — nothing you've entered is lost" is the proposed trust line.
- Options = the real 18-language `languageOptions` (order preserved; flags are content
  artwork — emoji in the prototype, SVGs in the app; Català has no emoji flag → CSS
  senyera stripes). Each row: 32 px round flag · label · country subtitle.
- **Suggested group** (improvement): current language (check, "· current") + the
  device language ("· suggested from your device" — surfaces the real detector order
  `querystring → localStorage → navigator`; no IP detection exists). "All languages"
  below.
- States kept from real code: selected = blue border + pressed tint + check
  (`aria-pressed`); **pending** = spinner on the picked row, everything else disabled
  (`aria-busy`) — `h-lang` shows Español pending; tapping it lands on `h-es`.
- Switch = `preloadAndSetDayJsLocale` + `i18n.reloadResources` (5 namespaces) +
  `i18n.changeLanguage` — **no page reload**; `h-es` renders the whole FAQ page in
  Spanish (real es locale strings) under a toast "Idioma actualizado — Español", with
  the same action links pointing at the same flows.

### 11.3 Vela

`vela-fab` on all FAQ screens (never over the open language sheet — §6 modal rule).
`m-vela` tips: "Prefer another language?" (→ `h-lang`), "Answers match your stay"
(conditionality), ask box with stay questions — Vela is the escalation path the real
FAQ page lacks.

### 11.4 Screen-id registry (deep-link hashes)

`h-faq`* · `h-search` · `h-empty` · `h-lang` · `h-es` · modal `m-vela`
(* = `data-start`; no autonext. `h-lang`/`h-es` embed the language sheet inline —
scrim tap returns to `h-faq`. Accordions are native `<details>` — no JS.)

---

## §12 FAQ & language — desktop

**Prototype:** `flow-faq-desktop.html` (loads `pay.css` + `faq.css`)

Desktop mirrors §11 with the desktop shell and these differences:

- Sidebar gains a **"Support" group** (mirrors `useNavigationLinks`): **Language**
  (globe + current value "English" via `.sb-val`, → `hd-lang`), **FAQs** (active,
  circle-help icon), **Privacy policy** (lock, external). Payments/taxes rows link
  into their flows (`#pd-cart`, `#td-setup`).
- `hd-faq`: centered `desk-col` (mirrors FAQView `max-w-[760px]`) — hero, search pill,
  count, grouped accordion; action pills target the **desktop** flows
  (`flow-iv-desktop.html#d-choice`, `flow-taxes-desktop.html#td-setup`,
  `flow-payments-desktop.html#pd-cart`, `guest-registration-desktop.html`).
- `hd-search`: query "minors", 2 auto-opened highlighted matches; rail explains the
  two age rules (14 registration / 18 IV).
- `hd-lang`: the language dialog (`ResponsiveSheet` desktop variant) — centered
  560 px panel, **two-column** grid (`sm:grid-cols-2`), close ✕ + scrim → `hd-faq`;
  Español (pending) → `hd-es`.
- `hd-es`: the **whole shell** translates in place — sidebar (groups, items, progress
  label), back-pill, page, and Vela rail all in Spanish; Language row value flips to
  "Español"; toast top-right. No mobile-style empty state screen (documented §11 only).
- Vela rail is stage-aware: `hd-faq`/`hd-es` — language tip (→ `hd-lang`) +
  conditionality tip + ask box; `hd-search` — the two-ages tip + "ask me beyond the
  FAQ"; `hd-lang` — minimal (intro only, §6 during-overlay rule).

### 12.1 Screen-id registry (deep-link hashes)

`hd-faq`* · `hd-search` · `hd-lang` · `hd-es` (* = `data-start`; no autonext)

---

## §13 Upselling — mobile

**Real components:** `pages/OfferListView/OfferListView.tsx`,
`pages/OfferView/OfferView.tsx`, `pages/BookExperienceView/BookExperienceView.tsx`,
`components/upselling/OfferCard/*`, `OfferCardMark/*`, `ExclusiveOfferBadge/*`,
`CategoryFilter/*`, `AddToCartForm/*` (`PriceCounter`, `DeliveryDateTimePicker`),
`CreateDealCompleteModal/*`, `EnterContactEmailModal/*`,
`legacy/hooks/useBookDeal.ts`, `store/bookExperience`,
`pages/HomeView/components/useUpsellItems.ts` (partner sources) ·
**Prototype:** `flow-upselling-mobile.html` (loads `pay.css` + `upsell.css`)

User-facing name: **"Extras & experiences"** (route `recommendations`). The flow's
job: add stay upgrades with zero ambiguity about (a) when money leaves the card and
(b) what needs host approval.

### 13.1 The two-lane rule (THE core rule)

Every native offer belongs to exactly one lane, derived from
`Offer.confirmation_type`, and **declares it before the tap**:

| Lane | Source value | Card chip | Detail lane-note | CTA label | After CTA |
|---|---|---|---|---|---|
| ⚡ **Instant** | `AUTO` | `.lane.instant` (blue tint) | "Instant — no approval needed. This goes straight to your payments cart…" | "Add to cart — €12.50" | `m-added` → deal status `APPROVED`, lands in the payments cart |
| 🕗 **On request** | `MANUAL` | `.lane.request` (amber tint) | "On request — {host} confirms first… charged only if they say yes." | "Send request — nothing charged yet" | `m-sent` → deal status `PRE_REQUESTED`, appears in "My requests" |

Corollaries:
- The CTA always states the money consequence (amount for instant, "nothing charged
  yet" for requests) — same rule as payments §7.3 and taxes §9.2 CTAs.
- Amber marks the *waiting* lane per Appendix A rule 5 (action needed — by the host);
  it is never used for errors.
- A third pseudo-lane **"In your cart"** (`.lane.incart`, green) marks offers whose
  deal already exists with status `APPROVED` — replaces today's `OfferCardMark`
  "ADDED" chip, which was the only status ever surfaced.

### 13.2 The dashed rule extended (status lifecycle)

`DEAL_STATUSES` map to UI as follows — this fixes the real-code gap where
`REQUESTED`/`REJECTED`/`PAID` never render:

| Status | Where shown | Treatment |
|---|---|---|
| `PRE_REQUESTED` / `REQUESTED` | "My requests" (`u-track`) | tracker step 2 active (pulsing), price as **dashed `hc-chip`**, ledger `lg-row hold` — never summed |
| `APPROVED` | "In your cart" group + list card mark | solid price, counts into "Extras in your cart" total, pays via §7 cart |
| `REJECTED` | `u-rejected` | red `.st-chip.declined` + tracker step 2 `fail`, host's reply quoted (`.host-note`), plan-B suggestion, "nothing was charged" |
| `PAID` | §7 order history (`p-history`) | not re-listed here — paid deals are receipts, not extras to manage |

Partner offers (Mozio/Airalo/GuruWalk `UpsellSource`s) are shown as the live app
shows them — **rich banners interleaved with the native offer grid**, mirroring
`OfferListView`'s `BANNER_AFTER_CARD = [2, 5]`:
- **Mozio** transfer banner (`.mozio-banner`) injected **after the 2nd** native card,
- **Airalo** eSIM banner (`.airalo-banner`) injected **after the 5th** native card,
- **GuruWalk** free tours as a trailing **"Free walking tours"** section of
  `.of-card`s with a green `Free` badge + star rating (`OfferCardExternal`).

Each banner spans the full grid row (`.col-full`) and stays unmistakably a partner
surface: the provider is named ("Powered by Mozio · books on the partner site"), an
external-link glyph is shown, and the `m-partner` hand-off dialog fires before
leaving. Because they book and pay off-site, they never enter the Chekin cart — the
same "not a charge here" contract the dashed cart language expresses, but presented
as the prominent banners the business runs today. The Mozio "HOT DEAL" tag uses the
amber token, not the partner's brand hex.

### 13.3 Browse (`u-list`, `u-empty`)

- Glass topbar: title "Extras & experiences", sub `Villa Serena · CHK-58291`,
  `tb-action` **"My requests"** → `u-track`, Vela FAB.
- **Category pill rail** (`.cat-rail`, glass, sticky under the topbar — replaces the
  `CategoryFilter` dropdown/sheet): All · Check-in & out · Food & drinks · Transport ·
  Wellness · Free tours. Selected pill = filled navy. Free tours mirrors the
  `freeOffers` category.
- **Featured card** (`.of-feature`): `is_exclusive` offer with gradient-brand
  "✦ Exclusive for guests" flag and dark-glass price pill (Sunset vineyard tour,
  €45.00 / person). Not wired to a detail screen in the prototype.
- **Offer grid** (2-col): each card = pastel photo + glass price pill
  (`€X <unit>` from `PriceItem.unit_type`) + title + one-line highlight + lane chip.
  Wired: Breakfast basket → `u-detail`, Early check-in → `u-request`. Late check-out
  carries the in-cart mark (story: added during §1 registration).
- CTA dock: "Review cart — 1 extra · €15.00" → `flow-payments-mobile.html#p-cart`
  (the dock always quotes the cart's current extras count + sum).
- `u-empty`: no published offers — gift ring, "No extras for this stay yet", escape
  actions **Ask Vela** (`m-vela`) and Back to home (Appendix A rule: empty states
  invite action).

### 13.4 Offer detail (`u-detail` instant, `u-request` on request)

Shared skeleton: hero photo with glass price pill → lane-note (the lane, spelled
out) → description (`Offer.description`) → `.of-facts` rows (availability/delivery
window, capacity, cancellation) → lane-specific block → CTA dock.

- `u-detail` (Breakfast basket, AUTO): quantity stepper (`PriceCounter` stand-in,
  "− 1 +", €12.50 each) → mini-ledger "To your payments cart €12.50" with the
  "nothing is charged now" note → CTA `m-added`.
- `u-request` (Early check-in, MANUAL): "How your request travels" tracker preview
  (3 steps: Send request *now* → Host reviews *a few hours* → Pay in cart *if
  approved*) → **inline reply-email row** (`.mail-row`: "The reply goes to
  maria@gmail.com · Edit") — replaces the surprise `EnterContactEmailModal` /
  confirm-email route → CTA `m-sent` + secure-line "€20.00 is charged only after
  Villa Serena approves".

### 13.5 My requests (`u-track`, `u-rejected`)

- `u-track`: section **"Waiting for the host"** — `.req-card` with 3-step tracker
  (step 1 done 10:24, step 2 active "usually a few hours", step 3 todo), dashed
  €20.00 chip, foot note "we'll email you… keep browsing meanwhile" + **Cancel
  request** (→ `m-cancel`; plain text, never red — Appendix A rule 2). Section
  **"In your cart — pay when ready"** — approved extras as `pay-item` rows. Ledger:
  "Extras in your cart €27.50" + dashed hold-row "Early check-in — waiting €20.00"
  with the note that dashed never sums. CTA → payments cart.
- `u-rejected`: the same view when the host declines — declined `.st-chip`, tracker
  step 2 `fail` (red = the request lifecycle's error outcome), **`.host-note`
  quoting the host's actual reply**, "Plan B" suggestion card (Luggage drop €5.00 /
  bag, instant), cart section unchanged ("your total didn't change"). Primary CTA
  "Browse other extras" (recovery is primary blue).

### 13.6 Modals & Vela

- `m-added` (sheet) = `CreateDealCompleteModal`: "Review cart & pay" →
  `#p-cart` · ghost "Keep browsing extras" → `u-list`.
- `m-sent` (sheet): "Track my request" → `u-track` · ghost → `u-list`. Quotes the
  reply email.
- `m-partner` (sheet): partner hand-off — "you'll book and pay on their site…
  never in your Chekin cart"; primary "Continue to the partner site".
- `m-cancel` (dialog): cancel request confirm — "nothing is charged… you can request
  again"; primary "Cancel request" (blue).
- `m-vela` (right sheet): "Two ways to book", "When am I charged?" (never here),
  "Can I change my mind?" + ask chips.

### 13.7 Screen-id registry (deep-link hashes)

`u-list`* · `u-detail` · `u-request` · `u-track` · `u-rejected` · `u-empty`
(* = `data-start`; no autonext screens)

---

## §14 Upselling — desktop

**Prototype:** `flow-upselling-desktop.html` (loads `pay.css` + `payd.css` +
`upsell.css`)

Desktop mirrors §13 with the desktop shell and these differences:

- Sidebar gains **"Extras & experiences"** (gift icon, active) under the
  **"Your stay"** group; Payments keeps its badge (4) and links `#pd-cart`; Tourist
  taxes links `#td-setup`.
- `ud-list`: category rail is a flat (non-glass, non-sticky) pill row with a
  right-aligned **"My requests · 1"** pill → `ud-track`; featured card + **3-column**
  grid with the **Mozio `.wide` banner interleaved after card 2 and the Airalo banner
  after card 5** (§13.2), then a trailing **"Free walking tours"** 3-col section of
  GuruWalk `.of-card`s (green `Free` badge + rating); CTA row (not a dock): "Review
  cart — 1 extra · €15.00" → `#pd-cart` + ghost "My requests & extras".
- `ud-detail` / `ud-request`: two-column `.upd-two` — story column (hero, lane-note,
  description, facts) left, **sticky `.book-box`** right. The book-box holds the
  price line, quantity stepper (instant) or tracker + inline email row (request),
  the lane CTA and the "nothing charged" note — the §7/§9 sticky-ledger pattern
  applied to booking.
- `ud-track` / `ud-rejected`: `payd-grid` — request/cart cards left, **sticky
  ledger** right (extras total, per-item rows, dashed "waiting" hold-row or €0.00
  declined row, CTA "Pay in your cart" → `#pd-cart` / "Browse other extras").
- Modals are centered dialogs (no sheets). No `u-empty` mirror (mobile-only, like
  taxes' `t-empty`).
- Vela rail is stage-aware: `ud-list` — two-ways-to-book + partner tip; `ud-detail` —
  delivery/cancellation tips; `ud-request` — "you'll get an email" + free-to-cancel;
  `ud-track` — status legend (waiting/in-cart/declined); `ud-rejected` — plan-B
  suggestion chips.

### 14.1 Screen-id registry (deep-link hashes)

`ud-list`* · `ud-detail` · `ud-request` · `ud-track` · `ud-rejected`
(* = `data-start`; no autonext)

---

## §15 Remote access — mobile

**Real components:** `components/RemoteAccess/RemoteAccess.tsx` (orchestrator),
`InternalRemoteAccess.tsx` / `LinksRemoteAccess.tsx` (page frames), `Content.tsx`,
`LocksList.tsx`, `components/KeyBox.tsx`, `KeylessKeyBox.tsx`,
`ExternalLocksGroupBox.tsx` + `DoorItem.tsx`, `NoAccessKeysBox.tsx`,
`OpenDoorSwich.tsx`, `OpenLockStatusModal.tsx`, `KeylessGuideModal/*`;
hooks `useAvailableLocks` / `useUnlockDoor` / `useFetchLockConditions`;
types `packages/core/src/utils/remoteAccess/{types,constants}.ts` ·
**Prototype:** `flow-remote-access-mobile.html` (loads `pay.css` + `keys.css`)

User-facing name: **"My keys" / "Virtual keys"** (route `remote-access`). The
flow's job: make access legible — *when* the keys work and *how* each door opens.

### 15.1 The two-state rule (THE core rule)

Access is always in exactly one of two states and the UI never hides which:

| State | Real source | Screen | Treatment |
|---|---|---|---|
| **Gated** (keys don't exist yet) | `useAvailableLocks`: `areKeysAvailable === false` — `incomplete_conditions[]` non-empty or `!is_available` | `k-gate` | a **conditions checklist**, not a bare list (redesigns `NoAccessKeysBox`) |
| **Live, time-boxed** | `areKeysAvailable === true`; each `Unlock` has `valid_from`/`valid_through` | `k-keys` (in-window) / `k-window` (before window) | per-door **state chip** — green "Open now" vs amber "Opens {time}" |

Corollaries:
- Amber marks *waiting* (before the access window / a condition still pending) per
  Appendix A rule 5 — never used for errors. Red is reserved for a lock that fails
  to open / is offline (`OpenLockStatusModal` ERROR, `business_status OUTSIDE_PERIOD`
  surfaces the backend message).
- `Lock.access_type` drives the door glyph: `COMMON` → building icon (street/shared
  entrance), `PRIVATE` → apartment icon (your unit). Doors are ordered "your way in."
- Time-gating mirrors `checkIfCurrentDayBetween(valid_from, valid_through)`: out of
  window → the slide is `.locked` and the code row shows "appears at {time}" instead of
  disabling silently with only "Keys out of time."

### 15.2 The door card (`KeyBox` / `LocksList`)

Every lock renders one `.door` card = icon (building/apartment) + name + sub +
state chip, then a body that depends on `LOCK_OPENING_TYPES` and vendor:

- **Keypad / collection code** (`opening_type CODE`, or KeyNest `collection_code`):
  `.door-code` — label + large mono value + **Copy** button. *Improvement:* every
  code is copyable (real code: only Keyless had copy).
- **Remote unlock** (`Boolean(token) && opening_type !== CODE`): the **slide-to-open**
  control (`.slide`, the real `OpenDoorSwich`) — the flow's signature. Completing the
  slide (drag or tap) opens `m-opening`. Disabled/out-of-window → `.slide.locked`
  labelled "Opens {time}".
- A door may show both (code + slide) when the lock exposes both.

### 15.3 The unlock lifecycle (`OpenLockStatusModal`)

`IDLE → LOADING → SUCCESS | ERROR`, mocked as three centered dialogs:
- `m-opening` (LOADING): spinner + "Opening the door…" (no buttons — resolves itself;
  prototype auto-advances ~2.2 s, mapping the websocket/redirect resolution).
- `m-opened` (SUCCESS): green burst check + "You're in" + "re-locks on its own" (maps
  the `door-opening-animation` lottie). If the real unlock returns `redirect_link` the
  app opens the provider deep-link instead of this success — not mocked.
- `m-error` (ERROR): `wifi-off` mark + "Connection issue" + the offline door named;
  primary **"Try again"** is blue (Appendix A rule 2 — recovery is never red), ghost
  "Contact {property}". Reachable from the Salto **Bike storage** door (`data-open-door="fail"`).

### 15.4 Screens

- `k-keys`* (in-window, keys live): collapsible property **instructions**
  (`housing_instructions`, `ViewMoreBox` + `convertStringToComponents` link parsing),
  "Your way in · in order" section, a **building-entrance keypad code** door (COMMON,
  copyable "4471#", Open now) + an **apartment remote** door (PRIVATE, slide, Open now),
  and the access-until-checkout line. No CTA dock — the keys *are* the destination.
- `k-gate` (§15.1 gated): lock ring + "Your keys are almost ready", a navy **"keys go
  live on check-in day · from 15:00"** banner, and the checklist — done rows
  (Booking paid ✓, All guests registered ✓) + the **active blocking row** (Every
  guest's ID verified → Carlos pending → **Verify** deep-links `flow-iv-mobile.html#s-start`)
  + a todo row (Check-in day arrives — automatic). Primary CTA = the blocking task
  (**"Verify Carlos's ID"**), ghost "Back to check-in list" (mirrors the §1.4 next-task
  priority). Maps `incomplete_conditions` → friendly labels + task links.
- `k-window` (§15.1 live-but-before-window): amber `.win-note` "Access opens at 15:00…",
  both doors shown with amber "Opens 15:00" chips, the code as a locked "appears at 15:00"
  row and the apartment as `.slide.locked`; a "we'll notify you" line.
- `k-keyless` (`KeylessKeyBox`, vendor `KEYLESS_DUBAI`): "Powered by Keyless · opens in
  their app", 3 steps, the **booking reference** (`external_id`) with Copy, App Store /
  Google Play buttons, and a "Why do I need another app?" row → `m-keyless-guide`.
  No in-app unlock (matches real: Keyless never has a slide/code).
- `k-doors` (`ExternalLocksGroupBox` + `DoorItem`, vendor `SALTO_V2`): a building-entrance
  slide + an expandable **"Your rooms & spaces"** group listing each room with its own
  **Open** button (Loft 2A, Rooftop terrace) and one **offline** door (Bike storage →
  Retry → `m-error`).

### 15.5 Modals & Vela

- `m-opening` / `m-opened` / `m-error` (§15.3), `m-keyless-guide` (`KeylessGuideModal` —
  why an app / share with the group / remove after checkout + guest-guide link).
- `m-vela` (right sheet): "When do my keys work?", "Nothing happens when I slide?", "Do
  I need to lock up?" + ask chips. `vela-fab` on every screen (never over the open
  status modal — §6 modal rule).

### 15.6 Screen-id registry (deep-link hashes)

`k-keys`* · `k-gate` · `k-window` · `k-keyless` · `k-doors` · modals `m-opening`,
`m-opened`, `m-error`, `m-keyless-guide`, `m-vela`
(* = `data-start`; no `data-autonext` screens — the opening→opened sequence is a
modal timer in the page script, not a flow-screen auto-advance)

---

## §16 Remote access — desktop

**Prototype:** `flow-remote-access-desktop.html` (loads `pay.css` + `payd.css` +
`keys.css`)

Desktop mirrors §15 with the desktop shell — the existing **"Virtual keys"** sidebar
item (under the **"Your stay"** group, `#i-key`) is now the active destination — and
these differences:

- Doors sit in a single centered reading column (`.desk-col`), not a two-column
  ledger split (there's nothing to total). Payments/taxes/registration sidebar rows
  link into their desktop flows; on keys-live screens their badges show ✓ and progress
  reads 100% ("Ready for your stay"); on `kd-gate` progress is 75% with Guest
  registration `warn 1` and the Virtual keys badge reads **"Soon"** (before-window:
  **"15:00"**, live: **"Live"**).
- `kd-keys`: instructions + the two doors (keypad code + apartment slide).
- `kd-gate`: the same conditions checklist; the blocking **Verify** row and the primary
  CTA deep-link `flow-iv-desktop.html#d-choice`.
- `kd-window`: amber note + both doors locked with "Opens 15:00".
- `kd-doors`: building-entrance slide + the Salto rooms group (one offline → `m-error`).
- `m-opening` / `m-opened` / `m-error` are shared dialogs (no Keyless/Vela sheet on
  desktop — the rail carries help, like taxes' desktop trims mobile-only states).
- **Vela rail (stage-aware):**

| Stage (screens) | Rail content | Escape actions |
|---|---|---|
| `kd-keys` | when-do-keys-work · slide-troubleshooting · re-locks-itself | — |
| `kd-gate` | **"The last step"** — Verify Carlos (deep-link `#d-choice`) + "then it's automatic" | verify → IV |
| `kd-window` | access-opens-15:00 · "need in earlier?" (early check-in via extras) | — |
| `kd-doors` | door-status legend (Open now / Offline) | — |

### 16.1 Screen-id registry (deep-link hashes)

`kd-keys`* · `kd-gate` · `kd-window` · `kd-doors` · modals `m-opening`, `m-opened`,
`m-error` (* = `data-start`; no autonext)

---

## §17.0 Find booking — V2 "the arrival card" (current)

**Real components:** same set as §17 — `pages/SearchReservation/SearchReservation.tsx`,
`Views/BookingCodeView`, `Views/CheckInDateView`, `Views/NewReservationView`,
`Views/DirectReservationView`, `components/SearchOptions.tsx`,
`components/SearchingBookingModal/*` (`StatusModal`),
`components/ReservationNotFoundModal/*`, `useHousing.ts`, `useReservationNotFound.ts`
· **Prototypes:** `flow-search-v2.html` (mobile), `flow-search-desktop-v2.html` (desktop),
both loading `search-v2.css` + `search-v2.js`
· Supersedes §17/§18, which stay documented for the V1 prototype.

The premise: `SearchReservation` is the **first thing a guest ever sees of a property**,
so the property is the hero and the form is the guest. Routes are unchanged
(`main` → `.bookingCode` / `.checkingDate` → `.newReservation`; `.direct` deep-link);
the constraint from §17 still holds — **1:1 mapping to the real components, no route
collapse**. Everything below is presentation, not new backend surface.

### 17.0.1 The rules

| Element | Real source | V2 treatment |
|---|---|---|
| Property context | `useHousing` (name, city, country) — already loaded here | a **`.s2-hero` photo canvas** (painted in CSS via layered gradients + an SVG-noise `.s2-grain`; no image asset, re-tintable per brand) carrying the "Official check-in" seal, the property name, the city, and a **`.s2-host` strip** (avatar · rating · "expecting you on 14 July"). Slim variant (`.s2-hero.slim`) on sub-screens. Desktop: a full-height `.s2-canvas` on the left with a past-guest quote + trust badges, **persistent across every screen** |
| The search surface | — | a frosted **`.s2-sheet`** (mobile) / **`.s2-card`** (desktop) lifted `-34px` into the hero, with one slow specular sweep. Reading surfaces are never behind a blur |
| Method select | `SearchOptions` = two `RadioWithBorder` + disabled **Continue** | two **`.s2-method` cards** that `data-goto` on tap (folds away the Continue gate); icon · explainer · "what you'll need" mono chip |
| Booking code | `BookingCodeView` single `Input` | **eight `.s2-cell` segments** split `HMAK · 2931`: the shape of the answer is visible before typing and a typo is locatable. `search-v2.js` auto-types on screen entry; **Paste** (`[data-s2-paste]`) fills all cells; `[data-s2-submit]` stays disabled until the last cell lands. `.s2-inline-error` markup exists for the mismatch state |
| "Where's my code?" | — (absent in code) | `m2-code-help` / `md2-code-help`: confirmation email · booking platform · escape hatch to date + email |
| Date & email | `CheckInDateView` `Datepicker` (≥ `getMinCheckInDate`) + email `Input` | unchanged two fields; the min-date rule is stated in the hint rather than only on error |
| Searching | `SearchingBookingModal` LOADING (spinner + "Searching booking...") | a **`.s2-scan`** mini property card with a sweeping scan line, above a three-row **`.s2-steps`** checklist (Reading your reference → Matching the reservation → Preparing your check-in) driven by `[data-s2-steps]` in `search-v2.js` |
| Booking found | `SearchingBookingModal` SUCCESS (text swap, then redirect) | a **`.s2-pass` boarding pass**: property strip, check-in / check-out with the night count between them, a copyable `.pf-ref` reference, lead guest + party size, a QR block. Tear notches are **masked out** of the card (`--tear`) so it reads correctly on any background; elevation moves to `.s2-pass-shell` as a `drop-shadow()` because the mask would clip a `box-shadow` |
| Not found | `ReservationNotFoundModal` (icon + text + text2 + **OK**) | four **`.s2-nf`** rows: retry → code · other method → date · **register a new stay** (only when `canCreate`) · contact the named host (`m2-contact`) |
| Create reservation | `NewReservationView` flat 6-field form; `preloadKnowsFields` silently prefills from `location.state` | two labelled **`.s2-group`s** (Your stay · Lead guest) with a green **"From your search"** tag on each prefilled field; `type_of_registration` for AT/UAE/IT documented in a `sim-note` |
| Direct link | `DirectReservationView` → `SearchingBookingModal` (or `ErrorView`) | the same scan + checklist, framed "Opened from your booking link" |
| Glass A/B | — | the shared `glass-toggle.js` switch. **Minimal** (`html.glass-lite`) solidifies the sheet/card/method/group surfaces and drops the sweep, the orbs and the bloom — **the hero photo stays**, because it is content, not chrome |

### 17.0.2 Transitions

| Screen (mobile · desktop) | data-autonext | CTA / rows |
|---|---|---|
| `s2-method`* · `sd2-method`* | — | method cards → `…-code` / `…-date` |
| `s2-code` · `sd2-code` | — | "Find my booking" → `…-searching` (disabled until 8 cells fill); ghost → `…-date`; help → `m2-code-help` / `md2-code-help` |
| `s2-date` · `sd2-date` | — | "Find my booking" → `…-searching`; ghost → `…-code` |
| `s2-searching` · `sd2-searching` | → `…-found` (2900 ms) | — (checklist runs) |
| `s2-found` · `sd2-found` | — | "Continue to check-in" → `flow-registration.html#r-hub`; `.pf-ref` copies |
| `s2-searching-nf` · `sd2-searching-nf` | → `…-notfound` (2400 ms) | — (checklist runs) |
| `s2-notfound` · `sd2-notfound` | — | retry → `…-code`; other method → `…-date`; new stay → `…-create`; contact → `m2-contact` / `md2-contact` |
| `s2-create` · `sd2-create` | — | "Create my registration" → `…-searching` |
| `s2-direct` · `sd2-direct` | → `…-found` (2900 ms) | (DirectReservationView entry) |

### 17.0.3 Screen-id registry (deep-link hashes)

Mobile: `s2-method`* · `s2-code` · `s2-date` · `s2-create` · `s2-searching` · `s2-found` ·
`s2-searching-nf` · `s2-notfound` · `s2-direct` · modals `m2-code-help`, `m2-contact`
Desktop: `sd2-method`* · `sd2-code` · `sd2-date` · `sd2-create` · `sd2-searching` ·
`sd2-found` · `sd2-searching-nf` · `sd2-notfound` · `sd2-direct` · modals `md2-code-help`,
`md2-contact`  (* = `data-start`)

### 17.0.4 `search-v2.js` — prototype-only hooks

`[data-s2-type]` (screen) auto-types its `.s2-cell[data-char]` cells, then enables
`[data-s2-submit]` · `[data-s2-paste]` fills every cell at once · `[data-s2-clear]` empties
them · `[data-s2-steps]` (screen) walks `.s2-step` rows pending → doing → done ·
`[data-s2-copy]` flips `[data-s2-copy-label]` to "Copied" for 1.6 s.
Screen activation is detected with a `MutationObserver` on `.flow-screen[class]`, so it
works with `flow.js` navigation, the scenario chips, `#hash` deep links and Restart alike
— `flow.js` needs no knowledge of it. No business logic anywhere.

---

## §17 Find booking — mobile

**Real components:** `pages/SearchReservation/SearchReservation.tsx` (method select),
`Views/BookingCodeView/BookingCodeView.tsx`, `Views/CheckInDateView/CheckInDateView.tsx`,
`Views/NewReservationView/NewReservationView.tsx`,
`Views/DirectReservationView/DirectReservationView.tsx`,
`components/SearchOptions.tsx`, `components/ViewMainInfo/ViewMainInfo.tsx`,
`components/SearchingBookingModal/SearchingBookingModal.tsx` (`StatusModal`),
`components/ReservationNotFoundModal/ReservationNotFoundModal.tsx`,
`useHousing.ts`, `useReservationNotFound.ts`, `utils.ts` (`OPTION_VALUES`,
`SEARCH_RESERVATION_FORM_NAMES`, `getMinCheckInDate`, `ALL_GROUP_TYPES_OPTIONS`)
· **Prototype:** `flow-search-mobile.html` (loads `search.css`)

The pre-check-in entry: before any reservation exists a guest must locate their booking.
Route tree (real): `searchReservation.main` (method) → `.bookingCode` / `.checkingDate`
→ `.newReservation` (property-link create); `.direct` is the deep-link auto-search.
Constraint: **1:1 mapping to the real components, incremental UX only — no route
collapse**. The method screen shows only when `reservation_search_mode === both`; a
fixed mode navigates straight to that method's view (real `useEffect` in
`SearchReservation.tsx`).

### 17.1 The rules

| Element | Real source | Treatment |
|---|---|---|
| Method select | `SearchOptions` = `RadioWithBorder` of two options (`booking_reference` / `check_in_date_and_email`) + disabled **Continue** | two **descriptive `.method-card`s** (icon · explainer · "what you'll need" chip) that **`data-goto` on tap** — folds the redundant Continue press into the choice (improvement); same two routes |
| Property context | `useHousing` (name, city, country) already loaded on this page | a **`.prop-chip`** (name · `map-pin` city · "Official") on the method screen, compact variant in sub-screen top bars (improvement — real screens only repeat the title) — a stale/wrong link is caught before typing |
| Booking code | `BookingCodeView` single `Input` "Booking reference code" (`required`) | big **uppercase mono `.input.code`** with an example + a **"Where do I find this?"** sheet (`m-code-help`: email · platform · switch to date+email) + inline "use date & email" escape |
| Date & email | `CheckInDateView` `Datepicker` (`validateCheckInDate` ≥ `getMinCheckInDate`) + email `Input` (`PATTERNS.email`) | two fields + a `.sr-why` "both must match exactly" line; Continue → searching |
| Searching | `SearchingBookingModal` `StatusModal` states LOADING → SUCCESS ("Searching booking..." / "Booking found!") | centered **`.sr-radar`** (pulse around a magnifier) for LOADING → **`.sr-check`** pop-in for SUCCESS with a booking summary + `.sr-redirect` auto-forward note |
| Not found | `ReservationNotFoundModal` (warning icon + text + text2 + **OK**) | **actionable `.sr-actions`** rows: retry (→ code) · try other method (→ date) · contact host (`m-contact`); a `sim-note` documents the `canCreate` 4th row → `NewReservationView` |
| Create reservation | `NewReservationView` flat 6-field form; `preloadKnowsFields` silently sets `check_in_date`/`default_invite_email` from `location.state` | two labelled **`.field-group`s** (Your stay: dates + guests; Lead guest: name + email) with a green **"From your search"** tag on preloaded fields; `type_of_registration` `Select` shown for AT/UAE/IT only (documented) |
| Direct link | `DirectReservationView` renders `SearchingBookingModal` immediately (or `ErrorView`) | `sr-direct` = the searching state framed "Opened from your booking link" → auto-advances to `sr-found` |

### 17.2 Transitions

| Screen | data-autonext | CTA / rows |
|---|---|---|
| `sr-method`* | — | card "Booking reference" → `sr-code`; card "Check-in date & email" → `sr-date` |
| `sr-code` | — | Confirm → `sr-searching`; ghost "Use date & email" → `sr-date`; help → `m-code-help` |
| `sr-date` | — | Continue → `sr-searching` |
| `sr-searching` | → `sr-found` (2400 ms) | — (LOADING) |
| `sr-found` | — | "Continue to check-in" → `flow-registration.html#r-hub` |
| `sr-searching-nf` | → `sr-notfound` (2200 ms) | — (LOADING) |
| `sr-notfound` | — | retry → `sr-code`; other method → `sr-date`; contact host → `m-contact` |
| `sr-create` | — | Confirm → `sr-searching` |
| `sr-direct` | → `sr-found` (2600 ms) | (DirectReservationView entry) |

### 17.3 Screen-id registry (deep-link hashes)

`sr-method`* · `sr-code` · `sr-date` · `sr-create` · `sr-searching` · `sr-found` ·
`sr-searching-nf` · `sr-notfound` · `sr-direct` · modals `m-code-help`, `m-contact`
(* = `data-start`)

---

## §18 Find booking — desktop

**Prototype:** `flow-search-desktop.html` (loads `search.css`)

Desktop mirrors §17 with one structural difference: search runs **pre-auth, before a
reservation exists**, so there is **no app shell / sidebar yet** (unlike §8/§10/§12/§14/§16).
The flow is a centered **`.sr-card`** on the branded `--gradient-page`, with a brandmark,
a language pill, and a "Secure check-in" footnote — matching the real standalone entry.

- `srd-method`: the `.prop-chip` + method cards inside `.sc-head`/`.sc-body`; cards
  `data-goto` `srd-code` / `srd-date`.
- `srd-code` / `srd-date`: `.sc-back` link instead of a top bar; help dialog `md-code-help`
  is a centered `.proto-modal` (not a bottom sheet).
- `srd-create`: wider card (520 px), the two `.field-group`s laid out **two-column**
  (`.two-col` grid) — desktop parity for `NewReservationView`.
- `srd-searching` → `srd-found` (2400 ms) → "Continue to check-in" →
  `guest-registration-desktop.html`; `srd-searching-nf` → `srd-notfound`;
  `srd-direct` → `srd-found` (2600 ms).
- Not-found = the same `.sr-actions` rows; contact dialog `md-contact`.

### 18.1 Screen-id registry (deep-link hashes)

`srd-method`* · `srd-code` · `srd-date` · `srd-create` · `srd-searching` · `srd-found` ·
`srd-searching-nf` · `srd-notfound` · `srd-direct` · modals `md-code-help`, `md-contact`
(* = `data-start`)

---

## §19 Error & recovery — mobile

**Real components:** `pages/ErrorView/ErrorView.tsx` (title/text/secondText + house SVG),
`components/ConnectionErrorsHandler/ConnectionErrorsHandler.tsx` (selects the variant),
`components/ErrorFallback/ErrorFallback.tsx` (Sentry error boundary),
`pages/SDKErrorView/SDKErrorView.tsx` (embedded)
· **Prototype:** `flow-error-mobile.html` (loads `search.css` + `err.css`)

`ErrorView` is a generic full-page error (props `title` / `text` / `secondText`, default
"Link not valid"). `ConnectionErrorsHandler` renders it for a bad/missing token or failed
auth-init, and passes a **`too_many_requests`** variant when `authError` is a rate-limit;
`DirectReservationView` renders the default when deep-link params are missing.
**Core gap:** the real view has **no actions** and one house icon for every case.
Constraint: incremental — `ErrorView` stays a title/text/secondText component; the
redesign adds a **variant** (mark + tint) and an **actions slot** the handler fills.

### 19.1 The variants

| Variant (`err-*`) | Real trigger | Mark / tint | Recovery (the missing piece) |
|---|---|---|---|
| `err-link`* | default `ErrorView` — bad token / auth-init fail / missing deep-link params | `unlink`, blue | primary **"Find my booking"** → `flow-search-mobile.html#sr-method`; **Contact your host** (`m-contact-host`); a 2-item "what to check" list (from `not_found_make_sure`) |
| `err-rate` | `too_many_requests_title` / `_description` (`authError` rate-limit) | `clock`, amber | a **countdown dial** ("try again shortly", auto-enables) + "your check-in is fine" line; **Try again** → search |
| `err-crash` | `ErrorFallback` ("Something went wrong" + `please_contact_support`) | `alert`, red | copyable **error ref** `CHK-9F3A2`; **Reload & try again**; **Contact support** (`m-support`) pre-quoting the ref |
| `err-embedded` | `SDKErrorView` (embedded, bare centered text) | `cloud-off`, blue | compact branded **embed card** with **Try again**, shown inside a mock host site (`.host-frame`); SDK still fires `onConnectionError` |

### 19.2 Transitions

| Screen | CTA / action |
|---|---|
| `err-link`* | "Find my booking" → `flow-search-mobile.html#sr-method`; "Contact your host" → `m-contact-host` |
| `err-rate` | "Try again" → `flow-search-mobile.html#sr-method` (countdown is illustrative — static `--p` on `.ec-dial`) |
| `err-crash` | "Reload & try again" → `flow-search-mobile.html#sr-method`; "Contact support" → `m-support`; ref "Copy" is a no-op affordance |
| `err-embedded` | "Try again" → `flow-search-mobile.html#sr-method` (widget reload) |

Chrome: a slim glass brand top bar (Chekin mark + language) on `err-link/rate/crash`;
`err-embedded` swaps it for the host site's own top bar. No autonext on any screen.

### 19.3 Screen-id registry (deep-link hashes)

`err-link`* · `err-rate` · `err-crash` · `err-embedded` · modals `m-contact-host`,
`m-support` (* = `data-start`)

---

## §20 Error & recovery — desktop

**Prototype:** `flow-error-desktop.html` (loads `search.css` + `err.css`)

Desktop mirrors §19 as a centered **`.sr-card`** on the branded gradient (same pre-auth
glass shell as §18 — errors happen before an app shell exists), with brandmark + language
pill + "Secure check-in" footnote.

- `erd-link` / `erd-rate` / `erd-crash`: the variant `.err-art` + copy + actions inside
  the glass card; link/crash CTAs target the **desktop** search (`flow-search-desktop.html#srd-method`);
  help dialogs `md-contact-host` / `md-support` are centered `.proto-modal`s.
- `erd-embedded`: a wider `.host-frame` (host top bar + centered 760 px body) with the
  embed card — the SDK error in a desktop host context.

### 20.1 Screen-id registry (deep-link hashes)

`erd-link`* · `erd-rate` · `erd-crash` · `erd-embedded` · modals `md-contact-host`,
`md-support` (* = `data-start`)

---

## §21 Guidebooks — mobile

**Prototype:** `flow-guidebooks-mobile.html` (loads `guide.css`)

Maps `GuidebooksListView` + `GuidebookView` (EDITOR blocks) + `GuidebookPdfView` +
`GuidebookHtmlView` + `UnavailableFeature`, and the housing nav drawer. Reservation
route `guidebooks`; detail routing is by `content_type` (see 21.2).

**Version toggle** (`guide-toggle.js`, top of the stage): **Classic** (default) is this
spec's shipped look — liquid glass on chrome only, solid reading surfaces. **Liquid
glass** flips `html.glass-max`, which (via `guide.css`) frosts the reading surfaces
(cards, search, Wi-Fi, map, place cards, jump drawer) over soft color orbs — a
decision-aid A/B that deliberately relaxes Appendix A rule 1; it changes no screen id,
hash or CTA. Persisted in localStorage (key `protoGuideGlass`), shared across §21/§22.

### 21.1 The content-type rule (THE core rule)

Every guidebook carries a `content_type` ∈ {`EDITOR`, `HTML`, `PDF`} (default `EDITOR`)
that drives **both** the list card's type badge **and** which renderer opens:

| `content_type` | List badge | Opens | Prototype screen |
|---|---|---|---|
| `EDITOR` | **Guide** | `GuidebookView` (block renderer) | `g-guide`, `g-recos` |
| `HTML` | **Web** | `GuidebookHtmlView` (sandboxed iframe) | `g-html` |
| `PDF` | **PDF** | `GuidebookPdfView` (react-pdf) | `g-pdf` |

`is_auto_translated: true` adds an **"Auto-translated"** chip on the card and a badge in
the reader. The list is disabled entirely if the UI language isn't one of the 18
supported guidebook locales (`useFetchGuidebooks` gate) — not mocked as a screen.

### 21.2 List (`g-list`, `g-search`, `g-empty`)

- `g-list` (`data-start`): `GuidebooksListView`. Header (kicker "Your stay" + title +
  intro), a **search pill** (`g-search`), a count, then `.gb-card`s. Each card = a
  `content_type`-colored **cover band** (icon + type badge) + title + description +
  **preview chips** (what's inside — Wi-Fi · Check-in · Map · "6 places"). An
  offline-reassurance strip closes the list. Tapping a card routes by 21.1.
- `g-search`: cross-guidebook search — matches are the guidebook rows whose title **or
  block text** contains the query, with `<mark class="hlq">` highlighting (the real app
  has no guidebook search today; this is the proposed addition). Clear → `g-list`.
- `g-empty`: `no_guidebooks_title/subtitle` + an exit (Ask Vela / FAQ).

### 21.3 EDITOR guide (`g-guide`)

`GuidebookView` → `GuidebookContent`. Structure:

- **Hero** (`.gb-hero`, `content_type`-colored): meta (type · updated · read-time),
  title, description, tag chips (Offline-ready · language).
- **Chapter rail** (`.gb-toc`, sticky under the top bar): one pill per `heading` block —
  the proposed in-page nav (the real long guide has none). Active pill = current section.
- **Blocks** (maps `GuidebookContent` node types): `paragraph` (level 1 lead / level 2
  secondary), `horizontalRule` → `.gb-divider`, and the surfaced treatments:
  - **Wi-Fi card** (`.gb-wifi`) — network + password on mono rows, each with one-tap
    **Copy** (proposed; today Wi-Fi is plain paragraph text).
  - **Info rows** (`.gb-rows`) — check-in/out times, keys (deep-links Virtual keys).
  - **Amenities** (`.gb-amenities`) — maps the `amenities` block / `AmenityIcon`.
  - **Map block** (`.gb-map`) — CSS-drawn static map + name + **address** + a
    **Directions sheet** `m-dir` (Open in Google / Apple Maps); maps `mapBlock` /
    `MapBlockView`, which today is a bare iframe with no address or directions.
  - **Video** (`.gb-video`) — placeholder for `videoBlock` (YouTube/Vimeo).
  - **File** (`.gb-file`) — maps `fileUpload` / `File` download card.

### 21.4 Recommendations (`g-recos`)

An EDITOR guide whose content is a **pinned map + place cards** (`.gb-place`): rank,
image, name, category · rating · walk-time, blurb, and Directions / Website actions.
Today this is free-form `imageBlock` + text + `mapBlock`; the place-card block is the
proposed structure. A filter rail (`.gb-toc`) scopes by category.

### 21.5 PDF & HTML readers (`g-pdf`, `g-html`)

- `g-pdf`: `GuidebookPdfView`. A sticky **doc toolbar** (`.gd-bar`: page count ·
  download · full screen) over lazily-rendered page sheets — proposed chrome so a PDF
  reads like a document, not a blank scroll.
- `g-html`: `GuidebookHtmlView`. `html_content` in the app shell with a **"web page ·
  auto-translated"** badge, instead of a bare `srcDoc` iframe that reads as broken.

### 21.6 Not available (`g-unavailable`)

`UnavailableFeature` — title + subtitle + reasons from `error.detail`, but each reason
becomes a **next step**: the blocking task (finish registration) deep-links straight to
it (same pattern as the virtual-keys gate §15.1). Availability opens on the arrival date.

### 21.7 Modals & Vela

- `m-jump` (right sheet): jump-to-guidebook drawer — maps the housing `GuidebooksNavigation`
  mobile drawer; lists every guidebook with its type.
- `m-dir` (bottom sheet): Directions — from any map block or place card.
- `m-vela` (right sheet): help — jump list + Ask Vela chips (Wi-Fi password / parking / paella).

### 21.8 Screen-id registry (deep-link hashes)

`g-list`* · `g-search` · `g-guide` · `g-recos` · `g-pdf` · `g-html` · `g-unavailable` ·
`g-empty` · modals `m-jump`, `m-dir`, `m-vela` (* = `data-start`)

---

## §22 Guidebooks — desktop

**Prototype:** `flow-guidebooks-desktop.html` (loads `guide.css`)

Guidebooks as the **navy-sidebar destination** (the "Your stay" → "Guidebooks" item that
already exists in the shell; here `active`). Same content-type rule as §21.1.

- `gd-list` (`data-start`): `desktop-shell with-rail` — main column = greeting + search +
  a **2-col card grid** (`.gb-grid`, same `.gb-card`s as §21.2) + offline strip; the
  **Vela rail** carries popular questions + a "Works offline" tip.
- `gd-guide`: `desk-page` back-pill + a centered **reading column** (`.gb-read`: hero +
  the same EDITOR blocks as §21.3). The **chapter index lives in the Vela rail**
  (`.gb-nav` "In this guide", anchored to the section ids) alongside jump-to-other-
  guidebooks and an Ask-Vela input — the desktop equivalent of the mobile chapter rail.
- `gd-recos`: reading column with the pinned map + a **2-col place-card grid**; the Vela
  rail carries the category filter + other guidebooks.
- `gd-pdf`: full-width `GuidebookPdfView` with the doc toolbar (back · page count ·
  download · full screen) over centered page sheets (no rail).
- `gd-unavailable`: `UnavailableFeature` centered in the content area, reasons →
  deep-linked task (desktop registration).

The navy sidebar (Villa Serena · progress 50% · Before-you-arrive / Your stay / Support
groups) is cloned into every screen from a `<template>` so the destination is identical
across states. Carries the same **Classic · Liquid glass** version toggle as §21
(`guide-toggle.js` / `html.glass-max`); in the glass version the main reading column and
its card grid frost over color orbs while the navy sidebar and Vela rail stay as-is.

### 22.1 Screen-id registry (deep-link hashes)

`gd-list`* · `gd-guide` · `gd-recos` · `gd-pdf` · `gd-unavailable` (* = `data-start`)

---

## §23 Sign in & onboarding — mobile

**Prototype:** `flow-auth-mobile.html` (loads `auth.css`)

Maps `pages/Auth`: `LoginView` (the `email → password → check_email_code` state machine,
serving create-account **and** login), `WelcomeView`, the OAuth popup (`OAuthCallback`),
the four `Onboarding` steps, and the `GuestCreationModal`. **Gated by
`isInstantCheckInEnabled`** (summary API `is_instant_check_in_enabled`, force-off in SDK):
when false none of these routes exist and the guest goes straight to Home/registration.

**Glass A/B toggle** (shared `glass-toggle.js`, top of the stage — the same Full · Minimal
switch as §17–§20): **Full** (default) is the current design — the frosted auth card over
color orbs; **Minimal** flips `html.glass-lite`, which (via `auth.css`) flattens the stage
orbs and makes the reading card a clean solid, keeping only the brand gradient. Persisted
in localStorage (key `protoGlass`), shared with Find-booking / Error. Changes no screen id,
hash or CTA.

### 23.1 The two core rules

1. **The sign-up machine is a visible, counted sequence.** The real `CREATE_ACCOUNT_STEPS`
   (`email → password → check_email_code → login`) is a hidden local state with one title;
   here each step names itself ("step 2 of 3"), the password step has a show/hide + strength
   meter, and the code step is a 6-cell OTP with a **resend countdown** (real resend has no
   cooldown). Login reuses the same shell (title `welcome_back`, email + password + forgot).
2. **Onboarding is a dynamic subset on a labelled rail.** The real steps are filtered by
   `useComputedOnboardingDetails` flags (`shouldAskReservationGroup` / `…NumberOfGuests` /
   `…ListOfParticipants` / `…LeaderGuest`) — a reservation may see 1–4 steps. The prototype
   shows all four for the story; the rail reads "Your trip · Step 1 of 4" (real bar has no
   labels). Order is fixed by `useOnboardingSteps`: reservation-type → number-of-guest →
   who-is-coming → confirm-leader-guest.

### 23.2 Auth screens

- `a-signin` (`data-start`): create-account email step. Value-prop perks (why an account),
  email field, Google (`m-oauth`), honest **"continue without an account"** (→ onboarding
  `a-type`), switch to `a-login`, terms/privacy footer.
- `a-password`: create-account password step — show/hide eye + strength bars; back to `a-signin`.
- `a-code`: `check_email_code` — 6-cell OTP + resend countdown (`0:24`) → `a-welcome`.
- `a-login`: returning login — email + password + forgot; Google; switch to `a-signin`.
- `a-welcome`: `WelcomeView` — wave art, "Welcome, María!", a next-step card, CTA → `a-type`.

### 23.3 Onboarding steps (choice cards)

- `a-type` — `ReservationTypeStep`, "How are you traveling?": choice cards **Family (F) /
  Group (G) / Tourist group (T)** (`GROUP_TYPES`; single derived when count ≤ 1). → `a-guests`.
- `a-guests` — `NumberOfGuestsStep`: **counter** cards (Adults / Children, + Pets when a
  pet-fee offer exists — age brackets are season-rule driven), a total vs. allowed. → `a-who`.
- `a-who` — `WhoIsComingStep`: avatar checkbox rows; registered guests are **locked-checked**
  (María), available participants toggle (Ana, Carlos 17); an agreement **clause** shows when
  the reservation has clauses/contracts. No selection → skip to Home; adult but no leader → `a-leader`.
- `a-leader` — `ConfirmGuestLeaderStep`, "Who's in charge?": adult radios + "none of the above"
  (hidden when `shouldShowOnlyGuests`); the chosen lead shows the gold **Crown**. Confirm →
  `createGuests()` → `m-creating`.

### 23.4 Modals & end of flow

- `m-creating`: `GuestCreationModal` — LOADING → **SUCCESS** (per-guest ticks), then the real
  flow auto-navigates to **guest registration** after 3s (not Home); prototype CTA → `flow-registration.html#r-hub`.
- `m-oauth`: Google popup mock — "Simulate success" posts back and lands on `a-welcome`
  (real `OAuthCallback` postMessages `{isLoginSuccessful, accessToken}` then `window.close()`).
- `m-logout`: `LogoutModalSheet` — "you've been logged out" → log back in.

### 23.5 Screen-id registry (deep-link hashes)

`a-signin`* · `a-password` · `a-code` · `a-login` · `a-welcome` · `a-type` · `a-guests` ·
`a-who` · `a-leader` · modals `m-creating`, `m-oauth`, `m-logout` (* = `data-start`)

---

## §24 Sign in & onboarding — desktop

**Prototype:** `flow-auth-desktop.html` (loads `auth.css`)

The same entry as a **brand-panel split** (`.auth-split`): a persistent left gradient panel
(`.auth-brandpanel`, cloned into every screen from a `<template>`) carrying the logo/property,
the "Instant check-in" hero and the three value-prop perks + terms/privacy; beside a right
`.auth-formpanel` with a language pill and the changing form. Replaces the real ~326px card
that shows identically on desktop and mobile.

- `ad-signin` (`data-start`): create-account email + Google + continue-without + switch to login.
- `ad-code`: OTP with resend countdown → `ad-welcome`.
- `ad-login`: returning login (email + password + forgot).
- `ad-welcome`: welcome moment + next-step card → `ad-type`.
- `ad-type` / `ad-guests` / `ad-who` / `ad-leader`: the four onboarding steps, each with the
  **dark-on-light** step rail (`.onb-rail.dark`, "Step N of 4") above the same choice cards /
  counters / avatar rows / lead-guest radio as §23.3. `ad-leader` Confirm → `m-creating`.

### 24.1 Screen-id registry (deep-link hashes)

`ad-signin`* · `ad-code` · `ad-login` · `ad-welcome` · `ad-type` · `ad-guests` · `ad-who` ·
`ad-leader` · modals `m-creating`, `m-oauth` (* = `data-start`)

---

## §25 Check-out — mobile

**Prototype:** `flow-checkout-mobile.html` (loads `pay.css` + `checkout.css`, `checkout-flow.js`)

The real feature is thin: `BeforeYouLeaveView` renders only a `PaymentSummaryBox`, then
`RateYourStayView` (a bare `RateForm`), then `ThanksView`. The redesign makes it **one
guided flow with a visible three-step spine** (segmented `progress-track`: *settle → rate
→ done*) and fills the gaps the app shipped copy for but never built (the `check-out.json`
keys `before_you_leave_subtitle`, `add_to_checkout`, `airport_city_transfers`,
`available_on_checkout_day` were orphaned). Mock story = Appendix B "Check-out mock story".

- `co-leave` (`data-start`, `BeforeYouLeaveView`): reassurance **before** the ask. A
  **"you're all set" checklist** (`.settled`: guests registered ✓ · stay paid ✓ · keys →
  lockbox how-to) frames the payment as a formality. The **deposit hold** is a `.hold-card`
  with a dashed `.hc-chip` (`€300.00 hold`) and is *never* summed into "to pay now" — one
  plain line: "reserved on your card … released after check-out" (Appendix A hold rule).
  **"Add before you go"** exposes `.addon` rows (late check-out `AUTO` €15.00, luggage drop
  €5.00) that toggle into a live `.ledger`; `checkout-flow.js` recomputes the total + a 6%
  service fee and **rewrites the sticky CTA**: empty cart → "Everything's settled, continue"
  (→ `co-rate`), non-empty → "Pay €X.XX" (→ `co-pay`). This is the **honest zero-balance
  path** — the app's real button-hiding logic (`shouldHideButton`) becomes explicit copy.
- `co-pay` → `co-paid`: a short processing ring (`proc-ring`, `data-autonext`) then an
  add-on **receipt** (reuses `pay.css` `.receipt`) and a "late check-out confirmed" moment.
  In production this is the same Stripe/HPP hand-off as §7 (`from: checkout`).
- `co-rate` (`RateYourStayView`): interactive `.stars` radiogroup with an **emotive verdict**
  (`data-verdict`: 😞 Very poor … 🤩 Excellent!) that also announces via `aria-live`; the
  submit stays disabled until a star is chosen, and its destination is set by score —
  **≥4 → `co-thanks`, ≤3 → `co-recovery`**. Comment stays optional; a "Skip" affordance
  exists (the real form requires only the rating).
- `co-thanks` (`ThanksView`, happy branch): confetti + `.co-ring` heart, then **public
  review** platform buttons (`.review-plat` Google / Booking.com — gated on
  `survey_minimum_nps_score` in production) and the **Mozio airport transfer** card
  (`.transfer`, gated on `mozio_status`). "Return to home".
- `co-recovery` (**new**, low-rating branch): the old ≤-NPS path was a near-blank thanks
  screen — a dead end that quietly funnelled only happy guests to public reviews. Replaced
  with an honest **service-recovery** card (`.recovery`): "we're sorry we fell short" →
  message the host / request a call back → feedback goes privately to the host, **never
  posted publicly**.
- `co-done` (`FEEDBACK_SUBMITTED`): completed/locked state — a `.co-summary` of what
  happened (balance €0.00 · late check-out added · ★★★★★ · deposit releasing) + "Nothing
  left to do".

Modals: `m-keys` (lockbox how-to), `m-fee` (service-fee explainer), `m-transfer` (Mozio
times), `m-host` (message host), `m-vela` (assistant sheet). Add-on toggles + stars are the
only bespoke JS (`checkout-flow.js`); everything else rides `flow.js` / `modals.js`.

**Glass-style toggle** (`checkout-toggle.js`, above the flow HUD, persisted in
localStorage as `protoCheckoutGlass`, shared mobile ↔ desktop): **Standard** (default —
the shipped ground rule: liquid glass on chrome only, reading surfaces solid) vs **Liquid
glass** (`html.glass-strong` — the reading surfaces frost over soft color orbs with deeper
blur + saturation, dividers lightened, deposit hold still dashed-hollow; navy sidebar and
Vela rail stay as-is). Overrides live in `checkout.css`; a `@supports not (backdrop-filter)`
fallback keeps the panes near-opaque so text never loses contrast (Appendix A). Same intent
as the Guidebooks Classic ↔ Liquid-glass toggle — a decision aid, not necessarily the
shipped default.

### 25.1 Screen-id registry (deep-link hashes)

`co-leave`* · `co-pay` · `co-paid` · `co-rate` · `co-thanks` · `co-recovery` · `co-done` ·
modals `m-keys`, `m-fee`, `m-transfer`, `m-host`, `m-vela` (* = `data-start`)

---

## §26 Check-out — desktop

**Prototype:** `flow-checkout-desktop.html` (loads `pay.css` + `payd.css` + `checkout.css`)

Check-out as the closing **"Your stay" → "Check-out"** navy-sidebar destination (`active`).
Same story, states and branch logic as §25; desktop layout conventions from §8/§10.

- `cd-leave` (`data-start`): `desktop-shell with-rail` — main = `.co-grid` (settled
  checklist + deposit hold + `.addon`s on the left, a **sticky `.ledger` with the confirm
  CTA inside it** on the right, same `data-*` hooks as §25); the **Vela rail** is
  stage-aware (check-out timeline via `.vela-progress`, "is there a fee?" + "where do the
  keys go?" `.vela-tip`s). CTA rewrites identically (`checkout-flow.js`).
- `cd-pay` → `cd-paid`: centered `payd-stage` processing ring → receipt (no rail).
- `cd-rate`: `with-rail` — centered `.card.glass` rate card (stars + verdict + optional
  note + Skip/Submit `payd-cta`); the Vela rail explains why ratings matter and that public
  reviews are always the guest's choice.
- `cd-thanks`: two-column celebration on the green `payd-celebrate` wash — confetti +
  `.co-ring`, **side-by-side** review platforms, the transfer card, "Return to home".
- `cd-recovery` / `cd-done`: the repair screen and the completed-state `.co-summary`,
  centered in the content area.

Carries the same **Standard ↔ Liquid glass** toggle as §25 (`checkout-toggle.js` /
`html.glass-strong`); in the strong version the centre content column and its cards frost
over color orbs while the navy sidebar and Vela rail stay as-is.

### 26.1 Screen-id registry (deep-link hashes)

`cd-leave`* · `cd-pay` · `cd-paid` · `cd-rate` · `cd-thanks` · `cd-recovery` · `cd-done` ·
modals `m-keys`, `m-fee`, `m-transfer`, `m-host` (* = `data-start`)

---

## §27 Chat with host — mobile

**Prototype:** `flow-chat-mobile.html` (loads `chat.css`, `chat-demo.js`, `chat-toggle.js`)

Maps `ChatView` (the state gates), `ChatInterface` (thread + composer), `MessageBubble`,
`ChatInput`, `OtpVerification` and `useChatWebSocket`. Reservation route `chat`; entry from
Home / the FAQ "message host" affordance.

**Version toggle** (`chat-toggle.js`, top of the stage): **Standard** (default) keeps liquid
glass on chrome only (header, composer) with solid bubbles for reading contrast. **Liquid
glass** flips `html.glass-max`, which (via `chat.css`) frosts the reading surfaces — host
bubbles, trip strip, day chips, starter chips and the desktop context rail — over soft color
orbs. A decision-aid A/B (relaxes Appendix A rule 1), changing no screen id / hash / CTA;
persisted in localStorage (key `protoChatGlass`), shared across §27/§28.

### 27.1 State machine (ChatView — the order the gates resolve)

`ChatView` resolves gates top-down; the prototype gives each its own screen:

| Guard (source) | Real state today | Prototype screen |
|---|---|---|
| `isChatSettingsLoading` | centered "loading" | (not mocked — instant) |
| `!isChatEnabled` (`useChatSettings`) | icon + one line | `c-unavailable` |
| `!hasLeadGuestEmail` (`default_invite_email`) | `UserX` + one line | `c-noreg` |
| `showOtp` (`useChatOtp`) | dialog over a **blurred** thread | `c-verify` (full screen) |
| otherwise | `ChatInterface` | `c-conversation` / `c-empty` |

### 27.2 Conversation (`c-conversation`, `data-start`)

- **Host identity header** (`.chat-head`) — replaces the "Talking with {property}" strip:
  host avatar with a **presence dot**, host display name + a **verified** tick, and a
  presence/response line (`Active now` / `Usually replies within an hour`). An info action
  opens `m-trip`. *(Host display name + photo + presence are a proposed profile addition;
  they fall back to `property_name` when absent — honest note in the sim-line.)*
- **Trip strip** (`.trip-strip`) — `property · dates · guests` from `reservationInfo`, so
  both sides share context without re-explaining.
- **Thread** (`.chat-thread`): a privacy `.chat-note`, **day separators** (`.chat-day`,
  Today / Yesterday — derived from `created_at`, absent today), and **grouped bubbles**
  (`.msg-group` = consecutive messages from one sender → avatar + sender name shown **once**,
  per-message time on the last). `is_outbound === false` ⇒ `.me` (right, brand gradient);
  host ⇒ `.host` (left, white card). Links auto-linkify (matches `MessageBubble`'s
  `URL_REGEX`). A **typing** bubble (`.typing`) reflects host presence over the WebSocket.

### 27.3 Empty / first message (`c-empty`)

`messages.length === 0` is **not** "No messages yet" — it's a host **greeting** bubble plus a
`.starters` block of tappable **starter questions** (Wi-Fi · How do I get in · Check in early ·
Parking). Tapping a chip fills the composer (`chat-demo.js` `data-fill`) — reduces blank-page
paralysis and routes common asks. Header presence shows the "replies within an hour" variant.

### 27.4 Verify it's you (`c-verify`)

`OtpVerification` reframed. Same 6-digit code / resend-cooldown / error semantics, but a
**full screen with rationale** (shield-check icon, who it protects, masked email, a "why am I
seeing this?" note) instead of a bare dialog floating over a blurred thread. Verify → `c-conversation`.

### 27.5 Delivery & read receipts (`c-sending`)

Proposed message-status ladder on outbound bubbles (`.msg-meta .status`): **Sending** (spinner,
optimistic) → **Sent** (✓) → **Delivered** (✓✓) → **Read** (✓✓ brand). Failed sends
(`failedMessageIds`) show **Not delivered · Retry** inline (maps `retryMessage`). Today only the
failed state exists.

### 27.6 Photos & files (`c-attach`)

Gated by `useChatAttachmentsEnabled`. Image messages render inside a `.bubble.media` and open a
**lightbox** (`m-lightbox`); documents render as a `.file-card` download row; the composer shows
**pending uploads** (`.pending-chip`) with a spinner while `usePendingFiles` uploads. Attach via
the `+` button (maps the paperclip).

### 27.7 Reconnecting (`c-offline`)

`WebsocketProvider` disconnect surfaces a `.conn-banner` ("Reconnecting…") and a composer hint;
outbound bubbles show a **Waiting to send…** state and flush on reconnect. Today the drop is silent.

### 27.8 Not available (`c-unavailable`) & Register to chat (`c-noreg`)

- `c-unavailable`: names the reason ("Chat isn't enabled for this stay") and routes to **FAQ /
  guidebook** instead of a dead icon.
- `c-noreg`: names the **lead guest** (`default_leader_full_name`) and deep-links registration
  (`flow-registration.html#r-hub`).

### 27.9 Modals

- `m-trip` (bottom sheet): booking details (property · dates · guests · host + response time).
- `m-lightbox`: full-bleed image viewer for any thread image.

### 27.10 Screen-id registry (deep-link hashes)

`c-conversation`* · `c-empty` · `c-verify` · `c-sending` · `c-attach` · `c-offline` ·
`c-unavailable` · `c-noreg` · modals `m-trip`, `m-lightbox` (* = `data-start`)

---

## §28 Chat with host — desktop

**Prototype:** `flow-chat-desktop.html` (loads `chat.css`, `chat-demo.js`, `chat-toggle.js`)

Carries the same **Standard · Liquid glass** version toggle as §27 (`chat-toggle.js` /
`html.glass-max`); in the glass version the thread orbs show through and the context-rail
cards frost while the navy sidebar stays as-is.

Chat as the **"Support" → "Chat with host"** navy-sidebar destination (`active`, with an unread
`sb-badge`). Same states/behaviour as §27; desktop layout conventions from §8/§10/§22.

- `cd-conversation` (`data-start`): `chat-desk` three-column grid — sidebar · `.cd-main`
  (host top bar + thread + composer) · a right **`.ctx-rail`** carrying the persistent shared
  context the mobile header can only summarise: a **host card** (photo · verified · response
  time), the **booking** (dates · guests · property), **Common questions** (fill the composer,
  `data-fill`) and a **Shared-in-this-chat** files gallery. The one "Talking with {property}"
  line becomes this rail.
- `cd-empty`: greeting + starter chips in the thread; the rail still answers who / when / where.
- `cd-verify`: `OtpVerification` as a centered `.cc-panel` (`no-rail`).
- `cd-unavailable`: chat-off state as a centered panel with FAQ / guidebook actions.

Sidebar is cloned from `#cd-sb-tpl` into each screen's `<aside data-sb>`.

### 28.1 Screen-id registry (deep-link hashes)

`cd-conversation`* · `cd-empty` · `cd-verify` · `cd-unavailable` · modal `m-lightbox`
(* = `data-start`)

---

## §29 Travel eSIM — mobile (**current**)

**Prototype:** `flow-esim-v2.html` (loads `esim-v2.css`, `esim-v2.js`)

Maps `pages/esim`: `ManageEsimView` (+ `EsimActionsCard`, `EsimInfoCard`), `ChoosePlanView`
(+ `ChooseForm`, `PackageCheckbox`, `TotalToPay`, `DeviceCompatibilityModal`) and
`MyEsimsView` (+ `MyEsimPlans`, `PurchasedPlan`, `InstractionCard`, `EsimHelp`).
Reservation routes `esim/manage`, `esim/choose-plan`, `esim/my`, `esim/help`.
Data: `useFetchEsimPackages`, `useFetchEsims`, `useEsimInstructions`, `useMutateEsimOrders`,
`useEsimPaymentsCreatedListener`, `useInfiniteFetchCompatibleDevices`.

**No "current" prototype exists** for this feature — §29/§30 are the first, and are
**proposals**. The shipped code stays authoritative until one is chosen.

### 29.1 Screen ids

| Screen | Maps to | Note |
|---|---|---|
| `e2-hub`* | `ManageEsimView`, `esims.length === 0` | `data-start` |
| `e2-owned` | `ManageEsimView`, `esims.length > 0` | the post-payment return |
| `e2-plans` | `ChoosePlanView` | |
| `e2-plans-loading` | `isLoadingEsimPackages` | `data-autonext="e2-plans"` @ 2200 ms |
| `e2-plans-empty` | `esimPackages.results === []` | |
| `e2-reserving` | `mutateEsimOrders` + the websocket wait | `data-autonext="e2-my"` @ 2800 ms |
| `e2-my` | `MyEsimsView`, eSIM not installed | |
| `e2-my-done` | `MyEsimsView`, eSIM connected | |
| `e2-my-empty` | `esims === []` | |
| `e2-help` | `EsimHelp` (was the `esim/help` tab) | |

Modals: `m-e2-compat` (`DeviceCompatibilityModal`) · `m-e2-qr` · `m-e2-usage`
(* = `data-start`)

### 29.2 Hub state (which `ManageEsimView` renders)

| `esims` | Un-installed among them | Hub shows |
|---|---|---|
| empty | — | hero → compatibility strip → 3 value props → "What's an eSIM?" `<details>`; CTA **See plans for {country}** |
| ≥ 1 | yes | **`.es-owned` card first** — "Your eSIM is paid for — install it now", plan named; CTA **Install my eSIM** → `esim/my`. Hero demoted to "Need more data?"; secondary **Buy another plan** |
| ≥ 1 | no | as above, `.es-owned.is-live`, CTA **View my eSIM** |

The shipped hub only toggles a second *button* on `Boolean(esims?.length)`. The proposal
makes the un-installed case the hub's subject: it is the only unfinished task the guest has.

### 29.3 Plan selection (`e2-plans`)

- **Grouping is unchanged** (`groupByDays`), the *presentation* is not: one
  `.es-dur-chip` per `package_days` value in a `role="tablist"` rail; exactly one group's
  `[data-es-panel]` is visible at a time.
- **Preselected group** = the smallest `package_days ≥ nights(reservation)`. It is labelled
  `Covers your stay`, and the panel carries `.es-stay`: "You're staying {n} nights — a
  {days}-day plan covers your arrival and departure days."
- **Packages are radios**, one per group (`name="es-plan-{i}"`). The shipped multi-select
  survives as **"Add a different plan for someone else"** (`[data-es-addplan]`), which
  clones the group. Two groups max in the prototype.
- **Quantity** (`count` in the `FormTypes` payload) lives **inside the selected card**
  (`.es-plan-extra`), min 1. The shipped counter sits in `TotalToPay` and, at 0, calls
  ``setValue(`${id}.checked`, false)`` — a remote un-check. Here the floor is 1 and
  de-selection is done by choosing another radio.
- **Badges** — decision table:

| Condition | Badge | Copy |
|---|---|---|
| lowest `package_price / GB` in the visible group | `.es-tag-value` | **Best value** |
| `package_is_unlimited` | `.es-tag-unlimited` | **No data cap** |

  These are **independent**. The shipped code renders `esim.choose_plan.best_value` when
  `package_is_unlimited` — a different claim, and usually the priciest card. Every card
  also shows a **unit price** (`€{price/GB} / GB`, or `no GB price` when unlimited) so the
  badge is auditable.
- **Specs** (`package_voice`, `package_text`) become labelled `.es-spec` chips —
  "100 min calls", "50 SMS" — not `` `${data} / ${voice}min / ${text}SMS ` `` concatenated
  into the title.
- **Summary** — one `.es-dock` (mobile) / `.es-ledger` (desktop, §30), not the shipped
  `TotalToPayForm` + `MobileTotalToPayForm` pair. Shows the plan name, device count and
  total; CTA **Continue to payment** (not "Buy now" — it navigates, it does not charge),
  disabled while nothing is selected, with `.es-reassure`: "Nothing is charged yet — you
  confirm on the payment page."

### 29.4 Reserving (`e2-reserving`)

`submitHandler` awaits `waitForPaymentsCreated(payload)` (a websocket event) behind a
spinner *inside the button*. The prototype gives the wait a screen: a ring, "Holding your
{plan}", and a three-step ticker (Plan reserved ✓ · Preparing your payment ✓ · Opening the
payment page). `role="status"` + `aria-live="polite"`. Auto-advances to `e2-my`; in the app
this hands off to Payments, which returns to `esim/my`.

### 29.5 The install ladder (`e2-my`)

Platform is a **segmented control** (`[data-es-seg]`), OS pre-detected, replacing the
`<Select>` that mixes `iOS 17.4` with `Android Option 1`. Rungs, in order:

| # | iOS | Android | Source |
|---|---|---|---|
| 1 | **Install in one tap** (`.es-rung.primary`) | **Enter the codes by hand** (primary — Android has no deep link) | `direct_apple_installation_url` |
| 2 | Enter the codes by hand | Scan from another device | `installation_manual` |
| 3 | **Scan from another device** | *(troubleshooting)* | `installation_via_qr_code` |
| 4 | *(troubleshooting)* **"Installed, but no mobile data?"** | same | `network_setup` (APN) |

Rules this encodes:

1. The **QR is never the first rung on a phone.** It cannot be scanned by the device
   displaying it. Its title says so — "Scan from another device" — and its body repeats it.
   Drawn at ≥ 105 px, with a full-screen `m-e2-qr`. (Shipped: `width={80} height={80}`, the
   default tab, captioned "Scan this QR code with your device camera".)
2. **APN is not an installation step.** `network_setup` fixes a *broken* connection; it is a
   collapsed `<details>` titled by the symptom, not step 4 of 4.
3. Rungs 2–4 are `<details>`/`<summary>` — keyboard and screen-reader support for free.
4. `installation_*.steps` (`Record<string,string>`) renders as an `<ol>` with a numbered
   rail, not `<span>{key}</span>. <span>{value}</span>` in a `<ul>`.

**Copy actions** (`[data-es-copy]`): flip the label to **Copied ✓**, raise `.es-toast`, and
announce into `[data-es-live]` (`aria-live="polite"`). Shipped `Value.tsx` calls
`copyToClipboard(value)` and shows nothing at all.

### 29.6 Install status (a state no API reports)

`Esim` carries no install flag and no usage figures. So:

| Class | Chip | Rail | Set by |
|---|---|---|---|
| `.is-pending` | ⊕ Not installed | dashed | default |
| `.is-ready` | ✓ Installed | solid blue | guest taps `[data-es-installed]` |
| `.is-live` | ▮ Connected | solid green | `is_roaming` true |

Never colour alone — icon + word + rail shape.

**Data usage is not drawn.** `m-e2-usage` points at the two places that hold the real
balance (phone settings, the Airalo app). A progress bar here would be a number nobody sent
us, and the guest would plan their week around it.

### 29.7 Compatibility (`m-e2-compat`)

Reachable from the **hub** (before any plan is chosen) and from the `e2-plans` top bar.
Order inside: **the three requirements as a checklist** (supports eSIM · not carrier-locked ·
not jailbroken/rooted) → the caveat → the searchable device list
(`useInfiniteFetchCompatibleDevices`). Shipped order is the reverse in weight: prose
requirements above a search box over an infinite list of model names, on the screen *after*
the guest committed to buying.

### 29.8 Help (`e2-help`)

The `esim/help` **tab is folded into a page** (its shipped label is the untranslated literal
`'help'`, lowercase). `esim/help` can redirect to the anchored section so existing links
survive. Each **common issue is a link to the rung that fixes it**, not a bullet that
describes the fix in bold prose. FAQ items are `<details>`, **closed by default** — the
shipped `AskedQuestion` mounts every item with `useState(true)`, so the accordion is fully
open and buys nothing. A fourth question is added ("Will I keep my normal number?").

### 29.9 Empty & loading

- `e2-plans-loading` / `e2-my` loading → **shape-matched skeletons** (`.es-skel-plan` mirrors
  `.es-plan-main`). Shipped: `isLoadingEsimPackages` only disables the CTA; `MyEsimPlans`
  renders the string `"loading..."`.
- `e2-my-empty` → "No eSIMs yet" + CTA. Shipped: `esims?.map` over `[]` leaves the
  "Purchased plans" heading above nothing.
- `e2-plans-empty` → "No eSIM plans for {country} right now" + a route out (Wi-Fi details).

---

## §30 Travel eSIM — desktop (**current**)

**Prototype:** `flow-esim-desktop-v2.html` (loads `esim-v2.css`, `esim-v2.js`)

The navy-sidebar **"Travel eSIM"** destination. Same decision logic as §29; three deltas:

1. **The dock becomes a sticky `.es-ledger`** — a row per selected package
   (`name · devices · line total`), the total, the CTA, and three notes answering what the
   guest is about to ask: nothing is charged yet · it activates on arrival · you'll install
   it on your phone. Replaces `TotalToPayForm`'s three-column grid of loose `<div>`s.
2. **The install screen leads with the QR.** A browser cannot install an eSIM, so here —
   and only here — the QR *is* rung 1, aimed at the guest's phone. Rung 2 is the codes to
   type across, rung 3 the APN troubleshooting. There is no platform segmented control:
   the codes work on both, and we cannot detect the phone from this machine.
3. **Compatibility says it cannot detect the device** (`.es-compat.unknown`) rather than
   guessing from a desktop user-agent.

`[data-es-installed]` also clears the sidebar's `[data-es-badge]` reminder.

### 30.1 Screen ids

`ed2-hub`* · `ed2-plans` · `ed2-plans-loading` (autonext → `ed2-plans` @ 2200 ms) ·
`ed2-my` · `ed2-my-done` · modals `m-e2-compat`, `m-e2-qr`, `m-e2-usage`
(* = `data-start`)

Layout note: the desktop screens **are** the app shell, so
`.browser > .desktop-shell.flow-screen.active { display: grid !important }` overrides
`flow.js`'s `display:flex`.

---

## §31 Housing guidebooks — the property link (mobile + desktop)

**Real components:** `pages/HousingGuidebooksView/*` — `HousingGuidebooksLayout.tsx`
(route `housing-guidebooks`, `<Outlet/>` under a `grid lg:grid-cols-[284px_auto]`),
`GuidebooksNavigation/GuidebooksNavigation.tsx`, `hooks/useBuildNavigationItems.tsx`,
`HousingGuidebooksView.tsx` (index), `GuidebookView.tsx` (`:id`),
`GuidebooksPageContent.tsx`, `GuidebookViewSkeleton.tsx`,
`context/GuidebooksLayoutProvider` (`contentTitle`) ·
data: `useFetchGuidebooksByHousing`, `useFetchGuidebookGroups`, `usePropertyLinkInfo`
· **Prototypes:** `flow-housing-guidebooks-mobile.html`,
`flow-housing-guidebooks-desktop.html` (both load `guide.css` + `hguide.css`)

### 31.1 What makes this surface different from §21/§22

`/guidebooks` is **reservation-scoped**: it hangs off a booking, so it may show a
booking reference, a progress ring, the bottom nav and the Vela rail.
`/housing-guidebooks` is **housing-scoped** — reached from a property link, with
`objectId` = a housing id and **no reservation at all**. Every reservation affordance
must therefore be absent, and the identity in the header is the *host's*
(`usePropertyLinkInfo` → `logo`, `title`, `onlyLogo`), not the stay's.

| Chrome | §21/§22 (reservation) | §31 (property link) |
|---|---|---|
| Header identity | property name + `CHK-…` ref | host logo + `display_name` (`onlyLogo` ⇒ logo alone) |
| Check-in progress | ring + task list | **absent** |
| Bottom nav / sidebar app items | present | **absent** — nav lists guidebooks only |
| Vela | FAB (mobile) / rail (desktop) | **absent** — no reservation to be stage-aware about (§6 rule (d) analogue) |
| Nav items | app destinations | `Home` + one row per guidebook (`useBuildNavigationItems`) |
| Footer items | Support group | Language · FAQs · Privacy policy (real `NavLinks`) |

### 31.2 Screens

Mobile ids: `hg-list`* · `hg-guide` · `hg-web` · `hg-pdf` ·
`hg-loading` (autonext → `hg-list` @ 2200 ms) · `hg-empty` ·
modals `m-nav`, `m-nav-guide`, `m-nav-empty` (the drawer, per screen), `m-lang`
(* = `data-start`)

Desktop ids: `hgd-list`* · `hgd-guide` · `hgd-web` · `hgd-pdf` ·
`hgd-loading` (autonext → `hgd-list` @ 2200 ms) · `hgd-empty`

| Screen | Real view | Notes |
|---|---|---|
| `hg-list` / `hgd-list` | `HousingGuidebooksView` | the shared `GuidebooksList` cards from §21 verbatim — same `content_type` badge (EDITOR → Guide, HTML → Web, PDF → PDF) and same `is_auto_translated` chip |
| `hg-guide` / `hgd-guide` | `GuidebookView` (housing) | mobile: header title **becomes** the guidebook title; desktop: the same string prints in the 94 px `hg-doc-head` — one source, `contentTitle` |
| `hg-web` / `hgd-web` | `GuidebookHtmlView` | **kept inside the layout** (see 31.4) |
| `hg-pdf` / `hgd-pdf` | `GuidebookPdfView` | **kept inside the layout**; doc toolbar sticks under the 64 px property header |
| `hg-loading` / `hgd-loading` | `GuidebooksListSkeleton` | the nav skeletons too — nav rows *are* the guidebooks |
| `hg-empty` / `hgd-empty` | `no_guidebooks_available` | today one centred grey line; the mock gives it a mark, a sentence and two exits |

### 31.3 Navigation rules

- Mobile header is `[home] [title] [menu]`. The **home button is the only way back**
  from a guidebook to the list — there is no `back-btn`, because the layout has no
  parent inside this surface. Tapping the title does nothing (real: `onTitleClick`
  is wired to the home icon and the sidebar title only).
- The drawer (`.proto-modal.right`, real: the `translate-x-full` panel) lists
  `Home` + every guidebook, with the current one `active`; picking one closes the
  drawer and navigates. Footer rows: **Language** (shows the current value),
  **FAQs** (→ `PATHS.faq`), **Privacy policy** (external, `guest_privacy_policy_link`).
- Desktop nav is the same list, persistent, never collapsed; `Home` is `active`
  only when there is no `:id`.

### 31.4 Design decisions that deviate from today's code

1. **PDF and Web guidebooks stay inside the shell.** `useGuidebookNavigate` maps
   `HTML → /guidebook-html/:id` and `PDF → /guidebook-pdf/:id` — routes declared
   *outside* `HousingGuidebooksLayout`. In the real app, opening the property's PDF
   guidebook therefore drops the guest out of the property nav, and its internal
   "back" targets the reservation home the guest doesn't have. The prototype renders
   both readers under the property header; the fix is to give the housing layout its
   own `:id` children for the three content types (or pass `mainPath` through the
   resolver for all of them, not just `EDITOR`).
2. **The language fallback is stated, not silent.** `useFetchGuidebookGroups` picks
   the group whose `locale` matches `i18n.language`, else `is_default`. Today the
   guest is simply shown another language with no explanation. `.hg-locale` says
   which language they're reading and whether a translation exists.
3. **The empty state points somewhere** ("Find my booking" / "Contact the host")
   instead of ending the session.
4. **No Vela.** Not an oversight: there is no reservation, so nothing a stage-aware
   rail could say. If Vela ever appears here it must answer guidebook content only.

Mock story: see Appendix B "Housing guidebooks mock story".

---

## §32 Key cards — kiosk (`/remote-keys`)

**Real components:** `components/RemoteAccess/RemoteKeys/RemoteKeys.tsx` (route
`PATHS.remoteKeys`), wrapped in `InternalRemoteAccess`;
`components/Kiosko/ProgressTaskBar`, `components/Kiosko/PrintingCardsModal`
(→ `StatusModal` LOADING/SUCCESS/ERROR), `components/Kiosko/PrintedCardsModal`
(→ `IncompletePrintedCardContent` / `CompletePrintedCardContent`),
`components/Kiosko/RegisteredGuestsInfoModal`, `components/Kiosko/ExitReservationButton`
· state: `useKioskoStore` (`cards.printed`, `cards.pending`, `printer.*`,
`connection.isConnected`), `useDispenserControls().printCard`, `useGuestGroup`
· **Prototype:** `flow-keycards-kiosko.html` (loads `keycards.css`)

### 32.1 The route is misnamed — read this before implementing

`remote-access` and `remote-keys` sound like a pair. They are not.
`remote-access` (§15/§16) is the guest's phone opening a smart lock.
**`remote-keys` is the kiosk printing a plastic card**: `printCard({room_number,
guest_name})` goes over the kiosk websocket to a dispenser bolted under the screen.
It renders only in kiosko layout (`data-layout-mode="kiosko"`), it has no mobile
form factor, and everything on it is sized for a metre of viewing distance and a
finger (`KIOSKO_BUTTON_CLASSES`, `text-kiosko-{s,m,l}`).

### 32.2 Screens

`kc-guests`* · `kc-main` · `kc-printing` (autonext → `kc-ready` @ 2600 ms) ·
`kc-ready` (autonext → `kc-cards` @ 3000 ms) · `kc-cards` ·
`kc-printing-last` (autonext → `kc-complete` @ 2600 ms) · `kc-complete` ·
`kc-error` · `kc-noroom`  (* = `data-start`)

| Screen | Real source | Decision logic |
|---|---|---|
| `kc-guests` | `RegisteredGuestsInfoModal` | opens **itself** via `useLayoutEffect` when `known_number_of_guests − added_number_of_guests > 0`; `showCloseButton` only when `registeredGuests` is truthy — so the first guest cannot dismiss it |
| `kc-main` | `RemoteKeys` | `printed`/`known_number_of_guests` drive the bar; the **print button exists only while `pending > 0`** |
| `kc-printing` | `StatusModal` LOADING | driven by `printer.isPrinting` from the websocket, not by the click |
| `kc-ready` | `StatusModal` SUCCESS | on `isPrintingSuccess`: `registerPrintedCard(reservationId)` fires, then `TimeoutFinishProcess` (3 s) opens `PrintedCardsModal` |
| `kc-cards` | `IncompletePrintedCardContent` | `pending > 0` branch; "Print new keycard" re-enters `printCard(guestCardData)`, "Maybe later" closes both modals |
| `kc-complete` | `CompletePrintedCardContent` | `pending === 0` branch; two exits (home / key cards) |
| `kc-error` | `StatusModal` ERROR | `isPrintingError`; the only action is `go_back_to_home` |
| `kc-noroom` | `print_card_unavailable` | `hasRooms = Boolean(reservation.rooms[0]?.external_name)`; button `disabled` |

### 32.3 The card stack replaces the progress bar

`ProgressTaskBar` is an abstract 12 px rail: at a metre it reads as decoration.
The mock keeps it (same `completed/total` semantics) but leads with `.k-cards` —
one `.kc` per `known_number_of_guests`: **`.done`** = a solid card with a chip,
**`.pending`** = a dashed ghost, **`.printing`** = the one in the dispenser.
The count in the header and the number of solid cards are the same fact told twice.

### 32.4 Physical honesty rules (new, kiosk-only)

1. **Point at the hardware.** Any screen that expects the guest to reach for
   something renders `.k-dispense` — an animated arrow aimed at the real slot — and
   the kiosk bezel's `.kiosk-dispenser` lights up (`.live`). The card is a physical
   object; the screen must say *where*.
2. **Failure routes to a person, not a retry.** A jammed dispenser cannot be fixed
   by tapping. `kc-error` names the front desk, its distance and the room number to
   quote. The one button is still primary blue (Appendix A rule 2).
3. **A disabled button must be explained above itself.** `kc-noroom` states the
   cause (no `external_name` on the room) *before* the guest reaches the dead
   control, and the cards render `Awaiting room` rather than `Not printed`.

### 32.5 Copy fixes carried by this section

| Key | Today | Prototype |
|---|---|---|
| `printing_keys` | "Printing keys..." | "Printing your keycard" — one card, not "keys" |
| `keycard_printed_and_remaining` | "{{printed}} keycards printed. {{remaining}} remaining" (reads "1 keycards printed") | "**1 of 3 printed** · 2 remaining for Ana and Carlos" |
| `print_card_unavailable` | "Your reservation has no room assigned. Please contact the host…" | states the cause, then who fixes it, then that check-in is already complete |
| `your_keys_are_ready` (success modal) | title only | title + the dispenser call-out; on `kc-complete` it also repeats the **room number and floor** |
| `go_to_keycards` / `go_to_home` | two outline buttons | one primary (home), one outline — Appendix A rule 4 |

Mock story: see Appendix B "Kiosk key cards mock story".

---

## §33 Property protection — the standalone DepositView

**Real components:** `pages/DepositView/DepositView.tsx` (route `PATHS.deposits`),
`components/DepositCard/DepositCard.tsx`, `DepositView/components/SecurityDepositCard/*`,
`DamageProtectionCard/*`, `ContinueWithoutProtectionButton`, `EnsureSecurityPropertyModal`,
`SecurityDepositInfoModal`, `DamageProtectionInfoModal`, `components/privacyPolicies/Waiver*`
· state: `usePropertyProtection`, `useSummary().isSecurityDepositPending`,
`useMutateReservation`
· **Prototypes:** `flow-deposit-mobile.html`, `flow-deposit-desktop.html`
(both load `pay.css` + `deposit.css`; desktop also `payd.css`)

### 33.1 Relationship to §7's `p-deposit`

They are the same decision reached from two places. `/deposit` is a **check-in task**
(entered from Home, exits into payments); `p-deposit` is an **edit** (entered from the
cart via `location.state.edit`, exits back to it). Both must render the identical
`.opt-card`; only the header, the CTA label and the back target differ.

### 33.2 The three configurations, and what each must render

`data` comes from `getPropertyProtectionsByReservation`. Each card renders only when
`activated`, so the page has three genuinely different shapes:

| Config | Condition | Prototype | Controls |
|---|---|---|---|
| **One protection** | exactly one of `security_deposit` / `waivo_damage_protection` | `dp-single` | **none** — there is nothing to choose |
| **Two protections** | `isMultipleDeposits` = both present | `dp-multi` / `dpd-multi` | radios (mutually exclusive) |
| **Optional deposit** | `security_deposit_status === optional` | `dp-optional` / `dpd-optional` | payment-type radio **+** decline |

Preselection (`preloadData`) runs only when `shouldAnyOptionBeMarked`: skipped while
loading, when an `insuranceSetup` already exists, or when multi-deposit with either
option non-mandatory. Otherwise: multi → **damage protection**; else waivo → damage
protection; else → security deposit.

### 33.3 Screens

Mobile ids: `dp-single`* · `dp-multi` · `dp-pending` · `dp-optional` · `dp-edit` ·
`dp-paid` · `dp-loading` (autonext → `dp-multi` @ 2200 ms) ·
modals `m-ensure` (auto-open), `m-info-deposit`, `m-info-damage`, `m-waiver`,
`m-decline`, `m-vela`  (* = `data-start`)

Desktop ids: `dpd-multi`* · `dpd-optional` · `dpd-edit` · `dpd-paid` ·
modals `m-info-deposit`, `m-info-damage`, `m-waiver`, `m-decline`

`dp-pending` mocks `EnsureSecurityPropertyModal`, which opens itself when
`useSummary().isSecurityDepositPending` and cannot be dismissed by escape or overlay.

### 33.4 Money rules (extend Appendix A's hold convention)

1. **Every option states what leaves the account today** (`.oc-today`): the deposit is
   `€0.00`, the protection is `€39.00`. This is the only comparison a guest can make
   without arithmetic, and today neither card makes it.
2. **The hold's real cost is named.** `€300.00 held, not charged` is only half true —
   the guest loses €300.00 of card limit for the stay. That is an amber `.ob.warn`
   bullet, not an omission.
3. **The hold is never summed into a payable total**, here or in §7.
4. **Declining is a decision, not a slip.** `m-decline` states the consequence (the
   host may still charge you; nothing is pre-agreed) and is styled primary blue, never
   destructive-red (Appendix A rule 2).
5. **Pre-auth vs retention** are different products, and **neither ever takes the
   money.** Read the shipped strings, not the flag name:
   · `is_pre_auth_active === true` → **retention**: the amount is *temporarily blocked*
   on the card, released and **auto-renewed every 7 days**, up to **30 days or 7 days
   after check-out, whichever comes first**, then released in full. The bank may send
   several renewal notices.
   · `is_pre_auth_active === false` → **pre-authorisation**: **nothing is blocked at
   all** — the card is stored and the host gains the right to **one** charge if damage
   is reported. It expires by itself 7 days after check-out.
   `m-info-deposit` swaps its whole timeline between them; never merge the two copies,
   and never describe either as "taken and refunded" — that product does not exist.

### 33.5 Defects the prototype fixes

0. **The card and its own info modal read `is_pre_auth_active` in opposite directions.**
   `SecurityDepositCard.tsx:31` computes `const DepositType = isPreAuthActive ? 'pre-auth'
   : 'retention'` — contradicting the comment on the two lines directly above it
   (*"isPreAuthActive true is Retention type, false is Pre-auth"*) **and**
   `SecurityDepositInfoModal`, which does `isPreActivated ? securityRetentionText :
   securityPreAuthText`. So for **every** property the card's title/description/features
   and the modal behind its own "How it works" button describe **opposite products** —
   one of the two is always wrong. The prototype renders one coherent variant
   (retention) and flags the inversion in a `.dp-bug` callout inside `m-info-deposit`.

1. **Checkboxes that behave like radios.** In `isMultipleDeposits`, `DepositCard`
   renders a `StyledCheckbox`, but the form holds a single `insurance_type` and
   `handleOnChange` sets `value` or `null` — ticking one silently clears the other.
   Prototype uses radios.
2. **A question with one answer.** With a single protection, `handleOnChange` returns
   early (`if (!checkbox) return`) and `DepositCard` passes `selected={checkbox && selected}`,
   so the card is inert and never looks chosen — while the page still prints
   `please_choose_an_option`. `dp-single` drops the question and states the fact.
3. **A radio group of one.** Multi-deposit properties get their payment options from
   `getPaymentMethodOptionsMultiInsure`, which returns only `pay_online` for both
   types. Render nothing rather than a one-option radio.
4. **Paid → silent redirect.** `has_insurance_been_paid` navigates straight to
   `PATHS.home`; the guest who tapped "Property protection" is bounced with no
   explanation. `dp-paid` shows a settled, locked card. (Same for the empty-`data`
   case, which also redirects.)
5. **Decline has no confirmation.** `ContinueWithoutProtectionButton` fires
   `security_deposit_marked_as_paid: false` on first tap.
6. **Edit mode says nothing about the cart.** `location.state.edit` only changes the
   subtitle and the CTA label; `dp-edit` shows what each option does to the total.

Mock story: see Appendix B "Property protection mock story".

---

## §34 Book an experience — the offer booking chain (mobile)

**Real components:** `pages/BookExperienceView/BookExperienceView.tsx`
(route `recommendations/:id/book-experience`), `pages/EnterContactEmailView/*`
(`…/confirm-email`), `pages/OfferSlugRedirectView/*` (`/:token/:slug`),
`components/upselling/AddToCartForm/*` (`PriceCounter`, `TimeBasedCounter`,
`DeliveryDateTimePicker`), `AddToCartButton`, `CreateDealCompleteModal`
· state: `useBookDeal`, `store/bookExperience`, `utils/upselling`
· **Prototype:** `flow-book-experience-mobile.html` (loads `pay.css` + `upsell.css` + `book.css`)

### 34.1 Mobile-only, by design

Both views branch on `useScreenResize(DEVICE_BREAKPOINTS.laptop)`: on a laptop they
render `<OfferView/>` and the booking happens in its sticky booking box (§14). So
**there is no desktop prototype** — the desktop story is §14, and this section covers
the mobile form, the email step and the deep link.

### 34.2 Screens

`bx-tour`* · `bx-multi` · `bx-time` · `bx-delivery` · `bx-email` · `bx-done` ·
`bx-done-request` · `bx-slug` (autonext → `bx-tour` @ 2400 ms) · `bx-slug-nf` ·
`bx-guard` (autonext → `bx-tour` @ 2600 ms)  (* = `data-start`)

| Screen | Real source | Notes |
|---|---|---|
| `bx-tour` | `AddToCartForm` + `PriceCounter` | single-price, per-person, `MANUAL` lane → dashed total + "nothing charged now" |
| `bx-multi` | `MULTIPLE_PRICE` items | **gap 16** — one counter per named `PriceItem`, each with its own `unit_type` |
| `bx-time` | `TimeBasedCounter` | radio slots; `isTimeBasedOffer` = category in `{checkIn, checkOut, checkInCheckOut}`; the standard hour is stated as the free baseline |
| `bx-delivery` | `DeliveryDateTimePicker` | **gap 15** — see 34.3 |
| `bx-email` | `EnterContactEmailView` | reached only when `getEmail()` is empty **and** `confirmation_type !== AUTO` |
| `bx-done` | `CreateDealCompleteModal` | `AUTO` lane → "Added to your cart" → My cart / keep browsing |
| `bx-done-request` | same component | `MANUAL` lane → "Request sent" → track request; **never** "My cart" |
| `bx-slug` | `OfferSlugRedirectView` | **gap 17** (deep link) — resolves `/:token/:slug` → `recommendations/:id`, preserving `location.search` |
| `bx-slug-nf` | slug error branch | `toastResponseError` + `replace` to the offer list |
| `bx-guard` | `EnterContactEmailView` guard | every quantity 0 and not yet submitted → `navigateToBookExperience({replace: true})` |

### 34.3 Delivery date & time — the real bounds

`requiresDeliveryDateTime(category)` is `true` when the feature flag
`CHE_162_DEAL_DELIVERY_DATETIME_ENABLED` is on, the offer is **not** time-based, and
the category is not in `{petFee, petFriendly, propertyProtection}`.

- Dates: `eachDayOfInterval(start, end)` where `start = max(today, checkInDate)` and
  `end = min(checkOutDate, start + 13 days)`. The strip therefore ends at check-out.
- Times: hours are expanded from `duration_availabilities` (`hours_start`→`hours_end`,
  skipping `is_all_day`); if none qualify, **no time select renders at all**.
- Choosing a new date **clears the time** and emits `null`, so the CTA re-disables.
- The CTA is blocked while `requiresDeliveryDateTime(category) && !deliveryDateTime`.

### 34.4 Time-based slots carry the time in their *name*

`buildRequestedFor` runs `parseTimeFromName(selectedItem.name)` — a regex for `HH:MM`
— and combines it with `check_in_date` / `check_out_date`. A slot named "Late
check-out (afternoon)" therefore books **no time at all**, silently. The prototype
names every slot `until HH:MM`; an implementation must either keep that contract or
move the time onto a real field.

### 34.5 Defects the prototype fixes

1. **The completion modal lies to on-request guests.** `CreateDealCompleteModal`
   receives `confirmationType` and never reads it: both lanes get
   `create_deal_complete_modal.auto_confirmation_type.message` and a **"My cart"**
   button — but an unapproved request is not in the cart. `bx-done-request` splits it.
2. **The deep-link loader is anonymous.** `OfferSlugRedirectView` renders a bare
   `ViewLoader`; the guest who tapped a shared link sees a spinner with no subject.
   `bx-slug` names the offer and the property.
3. **A dead slug dumps a raw API error.** `bx-slug-nf` names what's gone, then hands
   over the list.
4. **The empty-cart guard jumps backwards silently.** `bx-guard` says why.
5. **`AddToCartButton` ignores its `type` prop** — the label is always "Add to cart",
   even for a request the host must approve. The prototype's dock reflects the lane.

Mock story: see Appendix B "Book an experience mock story".

---

## §35 AI Travel Guide — the generated itinerary (mobile + desktop)

**Real components:** `pages/TravelGuideView/TravelGuideView.tsx` (route `PATHS.travelGuide`,
gated on `summary.upselling.active`), `TravelGuideStartPage`, `TravelGuideQuestions` +
`useTravelGuideQuestions`, `TravelGuideLoading`, `TravelGuidePlan`, and
`components/*` (`PlanHero`, `PhaseNav`, `DaySubTabs`, `DayTimeline`, `PlanEntry`,
`SlotMeta`, `CostBadge`, `WhyThisPick`, `TripGlance`, `CheckInCard`, `PreStayPanel`,
`useSlotAction`) · **API:** `AiApi` (`generateGuide` → poll `getGuideRun` → `getTravelGuide`)
· **Prototypes:** `flow-travel-guide-v2.html` (mobile), `flow-travel-guide-desktop-v2.html`
(desktop). Sidebar label is **"Travel Guide"**; the guest never sees the word "AI".

### 35.1 Screen ids (deep-link hash registry)

| Mobile | Desktop | State |
|---|---|---|
| `tg-intro`* | `tgd-intro`* | no guide exists yet (`?step` absent) |
| `tg-q` | `tgd-q` | preference questions (`?step=questions`) |
| `tg-build` | `tgd-build` | run in flight — autonext → plan after 9200 ms |
| `tg-slow` | — | run has exceeded 90 s |
| `tg-error` | `tgd-error` | `hasError` (mutation, poll, or phase `FAILED`/`CANCELLED`) |
| `tg-plan` | `tgd-plan` | `guide` present (`?step=guide`) |
| `tg-skeleton` | `tgd-skeleton` | `isGuideLoading` on return — autonext → plan after 2400 ms |
| `tg-offline` | — | cached guide, no network |
| `tg-empty` | `tgd-empty` | `guide.days.length === 0` |

`*` = `data-start`.

### 35.2 The reversibility rule (THE core rule)

**A generated plan is never final.** The shipped app force-forwards `intro → guide`
whenever a guide exists (`TravelGuideView.tsx:70`) and ships no regenerate control,
so the first answer set is permanent. The redesign requires:

1. The plan header renders `profile_assumptions` as a **"Tuned for" chip strip**.
2. A **Refine** control beside it reopens the questions with the previous answers intact.
3. Rebuilding is confirmed by a sheet that **enumerates what survives**: cart additions
   (`upsell_offer` slots already added) and anything paid. Only recommendations change.
4. Steps **push** history (never `{replace:true}`), and answers persist across them.

### 35.3 Questions — required vs optional

| id | Required | Control | Soft cap |
|---|---|---|---|
| `vacationStyle` | ✅ | checkbox group | 3 |
| `budget` | ✅ | **radio** group | — |
| `pace` | ✅ | **radio** group | — |
| `interests` | — | checkbox group | 5 |
| `placeVibe` | — | checkbox group | 4 |
| `avoid` | — | checkbox group | — |

Rules:
- The three optional questions live in a **folded `<details>`** ("Sharpen it").
- Single-select questions are `radio`, so re-activating the chosen option **cannot
  empty a required answer** (the shipped `aria-pressed` chip does).
- At the cap, unchecked options go `disabled` and the helper reads
  "That's {n} — unpick one to swap it." The shipped hook silently evicts the
  oldest pick; never do that.
- The meter has **3 solid required segments + 3 hatched optional ones**, and each
  segment maps to **its own question** — never to an answered *count*.
- The submit is **never `disabled` and never `aria-disabled`**. Pressing it
  unsatisfied adds `.is-error` to every unanswered required question, moves focus
  to the first, and announces "Still missing: {question}" on the live region.
- A dock hint counts: "{n} answers still needed" → "Ready — building takes about a minute".

### 35.4 Building & failing

- Show **elapsed time beside the real estimate** ("0:07 elapsed · usually 40–60 seconds").
  Never "a few seconds": the poll is 5.5 s × 4 phases.
- A phase not in `GENERATION_STEPS` (`START`, `AWAIT_PREFERENCES`) shows step 1 as
  *starting*, never as stalled-in-progress.
- Always offer **Cancel** and state that the run survives leaving the page.
- Past 90 s → `tg-slow`: keep waiting · build the quick version.
- Failure (`tg-error`) offers **three** exits, in this order:
  **Try again** (primary) · **Back to my answers** (outline) · **Build without preferences**
  (ghost), above a copyable run reference. Copy asserts the answers are saved — and they are.

### 35.5 The plan

- **Phases:** `pre_stay` (only when check-in is incomplete) · `arrival` · `stay` · `departure`.
  Rendered as a real `role="tablist"`: roving `tabindex`, ←/→/Home/End, `aria-controls`
  onto `role="tabpanel"`. Day-of-stay chips are a second tablist with the same contract.
  Today's phase is preselected and marked with a **dot as well as a colour**.
- **Time of day** (`morning`/`afternoon`/`evening`/`flex`) is an **`<h3>`** with an icon
  and a time range — never a `<span>`.
- **Every slot carries an action.** `web_search` slots get **Directions** + **Opening hours**
  (from `source_url`); `upsell_offer` gets **Add to stay** (+ "nothing is charged until you
  check out"); `airalo` gets **Add to stay**; `guruwalk` gets **Book on GuruWalk** plus the
  hand-off line "Books on guruwalk.com · you'll leave Chekin".
- **Cost band** = dots + word + an `.sr-only` sentence ("Cost: mid range, 2 out of 3").
  `free` is a pill with a check glyph, never green text alone.
- **Why this pick** is a disclosure (`aria-expanded` ↔ `[hidden]`) whose panel carries a
  **From row**: the guest's answer that drove the pick, and the `source_url` behind it.
- **`TripGlance` renders on mobile** as a 3-stat strip; the desktop rail carries it plus
  planned spend, the tuned-for profile, every `source_url` and **Send to my phone**.
- **"Right now" card** (mobile only): current time, the next stop, its walk time,
  Directions. Desktop replaces it with the trip rail.
- `CheckInCard` **names the guest and the blocking task** and deep-links to that task —
  never to `PATHS.home`.

### 35.6 Empty, offline, skeleton

- `tg-empty` names the answers that emptied the plan and offers to loosen one.
- `tg-offline` shows the saved plan behind a banner naming the save time; actions that
  need the network (Opening hours) are `disabled` and say so. Directions still work.
- `tg-skeleton` is shape-matched to the plan, never a spinner or a sentence.

### 35.7 `travel-guide-v2.js` — prototype-only hooks

`[data-tg-q]` (+ `data-tg-required`, `data-tg-max`, `data-tg-single`) · `[data-tg-generate]`
· `[data-tg-hint]` · `[data-tg-count]` · `[data-tg-seg]` · `[data-tg-cap]` ·
`[data-tg-build]` + `[data-tg-steps]` + `[data-tg-elapsed]` · `[data-tg-add]` ·
`[data-tg-copy]` + `[data-tg-copy-label]` · `[data-tg-toast]` + `[data-tg-toast-el]` ·
`[data-tg-scroll]` · `[data-tg-live]`. Screen activation is observed with a
`MutationObserver`, so it composes with `flow.js`; the build ladder is a fixed schedule
(`Math.random` / `Date.now` free) so two runs look identical.

---

## Appendix A — Global UI rules (apply to every flow)

1. Liquid glass only on chrome (top bars, docks, on-camera pills, Vela) — never on
   reading surfaces; keep list/cards opaque for contrast. `.card.glass` is therefore
   opaque (solid `--n-0`); chrome glass has an `@supports` solid fallback for browsers
   without `backdrop-filter`.
2. Declining/skipping is never styled destructive-red; red = errors only. Recovery
   actions ("Try again") are **primary blue** even on error screens — red never styles
   a button that moves the user forward. Exception: notification-count badges
   (`.nbadge`) may be red by platform convention.
3. Every waiting state names what's happening and what the user may do meanwhile.
4. Success states always propose the next action (decision table §1.4 is the canonical
   priority order: pay → verify ID → register next → home).
5. Status colors: green `--green-700` complete · amber `--amber-500/700` action needed ·
   red `--red-500` error; icon + label together (never color alone). Amber also marks
   awaiting-input fields (`.field.needed`); red field styling (`.field.error`) is
   reserved for post-interaction validation errors.
6. Mobile forms: single-column full-width fields; two-column pairs allowed on desktop only.
7. Screen ids in flow pages are the deep-link/hash API — `nav.js` flyouts and this spec
   must list the same ids.

## Appendix B — Copy constants (one value, quoted everywhere)

| Constant | Prototype value | Real source |
|---|---|---|
| Minors threshold | **under 18** | schema-driven `underage_allowed_age` — never hard-code two different numbers |
| Home mock progress | **2 of 4 tasks done = 50%** ring | derived from the same task list the checklist renders |
| IV step counter | stepper "Step N of 4" only | intro copy avoids totals ("A few quick steps") — count varies by document type |
| Modal mock story | Ana just registered · 2 of 3 guests done · Carlos `verification_pending` | all §1 screens + desktop mirrors quote this one story |
| Payments mock story | Booking stay €320.00 + tourist taxes €32.50 (incl. €1.50 fee) + late check-out €15.00 + breakfast basket €12.50 = **€380.00 to pay now** · €300.00 deposit **hold** · €410.00 already paid to Booking.com · Visa ···· 4242 · receipt to maria@gmail.com · pay-later variant defers the breakfast basket → €367.50 | ties to Home's "€ 380.00 paid" row and the §1 cart's late check-out + breakfast basket |
| FAQ & language mock story | Spain property with police active → minors-registration answer is the **age 14** variant; IV threshold stays **18** (two different real rules — never merge them) · IV, taxes and payments questions all visible (story enables all three) → **10 articles** · current language **English**, device language **Español** (suggested), switch lands on translated es strings from the real locale files | `Questions.tsx` conditions; `languageOptions` (18 entries, order fixed); es copy from `assets/locales/es/translation.json` |
| Upselling mock story | Story starts with **late check-out €15.00 already in the cart** (added during §1 registration) → full flow adds **breakfast basket × 1 = €12.50** (instant, `AUTO`) so the cart's extras equal the §7 lines exactly (€27.50) · **early check-in €20.00 / stay** is the `MANUAL` on-request example (sent 10:24 → waiting; declined variant: host replies "earliest hand-over 15:00", plan-B luggage drop €5.00 / bag) · featured exclusive = sunset vineyard tour €45.00 / person · airport transfer stays **€35.00 / trip** (same price as the §1 deck) · partners: Airalo eSIM "from €4.50" + GuruWalk free tours — never in the cart | `Offer.confirmation_type` drives the lane; `DEAL_STATUSES` drive §13.2; partner sources from `useUpsellItems.ts` |
| Remote-access mock story | Villa Serena · CHK-58291 · check-in **Fri 15 Aug, access from 15:00** to checkout 22 Aug 11:00 · two doors: **Street entrance** (COMMON, keypad code **4471#**) → **Apartment 3B** (PRIVATE, remote slide) · the gate blocks on the same recurring story beat — **Carlos's ID still pending** (`verification_pending`), with Booking paid (€380.00, 12 Aug) and all guests registered already ✓ · alt properties: The Palm Residence (Keyless, ref **CHK-KL-88213**), Loft Gràcia (Salto, rooms Loft 2A / Rooftop terrace / Bike storage **offline**) | `incomplete_conditions` → checklist; `valid_from`/`valid_through` → the access window; `LOCK_VENDORS` → the three card types; ties to the app-wide "Carlos verification_pending" beat (Appendix B modal story) and the §7 "€380.00 paid" |
| Auth & onboarding mock story | Villa Serena · CHK-58291 · account **maria@gmail.com** · create-account is a 3-step machine (email → password → 6-digit code, resend at **0:24**) · onboarding shows all 4 steps: trip = **Family**, guests = **2 adults + 1 child (Carlos 17)** = 3 of 6 allowed, who's coming = María (**locked-checked**, already registered) + Ana + Carlos, lead = **María** (Crown) · Confirm → 3 guests created → hands off to guest registration | ties to the app-wide "María García / Ana / Carlos 17 / party of 3" beat (Appendix B modal + taxes stories); `isInstantCheckInEnabled` gates the whole flow; `GROUP_TYPES` F/G/T |
| Guidebooks mock story | Villa Serena · CHK-58291 · **5 guidebooks**: Welcome & House Manual (`EDITOR` → Guide) · Local Recommendations (`EDITOR` → Guide, 6 places) · Getting Around Málaga (`HTML` → Web, `is_auto_translated`) · Beaches & Day Trips (`PDF`, 6 pages) · Pool & Spa Access (unavailable until check-in) · house facts reused across the app: check-in **15:00** / check-out **11:00** (ties to §7/§15 windows), keys **"code in Virtual keys"** (deep-links §15), Wi-Fi **VillaSerena_5G / serena·2024·sun**, address **Calle del Mar 14, 29601 Marbella** | `content_type` drives the badge + renderer; `is_auto_translated` → the "Auto-translated" chip; block set from `GuidebookContent` node types; check-in/out + keys reconcile with the remote-access mock story |
| Check-out mock story | Villa Serena · CHK-58291 · **check-out day, Fri 22 Aug, by 11:00** · María is leaving with everything already settled: all 3 guests registered ✓, **€380.00 stay paid** (ties to the §7 payments story), **€300.00 deposit hold** shown hollow and *never* summed into "to pay now" (SPEC hold convention) · **"add before you go"** offers = **late check-out until 14:00 €15.00** (`AUTO`, instant) + **luggage drop €5.00 / bag** — both optional, so the default payable total is **€0.00 → "Everything's settled, continue"**; adding the late check-out makes it **€15.00 + €0.90 fee = €15.90** on Visa ···· 4242 · rating **★★★★★ → thanks** (Google + Booking.com reviews, gated on `survey_minimum_nps_score`; Mozio Málaga transfer from €35.00 — same price as §13), **≤3 ★ → service recovery** (message host Elena / call back, never public reviews) | `check_out_flow_status` (`NOT_STARTED`/`PAID`/`FEEDBACK_SUBMITTED`) drives the gate; `is_survey_enabled` + `survey_external_urls` + `survey_minimum_nps_score` drive the thanks branch; `mozio_status` drives the transfer; keys/lockbox **4471#**, check-out **11:00** reconcile with the remote-access + guidebooks stories |
| Taxes mock story | High season **€3.10 per adult per night**, only the **first 5 of 7 nights** taxed (`is_max_nights_taxed`, `max_nights: 5`) · María €15.50 + Ana €15.50 + Carlos (17, **Under 18 exempt**) €0.00 = **€31.00 tax + €1.50 fee = €32.50** — exactly the cart's tourist-taxes line · exemption variant exempts Ana (Registered resident) → €17.00 · age-priced variant (no exemptions): Carlos at €1.55 half rate → €40.25 | reconciles the §7 cart's "Tourist taxes €32.50 incl. €1.50 fee"; exemption names are API data (`Season.exemptions[].exemption_name`), not locale keys |
| Housing guidebooks mock story | Property link to **Villa Serena**, published by host brand **Marbella Stays** (logo tile `MS` + `display_name`) · **no reservation**: no `CHK-…` ref, no progress ring, no bottom nav, no Vela · **4 guidebooks** — Welcome & House Manual (`EDITOR`) · Local Recommendations (`EDITOR`, 6 places) · Getting Around Málaga (`HTML`, `is_auto_translated`) · Beaches & Day Trips (`PDF`, 6 pages) — the §21 set minus "Pool & Spa Access", which is reservation-gated and cannot exist here · house facts identical to §21 (Wi-Fi **VillaSerena_5G / serena·2024·sun**, address **Calle del Mar 14, 29601 Marbella**, check-in **15:00** / check-out **11:00**) · guide exists in **en (default) + es**, UI language **English** | `usePropertyLinkInfo` (logo/title/`onlyLogo`) drives the header; `useFetchGuidebooksByHousing` drives both the list and the nav rows; `useFetchGuidebookGroups` resolves `locale === i18n.language ?? is_default` |
| Property protection mock story | Villa Serena · CHK-58291 · **security deposit €300.00** with `is_pre_auth_active` (held, expires 7 days after check-out) — the same €300.00 hold the §7 cart and the §25 check-out show, never summed into a payable total · **premium protection €39.00** one-time, `SUPPLIERS.stellar`, `protection_limit` **€1,500**, non-refundable · single-protection variant shows the deposit alone; multi variant offers both as an exclusive pair (paying it makes the §7 total **€380.00 → €419.00**); optional variant adds **pay online / pay on arrival** and the decline path · paid variant: premium protection paid **12 Aug, Visa ···· 4242** | `security_deposit` / `waivo_damage_protection` presence drives the three shapes; `is_pre_auth_active` swaps the info-modal timeline; `security_deposit_status`/`damage_protection_status` drive optional + decline; ties to the §7 payments story (€380.00 to pay, €300.00 hold) |
| Book an experience mock story | Three offers, all already priced by the §13 upselling story: **sunset vineyard tour €45.00 / person** (`MANUAL`, on request — the email step + "Request sent to Elena") · **breakfast basket** as the multi-item example (Continental **€12.50**, Vegan **€14.00**, Kids **€7.00** per basket — the §7 cart's €12.50 line is one Continental) · **late check-out** as the time-based example (until 12:00 **€15.00** — the §7/§25 line — until 14:00 €25.00, until 16:00 €35.00, standard check-out **11:00** free) · delivery window: 15–22 Aug (check-in day → check-out day), slot **08:00–09:00** · contact email **maria@gmail.com** · deep link `CHK-58291/sunset-vineyard-tour` | `confirmation_type` drives the lane and whether the email step appears; `OFFER_PRICE_TYPES.MULTIPLE_PRICE` drives the named items; `isTimeBasedOffer(category)` vs `requiresDeliveryDateTime(category)` are mutually exclusive; late check-out €15.00 and breakfast €12.50 reconcile with the §7 cart and the §25 add-ons |
| Kiosk key cards mock story | **Hotel Marbella Stays**, kiosk in the lobby · reservation with `rooms[0].external_name = **2001**`, second floor · `known_number_of_guests = **3**` (María, Ana, Carlos) · arrival state: `added_number_of_guests = **2**` ⇒ **1 pending registration** (the auto-opening reminder) and `cards.printed = **1**`, `cards.pending = **2**` · the flow prints card 2 (→ `IncompletePrintedCardContent`, "1 more") then card 3 (→ `CompletePrintedCardContent`, 3/3) · failure variants: dispenser jam (front desk **10 m to the left**, quote room **2001**) and **no room assigned** (`external_name` absent) | ties to the app-wide "María / Ana / Carlos, party of 3" beat (Appendix B modal story); `cards.printed`/`cards.pending` from `useKioskoStore`; the room number is the only thing `printCard` actually encodes |

## Appendix C — Known gaps (TODO, deliberately not mocked yet)

Found by the design-principles audit (2026-07-08); logged for a later iteration.
Resolved since: OTP wrong-code (→ `s-code-email-error`/`d-code-email-error`),
camera/webcam denied (→ `s-denied`/`d-cam-denied`), payment surface (→ §7/§8:
`dm-cart` "Review & pay" now enters the payments flow; decline, slow-confirmation,
empty-cart and deposit-chooser states included).

1. **Network offline / connection lost mid-flow** — variant of `dm-loading`/`dm-error`
   (submission interrupted ≠ server error) and on IV capture/upload screens.
2. **Session / booking-link expiry** — entry-level expired state for home / hub / IV.
3. **Rejected upload** on `s-crop`/`d-crop` (wrong type / >10 MB / unreadable file).
4. **Webcam not found / device busy** on `d-cam` (distinct from permission-denied).
5. **QR code expired + refresh** — `d-qr`/`m-qr`/`s-qr-scan` advertise "code expires in 9:41"
   but have no expired state or "generate new code" action.
6. ~~Payment failure hand-off~~ — **resolved**: §7/§8 payments flows added; `dm-cart`
   "Review & pay" links into them, decline + retry designed (`p-error`/`pd-error`).
7. **Concurrent guest edit/delete while the §1 modal is open** (hub kebab vs live modal).
8. **OTP resend cooldown / attempt lockout** — resend is a static link in the prototype;
   no cooldown timer or max-attempts state.
9. **Addon / Global Payments HPP provider** (`AddonPaymentForm`) — §7 mocks the Stripe
   provider only; the HPP iframe variant (pay triggered straight from the cart) isn't
   designed.
10. ~~Taxes exemption screens~~ — **resolved**: §9/§10 taxes flows added; the carts'
    "Add exemptions" links into the edit-from-payments mode (`t-edit`/`td-edit`), the
    exemption picker, new-guest exemption, age-priced and paid/locked states are
    designed. Still open from that flow: **SettingsModalPayment** (the "there are
    missing setups" variant shown instead of SuccessModal when the deposit is also
    unconfigured) and the **EditGuestsModal** (guest-count editor) aren't mocked.
11. ~~Checkout mini-cart~~ — **resolved**: the full check-out flow is mocked
    (`flow-checkout-{mobile,desktop}.html`, §25/§26) — `BeforeYouLeaveView` becomes a
    settled-checklist + "add before you go" surface with a hollow deposit hold and an
    honest €0.00 path, `RateYourStayView` gains an emotive star read-out, and
    `ThanksView` branches to public reviews + Mozio transfer (≥4) or a new
    **service-recovery** screen (≤3). Still deferred: the real HPP/`AddonPaymentForm`
    provider hand-off for the add-on payment (shared with gap 9), and the
    `survey_minimum_nps_score` / `survey_external_urls` admin config (mocked as Google +
    Booking.com).
12. **Other language-modal trigger surfaces** — §11/§12 mock the FAQ-page and sidebar
    entries only. Not mocked: the mobile **PageSideBar drawer** (the real hamburger
    menu that hosts Language/FAQs/Privacy on mobile), the **WelcomeLayout /
    universal-link footers**, the **kiosko LanguageButton** (flag + label variant) and
    the floating **LanguageSDKSwitcher** (SDK limited mode).
13. **Language search-in-action & no-languages-found** — the language panel's search
    field is static in the prototype; the filtered state and `no_languages_found`
    empty state aren't mocked.
14. **eSIM help section** (`pages/esim/MyEsimsView/EsimHelp/*`) — a separate
    feature-local FAQ; out of scope for §11.
15. ~~Upselling date/time picking~~ — **resolved**: §34 mocks `DeliveryDateTimePicker`
    (`bx-delivery`, with the real day-strip bounds) and `TimeBasedCounter`
    (`bx-time`), including the "a slot's *name* carries its time" contract (§34.4).
16. ~~Multi-item offers~~ — **resolved**: §34 `bx-multi` mocks
    `OFFER_PRICE_TYPES.MULTIPLE_PRICE` — one counter per named `PriceItem`.
17. **Upselling deep-link entry** — the `/:token/:slug` → `OfferSlugRedirectView`
    half is **resolved** (§34 `bx-slug` / `bx-slug-nf`). Still open: the
    **third-party redirect offer** template (`redirect_url` +
    `redirect_3d_party_enabled` on a *native* offer) — the partner hand-off dialog
    covers partner-source banners only.
18. **Approval push/websocket moment** — the status flip from "waiting" to
    "approved" (email + live toast while the guest is in the app) isn't mocked;
    `u-track` shows the before state and the §7 cart the after state.
19. **The rest of kiosko mode** — §32 mocks the key-card screen only. Still unmocked:
    `components/Kiosko/WelcomeScreen` (the `welcome-screen` route + `WelcomeLayout`),
    `pages/KioskoScanDocumentView` (the hardware document reader, distinct from the
    §3 camera capture), `ExpireSessionCloseModal` (the inactivity countdown), the
    kiosko `LanguageButton` (flag + label variant, shared with gap 12) and
    `ExitReservationButton`'s confirm step.
20. **Housing-guidebook search** — §31's list has no search field. §21's `gb-search`
    is reservation-scoped copy ("Search all guidebooks"); whether a 4-item property
    list needs one at all is unresolved.
21. **`onlyLogo` branding variant** — §31 draws the `logo + title` header only. The
    real `usePropertyLinkInfo` also returns `onlyLogo` (from
    `template.navigation_title_type`), where the housing name must be suppressed
    everywhere — including the mobile header title, which then falls back to
    `contentTitle` alone.
22. **Deposit retention variant** — §33 mocks the **pre-auth** deposit
    (`is_pre_auth_active`). The *retention* product (money taken up front, refunded
    after check-out) only gets a copy note; it deserves its own screen, because the
    "€0.00 today" claim that anchors §33.4 is **false** for it.
23. **Optional member of a multi-deposit pair** (`isMultipleDeposits &&
    isSecurityDepositOptional`) — the payment-type radio collapses to a single
    `pay_online` option and "Continue without protection" appears beside two
    mandatory-looking cards. Whether that combination should exist at all is a
    product question, not a design one; §33 mocks the two clean cases.
24. **Third-party redirect offers** — see gap 17; a *native* offer carrying
    `redirect_url` + `redirect_3d_party_enabled` hands the guest to an external
    booking site mid-flow, and §34's booking chain has no screen for the hand-off.
