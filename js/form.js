/* ============================================================
   form.js — vendor form validation + submission
   ============================================================ */

   function setError(el, hasError) {
    el.classList.toggle('field-err', hasError);
  }
  
  function collectVendorData() {
    const fd = new FormData();
    document.querySelectorAll(
      '#vendor-form-content input:not([type=checkbox]):not([type=radio]), ' +
      '#vendor-form-content select, ' +
      '#vendor-form-content textarea'
    ).forEach(el => { if (el.name && el.value) fd.append(el.name, el.value); });
    const checked = [...document.querySelectorAll('#vendor-form-content input[type=checkbox]:checked')]
      .map(cb => cb.value).join(', ');
    if (checked) fd.append('v_extras', checked);
    const date = document.querySelector('input[name="v_date"]:checked');
    if (date) fd.append('v_date', date.value);
    fd.append('application_type', 'Vendor');
    return fd;
  }
  
  function validateVendor() {
    const required = ['v-fname', 'v-lname', 'v-email', 'v-bizname', 'v-category', 'v-description']
      .map(id => document.getElementById(id));
    const dateOk    = document.querySelector('input[name="v_date"]:checked');
    const datePicks = document.getElementById('v-date-picks');
    let valid = true;
    required.forEach(el => {
      const empty = !el.value.trim();
      setError(el, empty);
      if (empty) valid = false;
    });
    if (!dateOk) { datePicks.style.outline = '2px solid #b00'; valid = false; }
    else { datePicks.style.outline = 'none'; }
    if (!valid) {
      (required.find(e => !e.value.trim()) || datePicks)
        .scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return valid;
  }
  
  async function submitVendor() {
    if (!validateVendor()) return;
    const btn = document.getElementById('v-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    try {
      const res = await fetch(window.FORMSPREE_URL, {
        method: 'POST',
        body: collectVendorData(),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        document.getElementById('vendor-form-content').style.display = 'none';
        const s = document.getElementById('v-success');
        s.classList.add('show');
        s.scrollIntoView({ behavior: 'smooth' });
      } else { throw new Error(`HTTP ${res.status}`); }
    } catch (err) {
      console.error('Vendor submit error:', err);
      btn.disabled = false;
      btn.textContent = 'Send It →';
      alert(`Something went wrong — email us at ${window.FALLBACK_EMAIL}`);
    }
  }
  
  window.submitVendor = submitVendor;