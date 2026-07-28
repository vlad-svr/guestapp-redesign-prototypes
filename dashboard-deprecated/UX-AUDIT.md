# Chekin Dashboard — UX Audit & Redesign

An interactive prototype of a redesigned Dashboard experience lives in this folder.
Open `index.html` in a browser (or serve the folder statically: `python3 -m http.server --directory prototype 4173`). No build step, no app dependencies — plain HTML/CSS/JS with realistic mock data.

**Pages:** `index.html` (Home), `reservations.html` (Bookings list), `reservation-detail.html` (Booking workspace + ID verification review), `properties.html`, `property-detail.html`, `documents.html`, `account.html` (Settings), `billing.html` (Plan & billing).

**Design variants:** the floating palette button (bottom-right) switches between 7 explorable designs — *Chekin* (default, navy + modern polish), *Minimal light*, *Dark*, *Playful*, *Boutique warm* (built on the Airbnb token family), *Aurora glass* (frosted translucent), and *Slate utility* (the token true-gray Inbox family). All variants re-point the same token slots in `css/themes.css`; components are untouched, demonstrating that the semantic-token layer makes full re-theming a CSS-only exercise. The choice persists across pages via `localStorage`.

The audit below is grounded in a full review of the current implementation: routing (`apps/dashboard/src/apps/getAuthenticatedRoutes.tsx`), layout (`PageLayout`, `AppSidebar`), the bookings/properties/account/billing/documents domains, and the design system (`@chekinapp/ui` + `@chekinapp/tokens` vs the legacy `styled-components` layer).

---

## 1. Key issues found

### Information architecture & navigation
- **No global search.** Finding a booking means going to Bookings and using per-column search *modals* (`SearchHousingsModal`, `SearchGuestLeaderModal`, `SearchDateModal`, `SearchExternalIdModal`) — four different modals to filter one table.
- **No top bar; everything is squeezed into the sidebar** (user menu, support, tutorials, referral banner, account switch). Meanwhile a full-width `TrialHeader` banner permanently consumes vertical space and shifts the whole layout via a CSS variable.
- **The Home page is feature-flagged off for most users** (`IT_4610_LANDING_ENABLED`); `/` redirects to `/bookings`, so the product has no "what needs my attention today" surface.
- **~20 near-duplicate Documents pages** (Alloggiati, Mossos, AVS, Feratel ×4, UbyPort, Sinfonia ×2, Puglia ×2, ESTI, VAU, Graz…), each a route + page file + tab in `DocumentsHeader` — three hand-maintained parallel lists of the same enum.
- **Terminology drift:** URLs and UI say "bookings", code says "reservations"; "Deposits" vs "Property protection"; "Certified invoices" vs "e-invoices" (label vs slug). One report's back-link even points to `/booking` (singular) — a live routing bug.

### Workflows
- **Reservations list has no bulk actions** — no multi-select, no bulk resend/retry/export, despite being the primary operational surface.
- **Filters are stored in sessionStorage, not the URL** — views can't be bookmarked or shared, and the "Filters (n)" counter ignores the search filters, so it can read 0 while filters are active.
- **Property edit has ~17 sections in 5 groups with three coexisting save models**: a global floating save button with a `buildPayload` switch on URL slug, sections with their own local save buttons, and ref-imperative submits for Legal subsections — plus two different unsaved-changes guards. Users get a different save affordance depending on the section.
- **The add-property flow renders the full 17-section sidebar but force-redirects everything to "Property info"** — advertised sections silently unreachable until after creation.
- **Incomplete/broken properties are surfaced weakly**: a small warning icon per row and one generic banner, with no "what's missing, fix it" path — while a failed police credential blocks compliance submissions.
- **Identity verification review is display-only**: no approve/reject action exists; missing photos silently fall back to external `placehold.co` images.
- **Subscription/billing is three parallel systems** (V1 four-page wizard passing state via `location.state` — lost on refresh; V2 modal flow; in-account `BillingSectionsV2`), plus legacy/redesign variants of Payments and Billing.
- **Mobile portrait is blocked entirely** by a non-dismissible `RotateScreenModal` ("rotate your device") on tablet-and-smaller portrait — the dashboard is unusable on phones.

