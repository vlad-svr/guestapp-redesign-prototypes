/* Signature interaction for the registration prototypes.
   Mirrors SignBlock + SignatureCanvas (react-signature-canvas) + SignatureModal:
   - Desktop: draw inline on the pad (enabled).
   - Mobile: the inline pad is disabled + "Tap to open the signature form"; tapping
     opens the bottom sheet (#m-sign) to draw, Confirm renders the drawing back into
     the inline pad as an <img> preview.
   - Clear resets to empty; submitting while required-but-empty shows the error.
   Pen color #161643 (the real --chekin-blue-900). Pure canvas, mock only. */
(function () {
  var PEN = '#161643';

  function makePad(canvas, container, onInk) {
    var ctx = canvas.getContext('2d');
    var ratio = window.devicePixelRatio || 1;
    var drawing = false, ink = false, last = null;

    function style() {
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = PEN; ctx.fillStyle = PEN;
    }
    function size() {
      var r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      canvas.width = Math.round(r.width * ratio);
      canvas.height = Math.round(r.height * ratio);
      style();
      return true;
    }
    function point(e) {
      var r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    function mark() { if (!ink) { ink = true; container.classList.add('inked'); if (onInk) onInk(true); } }

    canvas.addEventListener('pointerdown', function (e) {
      if (!canvas.width) size();
      drawing = true; last = point(e);
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      ctx.beginPath(); ctx.arc(last.x, last.y, 1.1, 0, Math.PI * 2); ctx.fill();
      mark();
      e.preventDefault();
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!drawing) return;
      var p = point(e);
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      last = p;
    });
    function end() { drawing = false; }
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('pointerleave', end);

    return {
      size: size,
      hasInk: function () { return ink; },
      dataURL: function () { return canvas.toDataURL('image/png'); },
      clear: function () {
        var w = canvas.width, h = canvas.height;
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, w, h); style();
        ink = false; container.classList.remove('inked'); if (onInk) onInk(false);
      }
    };
  }

  // ---- Inline (desktop) pads ----
  Array.prototype.forEach.call(document.querySelectorAll('.sig-pad[data-sign="inline"]'), function (pad) {
    var canvas = pad.querySelector('.sig-canvas');
    if (!canvas) return;
    var ctrl = makePad(canvas, pad);
    pad.__sig = ctrl;
    setTimeout(ctrl.size, 60);
    window.addEventListener('resize', function () { /* keep drawing on resize is out of scope; re-size only if empty */ if (!ctrl.hasInk()) ctrl.size(); });
  });

  // ---- Mobile sheet ----
  var sheet = document.getElementById('m-sign');
  var surface = sheet && sheet.querySelector('.sign-surface');
  var sheetCanvas = surface && surface.querySelector('.sig-canvas');
  var confirmBtn = sheet && sheet.querySelector('[data-sign-confirm]');
  var sheetCtrl = null;
  var origin = null; // the inline .sig-tap pad that opened the sheet

  function setConfirm(enabled) {
    if (!confirmBtn) return;
    confirmBtn.disabled = !enabled;
  }
  if (sheetCanvas) {
    sheetCtrl = makePad(sheetCanvas, surface, function (has) { setConfirm(has); });
  }

  function openSheet() { if (sheet) sheet.classList.add('open'); }
  function closeSheet() { if (sheet) sheet.classList.remove('open'); }
  function resetSheet() {
    if (sheetCtrl) sheetCtrl.clear();
    setConfirm(false);
  }

  document.addEventListener('click', function (e) {
    var el;

    // clear tool FIRST — so tapping Clear inside a pad never also reopens the sheet
    if ((el = e.target.closest('[data-sign-clear]'))) {
      e.preventDefault(); e.stopPropagation();
      var host = el.closest('.sign-surface, .sig-pad');
      if (!host) return;
      if (host.classList.contains('sign-surface')) { resetSheet(); return; }
      if (host.__sig) host.__sig.clear();           // desktop inline canvas
      var im = host.querySelector('.sig-img');       // mobile preview image
      if (im) im.remove();
      host.classList.remove('inked');
      return;
    }

    // confirm the drawn signature → render into the origin inline pad, close sheet
    if ((el = e.target.closest('[data-sign-confirm]'))) {
      e.preventDefault();
      if (!sheetCtrl || !sheetCtrl.hasInk()) return;
      if (origin) {
        var img = origin.querySelector('.sig-img');
        if (!img) { img = document.createElement('img'); img.className = 'sig-img'; origin.insertBefore(img, origin.firstChild); }
        img.src = sheetCtrl.dataURL();
        origin.classList.add('inked');
        origin.classList.remove('error');
        var msg = origin.parentElement && origin.parentElement.querySelector('.sig-msg');
        if (msg) msg.classList.remove('show');
      }
      closeSheet();
      return;
    }

    // cancel = clear + close
    if ((el = e.target.closest('[data-sign-cancel]'))) {
      e.preventDefault();
      resetSheet();
      closeSheet();
      return;
    }

    // open the sheet from the inline tap-pad (mobile)
    if ((el = e.target.closest('[data-sign-open]'))) {
      e.preventDefault();
      origin = el;
      resetSheet();
      openSheet();
      setTimeout(function () { if (sheetCtrl) sheetCtrl.size(); }, 40);
      return;
    }

    // scrim tap closes the sheet
    if (e.target.classList.contains('pm-scrim') && e.target.closest('#m-sign')) {
      closeSheet();
      return;
    }

    // submit — require a signature when the target pad is empty
    if ((el = e.target.closest('[data-sign-submit]'))) {
      var sel = el.getAttribute('data-sign-target');
      var pad = sel && document.querySelector(sel);
      var signed = pad && pad.classList.contains('inked');
      if (pad && !signed) {
        e.preventDefault();
        pad.classList.add('error');
        var m = pad.parentElement && pad.parentElement.querySelector('.sig-msg');
        if (m) m.classList.add('show');
        pad.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      var href = el.getAttribute('data-href');
      if (href) { e.preventDefault(); location.href = href; }
      // otherwise let the element's own href/flow handler run
    }
  });
})();
