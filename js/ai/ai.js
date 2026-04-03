/** All AI integration: OpenAI, Google Gemini, Anthropic Claude. */

// ── Utilities ─────────────────────────────────────────────────────────────
window.escapeHtml = function (str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

window.renderMarkdown = function (md) {
  if (!md) return '';
  let out = window.escapeHtml(md);
  out = out.replace(/```(\w+)?\n([\s\S]*?)```/g, (m, lang, code) =>
    `<pre><code class="language-${lang || 'plain'}">${window.escapeHtml(code)}</code></pre>`);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/^####\s*(.*)$/gm, '<h4>$1</h4>');
  out = out.replace(/^###\s*(.*)$/gm, '<h3>$1</h3>');
  out = out.replace(/^##\s*(.*)$/gm, '<h2>$1</h2>');
  out = out.replace(/^#\s*(.*)$/gm, '<h1>$1</h1>');
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__(.+?)__/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*(?!\*)(.+?)\*(?!\*)/g, '$1<em>$2</em>');
  out = out.replace(/(^|[^_])_(?!_)(.+?)_(?!_)/g, '$1<em>$2</em>');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const cleanUrl = url.replace(/["'<>]/g, '');
    const lowerUrl = cleanUrl.trim().toLowerCase();
    if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:') || lowerUrl.startsWith('vbscript:')) {
      return `<a href="#blocked" title="Blocked unsafe link">${text}</a>`;
    }
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });
  out = out.replace(/(^|\n)(?:[ \t]*[-*]\s.+(\n|$))+/g, block => {
    const items = block.trim().split(/\n/).map(l => l.replace(/^[\s]*[-*]\s+/, ''));
    return '\n<ul>' + items.map(i => `<li>${i}</li>`).join('') + '</ul>\n';
  });
  out = out.replace(/(^|\n)(?:[ \t]*\d+\.\s.+(\n|$))+/g, block => {
    const items = block.trim().split(/\n/).map(l => l.replace(/^[\s]*\d+\.\s+/, ''));
    return '\n<ol>' + items.map(i => `<li>${i}</li>`).join('') + '</ol>\n';
  });
  out = out.replace(/\n{2,}/g, '\n\n');
  const parts = out.split('\n\n').map(p => {
    if (/^<(h|ul|ol|pre|blockquote|div|table|p)/.test(p.trim())) return p;
    return `<p>${p}</p>`;
  });
  return parts.join('\n');
};

// ── AI Button State ────────────────────────────────────────────────────────
window.refreshAIButtonState = function () {
  const generateSummaryBtn = document.getElementById('generateSummary');
  const modelSelect = document.getElementById('aiModel');
  const vectorText = document.getElementById('vectorString')?.textContent;

  const hasModel = (modelSelect && !!modelSelect.value) || !!localStorage.getItem('aiModel');
  const hasVector = vectorText && vectorText !== '' && vectorText !== '(Nessuna selezione)';

  if (generateSummaryBtn) generateSummaryBtn.disabled = !(hasModel && hasVector);
  const vbBtn = document.getElementById('vectorBuilderBtn');
  if (vbBtn) vbBtn.disabled = !hasModel;
};

// ── Load Models ────────────────────────────────────────────────────────────
window.loadAvailableModels = async function () {
  const apiKeyInput = document.getElementById('apiKey');
  const apiUrlInput = document.getElementById('apiUrl');
  const modelSelect = document.getElementById('aiModel');
  const errorElement = document.getElementById('aiError');

  const apiKey = (apiKeyInput && apiKeyInput.value) || localStorage.getItem('aiApiKey');
  const apiUrl = (apiUrlInput && apiUrlInput.value) || localStorage.getItem('aiApiUrl');

  if (!apiKey) {
    if (errorElement) { errorElement.textContent = 'È necessaria la chiave API per recuperare i modelli.'; errorElement.style.display = 'block'; }
    return;
  }
  if (!modelSelect) return;

  try {
    if (errorElement) errorElement.style.display = 'none';
    const provider = (document.getElementById('aiProvider')?.value) || localStorage.getItem('aiProvider') || 'openai';
    let url = `${apiUrl.replace(/\/+$/, '')}/models`;
    let headers = { 'Content-Type': 'application/json' };

    if (provider === 'openai') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider === 'google') {
      url = `${apiUrl.replace(/\/+$/, '')}/v1beta/models?key=${apiKey}`;
    } else if (provider === 'claude') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    }

    if (provider === 'claude') {
      modelSelect.innerHTML = '<option value="">seleziona..</option>';
      ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307', 'claude-2.1'].forEach(m => {
        const opt = document.createElement('option');
        opt.value = m; opt.textContent = m;
        modelSelect.appendChild(opt);
      });
    } else {
      const resp = await fetch(url, { headers });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        throw new Error(errData?.error?.message || `Errore HTTP ${resp.status}`);
      }
      const data = await resp.json();
      modelSelect.innerHTML = '<option value="">seleziona..</option>';
      let models = provider === 'google'
        ? (data.models || []).map(m => ({ id: m.name.split('/').pop(), name: m.displayName }))
        : (data.data || []);
      models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id || m.name || m.model || '';
        opt.textContent = m.name || m.id || opt.value;
        modelSelect.appendChild(opt);
      });
    }

    const savedModel = localStorage.getItem('aiModel');
    if (savedModel && modelSelect.querySelector(`option[value="${savedModel}"]`)) {
      modelSelect.value = savedModel;
    }
    modelSelect.dispatchEvent(new Event('change'));
    window.refreshAIButtonState();
  } catch (err) {
    console.error('Errore recupero modelli:', err);
    if (errorElement) { errorElement.textContent = `Errore nel recupero dei modelli: ${err.message}`; errorElement.style.display = 'block'; }
  }
};

