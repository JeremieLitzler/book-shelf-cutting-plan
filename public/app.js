document.addEventListener('DOMContentLoaded', () => {
  const plankDimensions = {
    '760x300': 12,
    '480x300': 14,
    '1294x300': 2,
    '1594x300': 1,
    '1558x300': 2,
    '240x300': 1,
    '250x300': 1,
  };

  const shopPlankLength = 2000; // mm
  const sawBladeThickness = 2; // mm

  const requiredLengths = [];
  for (const dim in plankDimensions) {
    const length = parseInt(dim.split('x')[0]);
    requiredLengths.push(...Array(plankDimensions[dim]).fill(length));
  }

  requiredLengths.sort((a, b) => b - a);

  const usedPlanks = Array(8).fill([shopPlankLength]); // Add 8 full planks

  // Cutting plan
  while (requiredLengths.length > 0) {
    const currentPlank = shopPlankLength;
    const cuts = [];
    let remaining = currentPlank;

    for (let i = requiredLengths.length - 1; i >= 0; i--) {
      if (remaining >= requiredLengths[i] + sawBladeThickness) {
        cuts.push(requiredLengths[i]);
        remaining -= requiredLengths[i] + sawBladeThickness;
        requiredLengths.splice(i, 1);
      }
    }

    if (cuts.length > 0) {
      usedPlanks.push(cuts);
    }
  }

  console.log(usedPlanks);

  const cuttingPlanDiv = document.getElementById('cuttingPlan');
  let checkboxState = localStorage.getItem('checkboxState');
  if (!checkboxState) {
    checkboxState = {};
  } else {
    checkboxState = JSON.parse(checkboxState);
  }

  for (let i = 0; i < usedPlanks.length; i++) {
    const plankDiv = document.createElement('div');
    plankDiv.classList.add('plank');
    plankDiv.innerHTML = `Planche ${i + 1}`;

    const cutsDiv = document.createElement('div');
    cutsDiv.classList.add('cuts');

    for (let j = 0; j < usedPlanks[i].length; j++) {
      const cutDiv = document.createElement('div');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `plank${i}-cut${j}`;

      // Récupération de l'état à partir de LocalStorage
      const checked = checkboxState[checkbox.id] === true;
      checkbox.checked = checked;

      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = `Découpe ${usedPlanks[i][j]} mm`;

      cutDiv.appendChild(checkbox);
      cutDiv.appendChild(label);

      cutsDiv.appendChild(cutDiv);

      checkbox.addEventListener('change', function () {
        checkboxState[checkbox.id] = checkbox.checked;
        localStorage.setItem('checkboxState', JSON.stringify(checkboxState));
      });
    }

    plankDiv.appendChild(cutsDiv);
    cuttingPlanDiv.appendChild(plankDiv);
  }

  document.title = `Plan de découpe - ${usedPlanks.length} planches`;
});
