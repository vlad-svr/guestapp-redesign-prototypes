/* Check-out glass A/B toggle — injected into the Check-out prototypes.
   Two versions of the same screens:
     • Standard     (default) — the shipped ground rule: liquid glass on chrome only
                    (top bar, progress track, CTA dock, Vela); reading surfaces
                    (checklist, add-ons, ledger, cards) stay solid for contrast.
     • Liquid glass — extends a STRONGER frosted treatment onto those reading
                    surfaces over soft color orbs, with deeper blur + saturation,
                    so the two looks can be compared side by side. (Deliberately
                    relaxes the chrome-only rule — a decision aid, not the default.)
   Flips `glass-strong` on <html>; the CSS overrides live in checkout.css.
   Choice persists via localStorage so it holds across mobile <-> desktop. */
(function () {
  var KEY = 'protoCheckoutGlass';
  var root = document.documentElement;

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'strong') root.classList.add('glass-strong');

  var css = [
    '.glass-toggle{display:inline-flex;align-items:center;gap:11px;flex-wrap:wrap;justify-content:center}',
    '.glass-toggle .gt-label{font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-tertiary)}',
    '.glass-toggle .gt-seg{display:inline-flex;padding:3px;border-radius:99px;background:var(--n-100);border:1px solid var(--border);box-shadow:var(--shadow-card)}',
    '.glass-toggle .gt-seg button{height:30px;padding:0 15px;border-radius:99px;font-size:12px;font-weight:600;color:var(--n-600);display:inline-flex;align-items:center;gap:6px;transition:color .15s,background .15s}',
    '.glass-toggle .gt-seg button:hover{color:var(--navy)}',
    '.glass-toggle .gt-seg button.on{background:var(--n-0);color:var(--blue-500);box-shadow:var(--shadow-card)}',
    '.glass-toggle .gt-dot{width:8px;height:8px;border-radius:50%}',
    '.glass-toggle .gt-seg button[data-co-glass="strong"] .gt-dot{background:linear-gradient(135deg,var(--blue-500),#8ca5ff)}',
    '.glass-toggle .gt-seg button[data-co-glass="standard"] .gt-dot{background:var(--n-300)}',
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function sync() {
    var strong = root.classList.contains('glass-strong');
    var btns = document.querySelectorAll('.glass-toggle [data-co-glass]');
    Array.prototype.forEach.call(btns, function (b) {
      b.classList.toggle('on', b.getAttribute('data-co-glass') === (strong ? 'strong' : 'standard'));
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
      '<button data-co-glass="standard"><span class="gt-dot"></span> Standard</button>' +
      '<button data-co-glass="strong"><span class="gt-dot"></span> Liquid glass</button>' +
      '</div>';
    var hud = stage.querySelector('.flow-hud');
    if (hud) stage.insertBefore(wrap, hud);
    else stage.appendChild(wrap);

    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-co-glass]');
      if (!b) return;
      var v = b.getAttribute('data-co-glass');
      root.classList.toggle('glass-strong', v === 'strong');
      try { localStorage.setItem(KEY, v); } catch (err) {}
      sync();
    });
    sync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
