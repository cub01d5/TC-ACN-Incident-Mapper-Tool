/**
 * main.js — Bootstrap entry point.
 * Runs after all other scripts are loaded.
 * Wires up all event listeners and initializes the application.
 */

// Shared taxonomy descriptions (populated from embedded backup)
window.descriptions = { categories: {}, options: {} };

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. Load taxonomy data ─────────────────────────────────────────────
  if (typeof window.taxonomyBackup !== 'undefined' && window.taxonomyBackup) {
    window.descriptions = window.taxonomyBackup;
    console.log('✓ Taxonomy initialized from embedded backup');
  }

  // ── 2. Initialize UI systems ──────────────────────────────────────────
  window.initializeTooltips();
  window.updateHighlights();
  window.updateDescriptions();

  // ── 3. Initialize AI ──────────────────────────────────────────────────
  window.initializeAI();

  // ── 4. Setup form select listeners ───────────────────────────────────
  const form = document.getElementById('acnForm');
  if (form) {
    form.querySelectorAll('select').forEach(sel => {
      sel.addEventListener('change', () => {
        window.updateHighlights();
        window.updateDescriptions();
      });
    });
  }

  // ── 5. Generate Vector button ─────────────────────────────────────────
  const generateVectorBtn = document.getElementById('generateVectorBtn');
  if (generateVectorBtn) {
    generateVectorBtn.addEventListener('click', () => {
      const result   = window.generateVectorString();
      const vectorEl = document.getElementById('vectorString');
      const errorEl  = document.getElementById('vectorError');
      const copyBtn  = document.getElementById('copyVectorBtn');
      const exportBtn = document.getElementById('exportImageBtn');

      if (!result.valid) {
        if (errorEl) { errorEl.textContent = result.error; errorEl.style.display = 'block'; }
        vectorEl.textContent = '(Selezione incompleta)';
        if (copyBtn)   copyBtn.disabled = true;
        if (exportBtn) exportBtn.disabled = true;
      } else {
        if (errorEl) errorEl.style.display = 'none';
        vectorEl.textContent = result.vector;
        if (copyBtn)   copyBtn.disabled = false;
        if (exportBtn) exportBtn.disabled = false;
      }

      window.updateHighlights();
      window.updateDescriptions();
      window.evaluateReportingRequirement();
      if (typeof window.refreshAIButtonState === 'function') window.refreshAIButtonState();

      // Dim unselected selects
      form && form.querySelectorAll('select').forEach(sel => {
        sel.value ? sel.classList.remove('dimmed') : sel.classList.add('dimmed');
      });
      document.querySelectorAll('.card').forEach(card => {
        const anySelected = Array.from(card.querySelectorAll('select')).some(s => s.value);
        anySelected ? card.classList.remove('dimmed') : card.classList.add('dimmed');
      });
    });
  }

  // ── 6. Reset button ───────────────────────────────────────────────────
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn && form) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('vectorString').textContent = '';
      const vectorError = document.getElementById('vectorError');
      if (vectorError) { vectorError.textContent = ''; vectorError.style.display = 'none'; }
      const vectorInputEl = document.getElementById('vectorInput');
      if (vectorInputEl) vectorInputEl.value = '';
      const reverseError = document.getElementById('reverseError');
      if (reverseError) reverseError.style.display = 'none';

      window.updateHighlights();
      form.querySelectorAll('select.dimmed').forEach(s => s.classList.remove('dimmed'));
      document.querySelectorAll('.card.dimmed').forEach(c => c.classList.remove('dimmed'));
      window.updateDescriptions();

      const reportingEval = document.getElementById('reportingEvaluation');
      if (reportingEval) reportingEval.style.display = 'none';

      const copyBtn  = document.getElementById('copyVectorBtn');
      const exportBtn = document.getElementById('exportImageBtn');
      if (copyBtn)   copyBtn.disabled = true;
      if (exportBtn) exportBtn.disabled = true;

      const summaryContent = document.getElementById('summaryContent');
      if (summaryContent) summaryContent.innerHTML = '<p class="text-muted">Seleziona i campi e clicca "Genera Sintesi".</p>';

      if (typeof window.refreshAIButtonState === 'function') window.refreshAIButtonState();
    });
  }

  // ── 7. Populate Selects from vector (Tab 3) ───────────────────────────
  const populateSelectsBtn = document.getElementById('populateSelectsBtn');
  if (populateSelectsBtn) {
    populateSelectsBtn.addEventListener('click', () => {
      const vectorInput = document.getElementById('vectorInput').value.trim();
      const errorBox    = document.getElementById('reverseError');
      errorBox.style.display = 'none';

      if (!vectorInput) {
        errorBox.textContent = 'Inserisci un vettore ACN.';
        errorBox.style.display = 'block';
        return;
      }
      const { values, mapped, total } = window.parseVectorString(vectorInput);
      if (mapped === 0) {
        errorBox.textContent = 'Nessun campo riconosciuto dal vettore inserito. Controlla la sintassi.';
        errorBox.style.display = 'block';
        return;
      }
      if (mapped < total) {
        errorBox.textContent = `Attenzione: solo ${mapped} su ${total} campi riconosciuti.`;
        errorBox.style.display = 'block';
      }
      form && form.querySelectorAll('select').forEach(sel => {
        sel.value = values[sel.name] || '';
      });
      window.updateHighlights();
      document.querySelectorAll('.dimmed').forEach(el => el.classList.remove('dimmed'));
      window.updateDescriptions();
      window.evaluateReportingRequirement();
      window.showTab('tab-manual');
    });
  }

  // ── 8. Translations tab: locked — do NOT call initTranslations() ──────
  // The tab is locked by design. When ready to unlock, add:
  // window.initTranslations();

});

