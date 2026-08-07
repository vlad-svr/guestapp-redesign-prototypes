/* AI Travel Guide V3 — prototype-only interactions. No business logic, no network.

   [data-t3-q]           the step's question group; [data-t3-min="n"], [data-t3-max="n"]
   [data-t3-continue]    the step's Continue — gated by data-t3-min; while unsatisfied it
                         has no [data-goto], and pressing it explains what is missing
                         instead of doing nothing (data-t3-goto names the target)
   [data-t3-other]       the "Other…" free-text chip — typing counts as one pick
   [role="tablist"]      phase / day tabs — roving tabindex, ←/→/Home/End, real panels
   [data-t3-build]       elapsed clock + step ladder + progress bar, restarted on entry
   [data-t3-dismiss]     fades the slot out (the app's dismiss mutation)
   [data-t3-add]         "Add to cart" → Added, with a toast
   [data-t3-toast]       one-off confirmation toast

   Screen activation is detected with a MutationObserver so this composes with
   flow.js without either script knowing about the other. Everything is scoped
   to the device frame it lives in. Math.random and Date.now are avoided — the
   build ladder is a deterministic schedule. */
(function () {
  var STEP_MS = [1600, 3800, 6200, 8200]; // when each build step completes
  var BAR_PCT = [12, 37, 62, 87];         // (i + 0.5) / 4 — the app's formula
  var TOAST_MS = 2600;

  function frameOf(el) { return el.closest('.phone, .browser') || document; }
  function all(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

  function announce(frame, message) {
    var live = frame.querySelector('[data-t3-live]');
    if (!live) return;
    live.textContent = '';
    setTimeout(function () { live.textContent = message; }, 30);
  }

  /* ============================================================
     Questions — one per step, Continue gated by the step's minimum
     ============================================================ */
  function pickCount(q) {
    var n = all(q, 'input:checked').length;
    var other = q.querySelector('[data-t3-other]');
    if (other && other.value.trim()) n += 1;
    return n;
  }

  function syncStep(screen) {
    var groups = all(screen, '[data-t3-q]');
    if (!groups.length) return;

    /* Soft caps, on every group the screen carries (desktop stacks all four):
       at the cap the remaining chips disable rather than silently evicting
       the guest's oldest pick (the shipped hook drops it). */
    groups.forEach(function (q) {
      var max = parseInt(q.getAttribute('data-t3-max') || '0', 10);
      if (!max) return;
      var full = all(q, 'input[type="checkbox"]:checked').length >= max;
      all(q, 'input[type="checkbox"]').forEach(function (input) {
        if (!input.checked) input.disabled = full;
      });
      var cap = q.querySelector('[data-t3-cap]');
      if (cap) {
        cap.hidden = false;
        cap.classList.toggle('is-full', full);
        cap.textContent = full
          ? 'That’s ' + max + ' — unpick one to swap it.'
          : 'Pick up to ' + max + '.';
      }
    });

    /* The gate belongs to the step's own question — the mobile screens carry
       exactly one; the desktop screen has no [data-t3-continue] at all. */
    var q = groups[0];
    var min = parseInt(q.getAttribute('data-t3-min') || '0', 10);
    var ready = pickCount(q) >= min;
    var btn = screen.querySelector('[data-t3-continue]');
    if (btn) {
      /* Never `disabled` — a disabled submit is unreachable to a screen reader
         and explains nothing. flow.js navigates on [data-goto] at click time,
         so the attribute is the gate. */
      if (ready) btn.setAttribute('data-goto', btn.getAttribute('data-t3-goto'));
      else btn.removeAttribute('data-goto');
    }

    var hint = screen.querySelector('[data-t3-hint]');
    if (hint) {
      hint.classList.toggle('is-ready', ready && min > 0);
      var slot = hint.querySelector('span');
      if (slot && min > 0) {
        if (ready) slot.textContent = 'Ready — building takes about a minute.';
        else if (!hint.hasAttribute('data-t3-hint-default')) {
          hint.setAttribute('data-t3-hint-default', slot.textContent);
        }
        if (!ready) slot.textContent = hint.getAttribute('data-t3-hint-default') || slot.textContent;
      }
    }
  }

  function flagGap(screen) {
    var q = screen.querySelector('[data-t3-q]');
    var hint = screen.querySelector('[data-t3-hint]');
    if (hint) {
      hint.style.color = 'var(--red-500)';
      setTimeout(function () { hint.style.color = ''; }, 1600);
    }
    if (q) {
      var input = q.querySelector('input');
      if (input) input.focus({ preventScroll: true });
      q.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    var slot = hint && hint.querySelector('span');
    announce(frameOf(screen), slot ? slot.textContent : 'An answer is still needed.');
  }

  /* ============================================================
     Tabs — roving tabindex, arrow keys, real tabpanels
     ============================================================ */
  function selectTab(tablist, tab) {
    all(tablist, '[role="tab"]').forEach(function (t) {
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
    var li = steps.querySelector('[data-t3-step="' + index + '"]');
    if (!li) return;
    li.classList.remove('now', 'done');
    if (state) li.classList.add(state);
  }

  function startBuild(screen) {
    stopBuild();
    var steps = screen.querySelector('[data-t3-steps]');
    var clock = screen.querySelector('[data-t3-elapsed]');
    var bar = screen.querySelector('[data-t3-bar]');
    if (!steps) return;

    for (var i = 0; i < 4; i++) markStep(steps, i, i === 0 ? 'now' : null);
    if (bar) bar.style.width = BAR_PCT[0] + '%';

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
        if (index + 1 < 4) {
          markStep(steps, index + 1, 'now');
          if (bar) bar.style.width = BAR_PCT[index + 1] + '%';
        } else if (bar) {
          bar.style.width = '100%';
        }
        var label = steps.querySelector('[data-t3-step="' + index + '"] .t3-step-t');
        if (label) announce(frameOf(screen), label.textContent + ' — done.');
      }, at));
    });
  }

  /* ============================================================
     Toast
     ============================================================ */
  var toastTimer = null;
  function toast(frame, message) {
    var el = frame.querySelector('[data-t3-toast-el]');
    if (!el) return;
    var slot = el.querySelector('[data-t3-toast-text]');
    if (slot) slot.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, TOAST_MS);
  }

  /* ============================================================
     Wiring
     ============================================================ */
  document.addEventListener('change', function (e) {
    var input = e.target.closest('[data-t3-q] input');
    if (!input) return;
    var screen = input.closest('.flow-screen');
    if (screen) syncStep(screen);
  });
  document.addEventListener('input', function (e) {
    var other = e.target.closest('[data-t3-other]');
    if (!other) return;
    other.style.width = Math.max(7, Math.min(other.value.length + 2, 20)) + 'ch';
    var screen = other.closest('.flow-screen');
    if (screen) syncStep(screen);
  });

  document.addEventListener('click', function (e) {
    var el;
    var frame = frameOf(e.target);

    /* Continue — an unsatisfied press is a teaching moment, not a no-op. */
    if ((el = e.target.closest('[data-t3-continue]'))) {
      if (!el.hasAttribute('data-goto')) {
        e.preventDefault();
        flagGap(el.closest('.flow-screen'));
      }
      return;
    }

    /* Skip — the answers are kept, so coming back is lossless. */
    if ((el = e.target.closest('[data-t3-skip]'))) {
      announce(frame, 'Building from your booking alone. Your answers are kept.');
      return;
    }

    if ((el = e.target.closest('[role="tab"]'))) {
      var tablist = el.closest('[role="tablist"]');
      if (tablist) { selectTab(tablist, el); return; }
    }

    /* Dismiss — the slot fades, then leaves the flow (display:none), so the
       time-of-day group closes up the way the app's list re-render does. */
    if ((el = e.target.closest('[data-t3-dismiss]'))) {
      var slot = el.closest('.t3-slot');
      if (slot) {
        slot.classList.add('is-dismissed');
        setTimeout(function () { slot.style.display = 'none'; }, 300);
      }
      toast(frame, 'Removed from your plan');
      announce(frame, 'Removed from your plan.');
      return;
    }

    if ((el = e.target.closest('[data-t3-add]'))) {
      if (el.classList.contains('added')) return;
      el.classList.add('added');
      el.innerHTML = '<svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><use href="#i-check"/></svg> Added';
      toast(frame, 'Added. You pay at check-out, not now.');
      announce(frame, 'Added to your cart. Nothing charged yet.');
      return;
    }

    if ((el = e.target.closest('[data-t3-toast]'))) {
      toast(frame, el.getAttribute('data-t3-toast'));
      announce(frame, el.getAttribute('data-t3-toast'));
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
    if (screen.querySelector('[data-t3-build]')) startBuild(screen);
    else stopBuild();
    if (screen.querySelector('[data-t3-q]')) syncStep(screen);
  }

  function init() {
    all(document, '[role="tablist"]').forEach(wireTablist);
    all(document, '.flow-screen').forEach(function (screen) {
      if (screen.querySelector('[data-t3-q]')) syncStep(screen);
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
