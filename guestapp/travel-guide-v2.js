/* AI Travel Guide V2 — prototype-only interactions. No business logic, no network.

   [data-tg-q]            a question fieldset; [data-tg-required], [data-tg-max="n"], [data-tg-single]
   [data-tg-generate]     stays aria-disabled until the 3 required answers exist;
                          pressing it while disabled flags + focuses the first gap
                          (the shipped button just sits there doing nothing)
   [data-tg-tabs]         phase tablist — roving tabindex, ←/→/Home/End, real tabpanels
   [data-tg-days]         day-of-stay tablist, same keyboard contract
   .tg-why-btn            "Why this pick" disclosure (aria-expanded ↔ [hidden])
   [data-tg-build]        elapsed clock + step ladder, restarted on every entry
   [data-tg-add]          "Add to stay" → Added, with a toast and a live announcement
   [data-tg-copy]         copy with a confirmation (label flip + toast)
   [data-tg-toast]        one-off confirmation toast
   [data-tg-scroll]       jump to a slot inside the current screen

   Screen activation is detected with a MutationObserver, so this composes with
   flow.js without either script knowing about the other. Everything is scoped to
   the device frame it lives in, so the mobile and desktop frames on the same page
   never fight over ids. Math.random and Date.now are avoided — the build ladder is
   a deterministic schedule, so two runs of the prototype look identical. */
