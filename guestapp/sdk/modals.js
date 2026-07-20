/* Modal layer for prototypes.
   [data-modal="id"] opens #id (.proto-modal placed inside the device frame).
   [data-modal-close] or a click on the scrim closes it.
   Variants: default = centered dialog · .sheet = bottom sheet · .right = right-side sheet. */
(function () {
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-modal]');
    if (t) {
      e.preventDefault();
      var m = document.getElementById(t.getAttribute('data-modal'));
      if (m) m.classList.add('open');
      return;
    }
    if (e.target.closest('[data-modal-close]') || e.target.classList.contains('pm-scrim')) {
      var o = e.target.closest('.proto-modal');
      if (o) o.classList.remove('open');
    }
  });

  var css = [
    '.phone, .browser, .rail-demo { position: relative; }',
    '.proto-modal{position:absolute;inset:0;z-index:60;display:none;overflow:hidden;border-radius:inherit}',
    '.proto-modal.open{display:block}',
    '.pm-scrim{position:absolute;inset:0;background:rgba(22,22,67,0.45);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}',
    '.pm-card{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(430px,calc(100% - 44px));background:#fff;border-radius:16px;box-shadow:0 30px 80px rgba(22,22,67,0.35);padding:24px;animation:pm-in .22s ease both;max-height:calc(100% - 60px);overflow-y:auto}',
    '.proto-modal.sheet .pm-card{top:auto;bottom:0;left:0;transform:none;width:100%;max-height:86%;border-radius:22px 22px 0 0;padding:10px 18px 24px;animation:pm-up .28s ease both}',
    '.proto-modal.right .pm-card{top:0;bottom:0;right:0;left:auto;transform:none;width:88%;max-width:380px;max-height:none;height:100%;border-radius:22px 0 0 22px;padding:20px 18px;animation:pm-side .28s ease both;background:rgba(255,255,255,0.94);backdrop-filter:blur(24px) saturate(1.6);-webkit-backdrop-filter:blur(24px) saturate(1.6)}',
    '.pm-grabber{width:38px;height:4px;border-radius:99px;background:var(--n-200);margin:4px auto 14px}',
    '.pm-close{position:absolute;top:14px;right:14px;width:30px;height:30px;border-radius:9px;background:var(--n-50);display:grid;place-items:center;color:var(--n-600);z-index:2}',
    '.pm-close:hover{background:var(--n-100);color:var(--navy)}',
    '.pm-title{font-size:16.5px;font-weight:700;color:var(--navy);letter-spacing:-0.01em;padding-right:32px}',
    '.pm-desc{font-size:12.5px;line-height:18px;color:var(--text-secondary);margin-top:6px}',
    '.pm-actions{display:flex;flex-direction:column;gap:10px;margin-top:18px}',
    '.pm-actions .btn{width:100%}',
    /* share link row */
    '.pm-link{display:flex;align-items:center;gap:10px;margin-top:16px;height:46px;border-radius:12px;border:1px solid var(--border-subtle);background:var(--n-50);padding:0 6px 0 14px;font-size:12px;color:var(--n-600);font-family:ui-monospace,monospace;overflow:hidden;white-space:nowrap}',
    '.pm-link .pm-copy{margin-left:auto;flex-shrink:0;height:34px;padding:0 14px;border-radius:9px;background:var(--blue-500);color:#fff;font-size:12px;font-weight:600;display:inline-flex;align-items:center;gap:6px;box-shadow:var(--shadow-brand)}',
    '.pm-share-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px}',
    '.pm-share-opt{display:flex;flex-direction:column;align-items:center;gap:7px;padding:13px 6px;border-radius:14px;border:1px solid var(--border);background:#fff;font-size:11px;font-weight:600;color:var(--n-600);cursor:pointer}',
    '.pm-share-opt:hover{border-color:var(--blue-500);color:var(--blue-500)}',
    '.pm-share-opt .so-ic{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:var(--tint-info);color:var(--blue-500)}',
    /* QR modal */
    '.pm-qr{display:flex;gap:20px;align-items:center;margin-top:18px}',
    '.pm-qr .qr-box-m{width:150px;height:150px;border-radius:14px;background:#fff;border:1px solid var(--border);box-shadow:var(--shadow-card);display:grid;place-items:center;flex-shrink:0}',
    '.pm-qr .qr-cells-m{display:grid;grid-template-columns:repeat(9,12px);grid-template-rows:repeat(9,12px);gap:2px}',
    '.pm-qr .qr-cells-m i{background:var(--navy);border-radius:1.5px}',
    '.pm-qr .qr-cells-m i.off{background:transparent}',
    '.pm-steps{display:flex;flex-direction:column;gap:10px}',
    '.pm-steps .ps{display:flex;gap:10px;align-items:flex-start;font-size:12.5px;line-height:18px;color:var(--n-600)}',
    '.pm-steps .ps b{color:var(--navy)}',
    '.pm-steps .ps-n{width:22px;height:22px;border-radius:50%;background:var(--tint-info);color:var(--blue-500);font-size:11px;font-weight:700;display:grid;place-items:center;flex-shrink:0}',
    '.pm-wait{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:600;color:var(--text-secondary);margin-top:14px}',
    '.pm-wait .spin{width:13px;height:13px;border-radius:50%;border:2px solid rgba(56,91,248,0.25);border-top-color:var(--blue-500);animation:spin .9s linear infinite}',
    '.pm-list{display:flex;flex-direction:column;gap:12px;margin-top:16px}',
    '.pm-list .pl-row{display:flex;gap:11px;align-items:flex-start;font-size:12.5px;line-height:18px;color:var(--text-secondary)}',
    '.pm-list .pl-row b{color:var(--navy)}',
    '.pm-list .pl-ic{width:30px;height:30px;border-radius:9px;background:var(--tint-info);color:var(--blue-500);display:grid;place-items:center;flex-shrink:0}',
    '@keyframes pm-in{from{opacity:0;transform:translate(-50%,-48%) scale(0.97)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}',
    '@keyframes pm-up{from{transform:translateY(30px);opacity:0.4}to{transform:translateY(0);opacity:1}}',
    '@keyframes pm-side{from{transform:translateX(40px);opacity:0.4}to{transform:translateX(0);opacity:1}}',
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();
