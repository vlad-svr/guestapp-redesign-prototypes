/* Injects the shared app shell (sidebar, topbar, command palette).
   Usage: <body data-page="home" data-title="Good morning, Marta"> …
   <div id="shell-sidebar"></div> <div id="shell-topbar"></div> */
(function () {
  'use strict';

  /* ── Design variants (applied before first paint of shell) ── */
  var THEMES = [
    { id: '', name: 'Chekin', sub: 'Navy sidebar · modern polish', sw: ['#161643', '#385bf8', '#f8f9fc'] },
    { id: 'minimal', name: 'Minimal light', sub: 'Flat, airy, quiet chrome', sw: ['#ffffff', '#385bf8', '#ececf8'] },
    { id: 'dark', name: 'Dark', sub: 'Deep navy night mode', sw: ['#0a0a24', '#385bf8', '#181842'] },
    { id: 'playful', name: 'Playful', sub: 'Lavender, round, gradient', sw: ['#23235d', '#2148ff', '#f4f4fd'] },
    { id: 'warm', name: 'Boutique warm', sub: 'Sand & ink · Airbnb tokens', sw: ['#1f1f1b', '#fc98dd', '#f7f6f4'] },
    { id: 'glass', name: 'Aurora glass', sub: 'Frosted translucent surfaces', sw: ['#c7d2fe', '#f4e9fa', '#ffffff'] },
    { id: 'slate', name: 'Slate utility', sub: 'True-gray Inbox family', sw: ['#101828', '#6b7280', '#f9fafb'] }
  ];
  var savedTheme = localStorage.getItem('proto-theme') || '';
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

  var I = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
    bookings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h18"/><path d="M4 20v-7a8 8 0 0 1 16 0v7"/><path d="M12 5V3"/></svg>',
    properties: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7"/><path d="M5 8.5V21h14V8.5"/><path d="M10 21v-6h4v6"/></svg>',
    inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12h-5l-2 3h-4l-2-3H3"/><path d="M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/></svg>',
    upselling: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 15 6-6"/><circle cx="9.5" cy="9.5" r="1"/><circle cx="14.5" cy="14.5" r="1"/><path d="M12 3a2.4 2.4 0 0 1 1.7.7l6.6 6.6a2.4 2.4 0 0 1 0 3.4l-6.6 6.6a2.4 2.4 0 0 1-3.4 0l-6.6-6.6A2.4 2.4 0 0 1 3 12.3V6a3 3 0 0 1 3-3Z"/></svg>',
    documents: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3v5h5"/><path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M9 13h6M9 17h6"/></svg>',
    billing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    collapse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
  };
  window.ICONS = I;

  var NAV = [
    { group: 'Workspace', items: [
      { id: 'home', label: 'Home', href: 'index.html', icon: I.home },
      { id: 'reservations', label: 'Bookings', href: 'reservations.html', icon: I.bookings, badge: '3', badgeLabel: '3 bookings need attention' },
      { id: 'properties', label: 'Properties', href: 'properties.html', icon: I.properties },
      { id: 'inbox', label: 'Inbox', href: '#', icon: I.inbox, badge: '2', badgeInfo: true, badgeLabel: '2 unread messages', toast: 'Inbox is out of scope for this prototype' }
    ]},
    { group: 'Grow', items: [
      { id: 'upselling', label: 'Upselling', href: '#', icon: I.upselling, toast: 'Upselling is out of scope for this prototype' },
      { id: 'documents', label: 'Documents', href: 'documents.html', icon: I.documents }
    ]},
    { group: 'Manage', items: [
      { id: 'billing', label: 'Plan & billing', href: 'billing.html', icon: I.billing },
      { id: 'settings', label: 'Settings', href: 'account.html', icon: I.settings }
    ]}
  ];

  var page = document.body.getAttribute('data-page') || '';

  var sidebarHost = document.getElementById('shell-sidebar');
  if (sidebarHost) {
    var navHtml = NAV.map(function (g) {
      return '<div class="nav-group"><div class="nav-group-label">' + g.group + '</div>' +
        g.items.map(function (item) {
          var current = item.id === page ? ' aria-current="page"' : '';
          var badge = item.badge
            ? '<span class="nav-badge' + (item.badgeInfo ? ' nav-badge--info' : '') + '" aria-label="' + item.badgeLabel + '">' + item.badge + '</span>'
            : '';
          var toast = item.toast ? ' data-toast="' + item.toast + '"' : '';
          return '<a class="nav-item" href="' + item.href + '"' + current + toast + '>' + item.icon + '<span>' + item.label + '</span>' + badge + '</a>';
        }).join('') + '</div>';
    }).join('');

    sidebarHost.outerHTML =
      '<nav class="sidebar" aria-label="Main navigation">' +
        '<div class="sidebar-brand">' +
          '<span class="logo" aria-hidden="true">C</span><span class="wordmark">chekin</span>' +
          '<span class="grow"></span>' +
          '<button class="topbar-icon-btn" id="sidebar-collapse" aria-label="Collapse sidebar" aria-expanded="true">' + I.collapse + '</button>' +
        '</div>' +
        '<div class="sidebar-nav">' + navHtml + '</div>' +
        '<div class="sidebar-foot">' +
          '<button class="sidebar-user" data-menu="#user-menu" aria-haspopup="menu">' +
            '<span class="avatar av-1">MF</span>' +
            '<span class="meta"><span class="name">Marta Ferreira</span><br><span class="email">marta@solmarproperties.com</span></span>' +
          '</button>' +
          '<div class="menu" id="user-menu" role="menu" style="bottom:64px;left:12px;">' +
            '<a href="account.html" role="menuitem">' + I.settings + 'Account settings</a>' +
            '<button type="button" role="menuitem" data-toast="Switched to Coastal Rentals workspace">' + I.home + 'Switch workspace</button>' +
            '<hr><button type="button" role="menuitem" class="danger" data-toast="This is a prototype — no real sign out">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>Log out</button>' +
          '</div>' +
        '</div>' +
      '</nav><div class="sidebar-scrim"></div>';
  }

  var topbarHost = document.getElementById('shell-topbar');
  if (topbarHost) {
    topbarHost.outerHTML =
      '<header class="topbar">' +
        '<button class="topbar-icon-btn" id="mobile-nav-toggle" aria-label="Open navigation" aria-expanded="false">' + I.menu + '</button>' +
        '<button class="search-trigger" data-open="#cmdk" aria-label="Search — bookings, guests, properties, actions">' +
          I.search + '<span>Search bookings, guests, actions…</span><kbd>⌘K</kbd>' +
        '</button>' +
        '<span class="spacer"></span>' +
        '<span class="trial-pill"><span>Trial · 9 days left</span><a class="btn btn--primary" href="billing.html">Upgrade</a></span>' +
        '<div class="notif-wrap">' +
          '<button class="topbar-icon-btn" id="notif-btn" aria-label="Notifications — 3 unread" aria-haspopup="true" aria-expanded="false">' + I.bell + '<span class="dot" aria-hidden="true"></span></button>' +
          '<div class="notif-panel" id="notif-panel" role="region" aria-label="Notifications">' +
            '<div class="notif-head"><h2>Notifications</h2><button type="button" id="notif-readall">Mark all as read</button></div>' +
            '<div class="notif-list">' +
              '<a class="notif-item unread" href="property-detail.html#sec-compliance">' +
                '<span class="notif-ico err" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.3 3.9-8.5 14.2a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/></svg></span>' +
                '<span class="nt"><p class="t1">Police submission failed</p><p class="t2">Trastevere Suites — Alloggiati credentials are invalid. New bookings can’t be registered.</p></span>' +
                '<time datetime="2026-07-20T10:35">25m</time><span class="undot" aria-label="Unread"></span>' +
              '</a>' +
              '<a class="notif-item unread" href="reservation-detail.html">' +
                '<span class="notif-ico warn" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 16.5 4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9.5a2 2 0 0 1-2 2Z"/></svg></span>' +
                '<span class="nt"><p class="t1">ID verification needs review</p><p class="t2">Sofia Marchetti · Trastevere Suites — face match is below the auto-confirm threshold.</p></span>' +
                '<time datetime="2026-07-20T09:50">1h</time><span class="undot" aria-label="Unread"></span>' +
              '</a>' +
              '<a class="notif-item unread" href="index.html">' +
                '<span class="notif-ico info" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.3-.6L3 21l1.7-5.7a8.4 8.4 0 1 1 16.3-3.8Z"/></svg></span>' +
                '<span class="nt"><p class="t1">Amélie Rousseau replied</p><p class="t2">“Perfect, thanks! One more thing — is early check-in possible on…”</p></span>' +
                '<time datetime="2026-07-20T08:20">3h</time><span class="undot" aria-label="Unread"></span>' +
              '</a>' +
              '<a class="notif-item" href="reservation-detail.html">' +
                '<span class="notif-ico ok" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="m9 11 3 3L22 4"/></svg></span>' +
                '<span class="nt"><p class="t1">Check-in completed</p><p class="t2">Jonas Weber +1 · Casa Azulejo — all guests registered, arriving today.</p></span>' +
                '<time datetime="2026-07-20T07:05">4h</time><span class="undot" aria-label="Unread"></span>' +
              '</a>' +
              '<a class="notif-item" href="reservations.html">' +
                '<span class="notif-ico info" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg></span>' +
                '<span class="nt"><p class="t1">New booking synced from Guesty</p><p class="t2">Priya Nair · Villa Miramar · Aug 2–9 — check-in invite scheduled.</p></span>' +
                '<time datetime="2026-07-19T22:40">yesterday</time><span class="undot" aria-label="Unread"></span>' +
              '</a>' +
            '</div>' +
            '<div class="notif-foot"><a href="index.html">View all in Home</a></div>' +
          '</div>' +
        '</div>' +
        '<button class="topbar-icon-btn" aria-label="Help and support" data-toast="Help: docs, video tutorials & live chat would open here">' + I.help + '</button>' +
      '</header>';
  }

  /* ── Notifications panel ── */
  (function () {
    var btn = document.getElementById('notif-btn');
    var panel = document.getElementById('notif-panel');
    if (!btn || !panel) return;
    function close() { panel.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (panel.classList.contains('open') && !panel.contains(e.target) && !btn.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) { close(); btn.focus(); }
    });
    document.getElementById('notif-readall').addEventListener('click', function () {
      panel.querySelectorAll('.notif-item.unread').forEach(function (i) { i.classList.remove('unread'); });
      var dot = btn.querySelector('.dot');
      if (dot) dot.remove();
      btn.setAttribute('aria-label', 'Notifications — all read');
    });
  })();

  /* ── Theme switcher FAB ── */
  (function () {
    var fab = document.createElement('button');
    fab.className = 'theme-fab';
    fab.setAttribute('aria-label', 'Switch design variant');
    fab.setAttribute('aria-haspopup', 'menu');
    fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22a10 10 0 1 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.2a1.8 1.8 0 0 0-1.4 3 1.8 1.8 0 0 1-1.4 3Z"/><circle cx="7.5" cy="11.5" r="1.2"/><circle cx="11" cy="7.5" r="1.2"/><circle cx="16" cy="8.5" r="1.2"/></svg>';

    var menu = document.createElement('div');
    menu.className = 'theme-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Design variants');
    var current = localStorage.getItem('proto-theme') || '';
    menu.innerHTML = '<p class="tm-head">Design variants</p>' + THEMES.map(function (t) {
      return '<button type="button" role="menuitemradio" aria-checked="' + String(t.id === current) + '" data-theme-id="' + t.id + '">' +
        '<span class="swatches" aria-hidden="true">' + t.sw.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</span>' +
        '<span class="tm-name">' + t.name + '<span class="tm-sub">' + t.sub + '</span></span>' +
        '<svg class="tm-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>' +
      '</button>';
    }).join('');

    fab.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = menu.classList.toggle('open');
      fab.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target)) { menu.classList.remove('open'); fab.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { menu.classList.remove('open'); fab.setAttribute('aria-expanded', 'false'); }
    });
    menu.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-theme-id]');
      if (!btn) return;
      var id = btn.getAttribute('data-theme-id');
      if (id) document.documentElement.setAttribute('data-theme', id);
      else document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('proto-theme', id);
      menu.querySelectorAll('[data-theme-id]').forEach(function (b) {
        b.setAttribute('aria-checked', String(b === btn));
      });
      menu.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false');
    });

    document.body.appendChild(fab);
    document.body.appendChild(menu);
  })();

  /* Command palette markup */
  if (!document.getElementById('cmdk')) {
    var cmdk = document.createElement('div');
    cmdk.className = 'modal-overlay cmdk';
    cmdk.id = 'cmdk';
    cmdk.setAttribute('aria-hidden', 'true');
    cmdk.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-label="Command palette">' +
        '<div class="cmdk-input">' + I.search + '<input type="text" placeholder="Search or jump to…" aria-label="Search commands and pages">' +
        '<button class="btn btn--ghost btn--sm" data-close>Esc</button></div>' +
        '<div class="cmdk-list">' +
          '<div class="cmdk-group">Quick actions</div>' +
          '<button class="cmdk-item" data-action-label="New booking created (prototype)">' + I.plus + 'New booking</button>' +
          '<button class="cmdk-item" data-action-label="Check-in link copied">' + I.bookings + 'Copy check-in link for a booking</button>' +
          '<button class="cmdk-item" data-action-label="Export started — we’ll notify you when ready">' + I.documents + 'Export bookings report</button>' +
          '<div class="cmdk-group">Jump to</div>' +
          '<button class="cmdk-item" data-href="index.html">' + I.home + 'Home</button>' +
          '<button class="cmdk-item" data-href="reservations.html">' + I.bookings + 'Bookings</button>' +
          '<button class="cmdk-item" data-href="properties.html">' + I.properties + 'Properties</button>' +
          '<button class="cmdk-item" data-href="documents.html">' + I.documents + 'Documents & compliance</button>' +
          '<button class="cmdk-item" data-href="billing.html">' + I.billing + 'Plan & billing</button>' +
          '<button class="cmdk-item" data-href="account.html">' + I.settings + 'Settings</button>' +
          '<div class="cmdk-group">Guests</div>' +
          '<button class="cmdk-item" data-href="reservation-detail.html"><span class="avatar avatar--sm av-2" aria-hidden="true">AR</span>Amélie Rousseau · Villa Miramar</button>' +
          '<button class="cmdk-item" data-href="reservation-detail.html"><span class="avatar avatar--sm av-1" aria-hidden="true">JW</span>Jonas Weber · Casa Azulejo</button>' +
          '<div class="cmdk-empty" style="display:none;padding:24px;text-align:center;color:var(--text-tertiary);">No results</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(cmdk);
  }
})();
