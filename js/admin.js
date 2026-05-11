/* ============================================================
   admin.js — vendor admin panel logic
   ============================================================ */

const STORAGE_KEY = 'd2g_vendors';
const TIMER_HOURS = 48;

function loadVendors() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveVendors(vendors) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
  syncSpots(vendors);
}

function syncSpots(vendors) {
  var small = 0, large = 0;
  vendors.forEach(function (v) {
    if (!v.paid) return;
    var b = (v.booth || '').toLowerCase();
    if (b.indexOf('small') !== -1) small++;
    else if (b.indexOf('large') !== -1) large++;
  });
  localStorage.setItem('d2g_spots', JSON.stringify({ small: small, large: large }));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function addVendor() {
  const name   = document.getElementById('add-name').value.trim();
  const email  = document.getElementById('add-email').value.trim();
  const booth  = document.getElementById('add-booth').value;
  const amount = document.getElementById('add-amount').value.trim();

  if (!name) {
    document.getElementById('add-name').focus();
    return;
  }

  const vendors = loadVendors();
  vendors.unshift({
    id:        uid(),
    name,
    email,
    booth,
    amount,
    addedAt:   new Date().toISOString(),
    paid:      false,
    confirmed: false
  });
  saveVendors(vendors);

  document.getElementById('add-name').value   = '';
  document.getElementById('add-email').value  = '';
  document.getElementById('add-booth').value  = '';
  document.getElementById('add-amount').value = '';

  render();
}

function togglePaid(id) {
  const vendors = loadVendors();
  const v = vendors.find(function (x) { return x.id === id; });
  if (v) v.paid = !v.paid;
  saveVendors(vendors);
  render();
}

function toggleConfirmed(id) {
  const vendors = loadVendors();
  const v = vendors.find(function (x) { return x.id === id; });
  if (v) {
    v.confirmed = !v.confirmed;
    if (v.confirmed) v.paid = true;
  }
  saveVendors(vendors);
  render();
}

function deleteVendor(id) {
  if (!confirm('Remove this vendor entry?')) return;
  const vendors = loadVendors().filter(function (x) { return x.id !== id; });
  saveVendors(vendors);
  render();
}

function timerInfo(addedAt) {
  const added     = new Date(addedAt).getTime();
  const deadline  = added + TIMER_HOURS * 60 * 60 * 1000;
  const msLeft    = deadline - Date.now();

  if (msLeft <= 0) {
    return { label: '48h expired', cls: 'timer-expired', expired: true };
  }

  const hLeft = Math.floor(msLeft / 3600000);
  const mLeft = Math.floor((msLeft % 3600000) / 60000);
  const label = hLeft + 'h ' + mLeft + 'm left';

  if (hLeft >= 24) return { label, cls: 'timer-ok',     expired: false };
  if (hLeft >= 6)  return { label, cls: 'timer-warn',   expired: false };
  return               { label, cls: 'timer-urgent', expired: false };
}

function render() {
  const vendors = loadVendors();
  const listEl  = document.getElementById('vendor-list');
  const statsEl = document.getElementById('admin-stats');

  const total     = vendors.length;
  const confirmed = vendors.filter(function (v) { return v.confirmed; }).length;
  const paid      = vendors.filter(function (v) { return v.paid && !v.confirmed; }).length;
  const pending   = vendors.filter(function (v) { return !v.paid; }).length;

  statsEl.innerHTML =
    '<div class="stat-pill"><strong>' + total + '</strong>Total</div>' +
    '<div class="stat-pill stat-green"><strong>' + confirmed + '</strong>Confirmed</div>' +
    '<div class="stat-pill"><strong>' + paid + '</strong>Paid / Pending Confirm</div>' +
    '<div class="stat-pill stat-red"><strong>' + pending + '</strong>Awaiting Payment</div>';

  if (vendors.length === 0) {
    listEl.innerHTML = '<div class="empty-state">No vendors added yet.</div>';
    return;
  }

  listEl.innerHTML = vendors.map(function (v) {
    const timer     = timerInfo(v.addedAt);
    const cardCls   = v.confirmed ? 'vendor-card is-confirmed' : (timer.expired ? 'vendor-card is-expired' : 'vendor-card');
    const paidCls   = v.paid      ? 'badge badge-paid'      : 'badge';
    const confCls   = v.confirmed ? 'badge badge-confirmed' : 'badge';
    const btnPaidCls= v.paid      ? 'card-action-btn btn-paid active' : 'card-action-btn btn-paid';
    const btnConfCls= v.confirmed ? 'card-action-btn btn-confirm active' : 'card-action-btn btn-confirm';

    const addedDate = new Date(v.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

    return '<div class="' + cardCls + '" id="vc-' + v.id + '">' +
      '<div class="card-body">' +
        '<div class="card-name">' + esc(v.name) + '</div>' +
        (v.email ? '<div class="card-email">' + esc(v.email) + '</div>' : '') +
        '<div class="card-meta">' +
          (v.booth  ? '<span class="card-meta-item"><strong>' + esc(v.booth) + '</strong></span>' : '') +
          (v.amount ? '<span class="card-amount">' + esc(v.amount) + '</span>' : '') +
          '<span class="card-meta-item">Added ' + addedDate + '</span>' +
          (!v.confirmed ? '<span class="card-timer ' + timer.cls + '">' + timer.label + '</span>' : '') +
        '</div>' +
        '<div class="card-badges">' +
          (v.paid      ? '<span class="' + paidCls + '">Paid</span>'      : '') +
          (v.confirmed ? '<span class="' + confCls + '">Confirmed</span>' : '') +
        '</div>' +
      '</div>' +
      '<div class="card-actions">' +
        '<button class="' + btnPaidCls + '" onclick="togglePaid(\'' + v.id + '\')">' +
          (v.paid ? 'Undo Paid' : 'Mark Paid') +
        '</button>' +
        '<button class="' + btnConfCls + '" onclick="toggleConfirmed(\'' + v.id + '\')">' +
          (v.confirmed ? 'Unconfirm' : 'Confirm ✓') +
        '</button>' +
        '<button class="card-action-btn btn-delete" onclick="deleteVendor(\'' + v.id + '\')">Remove</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.getElementById('add-name').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') addVendor();
});

render();
setInterval(render, 60000);
