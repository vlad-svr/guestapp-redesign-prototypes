/* Floating prototype switcher — injected on every page. */
(function () {
  var PAGES = [
    { group: 'Hub', items: [
      { file: 'index.html', label: 'Overview & rationale', icon: '⌂' },
    ]},
    { group: 'Mobile', items: [
      { file: 'home.html', label: 'Home & check-in list', icon: '📱' },
      { file: 'iv-flow.html', label: 'Identity verification', icon: '🪪' },
      { file: 'guest-registration.html', label: 'Guest registration', icon: '📝' },
    ]},
    { group: 'Desktop', items: [
      { file: 'home-desktop.html', label: 'Home', icon: '🖥' },
      { file: 'iv-flow-desktop.html', label: 'Identity verification', icon: '🖥' },
      { file: 'guest-registration-desktop.html', label: 'Guest registration', icon: '🖥' },
    ]},
    { group: 'Components', items: [
      { file: 'vela.html', label: 'Vela helper', icon: '✦' },
    ]},
  ];

  var current = location.pathname.split('/').pop() || 'index.html';

  var css = [
    '.proto-nav{position:fixed;bottom:18px;right:18px;z-index:9999;font-family:Poppins,-apple-system,sans-serif}',
    '.proto-nav summary{list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px;border-radius:99px;background:rgba(22,22,67,0.88);backdrop-filter:blur(16px) saturate(1.5);-webkit-backdrop-filter:blur(16px) saturate(1.5);border:1px solid rgba(140,165,255,0.25);color:#fff;font-size:12.5px;font-weight:600;box-shadow:0 10px 30px rgba(22,22,67,0.35);user-select:none}',
    '.proto-nav summary::-webkit-details-marker{display:none}',
    '.proto-nav summary:hover{background:rgba(30,30,85,0.92)}',
    '.proto-nav summary .pn-dot{width:8px;height:8px;border-radius:50%;background:#8ca5ff;box-shadow:0 0 8px rgba(140,165,255,0.9)}',
    '.proto-nav .pn-menu{position:absolute;bottom:54px;right:0;width:280px;border-radius:16px;background:rgba(255,255,255,0.92);backdrop-filter:blur(24px) saturate(1.6);-webkit-backdrop-filter:blur(24px) saturate(1.6);border:1px solid rgba(229,230,238,0.9);box-shadow:0 20px 50px rgba(22,22,67,0.25);padding:10px;max-height:70vh;overflow-y:auto}',
    '.proto-nav .pn-group{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:#9696b9;padding:10px 10px 5px}',
    '.proto-nav a{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;font-size:12.5px;font-weight:600;color:#161643;text-decoration:none}',
    '.proto-nav a:hover{background:#f0f3ff}',
    '.proto-nav a.active{background:#e3efff;color:#385bf8;box-shadow:inset 0 0 0 1px rgba(56,91,248,0.3)}',
    '.proto-nav a .pn-ic{width:20px;text-align:center;flex-shrink:0;font-size:13px}',
    '.proto-nav a .pn-badge{margin-left:auto;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#385bf8;background:#f0f3ff;border-radius:99px;padding:2px 7px}',
    '.proto-nav a.active .pn-badge{background:#fff}',
    '@media print{.proto-nav{display:none}}',
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var menu = '';
  PAGES.forEach(function (g) {
    menu += '<div class="pn-group">' + g.group + '</div>';
    g.items.forEach(function (p) {
      var active = p.file === current;
      menu += '<a href="' + p.file + '"' + (active ? ' class="active"' : '') + '>' +
        '<span class="pn-ic">' + p.icon + '</span>' + p.label +
        (active ? '<span class="pn-badge">viewing</span>' : '') + '</a>';
    });
  });

  var nav = document.createElement('details');
  nav.className = 'proto-nav';
  nav.innerHTML =
    '<summary><span class="pn-dot"></span> Prototypes</summary>' +
    '<div class="pn-menu">' + menu + '</div>';
  document.body.appendChild(nav);

  document.addEventListener('click', function (e) {
    if (nav.open && !nav.contains(e.target)) nav.open = false;
  });
})();
