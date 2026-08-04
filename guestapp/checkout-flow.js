/* Checkout-specific interactivity (mobile + desktop share this).
   One behaviour, data-attribute driven so the same file works for the
   co-* (mobile) and cd-* (desktop) screens:

   Rate-your-stay stars: [data-star] fills the row, announces an emotive
   verdict ([data-verdict]), enables the submit button ([data-rate-submit])
   and routes it by the mock NPS gate (survey_minimum_nps_score = 4):
   >=4 -> the thanks screen with public-review links ([data-goto-high]),
   <=3 -> the quiet thanks screen without them ([data-goto-low]).
   In the real app the rating always POSTs to ThanksView; only what that
   screen shows changes — the two destinations here mirror that. */
(function () {
  var MIN_NPS = 4; // mock survey_minimum_nps_score

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
      var dest = value >= MIN_NPS
        ? submit.getAttribute('data-goto-high')
        : submit.getAttribute('data-goto-low');
      if (dest) submit.setAttribute('data-goto', dest);
    }
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-star]');
    if (el) {
      e.preventDefault();
      setRating(parseInt(el.getAttribute('data-star'), 10));
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
