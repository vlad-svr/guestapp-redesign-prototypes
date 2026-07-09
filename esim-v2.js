/* Travel eSIM V2 — prototype-only interactions. No business logic, no network.

   [data-es-group]                a plan group = one package + its quantity
   [data-es-dur] / [data-es-panel]  duration rail ↔ the package list it reveals
   .es-plan input[type=radio]     one package per group (multi survives via "Add a different plan")
   [data-es-step="1|-1"]          quantity stepper, living inside the card it controls
   [data-es-addplan]              clones a group so a second package can be bought
   [data-es-seg] / [data-es-plat-pane]  iOS ↔ Android instructions
   [data-es-copy]                 copy with a confirmation (the shipped button gives none)
   [data-es-installed]            "I've installed it" → flips the card's status
   [data-es-qr]                   paints a deterministic mock QR (no Math.random)

   Everything is scoped to the device frame it lives in, so the mobile and
   desktop frames on the same page never fight over ids. */
(function () {
  var CURRENCY = '€';

  function frameOf(el) { return el.closest('.phone, .browser') || document; }
  function all(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

  function announce(frame, message) {
    var live = frame.querySelector('[data-es-live]');
    if (live) live.textContent = message;
  }

  /* ============================================================
     Mock QR — a deterministic 21×21 grid with real finder patterns.
     Decorative: the alt text and the surrounding copy carry the meaning.
     ============================================================ */
  function paintQr(el) {
    var N = 21;
    // Fixed seed — Math.random() would repaint the "same" code differently each reflow.
    // xorshift32 stays inside Int32, so no precision is lost the way an LCG's
    // multiply would lose it once the product passes 2^53.
    var seed = 20260714;
    function next() {
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; seed |= 0;
      return (seed >>> 0) / 4294967296;
    }
    function inFinder(r, c) {
      function box(r0, c0) { return r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7; }
      return box(0, 0) || box(0, N - 7) || box(N - 7, 0);
    }
    function finderOn(r, c) {
      var rr = r < 7 ? r : r - (N - 7);
      var cc = c < 7 ? c : c - (N - 7);
      var ring = Math.max(Math.abs(rr - 3), Math.abs(cc - 3));
      return ring === 3 || ring <= 1; // outer ring + solid centre
    }
    var html = '';
    for (var r = 0; r < N; r++) {
      for (var c = 0; c < N; c++) {
        var on = inFinder(r, c) ? finderOn(r, c) : next() > 0.52;
        html += on ? '<i></i>' : '<i class="off"></i>';
      }
    }
    el.innerHTML = html;
  }

  /* ============================================================
     Plan selection + running total
     ============================================================ */
  function money(n) { return CURRENCY + n.toFixed(2); }

  function selectedIn(group) { return group.querySelector('.es-plan input:checked'); }

  function qtyOf(group) {
    var input = selectedIn(group);
    if (!input) return 1;
    var out = input.closest('.es-plan').querySelector('[data-es-qty]');
    return out ? parseInt(out.textContent, 10) || 1 : 1;
  }

  function render(frame) {
    var groups = all(frame, '[data-es-group]');
    var lines = [];
    var total = 0;

    groups.forEach(function (group) {
      // the selected card owns the highlight and the stepper
      all(group, '.es-plan').forEach(function (card) {
        card.classList.toggle('is-selected', !!card.querySelector('input:checked'));
      });
      var input = selectedIn(group);
      if (!input) return;
      var qty = qtyOf(group);
      var price = parseFloat(input.getAttribute('data-es-price')) * qty;
      total += price;
      lines.push({ name: input.getAttribute('data-es-name'), qty: qty, price: price });
    });

    // Mobile dock: one line, the thing being bought
    all(frame, '[data-es-sum-what]').forEach(function (el) {
      if (!lines.length) el.innerHTML = '<b>No plan selected</b>Pick a data plan above';
      else if (lines.length === 1) el.innerHTML = '<b>' + lines[0].name + '</b>' + (lines[0].qty > 1 ? lines[0].qty + ' devices' : '1 device');
      else el.innerHTML = '<b>' + lines.length + ' plans</b>' + lines.reduce(function (a, l) { return a + l.qty; }, 0) + ' devices';
    });

    // Desktop ledger: a row per plan
    all(frame, '[data-es-ledger-rows]').forEach(function (el) {
      if (!lines.length) {
        el.innerHTML = '<div class="es-ledger-row"><span class="k">Nothing selected yet</span></div>';
        return;
      }
      el.innerHTML = lines.map(function (l) {
        return '<div class="es-ledger-row"><span class="k"><b>' + l.name + '</b>' +
          (l.qty > 1 ? l.qty + ' devices' : '1 device') + '</span>' +
          '<span class="v">' + money(l.price) + '</span></div>';
      }).join('');
    });

    all(frame, '[data-es-sum-total]').forEach(function (el) { el.textContent = money(total); });
    all(frame, '[data-es-cta]').forEach(function (el) {
      el.classList.toggle('is-disabled', !lines.length);
      el.setAttribute('aria-disabled', String(!lines.length));
    });
  }

  /* Give every group its own radio name so cloning a group cannot
     steal the first group's selection. */
  function nameGroups(frame) {
    all(frame, '[data-es-group]').forEach(function (group, i) {
      all(group, '.es-plan input').forEach(function (input) { input.name = 'es-plan-' + i; });
      var remove = group.querySelector('[data-es-removeplan]');
      if (remove) remove.hidden = i === 0;
      var head = group.querySelector('[data-es-group-label]');
      if (head) head.textContent = i === 0 ? 'Your plan' : 'Second plan';
    });
  }

  function addGroup(frame, button) {
    var groups = all(frame, '[data-es-group]');
    var clone = groups[0].cloneNode(true);
    all(clone, '.es-plan input').forEach(function (input) {
      input.checked = false;
      input.id = '';
    });
    all(clone, '.es-plan').forEach(function (card) { card.classList.remove('is-selected'); });
    all(clone, '[data-es-qty]').forEach(function (out) { out.textContent = '1'; });
    groups[groups.length - 1].parentNode.insertBefore(clone, button);
    button.hidden = true; // two packages is enough to prove the point
    nameGroups(frame);
    render(frame);
    announce(frame, 'A second plan was added. Choose a package for it.');
    var first = clone.querySelector('.es-plan input');
    if (first) first.focus();
  }

  /* ============================================================
     Events
     ============================================================ */
  document.addEventListener('change', function (e) {
    if (e.target.matches('.es-plan input')) render(frameOf(e.target));
  });

  document.addEventListener('click', function (e) {
    var el;
    var frame;

    /* ---- duration rail ---- */
    if ((el = e.target.closest('[data-es-dur]'))) {
      e.preventDefault();
      var rail = el.closest('.es-dur');
      var group = el.closest('[data-es-group]');
      var days = el.getAttribute('data-es-dur');
      all(rail, '[data-es-dur]').forEach(function (c) { c.setAttribute('aria-selected', String(c === el)); });
      all(group, '[data-es-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-es-panel') !== days; });
      // a package from a hidden duration must not stay in the total
      all(group, '[data-es-panel][hidden] .es-plan input').forEach(function (i) { i.checked = false; });
      render(frameOf(el));
      return;
    }

    /* ---- quantity stepper ---- */
    if ((el = e.target.closest('[data-es-step]'))) {
      e.preventDefault();
      var counter = el.closest('.es-counter');
      var out = counter && counter.querySelector('[data-es-qty]');
      if (!out) return;
      var min = 1, max = 5;
      var value = Math.min(max, Math.max(min, parseInt(out.textContent, 10) + parseInt(el.getAttribute('data-es-step'), 10)));
      out.textContent = value;
      all(counter, '[data-es-step]').forEach(function (b) {
        b.disabled = (b.getAttribute('data-es-step') === '-1' && value <= min) ||
                     (b.getAttribute('data-es-step') === '1' && value >= max);
      });
      render(frameOf(el));
      announce(frameOf(el), value + (value === 1 ? ' device' : ' devices'));
      return;
    }

    /* ---- add / remove a second package ---- */
    if ((el = e.target.closest('[data-es-addplan]'))) {
      e.preventDefault();
      addGroup(frameOf(el), el);
      return;
    }
    if ((el = e.target.closest('[data-es-removeplan]'))) {
      e.preventDefault();
      frame = frameOf(el);
      el.closest('[data-es-group]').remove();
      var add = frame.querySelector('[data-es-addplan]');
      if (add) add.hidden = false;
      nameGroups(frame);
      render(frame);
      announce(frame, 'Second plan removed.');
      return;
    }

    /* ---- iOS ↔ Android ---- */
    if ((el = e.target.closest('[data-es-plat]'))) {
      e.preventDefault();
      var seg = el.closest('[data-es-seg]');
      var scope = el.closest('.es-esim') || frameOf(el);
      var plat = el.getAttribute('data-es-plat');
      all(seg, '[data-es-plat]').forEach(function (b) { b.setAttribute('aria-selected', String(b === el)); });
      all(scope, '[data-es-plat-pane]').forEach(function (p) { p.hidden = p.getAttribute('data-es-plat-pane') !== plat; });
      announce(frameOf(el), plat === 'ios' ? 'Showing iOS instructions.' : 'Showing Android instructions.');
      return;
    }

    /* ---- copy, with the confirmation the shipped button never gives ---- */
    if ((el = e.target.closest('[data-es-copy]'))) {
      e.preventDefault();
      frame = frameOf(el);
      var label = el.getAttribute('data-es-label') || el.textContent.trim();
      el.setAttribute('data-es-label', label);
      el.classList.add('copied');
      el.innerHTML = '<svg viewBox="0 0 24 24" class="icon" style="width:13px;height:13px" aria-hidden="true"><use href="#i-check"/></svg> Copied';
      showToast(frame, el.getAttribute('data-es-copy') + ' copied');
      announce(frame, el.getAttribute('data-es-copy') + ' copied to clipboard.');
      clearTimeout(el._t);
      el._t = setTimeout(function () {
        el.classList.remove('copied');
        el.innerHTML = '<svg viewBox="0 0 24 24" class="icon" style="width:13px;height:13px" aria-hidden="true"><use href="#i-copy"/></svg> ' + label;
      }, 2000);
      return;
    }

    /* ---- "I've installed it" — the state no API reports ---- */
    if ((el = e.target.closest('[data-es-installed]'))) {
      e.preventDefault();
      frame = frameOf(el);
      var card = el.closest('.es-esim');
      if (!card) return;
      card.classList.remove('is-pending');
      card.classList.add('is-ready');
      var status = card.querySelector('[data-es-status]');
      if (status) status.innerHTML = '<svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><use href="#i-check-circle"/></svg> Installed';
      var ladder = card.querySelector('[data-es-ladder]');
      if (ladder) ladder.open = false;
      el.hidden = true;
      var after = card.querySelector('[data-es-after-install]');
      if (after) after.hidden = false;
      var badge = frame.querySelector('[data-es-badge]');
      if (badge) { badge.className = 'sb-badge teal'; badge.textContent = '✓'; }
      announce(frame, 'Marked as installed. Your eSIM will connect when you land.');
      showToast(frame, 'Marked as installed');
      return;
    }

    /* ---- modal scrim / close (this page does not load modals.js state) ---- */
    if (e.target.closest('[data-es-dismiss]')) {
      e.preventDefault();
      hideToast(frameOf(e.target));
    }
  });

  /* ---- toast ---- */
  var toastTimer = {};
  function showToast(frame, text) {
    var toast = frame.querySelector('[data-es-toast]');
    if (!toast) return;
    var slot = toast.querySelector('[data-es-toast-text]');
    if (slot) slot.textContent = text;
    toast.hidden = false;
    clearTimeout(toastTimer.t);
    toastTimer.t = setTimeout(function () { hideToast(frame); }, 2200);
  }
  function hideToast(frame) {
    var toast = frame.querySelector('[data-es-toast]');
    if (toast) toast.hidden = true;
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.proto-modal.open').forEach(function (m) { m.classList.remove('open'); });
    }
  });

  function init() {
    document.querySelectorAll('[data-es-qr]').forEach(paintQr);
    document.querySelectorAll('.phone, .browser').forEach(function (frame) {
      nameGroups(frame);
      render(frame);
    });
  }

  var style = document.createElement('style');
  style.textContent = '[hidden]{display:none !important}' +
    '.btn.is-disabled{opacity:.45;pointer-events:none}';
  document.head.appendChild(style);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();