/* ============================================================
   vendor-spots.js — Netlify function
   Returns approved vendor count and remaining spots from Airtable.
   Requires env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID
   Optional env var:  AIRTABLE_TABLE (default: "Vendor Applications")
   ============================================================ */

const TOTAL_SPOTS = 25;

exports.handler = async function () {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table  = process.env.AIRTABLE_TABLE || 'Vendor Applications';

  if (!apiKey || !baseId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing Airtable configuration' })
    };
  }

  try {
    const formula = encodeURIComponent("{Status}='Approved'");
    const url = [
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
      `?filterByFormula=${formula}`,
      `&fields[]=Status`,
      `&pageSize=100`
    ].join('');

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });

    if (!res.ok) throw new Error(`Airtable responded with ${res.status}`);

    const data = await res.json();
    const approved  = (data.records || []).length;
    const remaining = Math.max(0, TOTAL_SPOTS - approved);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store'
      },
      body: JSON.stringify({ approved, remaining, total: TOTAL_SPOTS })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
