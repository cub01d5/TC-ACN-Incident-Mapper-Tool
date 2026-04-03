/** Theme toggle and localStorage persistence. */
(function () {
  function applyTheme(dark) {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  // Apply saved theme immediately (before DOM ready) to avoid flash
  const saved = localStorage.getItem('acnTheme');
  applyTheme(saved !== 'light'); // default dark

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    toggle.checked = (localStorage.getItem('acnTheme') !== 'light');
    toggle.addEventListener('change', function () {
      const dark = this.checked;
      applyTheme(dark);
      localStorage.setItem('acnTheme', dark ? 'dark' : 'light');
    });
  });
})();
