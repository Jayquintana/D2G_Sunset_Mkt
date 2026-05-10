/* ============================================================
   vendor-spots.js — fetches remaining vendor spots and updates
   the counter on the vendor who-card
   ============================================================ */

(function () {
  const el = document.getElementById('vendor-spots');
  if (!el) return;

  fetch('/.netlify/functions/vendor-spots')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (typeof data.remaining !== 'number') return;

      if (data.remaining <= 0) {
        el.textContent = 'Waitlist only';
        el.classList.add('spots-full');
      } else {
        el.innerHTML = data.remaining + ' of ' + data.total + ' spots remaining';
      }

      el.classList.add('spots-loaded');
    })
    .catch(function () {
      el.style.display = 'none';
    });
})();
