/* ============================================================
   artist-form.js — type selection, toggle, artist validation & submit
   ============================================================ */

/* ── TYPE SELECTION (from who-cards) ── */

function selectType(type) {
  const formSection = document.getElementById('form');
  const vendorForm  = document.getElementById('vendor-form');
  const artistForm  = document.getElementById('artist-form');
  const asideTitle  = document.getElementById('aside-title');
  const stepsVendor = document.getElementById('aside-steps-vendor');
  const stepsArtist = document.getElementById('aside-steps-artist');
  const cardVendor  = document.getElementById('who-vendor');
  const cardArtist  = document.getElementById('who-artist');

  // Mark selected card
  cardVendor.classList.toggle('selected', type === 'vendor');
  cardArtist.classList.toggle('selected', type === 'artist');

  // Show form section
  formSection.style.display = 'grid';

  if (type === 'vendor') {
    vendorForm.style.display  = 'block';
    artistForm.style.display  = 'none';
    asideTitle.innerHTML      = 'Vendor<br>Interest';
    stepsVendor.style.display = 'flex';
    stepsArtist.style.display = 'none';
  } else {
    vendorForm.style.display  = 'none';
    artistForm.style.display  = 'block';
    asideTitle.innerHTML      = 'Artist<br>Interest';
    stepsVendor.style.display = 'none';
    stepsArtist.style.display = 'flex';
  }

  // Smooth scroll into the form
  setTimeout(() => {
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}

/* ── ARTIST VALIDATION ── */

function validateArtist() {
  const required = [
    'a-fname', 'a-lname', 'a-email',
    'a-instagram', 'a-artist-name', 'a-act-size',
    'a-sound', 'a-links', 'a-equipment'
  ].map(id => document.getElementById(id));

  const dateOk    = document.querySelector('input[name="a_date"]:checked');
  const datePicks = document.getElementById('a-date-picks');
  let valid = true;

  required.forEach(el => {
    const empty = !el.value.trim();
    el.classList.toggle('field-err', empty);
    if (empty) valid = false;
  });

  if (!dateOk) {
    datePicks.style.outline = '2px solid #b00';
    valid = false;
  } else {
    datePicks.style.outline = 'none';
  }

  if (!valid) {
    (required.find(e => !e.value.trim()) || datePicks)
      .scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return valid;
}

/* ── ARTIST DATA COLLECTION ── */

function collectArtistData() {
  const fd = new FormData();

  document.querySelectorAll(
    '#artist-form-content input:not([type=checkbox]):not([type=radio]), ' +
    '#artist-form-content select, ' +
    '#artist-form-content textarea'
  ).forEach(el => { if (el.name && el.value) fd.append(el.name, el.value); });

  const date = document.querySelector('input[name="a_date"]:checked');
  if (date) fd.append('a_date', date.value);

  fd.append('application_type', 'Artist / Band');
  return fd;
}

/* ── ARTIST SUBMISSION ── */

async function submitArtist() {
  if (!validateArtist()) return;

  const btn = document.getElementById('a-submit-btn');
  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    const res = await fetch(window.FORMSPREE_URL, {
      method: 'POST',
      body: collectArtistData(),
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      document.getElementById('artist-form-content').style.display = 'none';
      const s = document.getElementById('a-success');
      s.classList.add('show');
      s.scrollIntoView({ behavior: 'smooth' });
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    console.error('Artist submit error:', err);
    btn.disabled = false;
    btn.textContent = 'Send It →';
    alert(`Something went wrong — email us at ${window.FALLBACK_EMAIL}`);
  }
}

window.selectType   = selectType;
window.submitArtist = submitArtist;
