/* Chat prototype interactions (prototype-only, no business logic).
   - Auto-grow the composer textarea + a soft char counter near the limit.
   - Toggle the send button on/off with content (mirrors ChatInput.canSend).
   - Starter chips and the desktop "common questions" fill the composer.
   - Image bubbles / thumbnails open the shared lightbox modal.
   Works on both flow-chat-mobile.html and flow-chat-desktop.html. */
(function () {
  var MAX = 1000;
  var WARN_AT = 200;

  function fieldFor(el) {
    var composer = el.closest('.composer, .cd-composer, .screen, .flow-screen');
    return composer ? composer.querySelector('textarea[data-count]') : null;
  }

  function sync(ta) {
    // auto-grow
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';

    // counter
    var wrap = ta.closest('.comp-field');
    var count = wrap && wrap.querySelector('.char-count');
    var remaining = MAX - ta.value.length;
    if (remaining <= WARN_AT) {
      if (!count) {
        count = document.createElement('span');
        count.className = 'char-count';
        wrap.appendChild(count);
      }
      count.textContent = String(remaining);
      count.classList.toggle('warn', remaining <= 0);
    } else if (count) {
      count.remove();
    }

    // send button
    var row = ta.closest('.composer-row');
    var send = row && row.querySelector('.comp-send');
    if (send) send.classList.toggle('off', ta.value.trim().length === 0);
  }

  document.addEventListener('input', function (e) {
    var ta = e.target.closest('textarea[data-count]');
    if (ta) sync(ta);
  });

  // initialise any pre-filled textareas
  function initAll() {
    Array.prototype.forEach.call(document.querySelectorAll('textarea[data-count]'), sync);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();

  document.addEventListener('click', function (e) {
    // starter chip / common question → fill composer
    var chip = e.target.closest('[data-fill]');
    if (chip) {
      e.preventDefault();
      var ta = fieldFor(chip);
      if (ta) {
        ta.value = chip.getAttribute('data-fill');
        sync(ta);
        ta.focus();
      }
      return;
    }

    // image lightbox
    var img = e.target.closest('img[data-lightbox]');
    if (img) {
      e.preventDefault();
      var box = document.getElementById('m-lightbox');
      var target = document.getElementById('lightbox-img');
      if (box && target) {
        target.src = img.getAttribute('src').replace(/w=\d+/, 'w=1000');
        target.alt = img.alt || '';
        box.classList.add('open');
      }
    }
  });
})();