### Design-system & consistency debt (evidence from the codebase)
- **763 hardcoded hex values across 208 component files.** Two near-identical brand blues coexist (`#385cf8` ×74 vs the token `#385bf8` ×8), three different "error reds" (`#df0044`, `#ff2467`, `#ff3d78`), and non-token greens.
- **Three parallel gray families** (lavender-neutral, true-gray, Airbnb warm) plus a fully separate legacy palette in `styled/theme.ts` / `styled/variables.ts`.
- **Three font families in play** (tokens say Montserrat, dashboard overrides to ProximaNova, Poppins self-hosted).
- **Mid-migration styling**: 804 files import `@chekinapp/ui`, 244 still import `styled-components` (1,302 `styled()` sites), 50 CSS-modules — often all three in one component (`ReservationsTable/Table.tsx`).
- **Spinners outnumber skeletons ~121 : 16** — most loading states are layout-shifting spinners rather than skeletons.
- Broken details: Tailwind arbitrary value with spaces in `calc()` (never compiles) in `PrivateLayout`, malformed CSS var fallback in the sidebar, `.menuButton.menuButton.menuButton` specificity hacks.

### Accessibility
- Status often encoded by **color-only icon tiles** in the reservations table; the meaning lives in a separate "status legend" modal.
- Sidebar count badges have **no screen-reader text**; charts rely on color; focus states inconsistent across the legacy/modern component mix.
- Dozens of bespoke per-feature modals with varying focus/keyboard behavior (123 files import kit modals, plus an imperative `useErrorModal`/`openModals` context layer on top).

---

## 2. Design decisions

1. **One shell: sidebar for navigation, top bar for tools.** The sidebar carries only destinations, grouped by intent (*Workspace / Grow / Manage*). Global search, notifications, help and the trial state move to a slim sticky top bar. The full-width `TrialHeader` banner becomes a compact **trial pill** with an Upgrade action — always visible, never layout-shifting.
2. **Home = "what needs me now", not analytics.** The landing page leads with arrivals/departures, a **Needs attention** queue (each item carries its one-click fix: *Fix credentials*, *Resend link*, *Request payment*), and a check-in funnel for the week. Metrics support the queue instead of replacing it.
3. **Status as a journey, not a legend.** A reservation's per-feature statuses render as a **5-step check-in pipeline** (link sent → guests registered → ID verified → police → payment), each step an icon + accessible label + tooltip — no separate legend modal needed. The same vocabulary (`pending / in progress / complete / error / excluded`) is used everywhere.
4. **Preview before commit.** Clicking a booking opens a **side drawer** with progress, guests, and quick actions, preserving list context; "Open full booking" leads to the full workspace. Deep work happens on a dedicated page, triage happens in place.
5. **Saved views instead of filter modals.** *All / Arriving today / Needs action / Errors* segmented views + inline search + filter chips. Filters live in the URL (bookmarkable, shareable) — the prototype notes this contract explicitly.
6. **One save model.** In the property workspace, every setting change raises a single bottom **save bar** ("You have unsaved changes — Discard / Save"), with section anchors + scroll-spy nav replacing the 17-item routed sidebar. Section headers show per-feature state (On / Off / Complete / Connection failed) as text badges.
7. **Errors are actionable at the point of impact.** The failed Alloggiati credential surfaces as a banner on the property list, a red dot in the section nav, a callout inside the section with a *Test connection* affordance, and a Home queue item — all leading to the same fix, never a dead-end toast.
8. **Documents: authority becomes a filter, not a page.** One hub with type segments (Registry / Guest books / Contracts / Invoices) and Property / Authority / Date chips replaces ~20 routed pages.
9. **Billing: one page, one modal.** Plan card, payment method, billing details, usage meters and invoices on a single page; plan selection is a modal with three transparent tiles — replacing the multi-page wizard whose state dies on refresh.
10. **Verification review gains a decision.** Side-by-side document/selfie compare, named checks (face match, liveness, document integrity) with explicit *Passed* labels, document data, and **Confirm / Reject & ask to retry** actions.
11. **Modern techniques only where they earn their keep:** backdrop blur on the top bar and overlays (context retention), 180–280 ms ease-out motion for drawers/modals, skeleton shimmer for loading, subtle elevation for hierarchy. No decorative glassmorphism; `prefers-reduced-motion` collapses all motion.

## 3. UX improvements (by flow)

