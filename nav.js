/* Floating prototype switcher — injected on every page.
   Flow pages expose sub-entries (scenarios) that deep-link via #hash;
   flow.js picks the hash up and jumps straight to that scenario. */
(function () {
  var PAGES = [
    { group: 'Hub', items: [
      { file: 'index.html', label: 'Overview & rationale', icon: '⌂' },
    ]},
    { group: 'Interactive flows', items: [
      { file: 'flow-iv-mobile.html', label: 'IV flow — mobile', icon: '▶', subs: [
        { hash: 's-start', label: 'Full flow (passport / ID card)' },
        { hash: 's-qr-scan', label: 'Continue from desktop (QR)' },
        { hash: 's-front-failed', label: 'Validation failed' },
        { hash: 's-live-1', label: 'Liveness sequence' },
        { hash: 's-contacts', label: 'Contacts verification' },
        { hash: 's-unavailable', label: 'Outside check-in window' },
      ]},
      { file: 'flow-iv-desktop.html', label: 'IV flow — desktop', icon: '▶', subs: [
        { hash: 'd-choice', label: 'Start — choose method' },
        { hash: 'd-qr', label: 'Continue on phone (QR)' },
        { hash: 'd-cam', label: 'Webcam capture' },
        { hash: 'd-upload', label: 'Upload files' },
      ]},
      { file: 'flow-registration.html', label: 'Registration flow', icon: '▶', subs: [
        { hash: 'r-hub', label: 'Full flow' },
        { hash: 'r-details', label: 'Add details' },
        { hash: 'r-review', label: 'Review & sign' },
        { hash: 'r-done', label: 'All registered' },
      ]},
      { file: 'scroll-demo.html', label: 'Scroll behavior demo', icon: '↕' },
      { file: 'modals-demo.html', label: 'Modals & overlays', icon: '▣' },
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
    '.proto-nav .pn-menu{position:absolute;bottom:54px;right:0;width:300px;border-radius:16px;background:rgba(255,255,255,0.94);backdrop-filter:blur(24px) saturate(1.6);-webkit-backdrop-filter:blur(24px) saturate(1.6);border:1px solid rgba(229,230,238,0.9);box-shadow:0 20px 50px rgba(22,22,67,0.25);padding:10px;max-height:76vh;overflow-y:auto}',
    '.proto-nav .pn-group{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:#9696b9;padding:10px 10px 5px}',
    '.proto-nav a{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;font-size:12.5px;font-weight:600;color:#161643;text-decoration:none}',
    '.proto-nav a:hover{background:#f0f3ff}',
    '.proto-nav a.active{background:#e3efff;color:#385bf8;box-shadow:inset 0 0 0 1px rgba(56,91,248,0.3)}',
    '.proto-nav a .pn-ic{width:20px;text-align:center;flex-shrink:0;font-size:13px}',
    '.proto-nav a .pn-badge{margin-left:auto;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#385bf8;background:#f0f3ff;border-radius:99px;padding:2px 7px}',
    '.proto-nav a.active .pn-badge{background:#fff}',
    /* hover flyout with flow scenarios — fixed panel to the LEFT of the menu */
    '.proto-nav a .pn-more{margin-left:auto;color:#9696b9;font-size:12px}',
    '.proto-nav a.active .pn-more{color:#385bf8}',
    '.pn-flyout{position:fixed;z-index:10000;display:none;width:252px;border-radius:14px;background:rgba(255,255,255,0.97);backdrop-filter:blur(24px) saturate(1.6);-webkit-backdrop-filter:blur(24px) saturate(1.6);border:1px solid rgba(229,230,238,0.9);box-shadow:0 16px 44px rgba(22,22,67,0.25);padding:8px;font-family:Poppins,-apple-system,sans-serif}',
    '.pn-flyout .pn-fly-title{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:#9696b9;padding:8px 10px 5px}',
    '.pn-flyout a.pn-sub{display:flex;align-items:center;gap:8px;padding:7px 10px;font-size:11.5px;font-weight:500;color:#6b6b95;border-radius:8px;text-decoration:none}',
    '.pn-flyout a.pn-sub:hover{color:#385bf8;background:#f0f3ff}',
    '.pn-flyout a.pn-sub .pn-dot2{width:5px;height:5px;border-radius:50%;background:#cecede;flex-shrink:0}',
    '.pn-flyout a.pn-sub:hover .pn-dot2{background:#385bf8}',
    '@media print{.proto-nav{display:none}}',
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var menu = '';
  var FLY = {};
  PAGES.forEach(function (g) {
    menu += '<div class="pn-group">' + g.group + '</div>';
    g.items.forEach(function (p) {
      var active = p.file === current;
      menu += '<a href="' + p.file + '"' + (active ? ' class="active"' : '') +
        (p.subs ? ' data-fly="' + p.file + '"' : '') + '>' +
        '<span class="pn-ic">' + p.icon + '</span>' + p.label +
        (active ? '<span class="pn-badge">viewing</span>' : '') +
        (p.subs ? '<span class="pn-more">‹</span>' : '') + '</a>';
      if (p.subs) {
        var fly = '<div class="pn-fly-title">Flows</div>';
        p.subs.forEach(function (sub) {
          fly += '<a class="pn-sub" href="' + p.file + '#' + sub.hash + '">' +
            '<span class="pn-dot2"></span>' + sub.label + '</a>';
        });
        FLY[p.file] = fly;
      }
    });
  });

  var nav = document.createElement('details');
  nav.className = 'proto-nav';
  nav.innerHTML =
    '<summary><span class="pn-dot"></span> Prototypes</summary>' +
    '<div class="pn-menu">' + menu + '</div>';
  document.body.appendChild(nav);

  var fly = document.createElement('div');
  fly.className = 'pn-flyout';
  document.body.appendChild(fly);
  var hideT = null;

  function showFly(a) {
    clearTimeout(hideT);
    fly.innerHTML = FLY[a.getAttribute('data-fly')] || '';
    fly.style.display = 'block';
    var menuBox = nav.querySelector('.pn-menu').getBoundingClientRect();
    fly.style.right = (window.innerWidth - menuBox.left + 8) + 'px';
    fly.style.top = '0px';
    var top = a.getBoundingClientRect().top - 8;
    var h = fly.offsetHeight;
    if (top + h > window.innerHeight - 10) top = window.innerHeight - 10 - h;
    if (top < 10) top = 10;
    fly.style.top = top + 'px';
  }
  function hideFly(now) {
    clearTimeout(hideT);
    if (now) { fly.style.display = 'none'; return; }
    hideT = setTimeout(function () { fly.style.display = 'none'; }, 140);
  }

  nav.addEventListener('mouseover', function (e) {
    var a = e.target.closest && e.target.closest('a[data-fly]');
    if (a) showFly(a);
    else hideFly(false);
  });
  nav.addEventListener('mouseleave', function () { hideFly(false); });
  fly.addEventListener('mouseenter', function () { clearTimeout(hideT); });
  fly.addEventListener('mouseleave', function () { hideFly(false); });
  nav.addEventListener('toggle', function () { if (!nav.open) hideFly(true); });

  document.addEventListener('click', function (e) {
    if (nav.open && !nav.contains(e.target) && !fly.contains(e.target)) nav.open = false;
    var sub = e.target.closest && (e.target.closest('.proto-nav a') || e.target.closest('.pn-flyout a'));
    if (sub) { nav.open = false; hideFly(true); }
  });
})();
