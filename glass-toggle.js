/* Liquid-glass A/B toggle — injected into the Search, Error & Auth prototypes.
   Two versions of the same screens:
     • Full    (default) — the frosted auth card / method cards / property chip /
                language pill over color orbs on a gradient stage.
     • Minimal — those extra surfaces revert to solids and the orbs/gradient
                flatten; only the baseline chrome glass (top bars, CTA docks) stays.
   Flips `glass-lite` on <html>; the CSS overrides live in search.css (Find-booking /
   Error) and auth.css (Sign in & onboarding).
   Choice persists across pages via localStorage so you can compare Search ↔ Error ↔ Auth. */
(function () {
  var KEY = 'protoGlass';
  var root = document.documentElement;

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'lite') root.classList.add('glass-lite');

  var css = [
    '.glass-toggle{display:inline-flex;align-items:center;gap:11px;flex-wrap:wrap;justify-content:center}',
    '.glass-toggle .gt-label{font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-tertiary)}',
    '.glass-toggle .gt-seg{display:inline-flex;padding:3px;border-radius:99px;background:var(--n-100);border:1px solid var(--border);box-shadow:var(--shadow-card)}',
    '.glass-toggle .gt-seg button{height:30px;padding:0 15px;border-radius:99px;font-size:12px;font-weight:600;color:var(--n-600);display:inline-flex;align-items:center;gap:6px;transition:color .15s,background .15s}',
    '.glass-toggle .gt-seg button:hover{color:var(--navy)}',
    '.glass-toggle .gt-seg button.on{background:var(--n-0);color:var(--blue-500);box-shadow:var(--shadow-card)}',
    '.glass-toggle .gt-dot{width:8px;height:8px;border-radius:50%}',
    '.glass-toggle .gt-seg button[data-glass="full"] .gt-dot{background:linear-gradient(135deg,var(--blue-500),#8ca5ff)}',
    '.glass-toggle .gt-seg button[data-glass="lite"] .gt-dot{background:var(--n-300)}',
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function sync() {
    var lite = root.classList.contains('glass-lite');
    var btns = document.querySelectorAll('.glass-toggle [data-glass]');
    Array.prototype.forEach.call(btns, function (b) {
      b.classList.toggle('on', b.getAttribute('data-glass') === (lite ? 'lite' : 'full'));
    });
  }

  function build() {
    var stage = document.querySelector('.proto-stage');
    if (!stage) return;
    var wrap = document.createElement('div');
    wrap.className = 'glass-toggle';
    wrap.innerHTML =
      '<span class="gt-label">Glass style</span>' +
      '<div class="gt-seg">' +
      '<button data-glass="full"><span class="gt-dot"></span> Full</button>' +
      '<button data-glass="lite"><span class="gt-dot"></span> Minimal</button>' +
      '</div>';
    var hud = stage.querySelector('.flow-hud');
    if (hud) stage.insertBefore(wrap, hud);
    else stage.appendChild(wrap);

    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-glass]');
      if (!b) return;
      var v = b.getAttribute('data-glass');
      root.classList.toggle('glass-lite', v === 'lite');
      try { localStorage.setItem(KEY, v); } catch (err) {}
      sync();
    });
    sync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
