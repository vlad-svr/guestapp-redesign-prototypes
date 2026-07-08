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
> | `flow-registration.html`, `guest-registration-desktop.html`, `reg.css` | §2 Guest registration |
> | `flow-iv-mobile.html`, `iv.css` | §3 Identity verification — mobile |
> | `flow-iv-desktop.html`, `ivd.css` | §4 Identity verification — desktop |
> | `home.html`, `home-desktop.html`, `home.css` (+`upsell.css` for the reco/partner banners) | §5 Home & check-in list |
> | `vela.html`, vela blocks in other pages | §6 Vela helper |
> | `flow-payments-mobile.html`, `pay.css` | §7 Payments — mobile |
> | `flow-payments-desktop.html`, `payd.css` (+`pay.css`) | §8 Payments — desktop |
> | `flow-taxes-mobile.html`, `tax.css` (+`pay.css`) | §9 Tourist taxes — mobile |
> | `flow-taxes-desktop.html`, `tax.css` (+`pay.css`, `payd.css`) | §10 Tourist taxes — desktop |
> | `flow-faq-mobile.html`, `faq.css` (+`pay.css`) | §11 FAQ & language — mobile |
> | `flow-faq-desktop.html`, `faq.css` (+`pay.css`) | §12 FAQ & language — desktop |
> | `flow-upselling-mobile.html`, `upsell.css` (+`pay.css`) | §13 Upselling — mobile |
> | `flow-upselling-desktop.html`, `upsell.css` (+`pay.css`, `payd.css`) | §14 Upselling — desktop |
>
> **Last synced:** 2026-07-08 · all sections match deployed prototypes at
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
> on Home.

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

1. **Signature** group (pen icon) — hand-drawn canvas (`SignatureCanvas`); mobile opens a
   sheet (`SignatureModal`), desktop draws inline; "clear signature" resets. Hidden when
   `reservation.auto_signature` is on (guest just clicks Submit); when the schema has no
   `signature` field at all, submit sends `fakeSignature`.
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

## §5 Home & check-in list

**Prototypes:** `home.html`, `home-desktop.html`

Task list = one row per remaining step (guest registration, IV, payments, taxes…),
"next up" spotlight, progress ring, glass top bar + bottom dock (mobile) / navy sidebar
with per-task badges (desktop). All-done state celebrates and surfaces booking info.
Row targets mirror §1.4 rows 2–4 targets.

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
| Taxes mock story | High season **€3.10 per adult per night**, only the **first 5 of 7 nights** taxed (`is_max_nights_taxed`, `max_nights: 5`) · María €15.50 + Ana €15.50 + Carlos (17, **Under 18 exempt**) €0.00 = **€31.00 tax + €1.50 fee = €32.50** — exactly the cart's tourist-taxes line · exemption variant exempts Ana (Registered resident) → €17.00 · age-priced variant (no exemptions): Carlos at €1.55 half rate → €40.25 | reconciles the §7 cart's "Tourist taxes €32.50 incl. €1.50 fee"; exemption names are API data (`Season.exemptions[].exemption_name`), not locale keys |

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
11. **Checkout mini-cart** (`checkout/before-you-leave` → survey → thanks) — reuses the
    payment form with `from: checkout`; its summary/survey/thanks screens aren't mocked.
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
15. **Upselling date/time picking** — §13 shows delivery windows and arrival-day
    times as fixed facts; the real `DeliveryDateTimePicker` (calendar + slot
    dropdown for delivery/time-based categories) and `TimeBasedCounter` slot
    selection aren't mocked.
16. **Multi-item offers** (`OFFER_PRICE_TYPES.MULTIPLE_PRICE` — named `PriceItem`s
    with per-day/per-slot prices) — §13 mocks single-price offers only.
17. **Upselling deep-link entry** (`/:token/:slug` → `OfferSlugRedirectView`) and
    the **third-party redirect offer** template (`redirect_url` +
    `redirect_3d_party_enabled` on a *native* offer) — the partner hand-off dialog
    covers partner-source banners only.
18. **Approval push/websocket moment** — the status flip from "waiting" to
    "approved" (email + live toast while the guest is in the app) isn't mocked;
    `u-track` shows the before state and the §7 cart the after state.
