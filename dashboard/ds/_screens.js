/* Floating screen switcher — jump between every screen of the onboarding
   journey (auth.html + onboarding.html + the dashboard). Self-contained:
   injects its own styles and markup; include with one <script> tag. */
(function () {
  'use strict';

  var GROUPS = [
    { label: 'Sign in', page: 'auth.html', items: [
      ['#login', 'Login'],
      ['#twofactor', 'Two-factor code'],
      ['#recovery', 'Password recovery'],
      ['#check-email', 'Check your email'],
      ['#reset', 'Reset password'],
      ['#reset-success', 'Reset success']
    ]},
    { label: 'Create account', page: 'auth.html', items: [
      ['#r-account', 'Account form'],
      ['#r-welcome', 'Account created →']
    ]},
    { label: 'Guided setup', page: 'onboarding.html', items: [
      ['?step=1', '1 · Where you operate'],
      ['?step=2', '2 · Your portfolio'],
      ['?step=3', '3 · Bookings & PMS + connect'],
      ['?step=4', '4 · What matters most'],
      ['?step=5', '5 · Your plan']
    ]},
    { label: 'App', page: 'index.html', items: [
      ['', 'Dashboard home']
    ]}
  ];

  var css = '' +
    '.scr-fab{position:fixed;right:22px;bottom:22px;z-index:200;height:44px;padding:0 16px;display:inline-flex;align-items:center;gap:9px;' +
      'background:#161643;color:#fff;border:none;border-radius:999px;font:600 13px var(--font-primary,sans-serif);cursor:pointer;' +
      'box-shadow:0 10px 26px rgba(22,22,67,.35);transition:transform .13s}' +
    '.scr-fab:hover{transform:translateY(-2px)}' +
    '.scr-fab svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2}' +
    '.scr-menu{position:fixed;right:22px;bottom:76px;z-index:200;width:288px;max-height:min(72vh,640px);overflow-y:auto;' +
      'background:#fff;border:1px solid #E8E9F1;border-radius:16px;padding:10px;display:none;' +
      'box-shadow:0 18px 44px rgba(22,22,67,.18),0 2px 6px rgba(22,22,67,.06)}' +
    '.scr-menu.on{display:block;animation:scrIn .18s ease}' +
    '@keyframes scrIn{from{opacity:0;transform:translateY(8px)}}' +
    '.scr-g{display:flex;align-items:center;gap:8px;padding:10px 10px 6px;font:700 10px var(--font-primary,sans-serif);' +
      'text-transform:uppercase;letter-spacing:.08em;color:#9696B9}' +
    '.scr-g .ln{flex:1;height:1px;background:#E8E9F1}' +
    '.scr-i{display:flex;align-items:center;gap:9px;width:100%;padding:8px 10px;border:none;background:none;border-radius:9px;' +
      'font:500 13px var(--font-primary,sans-serif);color:#161643;cursor:pointer;text-align:left;text-decoration:none}' +
    '.scr-i:hover{background:#F0F3FF}' +
    '.scr-i .dot{width:6px;height:6px;border-radius:50%;background:#CECEDE;flex-shrink:0}' +
    '.scr-i.act{background:#F0F3FF;color:#385CF8;font-weight:600}' +
    '.scr-i.act .dot{background:#385CF8}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var here = location.pathname.split('/').pop() || 'index.html';
  function isActive(page, target) {
    if (page !== here) return false;
    if (target.charAt(0) === '#') return location.hash === target || (!location.hash && target === '#login');
    if (target.charAt(0) === '?') return location.search === target;
    return !location.hash && !location.search;
  }

  var fab = document.createElement('button');
  fab.className = 'scr-fab';
  fab.setAttribute('aria-haspopup', 'menu');
  fab.setAttribute('aria-expanded', 'false');
  fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg>Screens';

  var menu = document.createElement('div');
  menu.className = 'scr-menu';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', 'All screens');
  menu.innerHTML = GROUPS.map(function (g) {
    return '<div class="scr-g">' + g.label + '<span class="ln"></span></div>' +
      g.items.map(function (it) {
        var act = isActive(g.page, it[0]) ? ' act' : '';
        return '<a class="scr-i' + act + '" role="menuitem" href="' + g.page + it[0] + '"><span class="dot"></span>' + it[1] + '</a>';
      }).join('');
  }).join('');

  function close() { menu.classList.remove('on'); fab.setAttribute('aria-expanded', 'false'); }
  fab.addEventListener('click', function (e) {
    e.stopPropagation();
    var on = menu.classList.toggle('on');
    fab.setAttribute('aria-expanded', String(on));
    if (on) {
      var act = menu.querySelector('.scr-i.act');
      if (act) act.scrollIntoView({ block: 'center' });
    }
  });
  document.addEventListener('click', function (e) { if (!menu.contains(e.target) && e.target !== fab) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  menu.addEventListener('click', function (e) {
    var link = e.target.closest('a.scr-i');
    if (!link) return;
    var href = link.getAttribute('href');
    var targetPage = href.split(/[?#]/)[0];
    if (targetPage === here) {
      /* Same page: pick the cheapest move that actually lands. Setting the
         hash and calling reload() in the same tick races — the reload can
         win and reload the old URL — so only reload when nothing else
         would change. */
      e.preventDefault();
      var url = new URL(href, location.href);
      if (url.search !== location.search) {
        location.href = url.href;
      } else if (url.hash !== location.hash) {
        location.hash = url.hash;
      } else {
        location.reload();
      }
    }
    close();
  });

  document.body.appendChild(fab);
  document.body.appendChild(menu);
})();