(function () {
  var STEP_MS = [1600, 3800, 6200, 8200]; // when each step lights up
  var TOAST_MS = 2600;

  function frameOf(el) { return el.closest('.phone, .browser') || document; }
  function all(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

  function announce(frame, message) {
    var live = frame.querySelector('[data-tg-live]');
    if (!live) return;
    live.textContent = '';
    setTimeout(function () { live.textContent = message; }, 30);
  }

  /* ============================================================
     Questions — required vs optional, honestly counted
     ============================================================ */
  var REQUIRED = ['vacationStyle', 'budget', 'pace'];

  function answersOf(screen, id) {
    return all(screen, '[data-tg-q="' + id + '"] input:checked');
  }

  function syncQuestions(screen) {
    var frame = frameOf(screen);
    var answeredRequired = REQUIRED.filter(function (id) { return answersOf(screen, id).length > 0; });

    /* Meter: a segment lights for the question it belongs to — not for the
       Nth answer given, as the shipped `answeredCount` bar does. */
    all(screen, '[data-tg-seg]').forEach(function (seg) {
      var id = seg.getAttribute('data-tg-seg');
      seg.classList.toggle('on', answersOf(screen, id).length > 0);
    });

    var counter = screen.querySelector('[data-tg-count]');
    if (counter) {
      counter.innerHTML = '<b>' + answeredRequired.length + '</b> of 3 answered';
      counter.classList.toggle('is-ready', answeredRequired.length === 3);
    }

    /* Soft caps: once the cap is reached the remaining chips go disabled rather
       than silently evicting the guest's oldest pick (the shipped hook drops it). */
    all(screen, '[data-tg-max]').forEach(function (q) {
      var max = parseInt(q.getAttribute('data-tg-max'), 10);
      var chosen = all(q, 'input:checked').length;
      var full = chosen >= max;
      all(q, 'input').forEach(function (input) {
        if (!input.checked) input.disabled = full;
      });
      var cap = q.querySelector('[data-tg-cap]');
      if (cap) {
        cap.classList.toggle('is-full', full);
        if (full) cap.textContent = 'That’s ' + max + ' — unpick one to swap it.';
        else cap.textContent = 'Pick up to ' + max + (max === 3 ? ' — a narrower answer makes a sharper plan.' : '.');
      }
    });

    /* Clearing an answered question drops its error flag. */
    all(screen, '[data-tg-q]').forEach(function (q) {
      if (all(q, 'input:checked').length) q.classList.remove('is-error');
    });

    var ready = answeredRequired.length === 3;
    var btn = screen.querySelector('[data-tg-generate]');
    if (btn) {
      /* The button is never `disabled` and never `aria-disabled` — both hide it
         from assistive tech. flow.js navigates on [data-goto] at click time, so
         the attribute is the gate; without it, our own handler runs instead and
         explains what is missing. */
      var target = screen.id.charAt(2) === 'd' ? 'tgd-build' : 'tg-build';
      if (ready) btn.setAttribute('data-goto', target);
      else btn.removeAttribute('data-goto');
    }

    var missing = 3 - answeredRequired.length;
    var hint = screen.querySelector('[data-tg-hint] span');
    if (hint) {
      hint.textContent = ready
        ? 'Ready — building takes about a minute'
        : missing + (missing === 1 ? ' answer still needed' : ' answers still needed');
      hint.parentNode.classList.toggle('is-ready', ready);
    }
    var note = screen.querySelector('[data-tg-gen-note]');
    if (note) note.textContent = ready
      ? 'Ready. Building takes about a minute.'
      : 'Answer the three required questions first.';

    if (ready && counter && !screen.hasAttribute('data-tg-announced')) {
      screen.setAttribute('data-tg-announced', '');
      announce(frame, 'All three required questions answered. You can build your plan.');
    }
    if (!ready) screen.removeAttribute('data-tg-announced');
  }

  function flagGaps(screen) {
    var first = null;
    REQUIRED.forEach(function (id) {
      var q = screen.querySelector('[data-tg-q="' + id + '"]');
      if (!q) return;
      var empty = all(q, 'input:checked').length === 0;
      q.classList.toggle('is-error', empty);
      if (empty && !first) first = q;
    });
    if (first) {
      first.scrollIntoView({ block: 'center', behavior: 'smooth' });
      var input = first.querySelector('input');
      if (input) input.focus({ preventScroll: true });
      announce(frameOf(screen), 'Still missing: ' + first.querySelector('.tg-q-title').textContent);
    }
  }

  /* ============================================================
     Tabs — the ARIA pattern the shipped aria-pressed buttons never had
     ============================================================ */
  function selectTab(tablist, tab) {
    var tabs = all(tablist, '[role="tab"]');
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
  }

  function wireTablist(tablist) {
    tablist.addEventListener('keydown', function (e) {
      var tabs = all(tablist, '[role="tab"]');
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      e.preventDefault();
      selectTab(tablist, next);
      next.focus();
    });
  }

  /* ============================================================
     Build ladder — a deterministic schedule, an honest clock
     ============================================================ */
  var buildTimers = [];

  function stopBuild() {
    buildTimers.forEach(clearTimeout);
    buildTimers.forEach(clearInterval);
    buildTimers = [];
  }

  function markStep(steps, index, state) {
    var li = steps.querySelector('[data-tg-step="' + index + '"]');
    if (!li) return;
    li.classList.remove('now', 'done');
    if (state) li.classList.add(state);
  }

  function startBuild(screen) {
    stopBuild();
    var steps = screen.querySelector('[data-tg-steps]');
    var clock = screen.querySelector('[data-tg-elapsed]');
    if (!steps) return;

    for (var i = 0; i < 4; i++) markStep(steps, i, i === 0 ? 'now' : null);

    var seconds = 0;
    if (clock) clock.textContent = '0:00';
    var tick = setInterval(function () {
      seconds++;
      if (clock) clock.textContent = '0:' + (seconds < 10 ? '0' : '') + seconds;
    }, 1000);
    buildTimers.push(tick);

    STEP_MS.forEach(function (at, index) {
      buildTimers.push(setTimeout(function () {
        for (var j = 0; j <= index; j++) markStep(steps, j, 'done');
        if (index + 1 < 4) markStep(steps, index + 1, 'now');
        var label = steps.querySelector('[data-tg-step="' + index + '"] .tg-step-t');
        if (label) announce(frameOf(screen), label.textContent + ' — done.');
      }, at));
    });
  }

  /* ============================================================
     Toast
     ============================================================ */
  var toastTimer = null;
  function toast(frame, message) {
    var el = frame.querySelector('[data-tg-toast-el]');
    if (!el) return;
    var slot = el.querySelector('[data-tg-toast-text]');
    if (slot) slot.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, TOAST_MS);
  }

  /* ============================================================
     Wiring
     ============================================================ */
  document.addEventListener('change', function (e) {
    var input = e.target.closest('[data-tg-q] input');
    if (!input) return;
    var screen = input.closest('.flow-screen');
    if (screen) syncQuestions(screen);
  });

  document.addEventListener('click', function (e) {
    var el;
    var frame = frameOf(e.target);

    /* Generate — an unsatisfied press is a teaching moment, not a no-op. */
    if ((el = e.target.closest('[data-tg-generate]'))) {
      if (!el.hasAttribute('data-goto')) {
        e.preventDefault();
        flagGaps(el.closest('.flow-screen'));
      }
      return;
    }

    /* Skip — the answers are kept, so coming back is lossless. */
    if ((el = e.target.closest('[data-tg-skip]'))) {
      announce(frame, 'Building from your booking alone. Your answers are kept.');
      return;
    }

    if ((el = e.target.closest('[role="tab"]'))) {
      var tablist = el.closest('[role="tablist"]');
      if (tablist) { selectTab(tablist, el); return; }
    }

    if ((el = e.target.closest('.tg-why-btn'))) {
      var open = el.getAttribute('aria-expanded') === 'true';
      el.setAttribute('aria-expanded', open ? 'false' : 'true');
      var panel = document.getElementById(el.getAttribute('aria-controls'));
      if (panel) panel.hidden = open;
      return;
    }

    if ((el = e.target.closest('[data-tg-add]'))) {
      if (el.classList.contains('added')) return;
      el.classList.remove('primary');
      el.classList.add('added');
      el.innerHTML = '<svg viewBox="0 0 24 24" class="icon icon-sm" aria-hidden="true"><use href="#i-check"/></svg> Added to your stay';
      toast(frame, 'Added. You pay at check-out, not now.');
      announce(frame, 'Added to your stay. Nothing charged yet.');
      return;
    }

    if ((el = e.target.closest('[data-tg-copy]'))) {
      var label = el.querySelector('[data-tg-copy-label]');
      var original = label ? label.textContent : '';
      if (label) label.textContent = 'Copied';
      toast(frame, 'Copied to your clipboard');
      announce(frame, 'Copied.');
      setTimeout(function () { if (label) label.textContent = original; }, TOAST_MS);
      return;
    }

    if ((el = e.target.closest('[data-tg-toast]'))) {
      toast(frame, el.getAttribute('data-tg-toast'));
      announce(frame, el.getAttribute('data-tg-toast'));
      return;
    }

    if ((el = e.target.closest('[data-tg-scroll]'))) {
      var target = document.getElementById(el.getAttribute('data-tg-scroll'));
      if (target) target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
  });

  /* Escape closes any open sheet — modals.js only wires the scrim and ✕. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    all(document, '.proto-modal.open').forEach(function (m) { m.classList.remove('open'); });
  });

  /* ============================================================
     Screen activation — composes with flow.js, which knows nothing of this
     ============================================================ */
  function onScreenActive(screen) {
    if (screen.querySelector('[data-tg-build]')) startBuild(screen);
    else stopBuild();
    if (screen.querySelector('[data-tg-q]')) syncQuestions(screen);
  }

  function init() {
    all(document, '[role="tablist"]').forEach(wireTablist);
    all(document, '.flow-screen').forEach(function (screen) {
      if (screen.querySelector('[data-tg-q]')) syncQuestions(screen);
      if (screen.classList.contains('active')) onScreenActive(screen);
    });

    var observer = new MutationObserver(function (records) {
      records.forEach(function (record) {
        var el = record.target;
        if (el.classList && el.classList.contains('flow-screen') && el.classList.contains('active')) {
          onScreenActive(el);
        }
      });
    });
    all(document, '.flow-screen').forEach(function (screen) {
      observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
