/* Checkout-specific interactivity (mobile + desktop share this).
   Two behaviours, both data-attribute driven so the same file works
   for the co-* (mobile) and cd-* (desktop) screens:

   1. Last-minute add-ons: [data-addon-toggle="key"] flips the add-on on/off,
      reveals its ledger line ([data-line="key"]), recomputes the total +
      6% service fee, and rewrites the sticky CTA ([data-checkout-cta]) so
      an empty cart continues straight to the survey and a non-empty cart
      pays first.
   2. Rate-your-stay stars: [data-star] fills the row, announces an emotive
      verdict ([data-verdict]), enables the submit button ([data-rate-submit])
      and routes it — a happy stay (>=4) to thanks, a poor one to repair. */
(function () {
  var FEE_RATE = 0.06;
  var cart = {}; // key -> amount

  function money(n) { return '€' + n.toFixed(2); }

  function recompute() {
    var subtotal = 0;
    Object.keys(cart).forEach(function (k) { subtotal += cart[k]; });
    var fee = subtotal > 0 ? Math.round(subtotal * FEE_RATE * 100) / 100 : 0;

    var totalEl = document.querySelector('[data-total]');
    if (totalEl) totalEl.textContent = money(subtotal + fee);

    var feeLine = document.querySelector('[data-fee-line]');
    var feeEl = document.querySelector('[data-fee]');
    if (feeEl) feeEl.textContent = money(fee);
    if (feeLine) feeLine.hidden = subtotal <= 0;

    document.querySelectorAll('[data-checkout-cta]').forEach(function (cta) {
      if (subtotal > 0) {
        var lbl = cta.getAttribute('data-label-paid') || 'Pay {amount}';
        cta.textContent = lbl.replace('{amount}', money(subtotal + fee));
        cta.setAttribute('data-goto', cta.getAttribute('data-goto-paid') || '');
        cta.classList.remove('btn-outline'); cta.classList.add('btn-primary');
      } else {
        cta.textContent = cta.getAttribute('data-label-empty') || 'Continue';
        cta.setAttribute('data-goto', cta.getAttribute('data-goto-empty') || '');
      }
    });
  }

  function toggleAddon(key) {
    var toggle = document.querySelector('[data-addon-toggle="' + key + '"]');
    var host = document.querySelector('[data-addon="' + key + '"]');
    if (!host) return;
    var amount = parseFloat(host.getAttribute('data-amount') || '0');
    var on = host.classList.toggle('on');
    if (toggle) toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    var line = document.querySelector('[data-line="' + key + '"]');
    if (line) line.hidden = !on;
    if (on) cart[key] = amount; else delete cart[key];
    recompute();
  }

  /* ---- rating ---- */
  var VERDICTS = {
    1: {e: '😞', t: 'Very poor'},
    2: {e: '😕', t: 'Poor'},
    3: {e: '😐', t: 'Average'},
    4: {e: '🙂', t: 'Good'},
    5: {e: '🤩', t: 'Excellent!'}
  };

  function setRating(value) {
    var stars = document.querySelectorAll('[data-star]');
    stars.forEach(function (s) {
      var v = parseInt(s.getAttribute('data-star'), 10);
      s.classList.toggle('on', v <= value);
      s.setAttribute('aria-checked', v === value ? 'true' : 'false');
    });
    var verdict = document.querySelector('[data-verdict]');
    if (verdict && VERDICTS[value]) {
      verdict.innerHTML = '<span class="rv-emoji">' + VERDICTS[value].e + '</span> ' + VERDICTS[value].t;
    }
    var submit = document.querySelector('[data-rate-submit]');
    if (submit) {
      submit.disabled = false;
      submit.style.opacity = '';
      submit.style.pointerEvents = '';
      var dest = value >= 4
        ? submit.getAttribute('data-goto-high')
        : submit.getAttribute('data-goto-low');
      if (dest) submit.setAttribute('data-goto', dest);
    }
  }

  document.addEventListener('click', function (e) {
    var el;
    if ((el = e.target.closest('[data-addon-toggle]'))) {
      e.preventDefault();
      toggleAddon(el.getAttribute('data-addon-toggle'));
      return;
    }
    if ((el = e.target.closest('[data-star]'))) {
      e.preventDefault();
      setRating(parseInt(el.getAttribute('data-star'), 10));
      return;
    }
  });

  // keyboard support for the star radiogroup (left/right arrows)
  document.addEventListener('keydown', function (e) {
    var star = e.target.closest && e.target.closest('[data-star]');
    if (!star) return;
    var v = parseInt(star.getAttribute('data-star'), 10);
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); var n = Math.min(5, v + 1); setRating(n); focusStar(n); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); var p = Math.max(1, v - 1); setRating(p); focusStar(p); }
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setRating(v); }
  });
  function focusStar(v) { var s = document.querySelector('[data-star="' + v + '"]'); if (s) s.focus(); }
})();