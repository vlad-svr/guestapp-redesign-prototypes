/* Shared prototype behaviours: sidebar, modals, drawers, toasts, menus, command palette. */
(function () {
  'use strict';

  /* ── Sidebar collapse + mobile ── */
  const app = document.querySelector('.app');
  const collapseBtn = document.getElementById('sidebar-collapse');
  if (collapseBtn && app) {
    if (localStorage.getItem('proto-sidebar') === 'collapsed') app.classList.add('sidebar-collapsed');
    collapseBtn.addEventListener('click', () => {
      app.classList.toggle('sidebar-collapsed');
      const collapsed = app.classList.contains('sidebar-collapsed');
      localStorage.setItem('proto-sidebar', collapsed ? 'collapsed' : 'open');
      collapseBtn.setAttribute('aria-expanded', String(!collapsed));
    });
  }
  const mobileBtn = document.getElementById('mobile-nav-toggle');
  const sidebar = document.querySelector('.sidebar');
  const scrim = document.querySelector('.sidebar-scrim');
  function closeMobileNav() {
    sidebar?.classList.remove('mobile-open');
    scrim?.classList.remove('open');
    mobileBtn?.setAttribute('aria-expanded', 'false');
  }
  mobileBtn?.addEventListener('click', () => {
    const open = sidebar.classList.toggle('mobile-open');
    scrim?.classList.toggle('open', open);
    mobileBtn.setAttribute('aria-expanded', String(open));
  });
  scrim?.addEventListener('click', closeMobileNav);

  /* ── Generic open/close: [data-open="#id"] / [data-close] ── */
  let lastTrigger = null;
  function openLayer(el, trigger) {
    lastTrigger = trigger || document.activeElement;
    el.classList.add('open');
    el.removeAttribute('aria-hidden');
    const focusable = el.querySelector('input, button, [tabindex]');
    focusable && setTimeout(() => focusable.focus(), 60);
  }
  function closeLayer(el) {
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    if (lastTrigger) { lastTrigger.focus(); lastTrigger = null; }
  }
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open]');
    if (opener) {
      const target = document.querySelector(opener.getAttribute('data-open'));
      if (target) { e.preventDefault(); openLayer(target, opener); }
      return;
    }
    const closer = e.target.closest('[data-close]');
    if (closer) {
      const layer = closer.closest('.modal-overlay, .drawer, .drawer-overlay');
      if (layer) {
        closeLayer(layer);
        if (layer.classList.contains('drawer')) {
          document.querySelector('.drawer-overlay') && closeLayer(document.querySelector('.drawer-overlay'));
        }
      }
      return;
    }
    if (e.target.classList?.contains('modal-overlay')) closeLayer(e.target);
    if (e.target.classList?.contains('drawer-overlay')) {
      closeLayer(e.target);
      document.querySelectorAll('.drawer.open').forEach(closeLayer);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open, .drawer.open, .drawer-overlay.open, .menu.open')
        .forEach((el) => closeLayer(el));
      closeMobileNav();
    }
  });

  /* ── Dropdown menus: [data-menu="#id"] ── */
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-menu]');
    document.querySelectorAll('.menu.open').forEach((m) => {
      if (!trigger || document.querySelector(trigger.getAttribute('data-menu')) !== m) m.classList.remove('open');
    });
    if (trigger) {
      e.stopPropagation();
      const menu = document.querySelector(trigger.getAttribute('data-menu'));
      menu?.classList.toggle('open');
    }
  });

  /* ── Toasts ── */
  let toastRegion = document.querySelector('.toast-region');
  if (!toastRegion) {
    toastRegion = document.createElement('div');
    toastRegion.className = 'toast-region';
    toastRegion.setAttribute('role', 'status');
    toastRegion.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastRegion);
  }
  window.showToast = function (message, { undo } = {}) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>' +
      '<span></span>' + (undo ? '<button class="undo" type="button">Undo</button>' : '');
    toast.querySelector('span').textContent = message;
    if (undo) toast.querySelector('.undo').addEventListener('click', () => { undo(); toast.remove(); });
    toastRegion.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; }, 4200);
    setTimeout(() => toast.remove(), 4600);
  };
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-toast]');
    if (t) window.showToast(t.getAttribute('data-toast'));
  });

  /* ── Command palette (Cmd/Ctrl+K) ── */
  const cmdk = document.getElementById('cmdk');
  if (cmdk) {
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        cmdk.classList.contains('open') ? closeLayer(cmdk) : openLayer(cmdk);
      }
    });
    const input = cmdk.querySelector('input');
    const items = Array.from(cmdk.querySelectorAll('.cmdk-item'));
    input?.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      let anyVisible = false;
      items.forEach((item) => {
        const match = !q || item.textContent.toLowerCase().includes(q);
        item.style.display = match ? '' : 'none';
        if (match) anyVisible = true;
      });
      cmdk.querySelectorAll('.cmdk-group').forEach((g) => {
        let sib = g.nextElementSibling, visible = false;
        while (sib && !sib.classList.contains('cmdk-group')) {
          if (sib.style.display !== 'none') visible = true;
          sib = sib.nextElementSibling;
        }
        g.style.display = visible ? '' : 'none';
      });
      cmdk.querySelector('.cmdk-empty')?.style.setProperty('display', anyVisible ? 'none' : 'block');
    });
    items.forEach((item) => item.addEventListener('click', () => {
      const href = item.getAttribute('data-href');
      if (href) window.location.href = href;
      else { closeLayer(cmdk); window.showToast(item.getAttribute('data-action-label') || 'Done'); }
    }));
  }

  /* ── Segmented controls + tabs (visual only) ── */
  document.querySelectorAll('.segmented, .tabs').forEach((group) => {
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('button[aria-selected]');
      if (!btn) return;
      group.querySelectorAll('button[aria-selected]').forEach((b) => b.setAttribute('aria-selected', 'false'));
      btn.setAttribute('aria-selected', 'true');
      const panelSel = btn.getAttribute('data-panel');
      if (panelSel) {
        const container = group.getAttribute('data-panels');
        document.querySelectorAll(container + ' > [data-panel-id]').forEach((p) => {
          p.hidden = p.getAttribute('data-panel-id') !== panelSel;
        });
      }
    });
  });

  /* ── Row select-all ── */
  document.querySelectorAll('[data-select-all]').forEach((master) => {
    const scope = document.querySelector(master.getAttribute('data-select-all'));
    master.addEventListener('change', () => {
      scope?.querySelectorAll('.checkbox[data-row]').forEach((cb) => { cb.checked = master.checked; });
      updateBulkbar(scope);
    });
    scope?.addEventListener('change', (e) => {
      if (e.target.matches('.checkbox[data-row]')) updateBulkbar(scope);
    });
  });
  function updateBulkbar(scope) {
    const bar = document.querySelector('.bulkbar');
    if (!bar || !scope) return;
    const n = scope.querySelectorAll('.checkbox[data-row]:checked').length;
    bar.classList.toggle('open', n > 0);
    const counter = bar.querySelector('[data-count]');
    if (counter) counter.textContent = n + ' selected';
  }
})();
