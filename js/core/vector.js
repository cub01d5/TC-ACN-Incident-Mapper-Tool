/** Vector generation and parsing logic. */

window.generateVectorString = function () {
  const form = document.getElementById('acnForm');
  const baselineFields = ['impact', 'rootCause', 'severity', 'victimGeography'];
  const missing = [];

  baselineFields.forEach(f => {
    const sel = form.elements[f];
    if (!sel || !sel.value) {
      const label = sel?.closest('label')?.querySelector('span')?.textContent?.replace(':', '') || f;
      missing.push(label);
    }
  });

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Errore: La Baseline Characterization deve essere completata. Mancano: ${missing.join(', ')}.`
    };
  }

  const parts = [];
  form.querySelectorAll('select').forEach(sel => {
    const val = sel.value;
    if (val && window.acnMap[sel.name]) {
      parts.push(`${window.acnMap[sel.name].prefix}:${window.acnMap[sel.name].code}_${val}`);
    }
  });
  return { valid: true, vector: parts.join(' ') };
};

window.parseVectorString = function (vector) {
  const parts = vector.trim().split(/\s+/);
  const values = {};
  let mapped = 0;
  parts.forEach(part => {
    const m = part.match(/^([A-Z]{2}:[A-Z0-9\-]+)_([A-Za-z0-9_.\-]+)$/);
    if (m) {
      const key = window.acnReverseMap[m[1]];
      if (key) {
        values[key] = m[2];
        mapped++;
      }
    }
  });
  return { values, mapped, total: parts.length };
};
