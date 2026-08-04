/* Luggage-storage interactivity (mobile + desktop share this).
   Data-attribute driven so the same file works for the lg-* (mobile)
   and ld-* (desktop) screens:

   1. Day cards [data-lug-day="arr|dep"] — the only two possible dates
      (the real LuggageDateTimePicker derives them from the reservation).
      Switching seeds the same default times the app uses:
      arrival 09:00/15:00, departure 11:00/20:00.
   2. Bag counter [data-bag-minus]/[data-bag-plus] — clamped 1..50 like
      the real Counter; every storage row re-prices (per-bag x bags),
      mirroring how the nearby query re-runs with the new bag count.
   3. Storage rows [data-storage data-perbag data-name] — selecting one
      enables every [data-lug-cta] and fills the desktop summary
      ([data-lug-sum-*]). Until then the CTA stays disabled — the real
      findBookingGap() 'luggage' gap ("Complete these details to
      continue").
   4. [data-copy="TEXT"] — clipboard copy with a 2s "Copied" swap
      (mirrors useCopyToClipboard on the booking code).
   5. [data-qr] — renders a decorative deterministic QR-ish grid. */
(function () {
  var bags = 3;
  var LIST_CAP = 4; // rows shown before "Show all N" — no silent truncation

  var DAYS = {
    arr: {drop: '09:00', pick: '15:00'},
    dep: {drop: '11:00', pick: '20:00'}
  };

  function money(n) { return '€' + n.toFixed(2); }

  function selectedStorage() { return document.querySelector('[data-storage].selected'); }

  function refresh() {
    document.querySelectorAll('[data-bag-count]').forEach(function (el) { el.textContent = bags; });
    document.querySelectorAll('[data-lug-sum-bags]').forEach(function (el) {
      el.textContent = bags + (bags === 1 ? ' bag' : ' bags');
    });
    document.querySelectorAll('[data-st-bags]').forEach(function (el) {
      el.textContent = 'for ' + bags + (bags === 1 ? ' bag' : ' bags');
    });
    document.querySelectorAll('[data-storage]').forEach(function (s) {
      var per = parseFloat(s.getAttribute('data-perbag') || '0');
      var total = s.querySelector('[data-st-total]');
      if (total) total.textContent = money(per * bags);
    });
    var sel = selectedStorage();
    document.querySelectorAll('[data-lug-cta]').forEach(function (cta) {
      if (sel) {
        var per = parseFloat(sel.getAttribute('data-perbag') || '0');
        cta.disabled = false;
        cta.style.opacity = '';
        cta.style.pointerEvents = '';
        cta.textContent = 'Continue — ' + money(per * bags);
      }
    });
    document.querySelectorAll('[data-lug-sum-storage]').forEach(function (el) {
      el.textContent = sel ? sel.getAttribute('data-name') : 'No storage chosen yet';
      el.classList.toggle('lr-wait', !sel);
    });
    document.querySelectorAll('[data-lug-sum-total]').forEach(function (el) {
      el.textContent = sel ? money(parseFloat(sel.getAttribute('data-perbag') || '0') * bags) : 'Pick a storage';
    });
    /* Empty ledger reads as "still choosing", not as a €0 bill: the amount
       shrinks to a muted prompt, the storage row stays pending, and the
       hint explains why there is no number yet. */
    document.querySelectorAll('[data-lug-ledger]').forEach(function (ledger) {
      ledger.classList.toggle('is-empty', !sel);
      var row = ledger.querySelector('[data-lug-storage-row]');
      if (row) row.classList.toggle('pending', !sel);
      var sep = ledger.querySelector('[data-lug-sep]');
      if (sep) sep.hidden = !sel;
      var he = ledger.querySelector('[data-lug-hint-empty]');
      if (he) he.hidden = !!sel;
      var hf = ledger.querySelector('[data-lug-hint-filled]');
      if (hf) hf.hidden = !sel;
    });
  }

  /* Sort / filter / cap for the storage list. Sorting reorders the rows by
     their data-km / data-perbag / data-rating; "Open 24/7" filters to
     [data-247] rows; only the first LIST_CAP visible rows show until
     "Show all N" expands the list. */
  function applyList(list) {
    if (!list) return;
    var screen = list.closest('.flow-screen') || document;
    var sortChip = screen.querySelector('[data-lug-sort].on');
    var mode = sortChip ? sortChip.getAttribute('data-lug-sort') : 'near';
    var only247 = !!screen.querySelector('[data-lug-247].on');
    var expanded = list.hasAttribute('data-expanded');
    var rows = Array.prototype.slice.call(list.querySelectorAll('[data-storage]'));
    rows.sort(function (a, b) {
      if (mode === 'cheap') return parseFloat(a.getAttribute('data-perbag')) - parseFloat(b.getAttribute('data-perbag'));
      if (mode === 'rated') return parseFloat(b.getAttribute('data-rating') || '-1') - parseFloat(a.getAttribute('data-rating') || '-1');
      return parseFloat(a.getAttribute('data-km')) - parseFloat(b.getAttribute('data-km'));
    });
    var pass = 0;
    rows.forEach(function (r) {
      list.appendChild(r);
      var ok = !only247 || r.hasAttribute('data-247');
      r.classList.toggle('filtered-out', !ok);
      if (ok) { pass++; r.classList.toggle('overcap', pass > LIST_CAP && !expanded); }
      else r.classList.remove('overcap');
    });
    var more = screen.querySelector('[data-lug-more]');
    if (more) {
      more.hidden = expanded || pass <= LIST_CAP;
      more.textContent = 'Show all ' + pass;
    }
  }

  document.addEventListener('click', function (e) {
    var el;
    if ((el = e.target.closest('[data-lug-sort]'))) {
      e.preventDefault();
      el.closest('.lug-filter').querySelectorAll('[data-lug-sort]').forEach(function (c) { c.classList.remove('on'); });
      el.classList.add('on');
      applyList((el.closest('.flow-screen') || document).querySelector('[data-storage-list]'));
      return;
    }
    if ((el = e.target.closest('[data-lug-247]'))) {
      e.preventDefault();
      el.classList.toggle('on');
      applyList((el.closest('.flow-screen') || document).querySelector('[data-storage-list]'));
      return;
    }
    if ((el = e.target.closest('[data-lug-more]'))) {
      e.preventDefault();
      var list = (el.closest('.flow-screen') || document).querySelector('[data-storage-list]');
      if (list) list.setAttribute('data-expanded', '1');
      applyList(list);
      return;
    }
    if ((el = e.target.closest('[data-lug-day]'))) {
      e.preventDefault();
      var screen = el.closest('.flow-screen') || document;
      screen.querySelectorAll('[data-lug-day]').forEach(function (d) { d.classList.remove('on'); });
      el.classList.add('on');
      var day = DAYS[el.getAttribute('data-lug-day')] || DAYS.dep;
      screen.querySelectorAll('[data-time-drop]').forEach(function (t) { t.textContent = day.drop; });
      screen.querySelectorAll('[data-time-pick]').forEach(function (t) { t.textContent = day.pick; });
      var lbl = el.querySelector('.ld-kind') ? el.querySelector('.ld-kind').textContent + ' · ' + el.querySelector('.ld-date').textContent : '';
      document.querySelectorAll('[data-lug-sum-day]').forEach(function (s) { s.textContent = lbl; });
      document.querySelectorAll('[data-lug-sum-times]').forEach(function (s) { s.textContent = day.drop + ' → ' + day.pick; });
      return;
    }
    if ((el = e.target.closest('[data-bag-minus]'))) { e.preventDefault(); bags = Math.max(1, bags - 1); refresh(); return; }
    if ((el = e.target.closest('[data-bag-plus]'))) { e.preventDefault(); bags = Math.min(50, bags + 1); refresh(); return; }
    if ((el = e.target.closest('[data-storage]'))) {
      if (e.target.closest('[data-modal]')) return; // opening-hours button inside the row
      e.preventDefault();
      var scope = el.closest('.flow-screen') || document;
      scope.querySelectorAll('[data-storage]').forEach(function (s) {
        s.classList.remove('selected');
        s.setAttribute('aria-checked', 'false');
      });
      el.classList.add('selected');
      el.setAttribute('aria-checked', 'true');
      refresh();
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

  /* Post-payment sidebar row — the real redesign sidebar gains an ungrouped
     "Luggage storage" link once a paid booking with a PNR exists
     (useLuggageBookings().hasBookings). chrome.js renders the canonical
     sidebar and wipes the element, so screens that represent the booked
     state opt in via [data-lug-booked] (+ [data-lug-active] on the luggage
     page itself) and the row is inserted after Home once chrome has run —
     deliberately absent on the pre-booking and empty-state screens. */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-sidebar][data-lug-booked]').forEach(function (sb) {
      var home = sb.querySelector('.sb-item');
      if (!home) return;
      var row = document.createElement('a');
      row.className = 'sb-item' + (sb.hasAttribute('data-lug-active') ? ' active' : '');
      if (sb.hasAttribute('data-lug-active')) row.setAttribute('aria-current', 'page');
      row.innerHTML = '<svg viewBox="0 0 24 24" class="icon"><use href="#i-luggage"/></svg> Luggage storage';
      home.insertAdjacentElement('afterend', row);
    });
  });

  /* decorative deterministic QR-ish grid (13x13, three finder squares) */
  function isFinder(r, c) {
    function inSq(r0, c0) { return r >= r0 && r < r0 + 5 && c >= c0 && c < c0 + 5; }
    return inSq(0, 0) || inSq(0, 8) || inSq(8, 0);
  }
  function finderOn(r, c) {
    function ring(r0, c0) {
      var lr = r - r0, lc = c - c0;
      if (lr < 0 || lr > 4 || lc < 0 || lc > 4) return null;
      if (lr === 0 || lr === 4 || lc === 0 || lc === 4) return true;   // outer ring
      return lr === 2 && lc === 2;                                     // centre dot
    }
    return ring(0, 0) !== null ? ring(0, 0) : (ring(0, 8) !== null ? ring(0, 8) : ring(8, 0));
  }
  document.querySelectorAll('[data-qr]').forEach(function (host) {
    var seed = 42;
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

  document.querySelectorAll('[data-storage-list]').forEach(applyList);
  refresh();
})();
