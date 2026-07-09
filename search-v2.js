/* Find your booking — V2 · prototype-only interactions. No business logic.

   Everything here is theatre for the mockup: it exists so the flow *feels*
   like the real thing when you click through it, not to model any behaviour.

     [data-s2-type]     on a .flow-screen — types its .s2-cell[data-char] cells
                        one by one when the screen becomes active, then enables
                        the [data-s2-submit] button in that screen.
     [data-s2-paste]    fills every cell at once (the "Paste" affordance).
     [data-s2-clear]    empties the cells and re-arms the caret.
     [data-s2-steps]    on a .flow-screen — walks its .s2-step rows from
                        pending → doing → done on a timer.
     [data-s2-copy]     copies the booking reference, flips the label to "Copied".

   Screens are found via a MutationObserver on .flow-screen[class], so this
   works with flow.js navigation, the scenario chips, #hash deep links and
   Restart alike — without flow.js needing to know we exist. */
(function () {
  var TYPE_MS = 120;
  var STEP_MS = 780;
  var timers = [];

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }
  function after(ms, fn) { timers.push(setTimeout(fn, ms)); }

  /* ---------- segmented code entry ---------- */
  function cellsOf(screen) {
    return Array.prototype.slice.call(screen.querySelectorAll('.s2-cell'));
  }

  function armCaret(cells, index) {
    cells.forEach(function (c, i) { c.classList.toggle('active', i === index); });
  }

  function resetCode(screen) {
    var cells = cellsOf(screen);
    cells.forEach(function (c) {
      c.textContent = '';
      c.classList.remove('filled');
    });
    armCaret(cells, 0);
    var wrap = screen.querySelector('.s2-code-wrap');
    if (wrap) wrap.classList.remove('invalid');
    setSubmit(screen, false);
  }

  function setSubmit(screen, enabled) {
    var btn = screen.querySelector('[data-s2-submit]');
    if (!btn) return;
    btn.disabled = !enabled;
    btn.style.opacity = enabled ? '' : '0.5';
    btn.style.pointerEvents = enabled ? '' : 'none';
  }

  function fillCell(cell) {
    cell.textContent = cell.getAttribute('data-char') || '';
    cell.classList.add('filled');
    cell.classList.remove('active');
  }

  function typeCode(screen) {
    var cells = cellsOf(screen);
    if (!cells.length) return;
    resetCode(screen);
    cells.forEach(function (cell, i) {
      after(420 + i * TYPE_MS, function () {
        fillCell(cell);
        armCaret(cells, i + 1);
        if (i === cells.length - 1) {
          armCaret(cells, -1);
          setSubmit(screen, true);
        }
      });
    });
  }

  function pasteCode(screen) {
    clearTimers();
    var cells = cellsOf(screen);
    cells.forEach(fillCell);
    armCaret(cells, -1);
    setSubmit(screen, true);
  }

  /* ---------- the searching checklist ---------- */
  function runSteps(screen) {
    var steps = Array.prototype.slice.call(screen.querySelectorAll('.s2-step'));
    if (!steps.length) return;
    steps.forEach(function (s) { s.classList.remove('done', 'doing'); });
    steps[0].classList.add('doing');
    steps.forEach(function (step, i) {
      after(STEP_MS * (i + 1), function () {
        step.classList.remove('doing');
        step.classList.add('done');
        var next = steps[i + 1];
        if (next) next.classList.add('doing');
      });
    });
  }

  /* ---------- screen activation ---------- */
  function onActivate(screen) {
    clearTimers();
    if (screen.hasAttribute('data-s2-type')) typeCode(screen);
    if (screen.hasAttribute('data-s2-steps')) runSteps(screen);
  }

  function watch() {
    var screens = document.querySelectorAll('.flow-screen');
    if (!screens.length) return;

    var observer = new MutationObserver(function (records) {
      records.forEach(function (r) {
        var el = r.target;
        if (el.classList.contains('active')) onActivate(el);
      });
    });
    Array.prototype.forEach.call(screens, function (s) {
      observer.observe(s, { attributes: true, attributeFilter: ['class'] });
      if (s.hasAttribute('data-s2-type')) resetCode(s);
    });

    // flow.js may have activated the start screen before we attached
    var live = document.querySelector('.flow-screen.active');
    if (live) onActivate(live);
  }

  /* ---------- clicks ---------- */
  document.addEventListener('click', function (e) {
    var el;

    if ((el = e.target.closest('[data-s2-paste]'))) {
      e.preventDefault();
      var s = el.closest('.flow-screen');
      if (s) pasteCode(s);
      return;
    }

    if ((el = e.target.closest('[data-s2-clear]'))) {
      e.preventDefault();
      var sc = el.closest('.flow-screen');
      if (sc) { clearTimers(); resetCode(sc); }
      return;
    }

    if ((el = e.target.closest('[data-s2-copy]'))) {
      e.preventDefault();
      var label = el.querySelector('[data-s2-copy-label]') || el;
      var original = label.textContent;
      label.textContent = 'Copied';
      setTimeout(function () { label.textContent = original; }, 1600);
      return;
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
  else watch();
})();