// ── Generate Summary ───────────────────────────────────────────────────────
window.generateSummary = async function () {
  const generateBtn = document.getElementById('generateSummary');
  const summaryContent = document.getElementById('summaryContent');
  const errorElement = document.getElementById('aiError');

  const apiKey = document.getElementById('apiKey')?.value || localStorage.getItem('aiApiKey');
  const apiUrl = (document.getElementById('apiUrl')?.value || localStorage.getItem('aiApiUrl') || '').replace(/\/+$/, '');
  const model = document.getElementById('aiModel')?.value || localStorage.getItem('aiModel');
  const provider = localStorage.getItem('aiProvider') || 'openai';

  if (!apiKey) {
    if (errorElement) { errorElement.textContent = 'Inserisci la chiave API e clicca "Recupera Modelli".'; errorElement.style.display = 'block'; }
    return;
  }
  if (!model) {
    if (errorElement) { errorElement.textContent = 'Seleziona un modello.'; errorElement.style.display = 'block'; }
    return;
  }

  const origBtnHtml = generateBtn ? generateBtn.innerHTML : null;
  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10"></circle></svg> Generating...';
  }
  if (!document.getElementById('spinner-style')) {
    const s = document.createElement('style');
    s.id = 'spinner-style';
    s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }

  try {
    if (errorElement) errorElement.style.display = 'none';
    if (summaryContent) summaryContent.innerHTML = '<p class="text-muted">Generating summary...</p>';

    const selections = [];
    document.getElementById('acnForm').querySelectorAll('select').forEach(select => {
      if (select.value) {
        selections.push({
          category: select.name,
          selection: select.options[select.selectedIndex].text,
          description: (window.descriptions && window.descriptions.options && window.descriptions.options[select.name])
            ? (window.descriptions.options[select.name][select.value] || '') : ''
        });
      }
    });

    const vectorStr = document.getElementById('vectorString')?.textContent || '';
    const userPrompt = `Analizza questo incidente cyber mappato secondo la tassonomia ACN e fornisci un riassunto narrativo conciso (massimo 200 parole).
Vettore ACN: ${vectorStr}
Dettagli:
${selections.map(s => `- ${s.category}: ${s.selection} (${s.description})`).join('\n')}
Fornisci una sintesi che includa la natura dell'attacco, l'impatto potenziale e le implicazioni di sicurezza.`;

    let url, body, headers = { 'Content-Type': 'application/json' };
    if (provider === 'openai') {
      url = `${apiUrl}/chat/completions`;
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = JSON.stringify({ model, messages: [{ role: 'user', content: userPrompt }], temperature: 0.7 });
    } else if (provider === 'google') {
      const base = apiUrl.includes('/v1') ? apiUrl : `${apiUrl}/v1beta`;
      url = `${base}/models/${model}:generateContent?key=${apiKey}`;
      body = JSON.stringify({ contents: [{ parts: [{ text: userPrompt }] }] });
    } else if (provider === 'claude') {
      url = `${apiUrl}/v1/messages`;
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      headers['anthropic-dangerous-direct-browser-access'] = 'true';
      body = JSON.stringify({ model, messages: [{ role: 'user', content: userPrompt }], max_tokens: 1024 });
    }

    const response = await fetch(url, { method: 'POST', headers, body });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error((errData.error && errData.error.message) ? errData.error.message : `HTTP ${response.status}`);
    }

    const data = await response.json();
    let aiText = '';
    if (provider === 'openai') aiText = data.choices?.[0]?.message?.content || '';
    else if (provider === 'google') {
      if (data.candidates?.[0]?.content) aiText = data.candidates[0].content.parts[0].text;
      else throw new Error('Google Gemini non ha generato contenuti (possibile blocco filtri sicurezza).');
    } else if (provider === 'claude') aiText = data.content?.[0]?.text || '';

    if (!aiText) throw new Error('Risposta AI vuota.');
    if (summaryContent) summaryContent.innerHTML = `<div class="ai-summary">${window.renderMarkdown(aiText)}</div>`;
  } catch (err) {
    console.error('Error:', err);
    if (summaryContent) {
      summaryContent.innerHTML = `<div style="color:var(--danger);padding:1rem;background:rgba(220,38,38,0.1);border-radius:var(--radius-sm);border:1px solid var(--danger);">
        <strong>Errore Generazione Sintesi:</strong><br>
        <span style="font-size:0.85rem;">${window.escapeHtml(err.message)}</span>
      </div>`;
    }
  } finally {
    if (generateBtn) { generateBtn.disabled = false; if (origBtnHtml !== null) generateBtn.innerHTML = origBtnHtml; }
  }
};

