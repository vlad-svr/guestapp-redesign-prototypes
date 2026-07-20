/* ══════════════════════════════════════════════════════════════════════════
   Splash screen V2 — prototype-only interactions. No business logic.

   Composes with flow.js without either knowing about the other: a
   MutationObserver watches `.active` landing on a `.flow-screen` and (re)runs
   that screen's ladder. Same trick as search-v2.js / travel-guide-v2.js.

   Deterministic by construction — no Date.now(), no Math.random(). Every
   number below is a timeout offset, so a replay is byte-identical to the
   first run and the two phones can be compared frame for frame.

   The four constants ARE the proposal. They are the whole behavioural
   change, and they are mirrored in SPEC.md §36.2.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  /* ── Timing contract ─────────────────────────────────────────────────────
     MIN_VISIBLE  a splash that flashes for 90 ms is worse than none, so it is
                  held this long — and not one frame longer.
     QUIET        below this, say nothing. Narrating a 600 ms load is noise.
     SLOW         above this, admit it, show the elapsed clock, offer a retry.
     WATCHDOG     above this, stop pretending. Render the error state with
                  real exits. Today there is no watchdog at all: a hung auth
                  request leaves the splash up forever.
     Today's shipped equivalent is a single constant —
     SHOW_MODAL_AFTER_SPLASH_TIMEOUT = 5000 — applied *after* the data has
     already arrived. Total splash time today is `load + 5000ms`, unbounded
     above. Total here is `max(load, 500ms)`, bounded by WATCHDOG.
     ────────────────────────────────────────────────────────────────────── */
  var MIN_VISIBLE = 500;
  var QUIET = 1200;
  var SLOW = 6000;
  var WATCHDOG = 20000;

  var HANDOFF = 340; // must match .sp-stage transition in splash-v2.css

  /* ── Ladders ─────────────────────────────────────────────────────────────
     `p` is the ring fill, 0…1. It eases toward 0.9 and is only ever written
     to 1.0 by a step that also carries `ready: true`. The ring cannot claim
     a completion the network hasn't delivered.
     ────────────────────────────────────────────────────────────────────── */
  var LADDERS = {
    /* The 90 % case. Silent, sub-second, gone before QUIET elapses. */
    fast: [
      { at: 0,   p: 0.12, indeterminate: true },
      { at: 220, p: 0.55, indeterminate: false },
      { at: 480, p: 0.88 },
      { at: 720, p: 1, ready: true, announce: 'Your check-in is ready.' },
    ],

    /* A real 3G morning. The stage line appears only once we pass QUIET, and
       the copy names the thing being fetched rather than saying "Loading…". */
    slow: [
      { at: 0,    p: 0.08, indeterminate: true },
      { at: 700,  p: 0.24, indeterminate: false },
      { at: QUIET, line: 'Connecting…', announce: 'Connecting.' },
      { at: 2400, p: 0.52, line: 'Loading your check-in', announce: 'Loading your check-in.' },
      { at: 4200, p: 0.78, line: 'Almost ready' },
      { at: 5200, p: 0.9 }, /* and there it stops — honest, not 99 % forever */
      { at: SLOW, slow: true, line: 'This is taking longer than usual', announce: 'This is taking longer than usual. You can keep waiting or try again.' },
      { at: WATCHDOG, watchdog: true },
    ],

    /* The same screen, fast-forwarded to the moment it admits it is slow. */
    longer: [
      { at: 0, p: 0.9, slow: true, line: 'This is taking longer than usual', elapsedFrom: 6.4, announce: 'This is taking longer than usual. You can keep waiting or try again.' },
      { at: WATCHDOG - SLOW, watchdog: true },
    ],

    /* Branding resolved to a light host theme — the ink set inverts with it.
       Still sub-second. */
    brand: [
      { at: 0,   p: 0.14, indeterminate: true },
      { at: 260, p: 0.5, indeterminate: false, branded: true, theme: 'on-light', announce: 'Casa Valencia check-in.' },
      { at: 620, p: 0.9 },
      { at: 900, p: 1, ready: true },
    ],

    /* splash_screen_enabled === false. There is no splash surface at all —
       but there is still a skeleton. What there must never be is the thing
       that ships today: no splash on first paint, half the app rendered, and
       then the splash slamming down on top once branding resolves. */
    off: [
      { at: 620, ready: true, announce: 'Your check-in is ready.' },
    ],

    /* Terminal states: no progress, no ladder. */
    error: [],
    offline: [],
  };

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  function frameOf(el) { return el.closest('.phone, .browser, .sp-kiosk') || document; }

  /* The elapsed-time pill is prototype instrumentation, so it lives in the
     caption *outside* the device frame — one per column, shared by every
     scenario screen inside it. Everything else is scoped to the screen. */
  function scopeOf(el) { return el.closest('.phone-col, .sp-col') || document; }

  function announce(scope, message) {
    if (!message) return;
    var live = scope.querySelector('[data-sp-live]');
    if (live) live.textContent = message;
  }

  /* Every screen carries its own live region, so a bare
     `frame.querySelector('[data-sp-live]')` would write into whichever screen
     happens to come first in the DOM — usually an inactive one, where no
     screen reader will ever read it. Resolve to the screen the element is in. */
  function announceFrom(el, message) {
    announce(el.closest('.flow-screen') || frameOf(el), message);
  }

  function fmt(seconds) { return seconds.toFixed(1) + 's'; }

  /* ── Runner ──────────────────────────────────────────────────────────── */
  var timers = [];        // pending step timeouts for the active screen
  var clockTimer = null;

  function clearAll() {
    timers.forEach(clearTimeout);
    timers = [];
    if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
  }

  function startClock(screen, fromSeconds) {
    var clock = scopeOf(screen).querySelector('[data-sp-clock-value]');
    var elapsed = screen.querySelector('[data-sp-elapsed]');
    var t = fromSeconds || 0;
    if (clock) clock.textContent = fmt(t);
    if (elapsed) elapsed.textContent = fmt(t);
    clockTimer = setInterval(function () {
      t += 0.1;
      if (clock) clock.textContent = fmt(t);
      if (elapsed) elapsed.textContent = fmt(t);
    }, 100);
  }

  function stopClock(screen, state) {
    if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
    var pill = scopeOf(screen).querySelector('[data-sp-clock]');
    if (pill && state) pill.classList.add(state);
  }

  function applyStep(screen, step) {
    /* `stage` is absent on the splash-disabled screen — there is nothing to
       cover the skeleton with. Every write below is guarded accordingly. */
    var stage = screen.querySelector('[data-sp-stage]');
    var under = screen.querySelector('[data-sp-under]');
    var ring = screen.querySelector('[data-sp-ring]');
    var line = screen.querySelector('[data-sp-line]');

    if (typeof step.p === 'number' && ring) ring.style.setProperty('--sp-p', step.p);
    if (typeof step.indeterminate === 'boolean' && ring) {
      ring.classList.toggle('is-indeterminate', step.indeterminate);
    }
    /* Branding arrives on the same round trip as auth, i.e. always after first
       paint. Today that reflows the logo and repaints the background under the
       guest. Here the host layer occupies a reserved box and cross-fades in
       once — one deliberate transition, no pop, no shift. */
    if (step.branded && stage) {
      stage.classList.add('branded');
      if (step.theme) stage.classList.add(step.theme);
    }

    if (step.line && line) {
      line.innerHTML = step.line;
      line.classList.add('is-shown');
    }

    /* Past SLOW: reveal the elapsed clock and the recovery affordances. The
       guest is now owed a choice, not a nicer spinner. */
    if (step.slow) {
      screen.querySelectorAll('[data-sp-when="slow"]').forEach(function (n) { n.hidden = false; });
      if (ring) ring.classList.add('is-indeterminate');
    }

    /* The watchdog. Today's component has no equivalent: with a hung auth
       request the splash never unmounts, because its only timer is gated
       behind the data having already arrived. */
    if (step.watchdog) {
      var target = screen.getAttribute('data-sp-watchdog');
      if (target && document.getElementById(target)) {
        announce(screen, 'We could not load your check-in.');
        location.hash = target;
      }
      return;
    }

    if (step.ready) handoff(screen, stage, under, step.at);
    announce(screen, step.announce);
  }

  /* The dissolve. The surface leaves, the mark travels to the header slot,
     and the skeleton it was covering becomes the real screen. There is never
     a frame of blank page between the two — which is the whole point.

     `heldMs` is how long the splash has *already* been on screen when the data
     lands. We top it up to MIN_VISIBLE and no further: a 720 ms load waits 0 ms,
     a 90 ms cache hit waits 410 ms so the mark doesn't strobe. */
  function handoff(screen, stage, under, heldMs) {
    var wait = Math.max(0, MIN_VISIBLE - (heldMs || 0));

    timers.push(setTimeout(function () {
      if (stage) stage.classList.add('is-gone');
      stopClock(screen, 'is-done');
      if (under) under.classList.add('is-live');

      /* Focus lands on the heading of the screen that arrived — the splash is
         a `role="status"` region and must not keep the focus ring. */
      timers.push(setTimeout(function () {
        var h = under && under.querySelector('[data-sp-focus]');
        if (h && screen.classList.contains('active')) h.focus({ preventScroll: true });
      }, stage ? HANDOFF : 0));
    }, wait));
  }

  function run(screen) {
    clearAll();

    var name = screen.getAttribute('data-sp-ladder');
    if (!name) return;
    var ladder = LADDERS[name] || [];

    /* Reset the screen to its first frame. */
    var stage = screen.querySelector('[data-sp-stage]');
    var under = screen.querySelector('[data-sp-under]');
    var ring = screen.querySelector('[data-sp-ring]');
    var line = screen.querySelector('[data-sp-line]');
    var pill = scopeOf(screen).querySelector('[data-sp-clock]');

    if (stage) stage.classList.remove('is-gone', 'branded', 'on-light');
    if (under) under.classList.remove('is-live');
    if (ring) { ring.style.setProperty('--sp-p', 0); ring.classList.remove('is-indeterminate'); }
    if (line) { line.textContent = ''; line.classList.remove('is-shown'); }
    if (pill) pill.classList.remove('is-done', 'is-bad');
    screen.querySelectorAll('[data-sp-when="slow"]').forEach(function (n) { n.hidden = true; });

    announce(screen, screen.getAttribute('data-sp-announce'));

    /* Terminal screens (error, offline): no ladder, no clock, and the mark is
       already a state mark rather than a progress ring. */
    if (!ladder.length) {
      var value = scopeOf(screen).querySelector('[data-sp-clock-value]');
      if (value) value.textContent = '—';
      return;
    }

    var first = ladder[0];
    startClock(screen, first.elapsedFrom || 0);

    ladder.forEach(function (step) {
      if (step.at === 0) applyStep(screen, step);
      else timers.push(setTimeout(function () { applyStep(screen, step); }, step.at));
    });
  }

  /* ── V1 replica ──────────────────────────────────────────────────────────
     Reproduces components/SplashScreen/SplashScreen.tsx faithfully:
       · curtains animate from mount, over 5 s, closed by 86 % (≈4.3 s)
       · the 5 s dismissal timer starts only once the data has ARRIVED
       · therefore total = load + 5000 ms, and everything between 4.3 s and
         that total is a solid rectangle of the brand colour
     `data-v1-load` is the simulated fetch time.
     ────────────────────────────────────────────────────────────────────── */
  var v1Timers = [];
  var v1Tick = null;

  function runV1(box) {
    v1Timers.forEach(clearTimeout);
    v1Timers = [];
    if (v1Tick) { clearInterval(v1Tick); v1Tick = null; }

    var load = parseInt(box.getAttribute('data-v1-load') || '750', 10);
    var total = load + 5000; // SHOW_MODAL_AFTER_SPLASH_TIMEOUT, started at ready
    var splash = box.querySelector('.v1-splash');
    var clockValue = box.querySelector('[data-v1-clock-value]');
    var pill = box.querySelector('[data-v1-clock]');
    var dead = box.querySelector('[data-v1-dead]');

    splash.classList.remove('is-gone', 'is-running');
    if (pill) pill.classList.remove('is-bad');
    if (dead) dead.hidden = true;
    void splash.offsetWidth; // restart the CSS animations
    splash.classList.add('is-running');

    var t = 0;
    if (clockValue) clockValue.textContent = fmt(0);
    v1Tick = setInterval(function () {
      t += 0.1;
      if (clockValue) clockValue.textContent = fmt(t);
    }, 100);

    /* Curtains are fully closed at 86 % of 5 s. From here to `total` the guest
       is looking at an opaque brand-coloured rectangle. */
    v1Timers.push(setTimeout(function () {
      if (dead) {
        dead.hidden = false;
        /* Round in integer deciseconds: (5750-4300)/1000 = 1.45, which is
           1.4499…  in binary, so .toFixed(1) would print "1.4s". */
        var slot = dead.querySelector('[data-v1-dead-value]');
        if (slot) slot.textContent = fmt(Math.round((total - 4300) / 100) / 10);
      }
    }, 4300));

    v1Timers.push(setTimeout(function () {
      if (v1Tick) { clearInterval(v1Tick); v1Tick = null; }
      splash.classList.add('is-gone');
      if (pill) pill.classList.add('is-bad');
      if (clockValue) clockValue.textContent = fmt(total / 1000);
    }, total));
  }

  /* ── Wiring ──────────────────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var el;

    if ((el = e.target.closest('[data-sp-retry]'))) {
      e.preventDefault();
      var to = el.getAttribute('data-sp-retry');
      announceFrom(el, 'Retrying.');
      if (to) location.hash = to;
      return;
    }

    if ((el = e.target.closest('[data-sp-copy]'))) {
      e.preventDefault();
      var original = el.getAttribute('data-sp-label') || el.textContent.trim();
      el.setAttribute('data-sp-label', original);
      el.textContent = '✓ Copied';
      announceFrom(el, 'Error reference copied to clipboard.');
      setTimeout(function () { el.textContent = original; }, 1800);
      return;
    }

    if ((el = e.target.closest('[data-v1-replay]'))) {
      e.preventDefault();
      var box = el.closest('[data-v1]');
      var load = el.getAttribute('data-v1-replay');
      if (load) box.setAttribute('data-v1-load', load);
      box.querySelectorAll('[data-v1-replay]').forEach(function (b) {
        b.classList.toggle('on', b === el);
      });
      runV1(box);
      return;
    }
  });

  /* ── Screen activation ───────────────────────────────────────────────── */
  function activeScreen() {
    return document.querySelector('.flow-screen.active[data-sp-ladder], .flow-screen.active[data-sp-announce]');
  }

  function onActivate() {
    var screen = activeScreen();
    if (screen) run(screen);
  }

  var observer = new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var t = records[i].target;
      if (t.classList && t.classList.contains('flow-screen') && t.classList.contains('active')) {
        run(t);
        return;
      }
    }
  });

  function boot() {
    document.querySelectorAll('.flow-screen').forEach(function (s) {
      observer.observe(s, { attributes: true, attributeFilter: ['class'] });
    });
    onActivate();
    document.querySelectorAll('[data-v1]').forEach(runV1);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.proto-modal.open').forEach(function (m) { m.classList.remove('open'); });
    }
  });

  var style = document.createElement('style');
  style.textContent = '[hidden]{display:none !important}';
  document.head.appendChild(style);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