- **Triage:** Home aggregates errors/warnings across domains into one queue with inline actions; the sidebar badge for Bookings matches it.
- **Find anything:** ⌘K command palette — quick actions (*New booking, Copy check-in link, Export report*) plus jump-to for pages and guests; the top-bar search opens it.
- **Bookings list:** saved views with counts; row-level issue lines in plain language ("3 of 4 guests not registered"); bulk bar (resend links / export / retry police) appears on selection; infinite modal-search replaced by inline search. A KPI strip (Arrivals next 7 days / Awaiting check-in / Need action / Ready to arrive) sits above the table and the cards **are** filters — clicking one applies it, clicking again clears it, and Home's stat tiles deep-link to the same views (`#awaiting`, `#error`…). Rows carry a relative-time tag ("Arrives today", "Tomorrow", "In 4 days"), a registration progress bar (2/4), and a channel pill (Booking.com / Airbnb / Vrbo / Direct / Expedia); the table paginates ("Showing 1–10 of 28") over a larger data set.
- **New booking:** a 4-field modal (property, dates, lead guest, guests) that creates immediately and defers everything else — versus the full-page form that demands payment/tax context upfront. Undo in the confirmation toast.
- **Booking workspace:** timeline tells the story (link opened 5×, last visit yesterday) so hosts know *whether to nag or wait*; per-guest rows show individual registration state with per-guest "Remind"; messaging and activity sit beside the journey.
- **Properties:** a table (like today's `HousingsTable`, but with plain-language issue lines, integration tags, bookings/30d and setup meters with "Finish" CTAs instead of ten cryptic status-icon columns). Working filters (All / Active / Needs setup) with computed counts and live search. A broken integration is a red badge + banner + issue line, not a dimmed row. Each row has a working actions menu (Open / Copy check-in link / Duplicate / Deactivate…) that adapts to status — drafts get *Delete draft…*, inactive properties get *Reactivate*. Duplicate really inserts a draft copy, deactivation goes through a consequence-stating dialog and actually flips the row's status, and both offer Undo in the toast; filter counts recompute live.
- **Property setup:** deferred sections are honest ("Turn on to configure…"), value-framed toggles ("hosts earn €18/booking on average"), and a persistent setup meter replaces silent redirects.
- **Workspace settings:** the same separated-view pattern as the property workspace — each section is its own view behind grouped navigation (*Account:* Profile & workspace, Security, Notifications · *Workspace:* Team, Check-in defaults, Payments, Branding & messages · *Connections:* Integrations, Embedded SDKs · Danger zone apart), with hash deep-links and Previous/Next paging. Sections that are dead toast-stubs today are real screens: session management + 2FA, notification preferences with a recommended-alerts default, new-property check-in defaults, payout/currency/deposit defaults, branding + message templates, and connected apps with API key/webhook management. **Embedded SDKs** carries over today's `EmbeddedSectionOnlineCheckin`: domain-scoped API keys (name, Guest app / Hosts dashboard type, allowed domains, all-properties scope) with a plan limit ("2 of 3 keys"), plus what the current screen lacks — visible domain/scope tags per key, copy-key and copy-snippet actions, and an inline quick-start snippet instead of only an external docs link.
- **Deactivation & deletion:** consequences stated in the dialog (what stops, what's legally retained, that it's reversible) instead of a generic confirm; destructive toasts offer Undo. Danger zone adds a "export all data first" path.

## 4. Accessibility improvements

- **Never color-only:** every status badge pairs a dot with a text label; pipeline steps have `aria-label`s ("Police registration: Failed") and keyboard-focusable tooltips.
- **Keyboard-first:** skip-to-content link; table rows focusable and Enter-activated; Escape closes every layer; focus returns to the trigger when drawers/modals close; visible `:focus-visible` rings on the brand color.
- **Semantics:** landmark structure (`nav`/`main`/`section` + labelled headings), `aria-current` for navigation, `aria-expanded`/`aria-haspopup` on disclosure triggers, `role="dialog"`+`aria-modal` overlays, toast region as `role="status"` `aria-live="polite"`, count badges carry sr-text ("3 bookings need attention").
- **Contrast:** status text always uses the token *text* pairings (`success-text #059669`, `warning-text #ce8b0b`, danger `#df0044`) on their matching surfaces — never the raw `#35e5bc` / `#ffb700` hues, which fail contrast as text and are reserved for dots/surfaces.
- **Motion & zoom:** `prefers-reduced-motion` disables all animation; layouts are fluid down to 375 px — mobile gets an off-canvas nav instead of the "rotate your device" dead-end.
- **Forms:** every input labelled (no placeholder-as-label), inline error messages tied via `aria-describedby`, required marks not color-only.

## 5. New / updated reusable components

Defined once in `css/components.css` + `js/app.js`/`js/shell.js` and reused across all eight pages — the intended seed of the next `@chekinapp/ui` iteration:

| Component | Replaces / upgrades |
|---|---|
| **App shell** (sidebar + topbar + trial pill) | `AppSidebar` + `TrialHeader` banner + scattered sidebar footer groups |
| **Command palette (⌘K)** | four per-column search modals; adds global quick actions |
| **StatusBadge** (dot + label) | color-only feature icons + status legend modal |
| **PipelineSteps** | `ReservationFeaturesStatuses` icon row |
| **Preview Drawer** | full-page navigation for triage |
| **Bulk action bar** | (missing entirely today) |
| **Segmented saved views** | `CheckboxDropdownMultiGroup` filter dropdown |
| **Filter chips** | mixed dropdown/modal filters |
| **Timeline** | status tiles in `ReservationStatusSection` |
| **Save bar** (single dirty-state model) | 3 coexisting save mechanisms + 2 unsaved-changes guards |
| **Section nav with scroll-spy + state dots** | 17-item routed `HousingSidebar` |
| **Callout** (info/warning/danger with action) | assorted alert/banner implementations |
| **Toast with Undo** | confirm-modal-heavy destructive flows |
| **Empty state, Skeleton, Progress, Stat tile, KV list, Avatar set, Switch, Checkbox, Menu, Modal** | unify the kit/legacy variants on one spec |

All styling flows from `css/tokens.css`, which mirrors today's `@chekinapp/tokens` values verbatim — ProximaNova-first type, white canvas (`--background-main`), navy `#161643` sidebar (as the current `AppSidebar`), brand `#385bf8` with the token `blue-300` hover, the 4/6/8px radii scale, `#ececf8` table heads, the `input-empty` gray-filled field pattern, and the token status pairings (`success-surface`/`success-text` etc.). Only genuinely missing slots are added on top (elevation, motion durations, layout vars) — one source of truth where the app currently has four (tokens, `styled/theme.ts`, `styled/variables.ts`, inline hexes). A restrained modern layer sits on these same values: a near-white canvas so white cards float, soft ink-tinted layered shadows, a frosted sticky topbar, the brand gradient (from `styled/theme.ts`) on the logo chip and active nav item, 8–12px surface radii, and hover-lift micro-interactions — all disabled under `prefers-reduced-motion` where applicable.

---

## 6. What changed and why

| Change | Why |
|---|---|
| **Home is an action queue, not a redirect to a table** | The current `/` redirect (flag off) drops hosts into a 7-column table with no prioritization. Ops work is exception-driven — surface the exceptions with their fixes attached. |
| **Trial banner → trial pill in a real top bar** | The fixed `TrialHeader` permanently steals vertical space and pushes the layout via CSS-var hacks; a pill keeps the upsell always visible without taxing every screen. |
| **Global ⌘K search** | There is no cross-domain search today; per-column search modals make even known-item lookup a 3-click task. |
| **Status icons → labelled pipeline** | The current icon rows need a separate legend modal to decode and are color-only (inaccessible). A labelled pipeline makes state self-evident and screen-reader-safe. |
| **Booking drawer before full page** | Row-click today commits you to a full page navigation for every glance; the drawer keeps triage context and cuts back-and-forth. |
| **Saved views + URL filters** | sessionStorage filters aren't shareable, silently persist across visits, and the active-filter counter lies. Views-with-counts also communicate workload at a glance. |
| **Real ProximaNova + heavier table craft** (second pass on chekin-dashboard-preview) | The prototype declared ProximaNova but never loaded it, so every screen silently rendered in the Montserrat fallback — the real `.woff2` faces (300–700) now ship in `prototype/fonts` with `@font-face`, matching what the app serves. Alongside it: table cells at 14 px on 68 px rows with 44 px uppercase headers and a brand accent bar on hover/focus, sidebar navigation at 15 px, and a taller 38 px search field with a brand focus ring — the density the old 13 px-everything table lacked. |
| **Filters button, More-actions menu, Property column** | Bookings had two decorative chips that only fired toasts and no bulk-level actions at all. Filters is now a real popover (property × channel, multi-select) that produces removable chips and a count badge, wired into the same filter chain as views and search; a ⋯ menu holds the list-level actions (resend all pending links, retry failed police, customize columns, save view, print arrivals). Property gets its own column with a thumbnail and city instead of being crammed into the guest sub-line, so it can be scanned and filtered as its own dimension. |
| **Stats that are filters** (adopted from the chekin-dashboard-preview exploration) | A number you can't act on is decoration. The bookings KPI cards apply the filter they describe, Home's stat tiles deep-link to those same filtered views, and both stay consistent because they compute from the same data. Also adopted from that review: relative arrival tags ("Tomorrow" beats date math at a glance), per-row registration progress bars, an explicit channel column, and honest pagination. Its icon-matrix properties table was evaluated and deliberately not adopted — plain-language issue lines replaced that pattern for a reason. |
| **Bulk actions** | Resending 5 check-in links or retrying 3 police submissions is currently 5× and 3× per-row journeys. |
| **4-field new-booking modal** | The current add form demands the full country/police-driven field matrix upfront (1,000+-line `ReservationInfoSection`, 10+ preload effects). Create fast, complete later — matching how bookings actually arrive. |
| **One save model in property settings** | Three save mechanisms + two dirty-guards means users can't predict what saves when (the code special-cases which sections suppress the shared guard). One savebar = one mental model. |
| **17 flat routed sections → grouped views with state dots** | One view per section is kept (deep-linkable, no mega-scroll), but the flat 17-item list becomes grouped navigation with per-section On/Off/Error dots, a setup meter and Previous/Next paging — "setup at a glance" plus a guided path through it. |
| **Settings: 3 sections + 4 dead stubs → 9 separated views** | Today Profile, Team and a danger card share one page while Check-in defaults, Payments, Branding and Integrations are dead links. Each section is now its own view (same pattern as the property workspace), and Security, Notifications and the four stubs are first-class screens — the settings people expect get a real home instead of a toast. |
| **Setup meters + honest empty sections** | Add-flow currently shows sections that silently redirect away; INCOMPLETE rows only get a warning icon. Progress % + "Finish setup" + explicit "3 steps left" make the gap actionable. |
| **20 Documents pages → 1 filtered hub** | Each authority page is the same table with a different enum prop; the tab bar, route table and page files are three parallel lists to maintain. A filter is the correct abstraction. |
| **3 billing systems → 1 page + plan modal** | V1 wizard state dies on refresh (`location.state`); V2 modal and BillingSectionsV2 duplicate it. One page holds plan, payment, usage and invoices — no journey to lose. |
| **IV review gains Confirm / Reject** | Verification is currently view-only, so a doubtful match has no next step; reject-and-retry closes the loop. Named checks replace an unexplained binary status. |
| **Consequence-stating destructive dialogs + Undo toasts** | Current delete/deactivate confirms are generic; stating what's kept (legal retention) and offering Undo reduces fear and support tickets. |
| **Mobile: off-canvas nav instead of RotateScreenModal** | Blocking portrait makes the dashboard unusable at the exact moment hosts need it (at the door, at the airport). The redesign degrades gracefully to 375 px. |
| **Visual language: unchanged, consolidated** | The redesign deliberately keeps today's design system — navy sidebar, white canvas, ProximaNova, brand `#385bf8`, token radii and status colors — so the change reads as *the same product, better organized*. What's fixed is the debt: 763 hardcoded hexes and the `#385cf8`/`#385bf8` brand fork exist because the token system lacks semantic slots (status fg/bg, surfaces, elevation); the prototype demonstrates that missing layer using only existing token values. |
| **Skeletons + reduced-motion + focus management** | 121 spinner sites cause layout shift; motion and focus behavior differ per modal implementation. The shell centralizes them once. |

### Out of scope (kept as navigation stubs)
Inbox and Upselling are represented in the navigation (with badges) but link to explanatory toasts — they live largely in external packages (`@chekin/inbox-shared`) and deserve their own pass. All PMS/lock OAuth connect pages, police-account import wizards, and the guidebook/template builders are acknowledged in flows (e.g. *Connect a PMS*, *Connect a lock*, *Edit guidebook*) but not prototyped.
