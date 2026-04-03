/** Tooltip system for ACN form fields. */

window.initializeTooltips = function () {
  if (!document.getElementById('global-tooltip')) {
    const gt = document.createElement('div');
    gt.id = 'global-tooltip';
    document.body.appendChild(gt);
  }

  const form = document.getElementById('acnForm');
  if (!form) return;

  form.querySelectorAll('label').forEach(label => {
    const select = label.querySelector('select');
    const span = label.querySelector('span');
    if (!select || !span) return;

    const category = select.name;
    const categoryDesc = window.descriptions && window.descriptions.categories && window.descriptions.categories[category];

    let tooltipContainer = label.querySelector('.tooltip-container');
    if (!tooltipContainer) {
      tooltipContainer = document.createElement('div');
      tooltipContainer.className = 'tooltip-container';
      const svgNS = 'http://www.w3.org/2000/svg';
      const icon = document.createElementNS(svgNS, 'svg');
      icon.setAttribute('class', 'info-icon');
      icon.setAttribute('width', '16');
      icon.setAttribute('height', '16');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('fill', 'none');
      icon.setAttribute('stroke', 'currentColor');
      icon.setAttribute('stroke-width', '2');
      icon.setAttribute('stroke-linecap', 'round');
      icon.setAttribute('stroke-linejoin', 'round');
      icon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>';
      tooltipContainer.appendChild(icon);
      span.appendChild(tooltipContainer);
    }

    const categoryOptions = window.descriptions && window.descriptions.options && window.descriptions.options[category];
    const optionItems = Array.from(select.options)
      .filter(opt => opt.value)
      .map(opt => {
        const desc = categoryOptions && categoryOptions[opt.value];
        if (!desc) return '';
        const dashIdx = desc.indexOf(' - ');
        const name = dashIdx > -1 ? desc.substring(0, dashIdx) : opt.text;
        const definition = dashIdx > -1 ? desc.substring(dashIdx + 3) : desc;
        return `<li class="tooltip-option-item"><strong>${name}</strong>${definition}</li>`;
      })
      .filter(h => h)
      .join('');

    tooltipContainer.dataset.tooltipHtml =
      `<div class="tooltip-title">${category}</div>` +
      `<div class="tooltip-category-desc">${categoryDesc || ''}</div>` +
      `<div class="tooltip-options-header">Opzioni disponibili:</div>` +
      `<ul class="tooltip-options-list">${optionItems || '<li class="tooltip-option-item">(nessuna opzione)</li>'}</ul>`;

    tooltipContainer.addEventListener('mouseenter', function () {
      const gt = document.getElementById('global-tooltip');
      if (!gt) return;
      gt.innerHTML = this.dataset.tooltipHtml;
      gt.classList.add('visible');
      positionGlobalTooltip(gt, this);
    });
    tooltipContainer.addEventListener('mouseleave', function (e) {
      const gt = document.getElementById('global-tooltip');
      if (gt && !gt.contains(e.relatedTarget)) gt.classList.remove('visible');
    });
    tooltipContainer.addEventListener('click', function (e) {
      e.stopPropagation();
      const gt = document.getElementById('global-tooltip');
      if (!gt) return;
      const isVisible = gt.classList.contains('visible') && gt.dataset.anchorCategory === category;
      if (isVisible) {
        gt.classList.remove('visible');
      } else {
        gt.innerHTML = this.dataset.tooltipHtml;
        gt.dataset.anchorCategory = category;
        gt.classList.add('visible');
        positionGlobalTooltip(gt, this);
      }
    });

    // Native title fallback
    const catOpts = window.descriptions && window.descriptions.options && window.descriptions.options[category];
    Array.from(select.options).forEach(opt => {
      if (opt.value && catOpts && catOpts[opt.value]) opt.title = catOpts[opt.value];
    });
  });

  document.addEventListener('click', function (e) {
    const gt = document.getElementById('global-tooltip');
    if (gt && !gt.contains(e.target) && !e.target.closest('.tooltip-container')) {
      gt.classList.remove('visible');
    }
  });
};

function positionGlobalTooltip(tooltip, anchor) {
  const rect = anchor.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight, m = 12, tw = 380;
  const th = Math.min(tooltip.scrollHeight || 280, 440);
  let top = rect.top - th - m;
  let left = rect.left + rect.width / 2 - tw / 2;
  if (top < m) top = rect.bottom + m;
  if (left < m) left = m;
  if (left + tw > vw - m) left = vw - tw - m;
  if (top + th > vh - m) top = Math.max(m, vh - th - m);
  if (top < m) top = m;
  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
  tooltip.style.width = tw + 'px';
}
