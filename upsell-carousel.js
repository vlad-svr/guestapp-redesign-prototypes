/* Rail upsell carousel — shows one offer at a time instead of stacking cards,
   so "Make your stay better" costs a single card's height in the right rail.
   Dots navigate between offers. */
(function () {
  function init() {
    var track = document.getElementById('ucTrack');
    var dotsEl = document.getElementById('ucDots');
    if (!track || !dotsEl) return;

    var slides = Array.prototype.slice.call(track.children);
    if (slides.length < 2) return;
    var index = 0;

    // build one dot per slide
    slides.forEach(function (_, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'uc-dot';
      d.setAttribute('aria-label', 'Offer ' + (i + 1) + ' of ' + slides.length);
      d.addEventListener('click', function () { go(i); });
      dotsEl.appendChild(d);
    });
    var dots = Array.prototype.slice.call(dotsEl.children);

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      dots.forEach(function (d, n) {
        d.classList.toggle('on', n === index);
        d.setAttribute('aria-current', n === index ? 'true' : 'false');
      });
      slides.forEach(function (s, n) {
        // keep off-screen slides out of the tab order
        s.setAttribute('aria-hidden', n === index ? 'false' : 'true');
      });
    }

    go(0);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
