/* Toast engine + touch popovers for toast-tooltip-demo.html.
   One spawn() for every toast in the system; the demo buttons
   ([data-toast="preset"]) only differ in the options they pass.
   Hosts live inside each .t-frame (phone or browser frame), so
   both devices run the same engine with different placement. */
(function () {
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ICONS = { success: 'i-check', info: 'i-info', warning: 'i-alert', error: 'i-alert', undo: 'i-undo' };

  function make(html) {
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  /* ---- lifecycle ---- */

  function spawn(host, o) {
    // Dedupe by id: the same event fired again pulses + re-arms the
    // existing toast instead of stacking a twin (mirrors toast ids in code).
    if (o.id) {
      var dup = host.querySelector('[data-tid="' + o.id + '"]');
      if (dup) { pulse(dup); rearm(dup); return dup; }
    }

    var kind = o.kind || 'info';
    var t = make('<div class="toast ' + kind + '" role="' + (kind === 'error' ? 'alert' : 'status') + '"></div>');
    if (o.id) t.setAttribute('data-tid', o.id);
    t.innerHTML =
      '<span class="t-icon"><svg viewBox="0 0 24 24" class="icon icon-sm"' + (kind === 'success' ? ' style="stroke-width:2.6"' : '') + '><use href="#' + (o.icon || ICONS[kind]) + '"/></svg></span>' +
      '<span class="t-body"><span class="t-title">' + o.title + '</span>' + (o.desc ? '<span class="t-desc">' + o.desc + '</span>' : '') + '</span>' +
      (o.action ? '<button class="t-act">' + (o.actionIcon ? '<svg viewBox="0 0 24 24" class="icon"><use href="#' + o.actionIcon + '"/></svg>' : '') + '<span class="t-act-label">' + o.action + '</span></button>' : '') +
      '<button class="t-close" aria-label="Dismiss"><svg viewBox="0 0 24 24" class="icon" style="width:13px;height:13px"><use href="#i-x"/></svg></button>';

    if (!o.sticky) arm(t, o.duration || 4200);
    t.querySelector('.t-close').addEventListener('click', function () { dismiss(t); });
    if (o.onAction) {
      t.querySelector('.t-act').addEventListener('click', function () { o.onAction(t); });
    }

    if (host.classList.contains('at-top')) {
      host.insertBefore(t, host.firstChild);
      enableSwipe(t);
    } else {
      host.appendChild(t);
    }
    trim(host);
    sync(host);
    return t;
  }

  /* Auto-dismiss is driven by the timer bar's animationend, so the CSS
     hover-pause IS the dismissal pause. Under reduced motion the bar is
     hidden and a plain timeout stands in. */
  function arm(t, ms) {
    if (REDUCED) {
      t._to = setTimeout(function () { dismiss(t); }, ms);
      return;
    }
    var bar = make('<i class="t-timer"></i>');
    bar.style.animationDuration = ms + 'ms';
    bar.addEventListener('animationend', function () { dismiss(t); });
    t.appendChild(bar);
    t._ms = ms;
  }

  function rearm(t) {
    if (REDUCED) { clearTimeout(t._to); arm(t, t._ms || 4200); return; }
    var bar = t.querySelector('.t-timer');
    if (!bar) return;
    var fresh = bar.cloneNode(false); // restart the animation
    fresh.addEventListener('animationend', function () { dismiss(t); });
    bar.replaceWith(fresh);
  }

  function pulse(t) {
    t.classList.remove('pulse');
    void t.offsetWidth;
    t.classList.add('pulse');
  }

  function dismiss(t) {
    if (t._gone) return;
    t._gone = true;
    clearTimeout(t._to);
    var host = t.closest('.toast-host');
    t.classList.add('leaving');
    setTimeout(function () {
      t.remove();
      if (host) sync(host);
    }, REDUCED ? 0 : 190);
  }

  // Stack cap: 3 visible. The oldest yields — a wall of toasts is noise.
  function trim(host) {
    var toasts = host.querySelectorAll('.toast:not(.leaving)');
    if (toasts.length <= 3) return;
    var oldest = host.classList.contains('at-top') ? toasts[toasts.length - 1] : toasts[0];
    dismiss(oldest);
  }

  function sync(host) {
    var n = host.querySelectorAll('.toast:not(.leaving)').length;
    host.classList.toggle('show-clear', n >= 2);
  }

  /* ---- swipe to dismiss (mobile host only) ---- */
  function enableSwipe(t) {
    var sx = 0, dx = 0, drag = false;
    t.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      drag = true; sx = e.clientX; dx = 0;
      t.setPointerCapture(e.pointerId);
      t.classList.add('dragging');
    });
    t.addEventListener('pointermove', function (e) {
      if (!drag) return;
      dx = e.clientX - sx;
      t.style.transform = 'translateX(' + dx + 'px)';
      t.style.opacity = Math.max(0.25, 1 - Math.abs(dx) / 200);
    });
    function end() {
      if (!drag) return;
      drag = false;
      t.classList.remove('dragging');
      if (Math.abs(dx) > 72) {
        t.classList.add('swiped');
        t.style.transform = 'translateX(' + (dx > 0 ? 120 : -120) + '%)';
        t.style.opacity = '0';
        var host = t.closest('.toast-host');
        setTimeout(function () { t.remove(); if (host) sync(host); }, 190);
      } else {
        t.style.transform = '';
        t.style.opacity = '';
      }
    }
    t.addEventListener('pointerup', end);
    t.addEventListener('pointercancel', end);
  }

  /* ---- demo presets ---- */

  var PRESETS = {
    success: function (h) {
      spawn(h, { kind: 'success', title: 'Late check-out added', desc: 'You’ll see it in your cart at checkout.', duration: 4200 });
    },
    undo: function (h) {
      var left = 5;
      var t = spawn(h, {
        kind: 'undo', title: 'Breakfast basket removed', action: 'Undo · 5', actionIcon: 'i-undo', duration: 5000,
        onAction: function (tt) {
          clearInterval(iv);
          dismiss(tt);
          spawn(h, { kind: 'success', title: 'Breakfast basket restored', duration: 3600 });
        },
      });
      var lbl = t.querySelector('.t-act-label');
      var iv = setInterval(function () {
        if (!t.isConnected) { clearInterval(iv); return; }
        if (t.matches(':hover')) return; // countdown pauses with the timer bar
        left--;
        if (left <= 0) { clearInterval(iv); return; }
        lbl.textContent = 'Undo · ' + left;
      }, 1000);
    },
    error: function (h) {
      spawn(h, {
        kind: 'error', sticky: true, id: 'save-guest',
        title: 'We couldn’t save your guest details',
        desc: 'Nothing was lost. <code>Ref 4F2A</code>',
        action: 'Retry', actionIcon: 'i-retry',
        onAction: function (t) {
          var btn = t.querySelector('.t-act');
          btn.disabled = true;
          btn.querySelector('.t-act-label').textContent = 'Retrying…';
          setTimeout(function () {
            dismiss(t);
            spawn(h, { kind: 'success', title: 'Guest details saved', duration: 3600 });
          }, 900);
        },
      });
    },
    warning: function (h) {
      spawn(h, { kind: 'warning', title: 'Tourist tax still due', desc: 'Pay before Friday to keep your virtual keys active.', duration: 6000 });
    },
    burst: function (h) {
      var seq = [
        function () { spawn(h, { kind: 'success', title: 'Passport photo uploaded', duration: 6500 }); },
        function () { spawn(h, { kind: 'info', title: 'Vela has a tip for your arrival', duration: 6500 }); },
        function () { spawn(h, { kind: 'success', title: 'Marta added to the guest list', duration: 6500 }); },
        function () { spawn(h, { kind: 'warning', title: 'Tourist tax still due', desc: 'The oldest toast above just yielded — the stack caps at 3.', duration: 7500 }); },
      ];
      seq.forEach(function (fn, i) { setTimeout(fn, i * 420); });
    },
    dedupe: function (h) {
      spawn(h, { kind: 'info', id: 'lang', title: 'Language updated — Español', duration: 5000 });
      setTimeout(function () {
        spawn(h, { kind: 'info', id: 'lang', title: 'Language updated — Español', duration: 5000 });
      }, 900);
    },
  };

  document.addEventListener('click', function (e) {
    var fire = e.target.closest('[data-toast]');
    if (fire) {
      var frame = fire.closest('.t-frame');
      var host = frame && frame.querySelector('.toast-host');
      if (host) PRESETS[fire.getAttribute('data-toast')](host);
      return;
    }
    var clear = e.target.closest('.toast-clear');
    if (clear) {
      var hh = clear.closest('.toast-host');
      hh.querySelectorAll('.toast').forEach(function (t) { dismiss(t); });
    }
  });

  /* ---- touch popovers (mobile tooltip replacement) ---- */
  document.addEventListener('click', function (e) {
    var trg = e.target.closest('[data-pop]');
    var wrap = trg && trg.closest('.pop');
    var wasOpen = wrap && wrap.classList.contains('open');
    document.querySelectorAll('.pop.open').forEach(function (p) { p.classList.remove('open'); });
    if (wrap && !wasOpen) wrap.classList.add('open');
    // tapping inside an open popover body keeps it open
    if (!trg && e.target.closest('.pop-b')) {
      var pb = e.target.closest('.pop');
      if (pb && !e.target.closest('[data-modal]')) pb.classList.add('open');
    }
  });
})();
