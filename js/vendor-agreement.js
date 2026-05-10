/* ============================================================
   vendor-agreement.js — logic for vendor-agreement.html
   ============================================================ */

// ── NAV ──
function toggleNav() {
  const open = document.getElementById('nav-menu').classList.toggle('open');
  document.getElementById('nav-menu-overlay').classList.toggle('show', open);
  document.getElementById('nav-hamburger').innerHTML = open ? '&#x2715;' : '&#9776;';
}

function closeNav() {
  document.getElementById('nav-menu').classList.remove('open');
  document.getElementById('nav-menu-overlay').classList.remove('show');
  document.getElementById('nav-hamburger').innerHTML = '&#9776;';
}

// ── DATE AUTO-FILL ──
(function () {
  const d = new Date();
  const str = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('sig-date-display').textContent = str;
  document.getElementById('date-signed-hidden').value = str;
})();

// ── TOTAL CALCULATOR ──
const BOOTH_PRICES = { 'booth-small': 50, 'booth-medium': 70 };
const BOOTH_SPOTS  = { 'booth-small': 15, 'booth-medium': 10 };
let tableQty = 0;

function updateTotal() {
  let base = 0;
  let baseName = '';

  Object.keys(BOOTH_PRICES).forEach(function (id) {
    if (document.getElementById(id).checked) {
      base = BOOTH_PRICES[id];
      baseName = document.querySelector('#' + id + ' ~ label .bp-size').textContent;
    }
  });

  const tableTotal = tableQty * 15;
  const total = base + tableTotal;

  const amountEl    = document.getElementById('total-amount');
  const breakdownEl = document.getElementById('total-breakdown');
  const hiddenEl    = document.getElementById('total-hidden');

  const paymentAmountEl = document.getElementById('payment-amount');

  if (base === 0) {
    amountEl.textContent        = '—';
    breakdownEl.textContent     = 'Select a booth size to calculate';
    hiddenEl.value              = '';
    paymentAmountEl.textContent = 'Select a booth size above';
    paymentAmountEl.classList.remove('payment-amount--set');
    return;
  }

  const parts = [baseName + ' booth $' + base];
  if (tableQty > 0) parts.push('Tables ×' + tableQty + ' +$' + tableTotal);

  amountEl.textContent        = '$' + total;
  breakdownEl.textContent     = parts.join(' + ');
  hiddenEl.value              = '$' + total;
  paymentAmountEl.textContent = '$' + total;
  paymentAmountEl.classList.add('payment-amount--set');
}

// ── TABLE STEPPER ──
document.getElementById('table-plus').addEventListener('click', function () {
  if (tableQty >= 3) return;
  tableQty++;
  document.getElementById('table-qty').textContent = tableQty;
  document.getElementById('table-minus').disabled = false;
  document.getElementById('table-plus').disabled = tableQty === 3;
  document.getElementById('table-stepper').classList.add('active');
  document.getElementById('addon-table-hidden').value = tableQty + ' table' + (tableQty > 1 ? 's' : '') + ' (+$' + (tableQty * 15) + ')';
  updateTotal();
});

document.getElementById('table-minus').addEventListener('click', function () {
  if (tableQty === 0) return;
  tableQty--;
  document.getElementById('table-qty').textContent = tableQty;
  document.getElementById('table-minus').disabled = tableQty === 0;
  document.getElementById('table-plus').disabled = false;
  document.getElementById('table-stepper').classList.toggle('active', tableQty > 0);
  document.getElementById('addon-table-hidden').value = tableQty > 0
    ? tableQty + ' table' + (tableQty > 1 ? 's' : '') + ' (+$' + (tableQty * 15) + ')'
    : '';
  updateTotal();
});

document.querySelectorAll('input[name="booth_size"]').forEach(function (r) {
  r.addEventListener('change', function () {
    document.querySelectorAll('.bp label').forEach(function (el) { el.classList.remove('field-err'); });
    const spots = BOOTH_SPOTS[this.id];
    const callout = document.getElementById('spots-callout');
    callout.textContent = 'There are ' + spots + ' spots left for this size.';
    callout.classList.add('spots-callout--visible');
    updateTotal();
  });
});

// ── CLEAR ERRORS ON INPUT ──
['business-name', 'vendor-email', 'signature'].forEach(function (id) {
  document.getElementById(id).addEventListener('input', function () {
    this.classList.remove('field-err');
  });
});

document.getElementById('business-name').addEventListener('input', function () {
  const noteEl = document.getElementById('payment-note');
  noteEl.textContent = this.value.trim() || 'Your business / vendor name';
});

document.getElementById('agree-checkbox').addEventListener('change', function () {
  this.closest('.chk').classList.remove('field-err');
});

// ── FORM SUBMISSION ──
document.getElementById('agreement-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Clear previous errors
  document.querySelectorAll('.field-err').forEach(function (el) { el.classList.remove('field-err'); });

  let valid = true;
  let firstError = null;

  function flagError(el) {
    el.classList.add('field-err');
    if (!firstError) firstError = el;
    valid = false;
  }

  // Business name
  const businessName = document.getElementById('business-name');
  if (!businessName.value.trim()) flagError(businessName);

  // Email
  const email = document.getElementById('vendor-email');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) flagError(email);

  // Booth size
  if (!document.querySelector('input[name="booth_size"]:checked')) {
    document.querySelectorAll('.bp label').forEach(function (el) { flagError(el); });
  }

  // Signature
  const signature = document.getElementById('signature');
  if (!signature.value.trim()) flagError(signature);

  // Agreement checkbox
  const agreeChk = document.getElementById('agree-checkbox');
  if (!agreeChk.checked) flagError(agreeChk.closest('.chk'));

  if (!valid) {
    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const btn = document.getElementById('submit-btn');
  btn.disabled    = true;
  btn.textContent = 'Submitting…';

  try {
    const res = await fetch('https://formspree.io/f/meenrkea', {
      method: 'POST',
      body: new FormData(this),
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      document.getElementById('agreement-form-content').style.display = 'none';
      document.getElementById('agreement-success').classList.add('show');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      btn.disabled    = false;
      btn.textContent = 'Sign & Submit Agreement';
      alert('Submission failed. Please try again or email elcapitan@death2genres.com directly.');
    }
  } catch (err) {
    btn.disabled    = false;
    btn.textContent = 'Sign & Submit Agreement';
    alert('Submission failed. Please try again or email elcapitan@death2genres.com directly.');
  }
});