// ── Vector Builder ─────────────────────────────────────────────────────────
window.runVectorBuilder = async function () {
  const input = document.getElementById('vectorBuilderInput').value.trim();
  const btn = document.getElementById('vectorBuilderBtn');
  const resultBox = document.getElementById('vectorBuilderResult');
  const output = document.getElementById('vectorBuilderOutput');
  const errorBox = document.getElementById('vectorBuilderError');

  if (!input) { errorBox.textContent = "Inserisci una descrizione dell'incidente."; errorBox.style.display = 'block'; return; }

  const apiKey = localStorage.getItem('aiApiKey');
  const apiUrl = (localStorage.getItem('aiApiUrl') || '').replace(/\/+$/, '');
  const model = localStorage.getItem('aiModel');
  const provider = localStorage.getItem('aiProvider') || 'openai';

  if (!apiKey || !model) { errorBox.textContent = 'Configura API Key e Modello nelle impostazioni.'; errorBox.style.display = 'block'; return; }

  const origText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = 'Generazione in corso...';
  errorBox.style.display = 'none';
  resultBox.style.display = 'none';

  try {
    let taxSummary = 'CATEGORIES AND OPTIONS:\n';
    for (const cat in window.descriptions.options) {
      taxSummary += `- ${cat}:\n`;
      for (const opt in window.descriptions.options[cat]) {
        taxSummary += `  * ${opt}: ${window.descriptions.options[cat][opt].substring(0, 150)}...\n`;
      }
    }

    const systemPrompt = `Sei un esperto di cybersecurity esperto nella tassonomia ACN (Agenzia per la Cybersicurezza Nazionale italiana). 
Analizza la descrizione e restituisci SOLO un oggetto JSON valido che mappi le categorie ai valori più appropriati.
JSON: { "categoryName": "optionCode", ... }
${taxSummary}`;
    const userPrompt = `DESCRIZIONE INCIDENTE: ${input}`;

    let url, body, headers = { 'Content-Type': 'application/json' };
    if (provider === 'openai') {
      url = `${apiUrl}/chat/completions`;
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], temperature: 0.1, response_format: { type: 'json_object' } });
    } else if (provider === 'google') {
      const base = apiUrl.includes('/v1') ? apiUrl : `${apiUrl}/v1beta`;
      url = `${base}/models/${model}:generateContent?key=${apiKey}`;
      body = JSON.stringify({ contents: [{ parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }], generationConfig: { responseMimeType: 'application/json' } });
    } else if (provider === 'claude') {
      url = `${apiUrl}/v1/messages`;
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      headers['anthropic-dangerous-direct-browser-access'] = 'true';
      body = JSON.stringify({ model, system: systemPrompt, messages: [{ role: 'user', content: userPrompt }], max_tokens: 1000 });
    }

    const resp = await fetch(url, { method: 'POST', headers, body });
    if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error?.message || `HTTP ${resp.status}`); }

    const data = await resp.json();
    let jsonStr = provider === 'openai' ? data.choices[0].message.content
      : provider === 'google' ? data.candidates[0].content.parts[0].text
      : data.content[0].text;
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    const mapping = JSON.parse(jsonStr);
    window._pendingAIMapping = mapping;

    output.innerHTML = '';
    for (const cat in mapping) {
      if (mapping[cat]) {
        const optText = (window.descriptions.options[cat] && window.descriptions.options[cat][mapping[cat]])
          ? window.descriptions.options[cat][mapping[cat]] : mapping[cat];
        const div = document.createElement('div');
        div.className = 'vb-result-item';
        div.innerHTML = `<strong>${window.escapeHtml(cat)}:</strong> ${window.escapeHtml(optText)}`;
        output.appendChild(div);
      }
    }
    resultBox.style.display = 'block';
  } catch (err) {
    console.error('Vector Builder Error:', err);
    errorBox.textContent = `Errore: ${err.message}`;
    errorBox.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.innerHTML = origText;
  }
};

