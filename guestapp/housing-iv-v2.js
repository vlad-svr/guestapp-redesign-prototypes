/* IV QR — prototype-only interactions. No business logic.

     [data-hv-announce="…"]  on a .flow-screen — its text is pushed into the
                             frame's aria-live region when the screen activates,
                             so a screen-reader user hears "Searching…",
                             "Reservation found", "We need one more detail".
     [data-hv-focus]         on a field inside a screen — receives focus when
                             that screen activates (never on the very first
                             paint, which would hijack the page on load).
     [data-hv-noop]          a <form> that must not actually submit.

   Screen activation is observed on .flow-screen[class] so this composes with
   flow.js (scenario chips, #hash deep links, Restart) without either script
   knowing about the other — the same trick search-v2.js uses. */
(function () {
  var firstPaint = true;

  function frameOf(el) { return el.closest('.phone, .browser') || document; }

  function announce(screen) {
    var msg = screen.getAttribute('data-hv-announce');
    if (!msg) return;
    var live = frameOf(screen).querySelector('[data-hv-live]');
    if (!live) return;
    // clear first: re-announcing identical text is otherwise dropped by AT
    live.textContent = '';
    setTimeout(function () { live.textContent = msg; }, 40);
  }

  function focusAsked(screen) {
    if (firstPaint) return;
    var target = screen.querySelector('[data-hv-focus]');
    if (target) setTimeout(function () { target.focus(); }, 120);
  }

  /* The flow crosses from the SDK page into the guest's own check-in session,
     so the browser-frame URL has to move with it — otherwise the desktop
     prototype claims every screen lives at /verify-on-housing. */
  function paintUrl(screen) {
    var url = screen.getAttribute('data-hv-url');
    if (!url) return;
    var slot = frameOf(screen).querySelector('[data-hv-urltext]');
    if (slot) slot.textContent = url;
  }

  function onActivate(screen) {
    announce(screen);
    paintUrl(screen);
    focusAsked(screen);
  }

  function watch() {
    var screens = document.querySelectorAll('.flow-screen');
    if (!screens.length) return;

    var observer = new MutationObserver(function (records) {
      records.forEach(function (r) {
        if (r.target.classList.contains('active')) onActivate(r.target);
      });
    });
    Array.prototype.forEach.call(screens, function (s) {
      observer.observe(s, { attributes: true, attributeFilter: ['class'] });
    });

    var live = document.querySelector('.flow-screen.active');
    if (live) onActivate(live);
    setTimeout(function () { firstPaint = false; }, 400);
  }

  document.addEventListener('submit', function (e) {
    if (e.target.closest('[data-hv-noop]')) e.preventDefault();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
  else watch();
})();
