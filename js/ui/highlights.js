/** Highlight active selects and update selection descriptions panel. */

window.updateHighlights = function () {
  const form = document.getElementById('acnForm');
  if (!form) return;
  form.querySelectorAll('select').forEach(sel => {
    if (sel.value && sel.value !== '') {
      sel.classList.add('evidenziato');
    } else {
      sel.classList.remove('evidenziato');
    }
  });
};

window.updateDescriptions = function () {
  const descriptionsContainer = document.getElementById('selectionDescriptions');
  if (!descriptionsContainer) return;
  descriptionsContainer.innerHTML = '';

  const form = document.getElementById('acnForm');
  if (!form) return;
  const selectedDescriptions = [];

  form.querySelectorAll('select').forEach(select => {
    if (!select.value) return;
    const category = select.name;
    const value = select.value;
    const option = select.options[select.selectedIndex];
    const optionDescRaw = (window.descriptions && window.descriptions.options && window.descriptions.options[category])
      ? (window.descriptions.options[category][value] || '') : '';
    let cleanOptionDesc = optionDescRaw;
    if (optionDescRaw.includes(' - ')) {
      cleanOptionDesc = optionDescRaw.split(' - ').slice(1).join(' - ');
    }
    if (cleanOptionDesc) {
      selectedDescriptions.push(`
        <div class="selection-description">
          <h4>${option.text}<span class="category">(${category})</span></h4>
          <p>${cleanOptionDesc}</p>
        </div>
      `);
    }
  });

  const selectionDetails = document.getElementById('selectionDetails');
  if (selectedDescriptions.length > 0) {
    descriptionsContainer.innerHTML = selectedDescriptions.join('');
    if (selectionDetails) selectionDetails.style.display = 'block';
  } else {
    if (selectionDetails) selectionDetails.style.display = 'none';
  }
};