window.applyAIMapping = function () {
  if (!window._pendingAIMapping) return;
  const mapping = window._pendingAIMapping;
  const form = document.getElementById('acnForm');
  form.querySelectorAll('select').forEach(sel => {
    sel.value = mapping[sel.name] ? mapping[sel.name] : '';
  });
  window.updateHighlights();
  document.querySelectorAll('.dimmed').forEach(el => el.classList.remove('dimmed'));
  window.updateDescriptions();
  window.evaluateReportingRequirement();
  window.showTab('tab-manual');
  const coreTabs = document.querySelector('.manual-tabs');
  if (coreTabs) coreTabs.scrollIntoView({ behavior: 'smooth' });
};

// ── Initialize AI ──────────────────────────────────────────────────────────
window.initializeAI = function () {
  const providerSelect = document.getElementById('aiProvider');
  const apiKeyInput    = document.getElementById('apiKey');
  const apiUrlInput    = document.getElementById('apiUrl');
  const modelSelect    = document.getElementById('aiModel');
  const saveConfigBtn  = document.getElementById('saveAIConfig');
  const getModelsBtn   = document.getElementById('getModelsBtn');
  const generateSummaryBtn = document.getElementById('generateSummary');
  const errorElement   = document.getElementById('aiError');

  const savedProvider = localStorage.getItem('aiProvider') || 'openai';
  if (providerSelect) {
    providerSelect.value = savedProvider;
    providerSelect.addEventListener('change', e => {
      if (e.target.value === 'google')     apiUrlInput.value = 'https://generativelanguage.googleapis.com';
      else if (e.target.value === 'openai') apiUrlInput.value = 'https://api.openai.com/v1';
      else if (e.target.value === 'claude') apiUrlInput.value = 'https://api.anthropic.com/v1';
    });
  }
  if (apiKeyInput) apiKeyInput.value = localStorage.getItem('aiApiKey') || '';
  if (apiUrlInput) apiUrlInput.value = localStorage.getItem('aiApiUrl') || (savedProvider === 'google' ? 'https://generativelanguage.googleapis.com' : 'https://api.openai.com/v1');

  if (saveConfigBtn) {
    saveConfigBtn.addEventListener('click', () => {
      localStorage.setItem('aiProvider', providerSelect ? providerSelect.value : 'openai');
      localStorage.setItem('aiApiKey', apiKeyInput ? apiKeyInput.value : '');
      localStorage.setItem('aiApiUrl', apiUrlInput ? apiUrlInput.value : '');
      localStorage.setItem('aiModel', modelSelect ? modelSelect.value : '');
      const orig = saveConfigBtn.textContent;
      saveConfigBtn.textContent = 'Configurazione Salvata! ✓';
      setTimeout(() => { saveConfigBtn.textContent = orig; document.getElementById('settingsModal').style.display = 'none'; }, 1000);
    });
  }

  const openSettingsBtn  = document.getElementById('openSettings');
  const closeSettingsBtn = document.getElementById('closeSettings');
  const settingsModal    = document.getElementById('settingsModal');
  if (openSettingsBtn && settingsModal)  openSettingsBtn.addEventListener('click',  () => settingsModal.style.display = 'flex');
  if (closeSettingsBtn && settingsModal) closeSettingsBtn.addEventListener('click', () => settingsModal.style.display = 'none');
  window.addEventListener('click', e => { if (e.target === settingsModal) settingsModal.style.display = 'none'; });

  if (getModelsBtn) {
    getModelsBtn.addEventListener('click', () => { if (errorElement) errorElement.style.display = 'none'; window.loadAvailableModels(); });
  }

  if (modelSelect) {
    modelSelect.addEventListener('change', e => {
      if (e.target.value) localStorage.setItem('aiModel', e.target.value);
      window.refreshAIButtonState();
    });
    window.refreshAIButtonState();
  }

  if (generateSummaryBtn) {
    generateSummaryBtn.addEventListener('click', () => {
      const selectedModel = modelSelect ? modelSelect.value : '';
      if (!selectedModel) {
        if (errorElement) { errorElement.textContent = 'Seleziona prima un modello.'; errorElement.style.display = 'block'; }
        return;
      }
      window.generateSummary();
    });
  }

  const vectorBuilderBtn = document.getElementById('vectorBuilderBtn');
  if (vectorBuilderBtn) vectorBuilderBtn.addEventListener('click', window.runVectorBuilder);
  const applyBuilderBtn  = document.getElementById('applyVectorBuilderBtn');
  if (applyBuilderBtn)   applyBuilderBtn.addEventListener('click', window.applyAIMapping);
};
