/* Tiny flow engine for interactive prototypes.
   - .flow-screen elements inside the device; first one (or [data-start]) is shown.
   - [data-goto="id"] navigates; [data-back] goes back in history.
   - [data-set-doc="passport|dni"] stores a branch choice and marks .selected.
   - [data-goto-doc-passport] / [data-goto-doc-dni] on one element → branch by stored doc.
   - A screen with data-autonext="id" data-autodelay="2500" advances automatically.
   - [data-scenario="id"] chips reset state and jump to an entry screen. */
(function () {
  var state = { doc: 'passport', history: [] };
  var timer = null;

  function screens() { return Array.prototype.slice.call(document.querySelectorAll('.flow-screen')); }

  function show(id, push) {
    var target = document.getElementById(id);
    if (!target) return;
    if (timer) { clearTimeout(timer); timer = null; }
    screens().forEach(function (s) { s.classList.remove('active'); });
    target.classList.add('active');
    if (push !== false) state.history.push(id);
    var label = document.querySelector('.flow-hud .fh-label');
    if (label) label.textContent = target.getAttribute('data-label') || '';
    var next = target.getAttribute('data-autonext');
    if (next) {
      var delay = parseInt(target.getAttribute('data-autodelay') || '2500', 10);
      timer = setTimeout(function () { show(next); }, delay);
    }
    // scroll device viewport to top on step change
    var scroller = target.closest('.phone, .browser');
    if (scroller) scroller.scrollTop = 0;
  }

  function start() {
    // deep link: #screen-id (from the Prototypes dropdown sub-menu) wins over data-start
    var hashId = location.hash.slice(1);
    var target = hashId && document.getElementById(hashId);
    if (target && target.classList.contains('flow-screen')) {
      state.history = [];
      markChip(hashId);
      show(hashId);
      return;
    }
    var first = document.querySelector('.flow-screen[data-start]') || document.querySelector('.flow-screen');
    if (!first) return;
    state.history = [];
    show(first.id);
  }

  function markChip(id) {
    var chips = document.querySelectorAll('.flow-hud [data-scenario]');
    Array.prototype.forEach.call(chips, function (c) {
      c.classList.toggle('on', c.getAttribute('data-scenario') === id);
    });
  }

  window.addEventListener('hashchange', function () {
    var id = location.hash.slice(1);
    var t = document.getElementById(id);
    if (t && t.classList.contains('flow-screen')) {
      state.history = [];
      markChip(id);
      show(id);
    }
  });

  document.addEventListener('click', function (e) {
    var el;
    if ((el = e.target.closest('[data-set-doc]'))) {
      state.doc = el.getAttribute('data-set-doc');
      var group = el.parentElement.querySelectorAll('[data-set-doc]');
      Array.prototype.forEach.call(group, function (c) { c.classList.remove('selected'); });
      el.classList.add('selected');
      return;
    }
    if ((el = e.target.closest('[data-scenario]'))) {
      e.preventDefault();
      state.doc = el.getAttribute('data-doc') || 'passport';
      document.querySelectorAll('.flow-hud [data-scenario]').forEach(function (c) { c.classList.remove('on'); });
      el.classList.add('on');
      state.history = [];
      show(el.getAttribute('data-scenario'));
      return;
    }
    if ((el = e.target.closest('[data-restart]'))) { e.preventDefault(); start(); return; }
    if ((el = e.target.closest('[data-back]'))) {
      e.preventDefault();
      state.history.pop();
      var prev = state.history[state.history.length - 1];
      if (prev) show(prev, false); else start();
      return;
    }
    if ((el = e.target.closest('[data-goto-doc-passport],[data-goto-doc-dni]'))) {
      e.preventDefault();
      var id = el.getAttribute(state.doc === 'dni' ? 'data-goto-doc-dni' : 'data-goto-doc-passport');
      if (id) show(id);
      return;
    }
    if ((el = e.target.closest('[data-goto]'))) {
      e.preventDefault();
      show(el.getAttribute('data-goto'));
      return;
    }
  });

  var css = [
    '.flow-screen{display:none !important}',
    '.flow-screen.active{display:flex !important}',
    '.flow-hud{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:-8px}',
    '.flow-hud .fh-chip{height:30px;padding:0 14px;border-radius:99px;border:1px solid var(--border);background:var(--n-0);font-size:11.5px;font-weight:600;color:var(--n-600);display:inline-flex;align-items:center;gap:6px;cursor:pointer;box-shadow:var(--shadow-card)}',
    '.flow-hud .fh-chip:hover{border-color:var(--blue-500);color:var(--blue-500)}',
    '.flow-hud .fh-chip.on{background:var(--tint-info);border-color:var(--blue-500);color:var(--blue-500)}',
    '.flow-hud .fh-restart{color:var(--text-tertiary);font-size:11.5px;font-weight:600;display:inline-flex;align-items:center;gap:5px;cursor:pointer;padding:6px}',
    '.flow-hud .fh-restart:hover{color:var(--navy)}',
    '.flow-hud .fh-label{width:100%;text-align:center;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-tertiary);margin-top:2px}',
    '.sim-note{font-size:10.5px;font-weight:600;color:var(--text-tertiary);text-align:center}',
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
