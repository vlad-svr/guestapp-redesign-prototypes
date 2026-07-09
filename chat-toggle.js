/* Chat version A/B toggle — injected into the Chat prototypes.
   Two versions of the same screens:
     • Standard     (default) — liquid glass on chrome only (header, composer);
                    the thread and its bubbles/cards stay solid for reading contrast.
     • Liquid glass — extends frosting onto the reading surfaces (host bubbles, trip
                    strip, day chips, starter chips, and the desktop context rail)
                    over soft color orbs, so the two looks can be compared.
                    (Deliberately relaxes the "chrome-only" ground rule — a decision
                    aid, mirroring the Guidebooks Classic · Liquid-glass switch.)
   Flips `glass-max` on <html>; the CSS overrides live in chat.css.
   Choice persists via localStorage so it holds across mobile ↔ desktop. */
(function () {
  var KEY = 'protoChatGlass';
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
    '.glass-toggle .gt-seg button[data-chat-glass="max"] .gt-dot{background:linear-gradient(135deg,var(--blue-500),#8ca5ff)}',
    '.glass-toggle .gt-seg button[data-chat-glass="std"] .gt-dot{background:var(--n-300)}',
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function sync() {
    var max = root.classList.contains('glass-max');
    var btns = document.querySelectorAll('.glass-toggle [data-chat-glass]');
    Array.prototype.forEach.call(btns, function (b) {
      b.classList.toggle('on', b.getAttribute('data-chat-glass') === (max ? 'max' : 'std'));
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
      '<button data-chat-glass="std"><span class="gt-dot"></span> Standard</button>' +
      '<button data-chat-glass="max"><span class="gt-dot"></span> Liquid glass</button>' +
      '</div>';
    var hud = stage.querySelector('.flow-hud');
    if (hud) stage.insertBefore(wrap, hud);
    else stage.appendChild(wrap);

    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-chat-glass]');
      if (!b) return;
      var v = b.getAttribute('data-chat-glass');
      root.classList.toggle('glass-max', v === 'max');
      try { localStorage.setItem(KEY, v); } catch (err) {}
      sync();
    });
    sync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
