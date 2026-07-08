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
> | `home.html`, `home-desktop.html`, `home.css` | §5 Home & check-in list |
> | `vela.html`, vela blocks in other pages | §6 Vela helper |
> | `flow-payments-mobile.html`, `pay.css` | §7 Payments — mobile |
> | `flow-payments-desktop.html`, `payd.css` (+`pay.css`) | §8 Payments — desktop |
>
> **Last synced:** 2026-07-08 · all sections match deployed prototypes at
> https://vlad-svr.github.io/guestapp-redesign-prototypes/ · duplicate static galleries
> (`iv-flow.html`, `iv-flow-desktop.html`, `guest-registration.html`) removed — the
> interactive flows are now the single source per feature. Payments flows added
> (§7/§8) — `dm-cart` "Review & pay" now links into them (Appendix C gap 6 resolved).

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

- Tabs "My cart {n}" / "Order history" map to the `Tabs` routes (index / `order-history`).
- Item rows mirror `useBuildDisplayedPayments`: icon + name + human meta; tourist taxes
  carry "+ Add exemptions" (→ taxes page); deposit hold carries "Edit protection"
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
10. **Taxes exemption screens** (`TaxesTouristView` / `TaxesExemptionView`) — the cart's
    "Add exemptions" affordance exists, but the exemption picker itself isn't mocked.
11. **Checkout mini-cart** (`checkout/before-you-leave` → survey → thanks) — reuses the
    payment form with `from: checkout`; its summary/survey/thanks screens aren't mocked.
