/** Copy vector and export-to-image functionality. */

document.addEventListener('DOMContentLoaded', () => {

  // ── Copy Vector ───────────────────────────────────────────────────────
  const copyBtn = document.getElementById('copyVectorBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      const vector = document.getElementById('vectorString').textContent;
      if (vector && vector !== '(Nessuna selezione)') {
        navigator.clipboard.writeText(vector).then(() => {
          const original = this.innerHTML;
          this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><polyline points="20 6 9 17 4 12"></polyline></svg> Copiato!';
          this.classList.add('success');
          setTimeout(() => { this.innerHTML = original; this.classList.remove('success'); }, 2000);
        });
      }
    });
  }

  // ── Export Image ──────────────────────────────────────────────────────
  const exportBtn = document.getElementById('exportImageBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const target = document.getElementById('acnForm');
      if (!target) return;

      const originalText = exportBtn.innerHTML;
      exportBtn.innerHTML = 'Generazione...';
      exportBtn.disabled = true;

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const bgColor = isDark ? '#09090b' : '#f0fdfa';

      html2canvas(target, {
        backgroundColor: bgColor,
        useCORS: true,
        scale: 4,
        logging: false,
        padding: 30,
        onclone: (clonedDoc) => {
          clonedDoc.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
          const cards = clonedDoc.querySelectorAll('.card');
          cards.forEach(card => {
            card.style.background = isDark ? '#18181b' : '#ffffff';
            card.style.opacity = '1';
            card.style.backdropFilter = 'none';
            card.style.border = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0';
          });
          clonedDoc.querySelectorAll('select, input, textarea').forEach(el => {
            el.style.background = isDark ? '#27272a' : '#ffffff';
            el.style.opacity = '1';
          });
          const clonedTarget = clonedDoc.getElementById('acnForm');
          if (clonedTarget) {
            clonedTarget.style.background = 'transparent';
            clonedTarget.style.padding = '10px';
          }
        }
      }).then(canvas => {
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        link.download = `ACN_Mapping_${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        exportBtn.innerHTML = originalText;
        exportBtn.disabled = false;
      }).catch(err => {
        console.error('Export error:', err);
        exportBtn.innerHTML = 'Errore ❌';
        setTimeout(() => { exportBtn.innerHTML = originalText; exportBtn.disabled = false; }, 3000);
      });
    });
  }

});
