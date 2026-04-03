/** Global tab navigation. */

window.showTab = function (id) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.main-tab-content').forEach(c => c.style.display = 'none');
  const targetTab = document.querySelector(`.nav-tab[data-target="${id}"]`);
  const targetContent = document.getElementById(id);
  if (targetTab) targetTab.classList.add('active');
  if (targetContent) {
    targetContent.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => window.showTab(tab.dataset.target));
  });
  if (!document.querySelector('.nav-tab.active')) {
    window.showTab('tab-manual');
  }
});
