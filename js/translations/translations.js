/**
 * Translations module — currently LOCKED/DISABLED in the UI.
 * Logic is loaded but not wired to any interactive elements.
 * When the feature is unlocked, call initTranslations() from main.js.
 */

function getNistColor(text) {
  for (const fn of Object.keys(window.nistColors || {})) {
    if (text.includes(fn)) return window.nistColors[fn];
  }
  return 'var(--text-muted)';
}

function translateVector(vectorStr) {
  const parts = vectorStr.trim().split(/\s+/).filter(p => p);
  if (parts.length === 0) return null;

  const enisaItems = new Map();
  const mitreItems = new Map();
  const nistItems  = new Map();

  parts.forEach(part => {
    const mapping = (window.translationMap || {})[part];
    if (!mapping) return;
    if (mapping.enisa) enisaItems.set(mapping.enisa, (enisaItems.get(mapping.enisa) || []).concat(part));
    if (mapping.mitre && mapping.mitre.length > 0) {
      mapping.mitre.forEach(m => {
        if (!mitreItems.has(m.id)) mitreItems.set(m.id, { ...m, acnParts: [part] });
        else mitreItems.get(m.id).acnParts.push(part);
      });
    }
    if (mapping.nist) nistItems.set(mapping.nist, (nistItems.get(mapping.nist) || []).concat(part));
  });

  return { enisaItems, mitreItems, nistItems, parsedParts: parts };
}

function renderTranslations(vectorStr) {
  const errEl     = document.getElementById('translationError');
  const resultsEl = document.getElementById('translationResults');

  const parts = vectorStr.trim().split(/\s+/).filter(p => p);
  if (parts.length === 0) {
    errEl.textContent = 'Errore: Nessun vettore valido inserito.';
    errEl.style.display = 'block';
    resultsEl.style.display = 'none';
    return;
  }

  const knownParts   = parts.filter(p => (window.translationMap || {})[p]);
  const unknownParts = parts.filter(p => !(window.translationMap || {})[p]);

  if (knownParts.length === 0) {
    errEl.textContent = 'Errore: Nessun componente riconosciuto. Controlla il formato (es. BC:IM_AC).';
    errEl.style.display = 'block';
    resultsEl.style.display = 'none';
    return;
  }

  errEl.style.display = 'none';
  const result = translateVector(vectorStr);

  // ENISA
  const enisaEl = document.getElementById('enisa-results');
  let enisaHtml = '';
  result.enisaItems.forEach((src, label) => {
    if (label.startsWith('N/A')) return;
    enisaHtml += `<div class="tx-item"><div class="tx-label">${label}</div><div class="tx-source">${src.join(' · ')}</div></div>`;
  });
  result.enisaItems.forEach((src, label) => {
    if (!label.startsWith('N/A')) return;
    enisaHtml += `<div class="tx-item tx-na"><div class="tx-label">${label}</div><div class="tx-source">${src.join(' · ')}</div></div>`;
  });
  unknownParts.forEach(p => { enisaHtml += `<div class="tx-item tx-na"><div class="tx-label">N/A (non riconosciuto: ${p})</div></div>`; });
  enisaEl.innerHTML = enisaHtml || '<div class="tx-item tx-na"><div class="tx-label">N/A</div></div>';

  // MITRE
  const mitreEl = document.getElementById('mitre-results');
  let mitreHtml = '';
  result.mitreItems.forEach(item => {
    mitreHtml += `<div class="tx-item mitre-item">
      <div class="tx-mitre-id"><a href="https://attack.mitre.org/techniques/${item.id.replace('.', '/')}" target="_blank" rel="noopener noreferrer">${item.id}</a></div>
      <div class="tx-mitre-detail"><span class="tx-mitre-tactic">${item.tactic}</span><span class="tx-label">${item.technique}</span></div>
      <div class="tx-source">${item.acnParts.join(' · ')}</div>
    </div>`;
  });
  const noMitreParts = parts.filter(p => { const m = (window.translationMap || {})[p]; return m && (!m.mitre || m.mitre.length === 0); });
  if (noMitreParts.length > 0) mitreHtml += `<div class="tx-item tx-na"><div class="tx-label">N/A — nessuna tecnica ATT&CK per: ${noMitreParts.join(', ')}</div></div>`;
  unknownParts.forEach(p => { mitreHtml += `<div class="tx-item tx-na"><div class="tx-label">N/A (non riconosciuto: ${p})</div></div>`; });
  mitreEl.innerHTML = mitreHtml || '<div class="tx-item tx-na"><div class="tx-label">N/A</div></div>';

  // NIST
  const nistEl = document.getElementById('nist-results');
  let nistHtml = '';
  const nistSeen = new Set();
  result.nistItems.forEach((src, label) => {
    if (label === 'N/A' || nistSeen.has(label)) return;
    nistSeen.add(label);
    const col = getNistColor(label);
    nistHtml += `<div class="tx-item nist-item" style="border-left:3px solid ${col};">
      <div class="tx-label" style="color:${col};">${label}</div>
      <div class="tx-source">${src.join(' · ')}</div>
    </div>`;
  });
  result.nistItems.forEach((src, label) => {
    if (label !== 'N/A') return;
    nistHtml += `<div class="tx-item tx-na"><div class="tx-label">N/A</div><div class="tx-source">${src.join(' · ')}</div></div>`;
  });
  unknownParts.forEach(p => { nistHtml += `<div class="tx-item tx-na"><div class="tx-label">N/A (non riconosciuto: ${p})</div></div>`; });
  nistEl.innerHTML = nistHtml || '<div class="tx-item tx-na"><div class="tx-label">N/A</div></div>';

  resultsEl.style.display = 'block';
}

// Kept but NOT called — the tab is locked.
// To activate, call initTranslations() from main.js.
window.initTranslations = function () {
  const importBtn   = document.getElementById('importVectorBtn');
  const translateBtn = document.getElementById('translateVectorBtn');
  const inputEl     = document.getElementById('translationVectorInput');
  const errEl       = document.getElementById('translationError');

  if (importBtn) {
    importBtn.addEventListener('click', () => {
      const vectorEl = document.getElementById('vectorString');
      const current  = vectorEl ? vectorEl.textContent.trim() : '';
      if (!current || current === '(Nessuna selezione)' || current === '(Selezione incompleta)') {
        errEl.textContent = 'Errore: Nessun vettore generato nella pagina Mapping Manuale.';
        errEl.style.display = 'block';
        return;
      }
      inputEl.value = current;
      errEl.style.display = 'none';
    });
  }
  if (translateBtn) translateBtn.addEventListener('click', () => renderTranslations(inputEl.value));
};
