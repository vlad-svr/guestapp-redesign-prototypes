/* VIP-lounge interactivity (prototype-only, mock data).
   Data-attribute driven, same conventions as the other flows:

   1. Airport rows [data-vl-airport="agp|bcn"] in the change sheet swap
      which [data-ap-group] renders in the list screen and stamp the
      airport name into every [data-ap-name]. The no-lounges airport
      (Granada) is a plain data-goto to the empty screen instead.
   2. Filter chips [data-vl-filter="all|after|before|t2|t3"] show the
      lounge cards whose data-side / data-term match; zero matches
      reveals the [data-vl-nores] block (never a silent blank).
   3. Lounge cards [data-lounge data-price data-name] — selecting one
      enables every [data-vl-cta] with a live "Continue — €…" total.
      Sold-out cards ([data-sold]) don't select; their Notify button
      is the escape. Until a lounge is chosen the CTA stays disabled —
      the findBookingGap() 'lounge' gap.
   4. Guest stepper [data-vl-minus]/[data-vl-plus] — clamped 1..6 like
      the real Counter; reprices the per-person line, the total and
      every [data-vl-guests] echo.
   5. Slot radios are handled by the shared book.css pattern here
      (not flow.js): picking one updates the [data-vl-window] entry
      window (slot → slot+1h).
   6. [data-copy="TEXT"] — clipboard copy with a 2s "Copied" swap.
   7. [data-qr] — decorative deterministic QR-ish grid (13x13). */
