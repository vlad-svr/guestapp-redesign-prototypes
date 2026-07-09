/* Guests summary V2 — prototype-only interactions. No business logic.
   - [data-gv-delete]        confirm sheet → row collapses → undo toast (10 s)
   - [data-gv-undo]          restores the row, dismisses the toast
   - [data-gv-copy]          copy-link affordance with a "Copied" confirmation
   - [data-gv-step="+1|-1"]  counter steppers in the group sheet
   Everything is scoped to the device frame it lives in, so the mobile and
   desktop frames on the same page never fight over ids. */
(function () {
  var UNDO_MS = 10000;
  var timers = {};

  function frameOf(el) { return el.closest('.phone, .browser') || document; }

  function closeModals(frame) {
    frame.querySelectorAll('.proto-modal.open').forEach(function (m) { m.classList.remove('open'); });
  }

  function announce(frame, message) {
    var live = frame.querySelector('[data-gv-live]');
    if (live) live.textContent = message;
  }

  /* ---- delete → optimistic remove + undo ---- */
  function removeGuest(frame, guestId) {
    var row = frame.querySelector('[data-gv-row="' + guestId + '"]');
    if (!row) return;
    row.hidden = true;

    var toast = frame.querySelector('[data-gv-toast]');
    if (toast) {
      var name = row.getAttribute('data-gv-name') || 'Guest';
      var slot = toast.querySelector('[data-gv-toast-name]');
      if (slot) slot.textContent = name;
      toast.hidden = false;
      toast.setAttribute('data-gv-for', guestId);
    }
    announce(frame, (row.getAttribute('data-gv-name') || 'Guest') + ' removed. Undo available for 10 seconds.');

    clearTimeout(timers[guestId]);
    timers[guestId] = setTimeout(function () { hideToast(frame); }, UNDO_MS);
  }

  function hideToast(frame) {
    var toast = frame.querySelector('[data-gv-toast]');
    if (toast) toast.hidden = true;
  }

  function undo(frame) {
    var toast = frame.querySelector('[data-gv-toast]');
    if (!toast) return;
    var guestId = toast.getAttribute('data-gv-for');
    var row = frame.querySelector('[data-gv-row="' + guestId + '"]');
    if (row) row.hidden = false;
    clearTimeout(timers[guestId]);
    hideToast(frame);
    announce(frame, 'Removal undone.');
  }

  document.addEventListener('click', function (e) {
    var el;
    var frame;

    if ((el = e.target.closest('[data-gv-delete]'))) {
      e.preventDefault();
      frame = frameOf(el);
      closeModals(frame);
      removeGuest(frame, el.getAttribute('data-gv-delete'));
      return;
    }

    if ((el = e.target.closest('[data-gv-undo]'))) {
      e.preventDefault();
      undo(frameOf(el));
      return;
    }

    if ((el = e.target.closest('[data-gv-copy]'))) {
      e.preventDefault();
      var original = el.getAttribute('data-gv-label') || el.textContent.trim();
      el.setAttribute('data-gv-label', original);
      el.textContent = '✓ Copied';
      announce(frameOf(el), 'Registration link copied to clipboard.');
      clearTimeout(timers['copy']);
      timers['copy'] = setTimeout(function () { el.textContent = original; }, 1800);
      return;
    }

    if ((el = e.target.closest('[data-gv-step]'))) {
      e.preventDefault();
      var wrap = el.closest('.gv-counter');
      var out = wrap && wrap.querySelector('output');
      if (!out) return;
      var min = parseInt(out.getAttribute('data-min') || '0', 10);
      var max = parseInt(out.getAttribute('data-max') || '12', 10);
      var next = parseInt(out.textContent, 10) + parseInt(el.getAttribute('data-gv-step'), 10);
      out.textContent = Math.min(max, Math.max(min, next));
      wrap.querySelectorAll('[data-gv-step]').forEach(function (b) {
        var v = parseInt(out.textContent, 10);
        b.disabled = (b.getAttribute('data-gv-step') === '-1' && v <= min) ||
                     (b.getAttribute('data-gv-step') === '1' && v >= max);
      });
      return;
    }
  });

  /* Rows are real buttons/links, so Enter + Space already work.
     The only extra key affordance the prototype needs is Escape → close sheet. */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.proto-modal.open').forEach(function (m) { m.classList.remove('open'); });
    }
  });

  var style = document.createElement('style');
  style.textContent = '[hidden]{display:none !important}';
  document.head.appendChild(style);
})();