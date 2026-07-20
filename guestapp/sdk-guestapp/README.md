# Chekin Guest SDK — guestapp-style variant

The second design direction for the embeddable Guest SDK. **Markup-identical to `../sdk`**
(the neutral variant) — every `flow-*.html`, `flow.js`, `modals.js`, `chrome.js` is a copy;
the only real difference is `shared.css` (plus a Poppins `<link>` in each head and nav copy).

Open `index.html` in a browser. No build.

## What this variant changes

Everything comes from the guestapp redesign prototype one folder up:

- Poppins; Chekin blue `#385bf8` on navy `#161643` ink; brand gradient on the widget tag
  and progress bar; `--gradient-doc-cam` navy camera viewfinders.
- Liquid glass on the widget **header only** (the guestapp's chrome-only glass rule),
  solid reading surfaces, `@supports` fallback.
- Rounder radii (10–20px), real elevation shadows, tinted selection states
  (`--tint-pressed` rows, halo'd result icons).
- The host-brand accent toggle also swaps `--gradient-brand`, so the theming demo holds.

The partner page ("Nordica Stays") stays as plain as in the neutral variant — it's the
partner's site; only the widget changes its clothes.

## Why two variants

They are the two candidate **surfaces** for the SDK. Because both render from the same DOM
with only a stylesheet swapped, they demonstrate exactly what a `guest-sdk.css` surface
file in `@chekinapp/tokens` (next to `guestapp.css`) would control — see
"Where this points the codebase" on the index page.
