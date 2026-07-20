/* Splash screen style A/B toggle — injected into both splash prototypes.

   Two treatments of the *same* component. They share every behavioural fix —
   the timing contract (`max(load, 500 ms)`), the 6 s honesty rung, the 20 s
   watchdog, the error / offline / branded / disabled states, the handoff into
   the skeleton, and the whole accessibility pass. Only the surface differs:

     • Classic (refined V1) — the shipped calm: a flat brand background, the
       bare logo, the three pulsing dots. The curtains are gone, because they
       only ever existed to cover a transition that no longer needs covering,
       and because they are what produced the dead screen. Nothing else about
       V1's look changes.
     • Modern (V2) — the pre-auth idiom already used by Find booking and
       Sign-in: the branded gradient, soft colour orbs, a film-grain layer, a
       liquid-glass logo plate with one slow specular sweep, and the honest
       progress ring.

   The dots and the ring are both honest, in different ways: dots are
   indeterminate by construction and never imply a percentage; the ring eases
   to 90 % and only completes when the data actually lands.

   Flips `sp-classic` on <html>; the overrides live in splash-v2.css §9.5.
   Choice persists via localStorage so it holds across mobile ↔ desktop. */
(function () {
  var KEY = 'protoSplashStyle';
  var root = document.documentElement;

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'classic') root.classList.add('sp-classic');

  var css = [
    '.splash-toggle{display:inline-flex;align-items:center;gap:11px;flex-wrap:wrap;justify-content:center}',
    '.splash-toggle .st-label{font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-tertiary)}',
    '.splash-toggle .st-seg{display:inline-flex;padding:3px;border-radius:99px;background:var(--n-100);border:1px solid var(--border);box-shadow:var(--shadow-card)}',
    '.splash-toggle .st-seg button{height:30px;padding:0 15px;border-radius:99px;font-size:12px;font-weight:600;color:var(--n-600);display:inline-flex;align-items:center;gap:6px;transition:color .15s,background .15s}',
    '.splash-toggle .st-seg button:hover{color:var(--navy)}',
    '.splash-toggle .st-seg button.on{background:var(--n-0);color:var(--blue-500);box-shadow:var(--shadow-card)}',
    '.splash-toggle .st-dot{width:8px;height:8px;border-radius:50%}',
    '.splash-toggle .st-seg button[data-splash-style="modern"] .st-dot{background:linear-gradient(135deg,var(--navy),var(--blue-500))}',
    '.splash-toggle .st-seg button[data-splash-style="classic"] .st-dot{background:var(--n-300)}',
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function sync() {
    var classic = root.classList.contains('sp-classic');
    var btns = document.querySelectorAll('.splash-toggle [data-splash-style]');
    Array.prototype.forEach.call(btns, function (b) {
      b.classList.toggle('on', b.getAttribute('data-splash-style') === (classic ? 'classic' : 'modern'));
    });
  }

  function build() {
    var stage = document.querySelector('.proto-stage');
    if (!stage) return;
    var wrap = document.createElement('div');
    wrap.className = 'splash-toggle';
    wrap.innerHTML =
      '<span class="st-label">Style</span>' +
      '<div class="st-seg">' +
      '<button data-splash-style="classic"><span class="st-dot"></span> Classic (refined V1)</button>' +
      '<button data-splash-style="modern"><span class="st-dot"></span> Modern (V2)</button>' +
      '</div>';
    var hud = stage.querySelector('.flow-hud');
    if (hud) stage.insertBefore(wrap, hud);
    else stage.appendChild(wrap);

    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-splash-style]');
      if (!b) return;
      var v = b.getAttribute('data-splash-style');
      root.classList.toggle('sp-classic', v === 'classic');
      try { localStorage.setItem(KEY, v); } catch (err) {}
      sync();
    });
    sync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
