/* Floating prototype switcher — injected on every page.
   Flow pages expose sub-entries (scenarios) that deep-link via #hash;
   flow.js picks the hash up and jumps straight to that scenario. */
(function () {
  // Organized by FEATURE. Under each feature, mobile (📱) and desktop (🖥)
  // sit together so the two form factors are never scattered across sections.
  var PAGES = [
    { group: 'Overview', items: [
      { file: 'index.html', label: 'Overview & rationale', icon: '⌂' },
    ]},
    { group: 'Home', items: [
      { file: 'home.html', label: 'Home — mobile', icon: '📱' },
      { file: 'home-desktop.html', label: 'Home — desktop', icon: '🖥' },
    ]},
    { group: 'Identity verification', items: [
      { file: 'flow-iv-mobile.html', label: 'IV flow — mobile', icon: '📱', subs: [
        { hash: 's-start', label: 'Full flow (passport / ID card)' },
        { hash: 's-qr-scan', label: 'Continue from desktop (QR)' },
        { hash: 's-crop', label: 'Upload — crop & confirm' },
        { hash: 's-front-failed', label: 'Validation failed' },
        { hash: 's-denied', label: 'Camera denied' },
        { hash: 's-live-1', label: 'Liveness sequence' },
        { hash: 's-contact-email', label: 'Contacts — email + SMS' },
        { hash: 's-unavailable', label: 'Outside check-in window' },
      ]},
      { file: 'flow-iv-desktop.html', label: 'IV flow — desktop', icon: '🖥', subs: [
        { hash: 'd-choice', label: 'Start — choose method' },
        { hash: 'd-qr', label: 'Continue on phone (QR)' },
        { hash: 'd-doc', label: 'Webcam — choose document' },
        { hash: 'd-cam', label: 'Webcam capture' },
        { hash: 'd-crop', label: 'Upload — crop & confirm' },
        { hash: 'd-contact-email', label: 'Contacts — email + SMS' },
        { hash: 'd-front-failed', label: 'Validation failed' },
        { hash: 'd-cam-denied', label: 'Webcam blocked' },
        { hash: 'd-unavailable', label: 'Outside check-in window' },
        { hash: 'd-upload', label: 'Upload view (deprecated)' },
      ]},
    ]},
    { group: 'Guest registration', items: [
      { file: 'flow-registration.html', label: 'Registration flow — mobile', icon: '📱', subs: [
        { hash: 'r-hub', label: 'Full flow' },
        { hash: 'r-details', label: 'Add details' },
        { hash: 'r-review', label: 'Review & sign' },
        { hash: 'r-done', label: 'Hub — guest without IV' },
      ]},
      { file: 'guest-registration-desktop.html', label: 'Registration — desktop', icon: '🖥' },
    ]},
    { group: 'Registration complete', items: [
      { file: 'flow-registered-modal.html', label: 'Registered modal + offers', icon: '▶', subs: [
        { hash: 'dm-loading', label: 'Full flow — with offers' },
        { hash: 'dm-offers', label: 'Offer stack' },
        { hash: 'dm-cart', label: 'Cart summary' },
        { hash: 'dm-empty-loading', label: 'No offers — full sequence' },
        { hash: 'dm-empty', label: 'No offers — registered' },
        { hash: 'dm-plain-loading', label: 'Upselling disabled' },
        { hash: 'dm-error', label: 'Submission failed' },
      ]},
    ]},
    { group: 'Payments', items: [
      { file: 'flow-payments-mobile.html', label: 'Payments flow — mobile', icon: '📱', subs: [
        { hash: 'p-cart', label: 'Full flow (cart → pay → receipt)' },
        { hash: 'p-later', label: 'Pay later' },
        { hash: 'p-form', label: 'Card form' },
        { hash: 'p-3ds', label: 'Bank confirmation (3-D Secure)' },
        { hash: 'p-error', label: 'Payment failed' },
        { hash: 'p-slow', label: 'Slow confirmation' },
        { hash: 'p-history', label: 'Order history' },
        { hash: 'p-empty', label: 'Empty cart' },
        { hash: 'p-deposit', label: 'Deposit chooser' },
      ]},
      { file: 'flow-payments-desktop.html', label: 'Payments flow — desktop', icon: '🖥', subs: [
        { hash: 'pd-cart', label: 'Full flow (cart → pay → receipt)' },
        { hash: 'pd-form', label: 'Card form' },
        { hash: 'pd-error', label: 'Payment failed' },
        { hash: 'pd-history', label: 'Order history' },
        { hash: 'pd-deposit', label: 'Deposit chooser' },
      ]},
    ]},
    { group: 'Tourist taxes', items: [
      { file: 'flow-taxes-mobile.html', label: 'Taxes flow — mobile', icon: '📱', subs: [
        { hash: 't-setup', label: 'Full flow (setup → cart)' },
        { hash: 't-exemption', label: 'Add exemption' },
        { hash: 't-newguest', label: 'New guest with exemption' },
        { hash: 't-added', label: 'Exemption added' },
        { hash: 't-edit', label: 'From payments cart' },
        { hash: 't-empty', label: 'Age-priced region (no exemptions)' },
        { hash: 't-paid', label: 'Taxes paid (locked)' },
      ]},
      { file: 'flow-taxes-desktop.html', label: 'Taxes flow — desktop', icon: '🖥', subs: [
        { hash: 'td-setup', label: 'Full flow (setup → cart)' },
        { hash: 'td-exemption', label: 'Add exemption' },
        { hash: 'td-edit', label: 'From payments cart' },
        { hash: 'td-paid', label: 'Taxes paid (locked)' },
      ]},
    ]},
    { group: 'Upselling', items: [
      { file: 'flow-upselling-mobile.html', label: 'Upselling flow — mobile', icon: '📱', subs: [
        { hash: 'u-list', label: 'Full flow (browse → book → cart)' },
        { hash: 'u-detail', label: 'Instant offer — add to cart' },
        { hash: 'u-request', label: 'On-request offer — host approval' },
        { hash: 'u-track', label: 'My requests & cart' },
        { hash: 'u-rejected', label: 'Request declined' },
        { hash: 'u-empty', label: 'No extras' },
      ]},
      { file: 'flow-upselling-desktop.html', label: 'Upselling flow — desktop', icon: '🖥', subs: [
        { hash: 'ud-list', label: 'Full flow (browse → book → cart)' },
        { hash: 'ud-detail', label: 'Instant offer — booking box' },
        { hash: 'ud-request', label: 'On-request offer — host approval' },
        { hash: 'ud-track', label: 'My requests & cart' },
        { hash: 'ud-rejected', label: 'Request declined' },
      ]},
    ]},
    { group: 'FAQ & language', items: [
      { file: 'flow-faq-mobile.html', label: 'FAQ & language — mobile', icon: '📱', subs: [
        { hash: 'h-faq', label: 'FAQ page' },
        { hash: 'h-search', label: 'Search with matches' },
        { hash: 'h-empty', label: 'No results' },
        { hash: 'h-lang', label: 'Language sheet' },
        { hash: 'h-es', label: 'Switched to Español' },
      ]},
      { file: 'flow-faq-desktop.html', label: 'FAQ & language — desktop', icon: '🖥', subs: [
        { hash: 'hd-faq', label: 'FAQ page' },
        { hash: 'hd-search', label: 'Search with matches' },
        { hash: 'hd-lang', label: 'Language dialog' },
        { hash: 'hd-es', label: 'Switched to Español' },
      ]},
    ]},
    { group: 'Building blocks', items: [
      { file: 'vela.html', label: 'Vela helper', icon: '✦' },
      { file: 'modals-demo.html', label: 'Modals & overlays', icon: '▣' },
      { file: 'scroll-demo.html', label: 'Scroll behavior', icon: '↕' },
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
