/** NIS2 / D.Lgs. 138/2024 reporting requirement evaluation. */

window.evaluateReportingRequirement = function () {
  const form = document.getElementById('acnForm');
  if (!form) return;
  const severity = form.elements['severity'] ? form.elements['severity'].value : '';
  const impact = form.elements['impact'] ? form.elements['impact'].value : '';
  const evalBox = document.getElementById('reportingEvaluation');
  if (!evalBox) return;

  const evalBadge  = document.getElementById('evalBadge');
  const evalIcon   = document.getElementById('evalIcon');
  const evalVerdict = document.getElementById('evalVerdict');
  const evalNormRef = document.getElementById('evalNormRef');
  const evalReason  = document.getElementById('evalReason');
  const evalNorms   = document.getElementById('evalNorms');

  if (!severity && !impact) { evalBox.style.display = 'none'; return; }

  evalBox.style.display = 'block';
  evalBadge.className = 'eval-badge';

  let reasonText = '';

  if ((severity === 'HI' || severity === 'ME') && impact !== 'NO' && impact !== '') {
    evalBadge.classList.add('eval-notify');
    evalIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    evalVerdict.textContent = 'Notifica Obbligatoria Presunta';
    reasonText = "L'incidente presenta un Livello di Gravità (Severity) Medio o Alto associato a un Impatto effettivo. Secondo le direttive, gli incidenti con impatto significativo sulla fornitura dei servizi richiedono una notifica tempestiva al CSIRT Italia.";
  } else if (severity === 'LO' || (severity && impact === 'NO')) {
    evalBadge.classList.add('eval-safe');
    evalIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    evalVerdict.textContent = 'Notifica Non Obbligatoria';
    reasonText = "L'incidente presenta un Livello di Gravità Basso o Nessun Impatto. Generalmente, non rientra nelle soglie di notifica obbligatoria, ma si consiglia la registrazione interna e la valutazione per notifica volontaria.";
  } else {
    evalBadge.classList.add('eval-review');
    evalIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    evalVerdict.textContent = 'Valutazione Necessaria';
    reasonText = "Compilare in modo completo i campi Severity e Impact per ottenere una stima sull'obbligo di notifica. La valutazione si basa sui parametri di base dell'incidente secondo la tassonomia ACN.";
  }

  if (evalNormRef)  evalNormRef.textContent = 'Rif: Direttiva NIS2 / D.Lgs. 138/2024';
  if (evalReason)   evalReason.textContent = reasonText;
  if (evalNorms)    evalNorms.innerHTML = '<strong>Art. 23 (NIS2) / Art. 25 (D.Lgs. 138/2024):</strong> Obbligo di notifica di un incidente significativo (preallarme in 24h, notifica dell\'incidente in 72h).';
};
