/* Row kebab menus for prototypes (the ⋯ on a guest / cart row).

   Markup:
     <span class="rm-wrap">
       <button class="rm-btn" data-menu="gm-maria">⋯</button>
       <div class="rm-pop" id="gm-maria">
         <button class="rm-item">…</button>
       </div>
     </span>

   [data-menu="id"] toggles #id; any other click closes every open menu.
   The popover is absolutely positioned inside .rm-wrap, so the card that
   holds the rows must NOT be overflow:hidden.

   Mobile pages use a .proto-modal.sheet instead (modals.js) — a bottom
   sheet is the native pattern there and needs no anchoring. */
(function () {
  function closeAll(except) {
    document.querySelectorAll('.rm-pop.open').forEach(function (p) {
      if (p !== except) p.classList.remove('open');
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-menu]');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      var pop = document.getElementById(btn.getAttribute('data-menu'));
      closeAll(pop);
      if (pop) pop.classList.toggle('open');
      return;
    }
    // A click inside an open menu still closes it — every item is an action.
    closeAll(null);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });

  var css = [
    '.rm-wrap{position:relative;display:inline-flex}',
    '.rm-btn{width:30px;height:30px;border-radius:9px;color:var(--n-500);display:grid;place-items:center;transition:background .15s,color .15s}',
    '.rm-btn:hover{background:var(--n-50);color:var(--navy)}',
    '.rm-pop{position:absolute;top:calc(100% + 6px);right:0;z-index:30;display:none;min-width:232px;padding:6px;background:#fff;border:1px solid var(--border);border-radius:14px;box-shadow:0 16px 40px rgba(22,22,67,0.18);animation:rm-in .14s ease both}',
    '.rm-pop.open{display:block}',
    '.rm-item{display:flex;gap:10px;align-items:flex-start;width:100%;padding:9px 10px;border-radius:10px;text-align:left;transition:background .12s}',
    '.rm-item:hover{background:var(--n-50)}',
    '.rm-item .icon{width:15px;height:15px;color:var(--n-500);flex-shrink:0;margin-top:1px}',
    '.rm-item .rm-t{display:block;font-size:12.5px;font-weight:600;color:var(--navy)}',
    '.rm-item .rm-d{display:block;font-size:10.5px;line-height:14px;color:var(--text-tertiary);margin-top:1px}',
    /* The zero-cost variant — an exemption costs the guest nothing to ask for */
    '.rm-item.free .icon{color:var(--green-700)}',
    '.rm-item.free .rm-d{color:var(--green-700)}',
    '.rm-sep{border:none;border-top:1px solid var(--border);margin:5px 6px}',
    '@keyframes rm-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}',
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();
