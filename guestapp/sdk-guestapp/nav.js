/* Floating prototype switcher for the Guest SDK prototype.
   Trimmed sibling of ../nav.js — same idea (fixed pill, grouped links,
   hover flyout with per-flow scenarios that deep-link via #hash; flow.js
   picks the hash up and jumps straight to that screen). */
(function () {
  var PAGES = [
    { group: 'Overview', items: [
      { file: 'index.html', label: 'Overview & principles', icon: '⌂' },
    ]},
    { group: 'Core check-in', items: [
      { file: 'flow-home.html', label: 'Home hub (mode: ALL)', icon: '▦', subs: [
        { hash: 'h-hub', label: 'Checklist — in progress' },
        { hash: 'h-loading', label: 'Loading (skeleton)' },
        { hash: 'h-done', label: 'All steps complete' },
      ]},
      { file: 'flow-guests.html', label: 'Guests summary', icon: '◫', subs: [
        { hash: 'gu-list', label: 'Guest list — 2 of 4' },
        { hash: 'gu-empty', label: 'No guests yet' },
        { hash: 'gu-complete', label: 'Everyone registered' },
        { hash: 'gu-noremove', label: 'Removal disabled (config)' },
      ]},
      { file: 'flow-guest-form.html', label: 'Guest form (ONLY_GUEST_FORM)', icon: '✎', subs: [
        { hash: 'f-form', label: 'Full form' },
        { hash: 'f-police', label: 'Police fields (Cataluña)' },
        { hash: 'f-hidden', label: 'hiddenSections variant' },
        { hash: 'f-prefill', label: 'prefillData variant' },
        { hash: 'f-signature', label: 'Signature' },
        { hash: 'f-success', label: 'Registered' },
      ]},
      { file: 'flow-autofill.html', label: 'Autofill by OCR', icon: '⌗', subs: [
        { hash: 'a-choice', label: 'Scan or type' },
        { hash: 'a-camera', label: 'Capture document' },
        { hash: 'a-processing', label: 'Reading (MRZ)' },
        { hash: 'a-review', label: 'Review extracted data' },
        { hash: 'a-fail', label: 'Could not read' },
      ]},
    ]},
    { group: 'Identity verification', items: [
      { file: 'flow-iv.html', label: 'Identity verification (IV_ONLY)', icon: '▣', subs: [
        { hash: 'iv-start', label: 'Start & consent' },
        { hash: 'iv-doc', label: 'Choose document' },
        { hash: 'iv-front', label: 'Front capture' },
        { hash: 'iv-selfie', label: 'Selfie / liveness' },
        { hash: 'iv-processing', label: 'Verifying' },
        { hash: 'iv-done', label: 'Verified' },
        { hash: 'iv-fail', label: 'Failed → retry' },
        { hash: 'iv-contacts', label: 'Contact verification' },
      ]},
      { file: 'flow-iv-qr.html', label: 'IV — QR handoff to phone', icon: '⧉', subs: [
        { hash: 'q-qr', label: 'Continue on your phone' },
        { hash: 'q-waiting', label: 'Waiting — live status' },
        { hash: 'q-done', label: 'Verified, synced back' },
      ]},
      { file: 'flow-qr-property.html', label: 'QR-IV on property', icon: '⌘', subs: [
        { hash: 'p-landing', label: 'Scanned at the property' },
        { hash: 'p-name', label: 'Find booking by name' },
        { hash: 'p-pick', label: 'Pick your booking' },
        { hash: 'p-verify', label: 'Verify identity' },
        { hash: 'p-done', label: 'Done' },
      ]},
    ]},
    { group: 'Reservation entry', items: [
      { file: 'flow-property-link.html', label: 'Property link (PROPERTY_LINK)', icon: '⚲', subs: [
        { hash: 'pl-welcome', label: 'Property welcome' },
        { hash: 'pl-code', label: 'Booking code' },
        { hash: 'pl-date', label: 'Check-in date' },
        { hash: 'pl-found', label: 'Booking found' },
        { hash: 'pl-create', label: 'Create a new booking' },
      ]},
    ]},
    { group: 'Stay', items: [
      { file: 'flow-guidebooks.html', label: 'Guidebooks & FAQ', icon: '❏', subs: [
        { hash: 'gb-list', label: 'Guidebooks list' },
        { hash: 'gb-guide', label: 'House manual' },
        { hash: 'gb-pdf', label: 'PDF guidebook' },
        { hash: 'gb-faq', label: 'FAQ' },
        { hash: 'gb-empty', label: 'Nothing here yet' },
      ]},
      { file: 'flow-remote-access.html', label: 'Remote access & keys', icon: '⌂', subs: [
        { hash: 'ra-locked', label: 'Locked until steps done' },
        { hash: 'ra-keys', label: 'Your keys' },
        { hash: 'ra-open', label: 'Opening the door' },
        { hash: 'ra-error', label: 'Lock unreachable' },
      ]},
    ]},
    { group: 'Cross-cutting', items: [
      { file: 'flow-errors.html', label: 'Errors & recovery', icon: '△', subs: [
        { hash: 'e-apikey', label: 'Invalid API key (dev)' },
        { hash: 'e-connection', label: 'Connection lost' },
        { hash: 'e-notfound', label: 'Reservation not found' },
        { hash: 'e-crash', label: 'Something went wrong' },
      ]},
    ]},
  ];

  var current = location.pathname.split('/').pop() || 'index.html';

  var css = [
    '.proto-nav{position:fixed;bottom:18px;right:18px;z-index:9999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '.proto-nav summary{list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 17px;border-radius:99px;background:#161643;border:1px solid rgba(255,255,255,0.12);color:#fff;font-size:12.5px;font-weight:600;box-shadow:0 10px 26px rgba(51,51,79,0.35);user-select:none}',
    '.proto-nav summary::-webkit-details-marker{display:none}',
    '.proto-nav summary:hover{background:#33334f}',
    '.proto-nav summary .pn-dot{width:8px;height:8px;border-radius:50%;background:#8ca5ff}',
    '.proto-nav .pn-menu{position:absolute;bottom:52px;right:0;width:390px;max-width:calc(100vw - 36px);border-radius:12px;background:#fff;border:1px solid #e5e6ee;box-shadow:0 18px 44px rgba(51,51,79,0.22);padding:10px;max-height:76vh;overflow-y:auto}',
    '.proto-nav .pn-group{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:#9696b9;padding:10px 10px 5px}',
    '.proto-nav a{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;font-size:12.5px;font-weight:600;color:#161643;text-decoration:none}',
    '.proto-nav a:hover{background:#f2f3f7}',
    '.proto-nav a.active{background:#e3efff;color:#385bf8;box-shadow:inset 0 0 0 1px rgba(56,91,248,0.3)}',
    '.proto-nav a .pn-ic{width:20px;text-align:center;flex-shrink:0;font-size:13px;color:#6b6b95}',
    '.proto-nav a .pn-label{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.proto-nav a .pn-badge{flex-shrink:0;margin-left:6px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#385bf8;background:#e3efff;border-radius:99px;padding:2px 7px}',
    '.proto-nav a.active .pn-badge{background:#fff}',
    '.proto-nav a .pn-more{flex-shrink:0;margin-left:6px;color:#9696b9;font-size:12px}',
    '.pn-flyout{position:fixed;z-index:10000;display:none;width:240px;border-radius:10px;background:#fff;border:1px solid #e5e6ee;box-shadow:0 14px 36px rgba(51,51,79,0.22);padding:8px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '.pn-flyout .pn-fly-title{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:#9696b9;padding:8px 10px 5px}',
    '.pn-flyout a.pn-sub{display:flex;align-items:center;gap:8px;padding:7px 10px;font-size:11.5px;font-weight:500;color:#6b6b95;border-radius:7px;text-decoration:none}',
    '.pn-flyout a.pn-sub:hover{color:#385bf8;background:#f2f3f7}',
    '.pn-flyout a.pn-sub .pn-dot2{width:5px;height:5px;border-radius:50%;background:#cecede;flex-shrink:0}',
    '.pn-flyout a.pn-sub:hover .pn-dot2{background:#385bf8}',
    '.proto-nav .pn-note{margin:6px 4px 2px;padding:9px 10px;border-top:1px solid #ececf3;font-size:10.5px;font-weight:500;color:#6b6b95;line-height:1.45}',
    '.proto-nav .pn-note a{display:inline;padding:0;color:#385bf8;font-weight:700}',
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
        '<span class="pn-ic">' + p.icon + '</span><span class="pn-label">' + p.label + '</span>' +
        (active ? '<span class="pn-badge">viewing</span>' : '') +
        (p.subs ? '<span class="pn-more">‹</span>' : '') + '</a>';
      if (p.subs) {
        var fly = '<div class="pn-fly-title">Screens</div>';
        p.subs.forEach(function (s) {
          fly += '<a class="pn-sub" href="' + p.file + '#' + s.hash + '"><span class="pn-dot2"></span>' + s.label + '</a>';
        });
        FLY[p.file] = fly;
      }
    });
  });
  menu += '<div class="pn-note">Guest <b>SDK · guestapp style</b> — same pages as the <a href="../sdk/index.html">neutral variant</a>, different shared.css. The guestapp redesign prototype lives <a href="../index.html">one folder up</a>.</div>';

  var nav = document.createElement('details');
  nav.className = 'proto-nav';
  nav.innerHTML = '<summary><span class="pn-dot"></span> SDK · guestapp style</summary><div class="pn-menu">' + menu + '</div>';
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
    if (a) showFly(a); else hideFly(false);
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
