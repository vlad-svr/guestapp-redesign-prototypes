/* Stage-based Home (desktop) — Wizz-Air-style journey.
   The booking is split into four stages: Pre-stay, Check-in, Stay, Departure.
   Only the features for the *current* stage (and past ones) are unlocked; future
   stages are visible but blocked until their date arrives. A "simulate the date"
   control (injected under the lede) moves the live stage so the progressive
   unlocking can be demoed. Stages act as animated tabs that switch the panel below. */
(function () {
  var META = [
    { name: 'Pre-stay',  done: 'Completed', current: '2 tasks left', locked: '' },
    { name: 'Check-in',  done: 'Checked in', current: 'Open now',    locked: 'Opens Fri 10 Jul', hint: 'Unlocks on your check-in day · Fri 10 Jul' },
    { name: 'Stay',      done: 'Done',       current: 'In progress',  locked: 'After check-in',   hint: 'Unlocks once you check in' },
    { name: 'Departure', done: 'Done',       current: 'Today',        locked: 'Tue 14 Jul',       hint: 'Unlocks on your departure day · Tue 14 Jul' }
  ];
  var GREET = [
    'Your stay in Barcelona is almost ready — 2 tasks left before your keys unlock.',
    "Today's the day — your check-in is open and your keys are ready.",
    "You're all checked in. Make the most of Barcelona.",
    'Check-out is coming up — here’s how to wrap up your stay.'
  ];
  // Simulator segments -> which stage is "live"
  var SIM = [
    { label: 'Before arrival', stage: 0 },
    { label: 'Check-in day',   stage: 1 },
    { label: 'During stay',    stage: 2 },
    { label: 'Departure day',  stage: 3 }
  ];

  var current = 0; // live stage (from simulated date)
  var viewing = 0; // panel currently shown
  var prevCurrent = 0;

  var tabsEl, indicator, greetSub, stages, panels;

  var CHECK = '<svg viewBox="0 0 24 24" class="icon"><use href="#i-check"/></svg>';

  function markHTML(state) {
    if (state === 'done') return CHECK;
    if (state === 'active') return '<span class="dot mint"></span>';
    if (state === 'live') return '<span class="dot live"></span>';
    return '<span class="dot"></span>'; // locked & default share a plain dot
  }

  function moveIndicator() {
    if (!indicator || !stages[viewing]) return;
    var el = stages[viewing];
    indicator.style.width = el.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + el.offsetLeft + 'px)';
  }

  function render(animateUnlock) {
    stages.forEach(function (btn, i) {
      var m = META[i];
      var tip = btn.querySelector('.stg-tip');
      var mark = btn.querySelector('.stg-mark');
      var locked = i > current;
      var done = i < current;
      var active = i === viewing;

      btn.classList.toggle('active', active);
      btn.classList.toggle('done', done && !active);
      btn.classList.toggle('locked', locked);
      btn.disabled = locked;
      if (tip) tip.textContent = locked ? (m.hint || '') : '';

      var state = active ? 'active' : (locked ? 'locked' : (done ? 'done' : 'live'));
      if (mark) mark.innerHTML = markHTML(state);

      // brief pop for tabs that just became available
      if (animateUnlock && i > prevCurrent && i <= current) {
        btn.classList.remove('just-freed');
        void btn.offsetWidth; // reflow so the animation retriggers
        btn.classList.add('just-freed');
      }
    });

    moveIndicator();

    panels.forEach(function (p) {
      p.classList.toggle('is-active', Number(p.getAttribute('data-panel')) === viewing);
    });

    greetSub.textContent = GREET[viewing];
  }

  function goTo(idx) {
    if (idx < 0 || idx > current) return; // can't view locked stages
    viewing = idx;
    render(false);
  }

  function setCurrent(idx, animate) {
    prevCurrent = current;
    current = idx;
    if (viewing > current) viewing = current; // don't leave a now-relocked panel open
    else viewing = current;                   // jump to the new live stage
    render(animate);
  }

  function buildSimulator() {
    var stage = document.querySelector('.proto-stage');
    if (!stage) return;
    var wrap = document.createElement('div');
    wrap.className = 'sim-toggle';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Simulate the date');
    var seg = '<span class="st-label">Simulate the date</span><div class="st-seg">';
    SIM.forEach(function (s, i) {
      seg += '<button type="button" data-sim="' + s.stage + '"' + (i === 0 ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + '>' + s.label + '</button>';
    });
    seg += '</div>';
    wrap.innerHTML = seg;

    var glass = stage.querySelector('.glass-toggle');
    var lede = stage.querySelector('p.lede');
    if (glass && glass.nextSibling) stage.insertBefore(wrap, glass.nextSibling);
    else if (lede && lede.nextSibling) stage.insertBefore(wrap, lede.nextSibling);
    else stage.appendChild(wrap);

    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sim]');
      if (!b) return;
      var idx = Number(b.getAttribute('data-sim'));
      Array.prototype.forEach.call(wrap.querySelectorAll('[data-sim]'), function (x) {
        var on = x === b;
        x.classList.toggle('on', on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      setCurrent(idx, true);
    });
  }

  function injectSimStyles() {
    var css = [
      '.sim-toggle{display:inline-flex;align-items:center;gap:11px;flex-wrap:wrap;justify-content:center;margin-top:10px}',
      '.sim-toggle .st-label{font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--text-tertiary)}',
      '.sim-toggle .st-seg{display:inline-flex;padding:3px;border-radius:99px;background:var(--n-100);border:1px solid var(--border);box-shadow:var(--shadow-card)}',
      '.sim-toggle .st-seg button{height:30px;padding:0 14px;border-radius:99px;font-size:12px;font-weight:600;color:var(--n-600);transition:color .15s,background .15s}',
      '.sim-toggle .st-seg button:hover{color:var(--navy)}',
      '.sim-toggle .st-seg button.on{background:var(--n-0);color:var(--blue-500);box-shadow:var(--shadow-card)}',
      '.sim-toggle .st-seg button:focus-visible{outline:none;box-shadow:var(--shadow-focus)}'
    ].join('\n');
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function init() {
    tabsEl = document.getElementById('journeyTabs');
    indicator = document.getElementById('stgIndicator');
    greetSub = document.getElementById('greetSub');
    if (!tabsEl) return;
    stages = Array.prototype.slice.call(tabsEl.querySelectorAll('.stg'));
    panels = Array.prototype.slice.call(document.querySelectorAll('.stage-panel'));

    stages.forEach(function (btn) {
      btn.addEventListener('click', function () {
        goTo(Number(btn.getAttribute('data-stage')));
      });
    });

    window.addEventListener('resize', moveIndicator);

    injectSimStyles();
    buildSimulator();
    render(false);

    // Keep the pill glued to the active tab. Deliberately avoids rAF: it never
    // fires while the tab is backgrounded, which would leave the pill mis-sized.
    window.addEventListener('resize', moveIndicator);
    if (window.ResizeObserver) new ResizeObserver(moveIndicator).observe(tabsEl);

    function enableSlide() {
      moveIndicator();                 // final placement once layout has settled
      tabsEl.classList.add('ready');   // only now allow the slide transition
    }
    if (document.readyState === 'complete') enableSlide();
    else window.addEventListener('load', enableSlide);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