(function () {
  var guests = 2;
  var PRICE = 32; // €/person — re-read from the selected lounge

  function money(n) { return '€' + n.toFixed(2); }
  function selectedLounge() { return document.querySelector('[data-lounge].selected'); }

  function refresh() {
    var sel = selectedLounge();
    if (sel) PRICE = parseFloat(sel.getAttribute('data-price') || '0');
    document.querySelectorAll('[data-vl-count]').forEach(function (el) { el.textContent = guests; });
    document.querySelectorAll('[data-vl-guests]').forEach(function (el) {
      el.textContent = guests + (guests === 1 ? ' guest' : ' guests');
    });
    document.querySelectorAll('[data-vl-ppline]').forEach(function (el) {
      el.textContent = money(PRICE) + ' × ' + guests + (guests === 1 ? ' guest' : ' guests');
    });
    document.querySelectorAll('[data-vl-total]').forEach(function (el) {
      el.textContent = money(PRICE * guests);
    });
    document.querySelectorAll('[data-vl-cta]').forEach(function (cta) {
      if (sel) {
        cta.disabled = false;
        cta.style.opacity = '';
        cta.style.pointerEvents = '';
        cta.textContent = 'Book ' + sel.getAttribute('data-name');
      }
    });
    document.querySelectorAll('[data-vl-name]').forEach(function (el) {
      if (sel) el.textContent = sel.getAttribute('data-name');
    });
    /* Desktop summary ledger — empty reads as "still choosing", not a €0 bill */
    document.querySelectorAll('[data-vl-sum-lounge]').forEach(function (el) {
      el.textContent = sel ? sel.getAttribute('data-name') : 'No lounge chosen yet';
      el.classList.toggle('lr-wait', !sel);
    });
    document.querySelectorAll('[data-vl-sum-total]').forEach(function (el) {
      el.textContent = sel ? money(PRICE * guests) : 'Pick a lounge';
    });
    document.querySelectorAll('[data-vl-ledger]').forEach(function (ledger) {
      ledger.classList.toggle('is-empty', !sel);
      var row = ledger.querySelector('[data-vl-lounge-row]');
      if (row) row.classList.toggle('pending', !sel);
      var sep = ledger.querySelector('[data-vl-sep]');
      if (sep) sep.hidden = !sel;
      var he = ledger.querySelector('[data-vl-hint-empty]');
      if (he) he.hidden = !!sel;
      var hf = ledger.querySelector('[data-vl-hint-filled]');
      if (hf) hf.hidden = !sel;
    });
  }

  function applyFilter(screen) {
    var chip = screen.querySelector('[data-vl-filter].on');
    var mode = chip ? chip.getAttribute('data-vl-filter') : 'all';
    var group = screen.querySelector('[data-ap-group]:not([hidden])');
    if (!group) return;
    var shown = 0;
    group.querySelectorAll('[data-lounge]').forEach(function (card) {
      var ok = mode === 'all' ||
        card.getAttribute('data-side') === mode ||
        card.getAttribute('data-term') === mode;
      card.classList.toggle('filtered-out', !ok);
      if (ok) shown++;
    });
    var nores = screen.querySelector('[data-vl-nores]');
    if (nores) nores.hidden = shown > 0;
  }

  document.addEventListener('click', function (e) {
    var el;
    if ((el = e.target.closest('[data-vl-filter]'))) {
      e.preventDefault();
      var screen = el.closest('.flow-screen') || document;
      screen.querySelectorAll('[data-vl-filter]').forEach(function (c) { c.classList.remove('on'); });
      el.classList.add('on');
      applyFilter(screen);
      return;
    }
    if ((el = e.target.closest('[data-vl-airport]'))) {
      e.preventDefault();
      var code = el.getAttribute('data-vl-airport');
      document.querySelectorAll('[data-vl-airport]').forEach(function (r) { r.classList.toggle('on', r === el); });
      document.querySelectorAll('[data-ap-group]').forEach(function (g) {
        g.hidden = g.getAttribute('data-ap-group') !== code;
      });
      document.querySelectorAll('[data-ap-name]').forEach(function (n) {
        n.textContent = el.getAttribute('data-ap-label') || code.toUpperCase();
      });
      // switching airports drops the selection and resets the filter
      document.querySelectorAll('[data-lounge]').forEach(function (c) {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });
      document.querySelectorAll('[data-vl-cta]').forEach(function (cta) {
        cta.disabled = true;
        cta.style.opacity = '.5';
        cta.style.pointerEvents = 'none';
        cta.textContent = 'Choose a lounge to continue';
      });
      document.querySelectorAll('.flow-screen [data-vl-filter]').forEach(function (c) {
        c.classList.toggle('on', c.getAttribute('data-vl-filter') === 'all');
      });
      document.querySelectorAll('.flow-screen').forEach(function (s) {
        if (s.querySelector('[data-ap-group]')) applyFilter(s);
      });
      return;
    }
    if ((el = e.target.closest('[data-vl-notify]'))) {
      e.preventDefault();
      el.textContent = '✓ We’ll email you if it opens up';
      el.disabled = true;
      el.style.opacity = '.6';
      el.style.pointerEvents = 'none';
      return;
    }
    if ((el = e.target.closest('[data-lounge]'))) {
      if (e.target.closest('[data-modal]') || e.target.closest('[data-goto]')) return; // details link inside the card
      if (el.hasAttribute('data-sold')) return; // sold out never selects
      e.preventDefault();
      var scope = el.closest('.flow-screen') || document;
      scope.querySelectorAll('[data-lounge]').forEach(function (c) {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });
      el.classList.add('selected');
      el.setAttribute('aria-checked', 'true');
      refresh();
      return;
    }
    if ((el = e.target.closest('[data-vl-minus]'))) { e.preventDefault(); guests = Math.max(1, guests - 1); refresh(); return; }
    if ((el = e.target.closest('[data-vl-plus]'))) { e.preventDefault(); guests = Math.min(6, guests + 1); refresh(); return; }
    if ((el = e.target.closest('[data-vl-slot]'))) {
      e.preventDefault();
      var scr = el.closest('.flow-screen') || document;
      scr.querySelectorAll('[data-vl-slot]').forEach(function (s) { s.classList.remove('selected'); });
      el.classList.add('selected');
      var t = el.getAttribute('data-vl-slot'); // "17:00"
      var endH = (parseInt(t, 10) + 1) + ':00';
      document.querySelectorAll('[data-vl-window]').forEach(function (w) { w.textContent = t + ' – ' + endH; });
      document.querySelectorAll('[data-vl-entry]').forEach(function (w) { w.textContent = t; });
      return;
    }
    if ((el = e.target.closest('[data-tk-toggle]'))) {
      if (e.target.closest('[data-modal]') || e.target.closest('[data-copy]')) return;
      e.preventDefault();
      el.closest('.ticket').classList.toggle('collapsed');
      return;
    }
    if ((el = e.target.closest('[data-copy]'))) {
      e.preventDefault();
      var text = el.getAttribute('data-copy');
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
      var prev = el.innerHTML;
      el.textContent = 'Copied ✓';
      setTimeout(function () { el.innerHTML = prev; }, 2000);
      return;
    }
  });

  /* Post-payment sidebar row — the redesign sidebar gains an ungrouped
     "VIP lounge" link once a paid pass exists. chrome.js renders the
     canonical sidebar and wipes the element, so screens that represent the
     booked state opt in via [data-vl-booked] (+ [data-vl-active] on the
     lounge page itself); the row is inserted after Home once chrome ran. */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-sidebar][data-vl-booked]').forEach(function (sb) {
      var home = sb.querySelector('.sb-item');
      if (!home) return;
      var row = document.createElement('a');
      row.className = 'sb-item' + (sb.hasAttribute('data-vl-active') ? ' active' : '');
      if (sb.hasAttribute('data-vl-active')) row.setAttribute('aria-current', 'page');
      row.innerHTML = '<svg viewBox="0 0 24 24" class="icon"><use href="#i-armchair"/></svg> VIP lounge';
      home.insertAdjacentElement('afterend', row);
    });
  });

  /* decorative deterministic QR-ish grid (13x13, three finder squares) —
     same painter as luggage-flow.js, different seed */
  function isFinder(r, c) {
    function inSq(r0, c0) { return r >= r0 && r < r0 + 5 && c >= c0 && c < c0 + 5; }
    return inSq(0, 0) || inSq(0, 8) || inSq(8, 0);
  }
  function finderOn(r, c) {
    function ring(r0, c0) {
      var lr = r - r0, lc = c - c0;
      if (lr < 0 || lr > 4 || lc < 0 || lc > 4) return null;
      if (lr === 0 || lr === 4 || lc === 0 || lc === 4) return true;
      return lr === 2 && lc === 2;
    }
    return ring(0, 0) !== null ? ring(0, 0) : (ring(0, 8) !== null ? ring(0, 8) : ring(8, 0));
  }
  document.querySelectorAll('[data-qr]').forEach(function (host) {
    var seed = 77;
    function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
    var html = '';
    for (var r = 0; r < 13; r++) {
      for (var c = 0; c < 13; c++) {
        var on = isFinder(r, c) ? finderOn(r, c) : rnd() > 0.52;
        html += '<i' + (on ? '' : ' class="off"') + '></i>';
      }
    }
    host.innerHTML = html;
  });

  refresh();
})();