// ── Utility: Safe HTML escaping ──────────────────────────────────────────
window.escapeHtml = function (str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

// ── Utility: Simple Markdown Renderer ────────────────────────────────────
window.renderMarkdown = function (md) {
  if (!md) return '';
  let out = window.escapeHtml(md);

  // code fences ```lang\n...\n```
  out = out.replace(/```(\w+)?\n([\s\S]*?)```/g, (m, lang, code) => {
    const escaped = window.escapeHtml(code);
    return `<pre><code class="language-${lang || 'plain'}">${escaped}</code></pre>`;
  });

  // inline code `code`
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');

  // headings
  out = out.replace(/^####\s*(.*)$/gm, '<h4>$1</h4>');
  out = out.replace(/^###\s*(.*)$/gm, '<h3>$1</h3>');
  out = out.replace(/^##\s*(.*)$/gm, '<h2>$1</h2>');
  out = out.replace(/^#\s*(.*)$/gm, '<h1>$1</h1>');

  // bold
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // italic
  out = out.replace(/(^|[^*])\*(?!\*)(.+?)\*(?!\*)/g, '$1<em>$2</em>');
  out = out.replace(/(^|[^_])_(?!_)(.+?)_(?!_)/g, '$1<em>$2</em>');

  // links
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const cleanUrl = url.replace(/["'<>]/g, '');
    const lowerUrl = cleanUrl.trim().toLowerCase();
    if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:') || lowerUrl.startsWith('vbscript:')) {
      return `<a href="#blocked" title="Blocked unsafe link">${text}</a>`;
    }
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });

  // lists
  out = out.replace(/(^|\n)(?:[ \t]*[-*]\s.+(\n|$))+/g, block => {
    const items = block.trim().split(/\n/).map(l => l.replace(/^[\s]*[-*]\s+/, ''));
    return '\n<ul>' + items.map(i => `<li>${i}</li>`).join('') + '</ul>\n';
  });

  // paragraphs
  out = out.replace(/\n{2,}/g, '\n\n');
  const parts = out.split('\n\n').map(p => {
    if (/^<(h|ul|ol|pre|blockquote|div|table|p)/.test(p.trim())) return p;
    return `<p>${p}</p>`;
  });
  return parts.join('\n');
};

