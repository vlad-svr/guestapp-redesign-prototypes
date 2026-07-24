/* ══════════════════════════════════════════════════════════════════════════
   Shared app chrome — one definition, injected into every view.

   The prototype had ~100 hand-copied sidebars across 22 desktop pages and
   ~220 hand-copied status bars. They drifted: different check-in percentages,
   different item sets, and — once Home dropped its progress bar and merged
   Payments — a Home sidebar that no longer matched any of the others.

   The sidebar here is Home's, verbatim. It is the canonical one; every desktop
   view renders it and marks its own row active:

     <aside class="sidebar" data-sidebar data-active="payments"></aside>
     <div class="statusbar" data-statusbar></div>
     <header class="topbar" data-topbar data-title="Payments" data-back="home.html"></header>

   Attributes, all optional:
     data-active    sidebar row to light up — see ITEMS ids below
     data-property  identity to render — see PROPERTIES below (default 'villa')
     data-time      status-bar clock (default 9:41)
     data-signal    status-bar glyphs: full | weak | none
     data-title     topbar title       data-sub   topbar subtitle
     data-back      topbar back target: a URL, or `screen:<id>` for an in-flow
                    jump, or the bare word `history`

   Same runtime-injection idiom as nav.js — the prototype has no build step,
   so shared markup has to arrive from JS. Anything genuinely per-view (a
   topbar's title, which row is active) stays in the page as an attribute,
   where it is still greppable.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  /* ── Identity ────────────────────────────────────────────────────────────
     81 of the 87 sidebars in the prototype were the same booking; the rest are
     the housing / property-link surfaces, which have a different property and
     — for `marbella` — no booking at all, because there is no reservation. */
  var PROPERTIES = {
    villa:    { logo: 'V', name: 'Villa Serena',  ref: 'Booking · CHK-58291' },
    casa:     { logo: 'C', name: 'Casa Marbella', ref: 'Booking · HMAK-2931' },
    loft:     { logo: 'L', name: 'Loft Gràcia',   ref: 'Booking · CHK-64408' },
    marbella: { logo: 'M', name: 'Marbella Stays', ref: '' },
  };

  /* ── The sidebar, as Home defines it ─────────────────────────────────────
     No progress bar: it was removed from Home deliberately, and a rail that
     re-states a number the page already shows is noise. Payments carries
     protection and taxes — they were three rows for one payment step. */
  var GROUPS = [
    { label: 'Before you arrive', items: [
      { id: 'home',     icon: 'i-home',        label: 'Home', href: 'home-desktop.html' },
      { id: 'guests',   icon: 'i-users',       label: 'Guest registration', badge: { cls: 'teal', text: '✓' } },
      { id: 'payments', icon: 'i-credit-card', label: 'Payments', badge: { cls: 'warn', text: '!' } },
    ]},
    { label: 'Your stay', items: [
      { id: 'keys',       icon: 'i-key',       label: 'Virtual keys', href: 'flow-remote-access-desktop.html#kd-keys' },
      { id: 'guidebooks', icon: 'i-book-open', label: 'Guidebooks' },
      { id: 'experiences',icon: 'i-compass',   label: 'Experiences' },
    ]},
    /* Home never had these rows, but FAQs, Chat, Language and Privacy are real
       destinations in the prototype — without them those views render a rail
       with nothing highlighted, which reads as a bug rather than a choice. */
    { label: 'Support', items: [
      { id: 'chat',     icon: 'i-message-circle', label: 'Chat with host', href: 'flow-chat-desktop.html' },
      { id: 'faq',      icon: 'i-circle-help',    label: 'FAQs', href: 'flow-faq-desktop.html' },
      { id: 'language', icon: 'i-globe',          label: 'Language', value: 'English' },
      { id: 'privacy',  icon: 'i-lock',           label: 'Privacy policy', href: 'https://chekin.com/en/privacy-policy/' },
    ]},
  ];

  var USER = { initials: 'MG', name: 'María García', mail: 'maria@gmail.com' };

  /* ── Icons ───────────────────────────────────────────────────────────────
     Injected markup can't rely on the host page's <defs>: `i-compass` was
     missing from 21 of the 22 desktop pages (Experiences is newer than they
     are), so a bare <use href="#i-compass"> renders nothing. The component
     ships its own glyphs and adds only the ones the page is missing — an id
     that already exists keeps the page's own definition. */
  var SYMBOLS = {
    'i-home': '<path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    'i-users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'i-credit-card': '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
    'i-key': '<path d="m15.5 7.5 3 3L22 7l-3-3"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
    'i-book-open': '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    'i-compass': '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    'i-log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
    'i-chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'i-message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
    'i-circle-help': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    'i-globe': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    'i-lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  };

  function ensureSymbols() {
    var missing = Object.keys(SYMBOLS).filter(function (id) {
      return !document.getElementById(id);
    });
    if (!missing.length) return;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.style.position = 'absolute';
    svg.innerHTML = '<defs>' + missing.map(function (id) {
      return '<g id="' + id + '">' + SYMBOLS[id] + '</g>';
    }).join('') + '</defs>';
    document.body.appendChild(svg);
  }

  function icon(id, cls) {
    return '<svg viewBox="0 0 24 24" class="' + (cls || 'icon') + '"><use href="#' + id + '"/></svg>';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
    });
  }

  /* ── Sidebar ─────────────────────────────────────────────────────────── */
  function renderSidebar(el) {
    var active = el.getAttribute('data-active') || '';
    var p = PROPERTIES[el.getAttribute('data-property') || 'villa'] || PROPERTIES.villa;

    var html =
      '<div class="sb-head">' +
        '<div class="sb-logo">' + esc(p.logo) + '</div>' +
        '<div>' +
          '<div class="sb-prop">' + esc(p.name) + '</div>' +
          (p.ref ? '<div class="sb-ref">' + esc(p.ref) + '</div>' : '') +
        '</div>' +
      '</div>';

    GROUPS.forEach(function (g) {
      html += '<div class="sb-group">' + esc(g.label) + '</div>';
      g.items.forEach(function (it) {
        var on = it.id === active;
        /* The active row is the current page — a link to itself is a dead
           control, so it loses its href and gains aria-current instead. */
        var href = (!on && it.href) ? ' href="' + it.href + '"' : '';
        html += '<a class="sb-item' + (on ? ' active' : '') + '"' + href +
                (on ? ' aria-current="page"' : '') + '>' +
                icon(it.icon) + ' ' + esc(it.label) +
                (it.badge ? ' <span class="sb-badge ' + it.badge.cls + '">' + it.badge.text + '</span>' : '') +
                (it.value ? ' <span class="sb-val">' + esc(it.value) + '</span>' : '') +
                '</a>';
      });
    });

    html +=
      '<div class="sb-footer">' +
        '<div class="sb-avatar">' + esc(USER.initials) + '</div>' +
        '<div>' +
          '<div class="sb-user">' + esc(USER.name) + '</div>' +
          '<div class="sb-mail">' + esc(USER.mail) + '</div>' +
        '</div>' +
        '<button class="sb-logout" aria-label="Log out">' + icon('i-log-out') + '</button>' +
      '</div>';

    el.innerHTML = html;
  }

  /* ── Status bar ──────────────────────────────────────────────────────── */
  var SIGNAL = { full: '▮▮▮ ᯤ ▭', weak: '▮▯▯ ᯤ ▭', none: '▯▯▯ ⚠ ▭' };

  function renderStatusbar(el) {
    var time = el.getAttribute('data-time') || '9:41';
    var sig = SIGNAL[el.getAttribute('data-signal') || 'full'] || SIGNAL.full;
    el.innerHTML = '<span>' + esc(time) + '</span><span class="sb-icons">' + sig + '</span>';
  }

  /* ── Topbar ──────────────────────────────────────────────────────────────
     Unlike the sidebar, topbars are NOT interchangeable — 122 instances carry
     65 distinct titles, because the title is the screen's identity. What is
     shared is the shape: back affordance, title block, optional subtitle. The
     title stays on the element as an attribute. */
  function renderTopbar(el) {
    var back = el.getAttribute('data-back');
    var title = el.getAttribute('data-title') || '';
    var sub = el.getAttribute('data-sub') || '';
    var html = '';

    if (back) {
      if (back.indexOf('screen:') === 0) {
        html += '<button class="back-btn" data-goto="' + esc(back.slice(7)) + '" aria-label="Back">' + icon('i-chevron-left') + '</button>';
      } else if (back === 'history') {
        html += '<button class="back-btn" data-back aria-label="Back">' + icon('i-chevron-left') + '</button>';
      } else {
        html += '<a class="back-btn" href="' + esc(back) + '" aria-label="Back">' + icon('i-chevron-left') + '</a>';
      }
    }

    html += '<div class="tb-titles"><div class="tb-title">' + esc(title) + '</div>' +
            (sub ? '<div class="tb-sub">' + esc(sub) + '</div>' : '') + '</div>';

    /* Trailing slot: whatever the page put inside the element is preserved and
       re-appended, so a view can still hang its own action on the right. */
    var slot = el.innerHTML.trim();
    el.innerHTML = html + slot;
  }

  /* ── Page head ───────────────────────────────────────────────────────────
     kicker + title + intro, 123 times across 27 pages, hand-copied every
     time. Like the topbar the *words* are the screen's identity and stay on
     the element; what is shared — and what kept drifting — is the shape and
     the order of the three parts.

       <div class="page-head" data-page-head
            data-kicker="Registration · Step 2 of 4"
            data-title="Upload your {document}"
            data-intro="Drop photos or scans of your ID card."></div>

     `{…}` marks the highlighted words, so a view never hand-writes
     `<span class="hl">` and the accent can never end up on the wrong span.
     data-intro is plain text; the 9 intros that carry inline markup (a <b>,
     an "Edit" button) write their own <p class="page-intro"> as slot content
     instead — same trailing-slot rule as the topbar. */
  function highlight(s, accent) {
    /* esc() first: braces are not HTML, so substituting after escaping is safe */
    var cls = 'hl' + (accent ? ' ' + accent : '');
    return esc(s).replace(/\{([^}]*)\}/g, '<span class="' + cls + '">$1</span>');
  }

  function renderPageHead(el) {
    el.classList.add('page-head');
    var kicker = el.getAttribute('data-kicker');
    var title = el.getAttribute('data-title') || '';
    var intro = el.getAttribute('data-intro');
    /* data-accent="ok|bad" recolours the highlight for outcome screens
       (captured / passed vs. try again) — see .hl.ok / .hl.bad in shared.css */
    var accent = el.getAttribute('data-accent');
    if (accent !== 'ok' && accent !== 'bad') accent = '';

    var html = '';
    if (kicker) html += '<div class="kicker">' + esc(kicker) + '</div>';
    html += '<div class="page-title">' + highlight(title, accent) + '</div>';
    if (intro) html += '<p class="page-intro">' + esc(intro) + '</p>';

    var slot = el.innerHTML.trim();
    el.innerHTML = html + slot;
  }

  function boot() {
    ensureSymbols();
    document.querySelectorAll('[data-sidebar]').forEach(renderSidebar);
    document.querySelectorAll('[data-statusbar]').forEach(renderStatusbar);
    document.querySelectorAll('[data-topbar]').forEach(renderTopbar);
    document.querySelectorAll('[data-page-head]').forEach(renderPageHead);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
