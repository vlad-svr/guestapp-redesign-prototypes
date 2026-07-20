/* Guidebooks version A/B toggle — injected into the Guidebooks prototypes.
   Two versions of the same screens:
     • Classic     (default) — the shipped treatment: liquid glass on chrome only
                   (top bar, chapter rail, doc toolbar, Vela); reading surfaces
                   (cards, Wi-Fi, map, place cards) stay solid for contrast.
     • Liquid glass — extends the frosted treatment onto those reading surfaces
                   over soft color orbs, so the two looks can be compared side by side.
                   (Deliberately relaxes the "chrome-only" ground rule — this is a
                   decision aid, not necessarily the shipped default.)
   Flips `glass-max` on <html>; the CSS overrides live in guide.css.
   Choice persists via localStorage so it holds across mobile ↔ desktop. */
(function () {
  var KEY = 'protoGuideGlass';
  var root = document.documentElement;

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'max') root.classList.add('glass-max');

  var css = [
    '.glass-toggle{display:inline-flex;align-items:center;gap:11px;flex-wrap:wrap;justify-content:center}',
    '.glass-toggle .gt-label{font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-tertiary)}',
    '.glass-toggle .gt-seg{display:inline-flex;padding:3px;border-radius:99px;background:var(--n-100);border:1px solid var(--border);box-shadow:var(--shadow-card)}',
    '.glass-toggle .gt-seg button{height:30px;padding:0 15px;border-radius:99px;font-size:12px;font-weight:600;color:var(--n-600);display:inline-flex;align-items:center;gap:6px;transition:color .15s,background .15s}',
    '.glass-toggle .gt-seg button:hover{color:var(--navy)}',
    '.glass-toggle .gt-seg button.on{background:var(--n-0);color:var(--blue-500);box-shadow:var(--shadow-card)}',
    '.glass-toggle .gt-dot{width:8px;height:8px;border-radius:50%}',
    '.glass-toggle .gt-seg button[data-guide-glass="max"] .gt-dot{background:linear-gradient(135deg,var(--blue-500),#8ca5ff)}',
    '.glass-toggle .gt-seg button[data-guide-glass="classic"] .gt-dot{background:var(--n-300)}',
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function sync() {
    var max = root.classList.contains('glass-max');
    var btns = document.querySelectorAll('.glass-toggle [data-guide-glass]');
    Array.prototype.forEach.call(btns, function (b) {
      b.classList.toggle('on', b.getAttribute('data-guide-glass') === (max ? 'max' : 'classic'));
    });
  }

  function build() {
    var stage = document.querySelector('.proto-stage');
    if (!stage) return;
    var wrap = document.createElement('div');
    wrap.className = 'glass-toggle';
    wrap.innerHTML =
      '<span class="gt-label">Version</span>' +
      '<div class="gt-seg">' +
      '<button data-guide-glass="classic"><span class="gt-dot"></span> Classic</button>' +
      '<button data-guide-glass="max"><span class="gt-dot"></span> Liquid glass</button>' +
      '</div>';
    var hud = stage.querySelector('.flow-hud');
    if (hud) stage.insertBefore(wrap, hud);
    else stage.appendChild(wrap);

    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-guide-glass]');
      if (!b) return;
      var v = b.getAttribute('data-guide-glass');
      root.classList.toggle('glass-max', v === 'max');
      try { localStorage.setItem(KEY, v); } catch (err) {}
      sync();
    });
    sync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
