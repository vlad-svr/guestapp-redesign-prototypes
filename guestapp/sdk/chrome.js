/* SDK-prototype chrome: view + accent toggles, and the integration
   event console.
   - Injects a "Desktop · Mobile" segment (html.view-mobile, persisted) and
     a "Neutral · Host brand" accent segment (html[data-accent], persisted) —
     the accent demo stands in for the SDK's `styles` / `stylesLink` injection.
   - Any element with [data-event="onGuestRegistered"] (+ optional
     [data-event-payload='{"id":"g_1"}']) logs that callback to the console
     panel when clicked.
   - Screen changes are observed via the flow.js active-class flip and logged
     as onScreenChanged — the same composition trick the guestapp prototype
     uses (MutationObserver, so neither script knows about the other). */
(function () {
  var KEY_VIEW = 'sdkproto-view';
  var KEY_ACCENT = 'sdkproto-accent';

  /* ---- persisted toggles ---- */
  function apply() {
    document.documentElement.classList.toggle('view-mobile', localStorage.getItem(KEY_VIEW) === 'mobile');
    if (localStorage.getItem(KEY_ACCENT) === 'host') document.documentElement.setAttribute('data-accent', 'host');
    else document.documentElement.removeAttribute('data-accent');
  }
  apply();

  function seg(label, key, opts) {
    var wrap = document.createElement('div');
    wrap.className = 'pt-group';
    var html = label + ' <div class="pt-seg">';
    opts.forEach(function (o) {
      var on = (localStorage.getItem(key) || opts[0].value) === o.value;
      html += '<button data-k="' + o.value + '"' + (on ? ' class="on"' : '') + '>' + o.label + '</button>';
    });
    wrap.innerHTML = html + '</div>';
    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-k]');
      if (!b) return;
      localStorage.setItem(key, b.getAttribute('data-k'));
      wrap.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
      apply();
    });
    return wrap;
  }

  /* ---- in-widget language + menu (product UI, injected so all pages
     stay markup-identical across the two design variants) ----
     Rules: a language chip on every stable screen header (guests read
     legal text in their own language); a menu button ONLY on ALL-mode
     pages — scoped modes (ONLY_GUEST_FORM, IV_ONLY…) stay single-purpose,
     and the Home hub IS the menu, so it gets no button either. */
  var PAGE = location.pathname.split('/').pop();
  var MENU_PAGES = ['flow-guests.html', 'flow-guidebooks.html', 'flow-remote-access.html'];
  var LANGS = [['EN', 'English'], ['ES', 'Español'], ['FR', 'Français'], ['DE', 'Deutsch'], ['IT', 'Italiano']];
  var KEY_LANG = 'sdkproto-lang';
  var GLOBE = '<svg viewBox="0 0 24 24" class="icon icon-sm"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>';

  function chipLabel(code) { return GLOBE + ' <span class="lc-code">' + code + '</span>'; }

  function widgetChrome() {
    var lang = localStorage.getItem(KEY_LANG) || 'EN';
    document.querySelectorAll('.sdk-widget').forEach(function (w) {
      var head = w.querySelector('.w-head');
      if (!head) return;
      var screen = w.classList.contains('flow-screen') ? w : w.closest('.flow-screen');
      var transient = screen && screen.hasAttribute('data-autonext');
      if (!transient && !head.querySelector('.lang-chip')) {
        var b = document.createElement('button');
        b.className = 'lang-chip';
        b.setAttribute('aria-label', 'Change language');
        head.appendChild(b);
      }
      head.querySelectorAll('.lang-chip').forEach(function (c) { c.innerHTML = chipLabel(lang); });
      if (MENU_PAGES.indexOf(PAGE) !== -1 && !head.querySelector('.w-menu-btn')) {
        var m = document.createElement('button');
        m.className = 'w-menu-btn';
        m.setAttribute('aria-label', 'Check-in menu');
        m.innerHTML = '<svg viewBox="0 0 24 24" class="icon"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>';
        head.appendChild(m);
      }
    });
  }

  function langHTML() {
    var lang = localStorage.getItem(KEY_LANG) || 'EN';
    var rows = LANGS.map(function (l) {
      return '<button class="ws-row" data-ws-lang="' + l[0] + '"' + (l[0] === lang ? ' data-on' : '') + '>' +
        '<span class="ws-code">' + l[0] + '</span>' + l[1] +
        '<svg viewBox="0 0 24 24" class="icon icon-sm ws-check"><path d="M20 6 9 17l-5-5"/></svg></button>';
    }).join('');
    return '<div class="ws-scrim" data-ws-close></div><div class="ws-card">' +
      '<div class="ws-title">Language</div>' + rows +
      '<div class="ws-note">Set by the guest here, or preset by the partner via <code>defaultLanguage</code>.</div></div>';
  }

  function menuHTML() {
    return '<div class="ws-scrim" data-ws-close></div><div class="ws-card">' +
      '<div class="ws-title">Your check-in</div>' +
      '<a class="ws-row" href="flow-home.html">' + '<span class="ws-code">⌂</span>Overview</a>' +
      '<a class="ws-row" href="flow-guests.html">' + '<span class="ws-code">◫</span>Guests</a>' +
      '<a class="ws-row" href="flow-guidebooks.html">' + '<span class="ws-code">❏</span>Guidebooks</a>' +
      '<a class="ws-row" href="flow-guidebooks.html#gb-faq">' + '<span class="ws-code">?</span>FAQ</a>' +
      '<a class="ws-row" href="flow-remote-access.html#ra-keys">' + '<span class="ws-code">⚿</span>Door code</a>' +
      '<button class="ws-row" data-ws-lang-open>' + '<span class="ws-code">' + GLOBE + '</span>Language</button>' +
      '<div class="ws-note">The menu exists in <code>mode: "ALL"</code> only — scoped modes stay single-purpose.</div></div>';
  }

  function openSheet(w, kind) {
    var sheet = w.querySelector('.widget-sheet[data-kind="' + kind + '"]');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.className = 'widget-sheet';
      sheet.setAttribute('data-kind', kind);
      sheet.innerHTML = kind === 'lang' ? langHTML() : menuHTML();
      w.appendChild(sheet);
    } else if (kind === 'lang') {
      sheet.innerHTML = langHTML();
    }
    sheet.classList.add('open');
  }

  document.addEventListener('click', function (e) {
    var el;
    if ((el = e.target.closest('.lang-chip'))) {
      e.preventDefault();
      openSheet(el.closest('.sdk-widget'), 'lang');
      return;
    }
    if ((el = e.target.closest('.w-menu-btn'))) {
      openSheet(el.closest('.sdk-widget'), 'menu');
      return;
    }
    if ((el = e.target.closest('[data-ws-lang-open]'))) {
      var w = el.closest('.sdk-widget');
      el.closest('.widget-sheet').classList.remove('open');
      openSheet(w, 'lang');
      return;
    }
    if ((el = e.target.closest('[data-ws-lang]'))) {
      localStorage.setItem(KEY_LANG, el.getAttribute('data-ws-lang'));
      document.querySelectorAll('.lang-chip').forEach(function (c) { c.innerHTML = chipLabel(el.getAttribute('data-ws-lang')); });
      el.closest('.widget-sheet').classList.remove('open');
      return;
    }
    if (e.target.closest('[data-ws-close]')) {
      var open = e.target.closest('.widget-sheet');
      if (open) open.classList.remove('open');
    }
  });

  /* ---- agreement clauses ----
     Capture phase, because a required clause left unticked has to stop the
     submit before flow.js's own document listener advances the screen —
     the same gate the real SignBlock applies. */
  document.addEventListener('click', function (e) {
    var lab = e.target.closest('.agree');
    if (lab) {
      if (e.target.closest('.agree-text a')) return; // let the clause link win
      e.preventDefault();
      if (lab.hasAttribute('data-on')) lab.removeAttribute('data-on');
      else lab.setAttribute('data-on', '');
      lab.classList.remove('error');
      return;
    }
    var cta = e.target.closest('[data-agree-guard]');
    if (!cta) return;
    var scope = cta.closest('.sdk-widget');
    if (!scope) return;
    var missing = Array.prototype.filter.call(
      scope.querySelectorAll('.agree[data-required]'),
      function (a) { return !a.hasAttribute('data-on'); }
    );
    if (!missing.length) return;
    e.preventDefault();
    e.stopPropagation();
    missing.forEach(function (m) { m.classList.add('error'); });
    missing[0].scrollIntoView({block: 'center', behavior: 'smooth'});
  }, true);

  function init() {
    var hud = document.querySelector('.flow-hud');
    var bar = document.createElement('div');
    bar.className = 'proto-toggles';
    bar.appendChild(seg('Embed', KEY_VIEW, [
      { value: 'desktop', label: 'Desktop' },
      { value: 'mobile', label: 'Mobile' },
    ]));
    bar.appendChild(seg('Widget accent', KEY_ACCENT, [
      { value: 'neutral', label: 'Neutral' },
      { value: 'host', label: 'Host brand' },
    ]));
    // Design-variant switch: the sibling folder has the SAME files and the
    // SAME screen ids, so we jump to the same page + #screen, other skin.
    // Real anchors (not location.href) so middle-click/cmd-click work too;
    // the href is finalized on click to carry the currently active screen.
    var isGuestappStyle = location.pathname.indexOf('/sdk-guestapp/') !== -1;
    var file = location.pathname.split('/').pop() || 'index.html';
    var vwrap = document.createElement('div');
    vwrap.className = 'pt-group';
    vwrap.innerHTML = 'Design <div class="pt-seg">' +
      '<a data-v="sdk" href="../sdk/' + file + '"' + (!isGuestappStyle ? ' class="on"' : '') + '>Neutral</a>' +
      '<a data-v="sdk-guestapp" href="../sdk-guestapp/' + file + '"' + (isGuestappStyle ? ' class="on"' : '') + '>Guestapp</a></div>';
    vwrap.addEventListener('click', function (e) {
      var b = e.target.closest('a[data-v]');
      if (!b) return;
      if (b.classList.contains('on')) { e.preventDefault(); return; }
      var active = document.querySelector('.flow-screen.active');
      if (active) b.setAttribute('href', '../' + b.getAttribute('data-v') + '/' + file + '#' + active.id);
    });
    bar.appendChild(vwrap);

    widgetChrome();

    if (hud) hud.parentNode.insertBefore(bar, hud.nextSibling);
    else {
      var h1 = document.querySelector('.proto-stage h1');
      if (h1) {
        var lede = document.querySelector('.proto-stage .lede');
        (lede || h1).insertAdjacentElement('afterend', bar);
      }
    }

    /* ---- event console ---- */
    var log = document.querySelector('.sdk-console .sc-log');
    if (!log) return;
    var clock = 0; // deterministic fake timeline, no Date.now()

    function line(ev, payload, muted) {
      clock += 1;
      var mm = String(Math.floor(clock / 60)).padStart(2, '0');
      var ss = String(clock % 60).padStart(2, '0');
      var el = document.createElement('div');
      el.className = 'sc-line' + (muted ? ' muted' : '');
      el.innerHTML = '<span class="t">00:' + mm + ':' + ss + '</span>' +
        '<span class="ev">' + ev + '</span>' +
        '<span class="pl">' + (payload || '') + '</span>';
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
      while (log.children.length > 40) log.removeChild(log.firstChild);
    }
    line('onMounted', '{ version: "3.x" }', true);

    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-event]');
      if (el) line(el.getAttribute('data-event'), el.getAttribute('data-event-payload') || '{}');
    });

    // onScreenChanged via the flow.js class flip. One show() produces two
    // mutation records (remove + add), so dedupe on the screen id.
    var lastScreen = null;
    var mo = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        var t = m.target;
        if (t.classList && t.classList.contains('flow-screen') && t.classList.contains('active') && t.id !== lastScreen) {
          lastScreen = t.id;
          line('onScreenChanged', '{ screen: "' + t.id + '" }', true);
        }
      });
    });
    document.querySelectorAll('.flow-screen').forEach(function (s) {
      mo.observe(s, { attributes: true, attributeFilter: ['class'] });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
