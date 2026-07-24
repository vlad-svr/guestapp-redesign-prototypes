/* ══════════════════════════════════════════════════════════════════════════
   Check-in card — smart follow-up.

   The card used to say "Continue check-in" no matter what was outstanding.
   That is a label, not a direction: the guest still has to read four rows and
   work out which one is theirs. Here the card reads its own list and points at
   the first unfinished step by name — "Choose your protection" — so the
   primary button is always the next thing to actually do.

   Finished steps fold into one green summary line. They are not deleted:
   seeing "Register guests · Booking payment" banked is the reassurance the
   guest came for. They just stop occupying a full row apiece, so the list is
   the work remaining rather than a history of the work done.

   State lives on the rows as `data-state="done|todo"`; everything else — the
   ring, the headline, the estimate, the CTA — is derived from it, so there is
   exactly one thing to change when a step completes.

     <div class="card" data-checkin>
       <div class="cl-progress"> … <button data-cta><span data-cta-label></span></button></div>
       <div class="task-list" data-tasks>
         <button class="task-row" data-step="taxes" data-state="todo"
                 data-mins="1" data-cta="Pay your tourist taxes"> … </button>
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  var CHECK = '<svg viewBox="0 0 24 24" class="icon"><use href="#i-check"/></svg>';
  var CHEV  = '<svg viewBox="0 0 24 24" class="icon icon-sm tf-chev"><use href="#i-chevron-down"/></svg>';

  /* r=26 in the markup, so the arc's full length is 2πr. Hard-coding the
     dasharray in CSS is what made the ring read 60% while the label said 50%. */
  var CIRC = 2 * Math.PI * 26;

  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  function render(card) {
    var list  = card.querySelector('[data-tasks]');
    /* Stamp the authored order once. After the first fold the DOM order is
       whatever the fold left behind, so a fresh querySelectorAll is not a
       reliable source of "the order the steps come in". */
    var rows  = Array.prototype.slice.call(list.querySelectorAll('.task-row'));
    rows.forEach(function (r, i) {
      if (!r.hasAttribute('data-order')) r.setAttribute('data-order', i);
    });
    rows.sort(function (a, b) {
      return (+a.getAttribute('data-order')) - (+b.getAttribute('data-order'));
    });
    var prog  = card.querySelector('.cl-progress');
    var arc   = card.querySelector('[data-arc]');
    var pct   = card.querySelector('[data-pct]');
    var title = card.querySelector('[data-cp-title]');
    var sub   = card.querySelector('[data-cp-sub]');
    var cta   = card.querySelector('[data-cta]');
    var label = card.querySelector('[data-cta-label]');

    var done = rows.filter(function (r) { return r.getAttribute('data-state') === 'done'; });
    var left = rows.filter(function (r) { return r.getAttribute('data-state') !== 'done'; });
    var next = left[0] || null;
    var p = rows.length ? done.length / rows.length : 0;

    /* ── the ring ── */
    if (arc) {
      arc.style.strokeDasharray = CIRC.toFixed(1);
      arc.style.strokeDashoffset = (CIRC * (1 - p)).toFixed(1);
      arc.style.transition = 'stroke-dashoffset .5s cubic-bezier(.22,.61,.36,1)';
    }
    if (pct) pct.textContent = Math.round(p * 100) + '%';
    if (prog) prog.classList.toggle('is-complete', !left.length);

    /* ── the headline and the estimate ── */
    var mins = left.reduce(function (t, r) { return t + (parseInt(r.getAttribute('data-mins'), 10) || 1); }, 0);
    if (!left.length) {
      if (title) title.textContent = "You're all set";
      if (sub) sub.textContent = 'Every step is done — your keys unlock on arrival, Friday 10 July';
    } else {
      if (title) title.textContent = done.length ? "You're " + Math.round(p * 100) + '% there' : 'Let’s get you checked in';
      if (sub) sub.textContent = plural(left.length, 'step', 'steps') + ' left · about ' +
                                 plural(mins, 'minute', 'minutes') + ' · due before Friday 10 July';
    }

    /* ── the follow-up itself: label AND destination ──
       A button that renames itself but goes nowhere is still guesswork — the
       guest reads "Choose your protection" and then has to go find it. The
       target moves with the label, straight to the step's own screen. */
    var ALL_DONE = 'flow-remote-access-desktop.html#kd-keys';
    var href = next ? next.getAttribute('data-href') : ALL_DONE;
    if (label) {
      label.textContent = next
        ? (next.getAttribute('data-cta') || 'Continue check-in')
        : 'View your keys';
    }
    if (cta) {
      cta.setAttribute('aria-label', label ? label.textContent : '');
      cta.setAttribute('data-href', href || '');
      /* keeps the browser status bar and middle-click/⌘-click honest, which a
         <button> with a JS handler cannot do */
      if (cta.tagName === 'A') cta.href = href || '#';
    }

    /* ── row states ── */
    rows.forEach(function (r) {
      var isDone = r.getAttribute('data-state') === 'done';
      var isNext = r === next;
      r.classList.toggle('is-next', isNext);
      var badge = r.querySelector('.task-badge');
      var chip = r.querySelector('.t-chip');
      if (badge) {
        badge.className = 'task-badge ' + (isDone ? 'done' : isNext ? 'next' : 'todo');
        badge.innerHTML = isDone ? CHECK
          : '<svg viewBox="0 0 24 24" class="icon"><use href="#' + (r.getAttribute('data-icon') || 'i-circle') + '"/></svg>';
      }
      if (chip) {
        chip.className = 't-chip ' + (isDone ? 'done' : isNext ? 'next' : 'todo');
        chip.textContent = isDone ? 'Done' : isNext ? 'Next up' : 'To do';
      }
    });

    /* The rest of the page has to agree with the card. A section counter
       reading "2 of 4 done" beside a 100% ring is the kind of contradiction
       that makes a guest distrust the whole screen. */
    var counter = document.querySelector('[data-counter]');
    if (counter) counter.innerHTML = '<b>' + done.length + '</b> of ' + rows.length + ' done';

    var greet = document.querySelector('[data-greet-sub]');
    if (greet) {
      greet.textContent = left.length
        ? 'Your stay in Barcelona is almost ready — ' + plural(left.length, 'task', 'tasks') +
          ' left before your keys unlock.'
        : "Your stay in Barcelona is ready — everything's done and your keys unlock on arrival.";
    }

    fold(list, rows, done);
  }

  /* Move every done row into one collapsible group, headed by a summary line.

     This rebuilds the whole arrangement from `rows` on every call rather than
     moving the delta. Moving only the newly-done rows leaves a row that has
     been *un*-done stranded inside the collapsed group — invisible, and it is
     precisely the outstanding step the guest needs. Rebuilding from the
     authored order is also what keeps the rows from shuffling. */
  function fold(list, rows, done) {
    var group = list.querySelector('.task-done-group');
    var bar = list.querySelector('.task-fold');

    if (!done.length) {
      if (bar) { bar.remove(); bar = null; }
      if (group) { group.remove(); group = null; }
      rows.forEach(function (r) { list.appendChild(r); });
      return;
    }

    if (!bar) {
      bar = document.createElement('button');
      bar.type = 'button';
      bar.className = 'task-fold';
      bar.setAttribute('aria-expanded', 'false');
      bar.addEventListener('click', function () {
        var g = list.querySelector('.task-done-group');
        var open = bar.classList.toggle('is-open');
        if (g) g.classList.toggle('is-open', open);
        bar.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    if (!group) {
      group = document.createElement('div');
      group.className = 'task-done-group';
    }

    /* summary first, then the folded group, then whatever is still outstanding
       — each in the order the steps were authored in */
    list.appendChild(bar);
    list.appendChild(group);
    rows.forEach(function (r) {
      (r.getAttribute('data-state') === 'done' ? group : list).appendChild(r);
    });

    var names = done.map(function (r) {
      var t = r.querySelector('.t-title');
      return t ? t.textContent.trim() : '';
    }).filter(Boolean).join(' · ');

    bar.innerHTML =
      '<span class="tf-check">' + CHECK + '</span>' +
      '<span class="tf-label">' + plural(done.length, 'step', 'steps') + ' done</span>' +
      '<span class="tf-names">' + names + '</span>' + CHEV;
    /* innerHTML wiped the chevron's open-state class off the old node */
    bar.classList.toggle('is-open', group.classList.contains('is-open'));
  }

  /* ── Simulator ────────────────────────────────────────────────────────────
     The follow-up only reads as smart if you can watch it move, so the demo
     completes the next step on click rather than making you imagine it. */
  function buildSim(card) {
    var stage = document.querySelector('.proto-stage');
    if (!stage || stage.querySelector('.ci-sim')) return;
    var wrap = document.createElement('div');
    wrap.className = 'sim-toggle ci-sim';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Simulate check-in progress');
    wrap.innerHTML =
      '<span class="st-label">Check-in progress</span>' +
      '<div class="st-seg">' +
      '<button type="button" data-ci="back">‹ Undo a step</button>' +
      '<button type="button" data-ci="fwd">Complete next step ›</button>' +
      '<button type="button" data-ci="reset">↻ Reset</button>' +
      '</div>';

    var anchor = stage.querySelector('p.lede');
    if (anchor && anchor.nextSibling) stage.insertBefore(wrap, anchor.nextSibling);
    else stage.appendChild(wrap);

    var rows = Array.prototype.slice.call(card.querySelectorAll('.task-row'))
      .sort(function (a, b) {
        return (+a.getAttribute('data-order')) - (+b.getAttribute('data-order'));
      });
    var initial = rows.map(function (r) { return r.getAttribute('data-state'); });

    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ci]');
      if (!b) return;
      var act = b.getAttribute('data-ci');
      /* sort by the authored order, not the DOM order — the fold reparents rows */
      var ordered = Array.prototype.slice.call(card.querySelectorAll('.task-row'))
        .sort(function (a, c) {
          return (+a.getAttribute('data-order')) - (+c.getAttribute('data-order'));
        });
      if (act === 'fwd') {
        var nx = ordered.filter(function (r) { return r.getAttribute('data-state') !== 'done'; })[0];
        if (nx) nx.setAttribute('data-state', 'done');
      } else if (act === 'back') {
        var dn = ordered.filter(function (r) { return r.getAttribute('data-state') === 'done'; }).pop();
        if (dn) dn.setAttribute('data-state', 'todo');
      } else {
        rows.forEach(function (r, i) { r.setAttribute('data-state', initial[i]); });
      }
      render(card);
    });
  }

  function injectStyles() {
    if (document.getElementById('ci-sim-css')) return;
    var css = [
      '.sim-toggle{display:inline-flex;align-items:center;gap:11px;flex-wrap:wrap;justify-content:center;margin-top:10px}',
      '.sim-toggle .st-label{font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--text-tertiary)}',
      '.sim-toggle .st-seg{display:inline-flex;padding:3px;border-radius:99px;background:var(--n-100);border:1px solid var(--border);box-shadow:var(--shadow-card)}',
      '.sim-toggle .st-seg button{height:30px;padding:0 14px;border-radius:99px;font-size:12px;font-weight:600;color:var(--n-600);transition:color .15s,background .15s}',
      '.sim-toggle .st-seg button:hover{color:var(--navy);background:var(--n-0)}',
      '.sim-toggle .st-seg button:focus-visible{outline:none;box-shadow:var(--shadow-focus)}'
    ].join('\n');
    var st = document.createElement('style');
    st.id = 'ci-sim-css';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* The rows are <button>s (they were never links), so they need a handler to
     reach the same screens the CTA does. Delegated, because fold() reparents
     them on every render and per-row listeners would be lost or doubled. */
  function wireRows(card) {
    card.addEventListener('click', function (e) {
      var row = e.target.closest('.task-row');
      if (!row || !card.contains(row)) return;
      var href = row.getAttribute('data-href');
      if (href) location.href = href;
    });
  }

  function init() {
    var cards = document.querySelectorAll('[data-checkin]');
    if (!cards.length) return;
    injectStyles();
    Array.prototype.forEach.call(cards, function (card) {
      render(card);
      wireRows(card);
      buildSim(card);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
