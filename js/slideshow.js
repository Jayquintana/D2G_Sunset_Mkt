/* ============================================================
   slideshow.js — hero image carousel (no dots)
   ============================================================ */

(function () {
  const slides = document.querySelectorAll('.slide');
  if (!slides.length) return;

  let current = 0;

  function goTo(n) {
    slides[current].classList.remove('active');
    current = n;
    slides[current].classList.add('active');
  }

  setInterval(() => goTo((current + 1) % slides.length), 4000);
})();
