document.addEventListener('DOMContentLoaded', () => {
  const plankDimensionsInput = document.getElementById('plankDimensions');
  const shopPlankLengthInput = document.getElementById('shopPlankLength');
  const sawBladeThicknessInput = document.getElementById('sawBladeThickness');
  const generatePlanButton = document.getElementById('generatePlan');
  const clearLocalStorageButton = document.getElementById('clearLocalStorage');
  const cuttingPlanDiv = document.getElementById('cuttingPlan');

  // Valeurs par défaut
  const defaultPlankDimensions = {
    '760x300': 12,
    '480x300': 14,
    '1294x300': 2,
    '1594x300': 1,
    '1558x300': 2,
    '240x300': 1,
    '250x300': 1,
  };
  const defaultShopPlankLength = 2000; // mm
  const defaultSawBladeThickness = 2; // mm

  // Initialisation des champs d'entrée avec les valeurs par défaut
  plankDimensionsInput.value = Object.keys(defaultPlankDimensions)
    .map((key) => `${key}`)
    .join(',');
  shopPlankLengthInput.value = defaultShopPlankLength;
  sawBladeThicknessInput.value = defaultSawBladeThickness;

  // Fonction pour parser les dimensions des planches
  function parsePlankDimensions(input) {
    const dimensions = {};
    input.split(',').forEach((dim) => {
      const [width, height] = dim.split('x');
      dimensions[dim] = 1; // Par défaut, une planche par dimension
    });
    return dimensions;
  }

  // Fonction pour générer le plan de découpe
  function generateCuttingPlan(
    plankDimensions,
    shopPlankLength,
    sawBladeThickness,
    fullPlanks
  ) {
    const requiredLengths = [];
    for (const dim in plankDimensions) {
      const length = parseInt(dim.split('x')[0]);
      requiredLengths.push(...Array(plankDimensions[dim]).fill(length));
    }

    requiredLengths.sort((a, b) => b - a);

    const usedPlanks = Array(parseInt(fullPlanks)).fill([shopPlankLength]); // Ajouter des planches complètes

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
      } else {
        // Si aucune coupe n'est possible, ajouter une nouvelle planche complète
        usedPlanks.push([shopPlankLength]);
      }
    }

    return usedPlanks;
  }

  // Fonction pour afficher le plan de découpe
  function displayCuttingPlan(usedPlanks) {
    cuttingPlanDiv.innerHTML = ''; // Effacer le contenu précédent

    const checkboxState = localStorage.getItem('checkboxState');
    let parsedCheckboxState = {};
    if (checkboxState) {
      parsedCheckboxState = JSON.parse(checkboxState);
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
        const checked = parsedCheckboxState[checkbox.id] === true;
        checkbox.checked = checked;

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = `Découpe ${usedPlanks[i][j]} mm`;

        cutDiv.appendChild(checkbox);
        cutDiv.appendChild(label);

        cutsDiv.appendChild(cutDiv);

        checkbox.addEventListener('change', function () {
          parsedCheckboxState[checkbox.id] = checkbox.checked;
          localStorage.setItem(
            'checkboxState',
            JSON.stringify(parsedCheckboxState)
          );
        });
      }

      plankDiv.appendChild(cutsDiv);
      cuttingPlanDiv.appendChild(plankDiv);
    }

    document.title = `Plan de découpe - ${usedPlanks.length} planches`;
  }

  // Gestion du bouton pour générer le plan
  generatePlanButton.addEventListener('click', () => {
    const plankDimensions = parsePlankDimensions(plankDimensionsInput.value);
    const shopPlankLength = parseInt(shopPlankLengthInput.value);
    const sawBladeThickness = parseInt(sawBladeThicknessInput.value);
    const fullPlanks = document.getElementById('fullPlanks').value;

    // Augmenter le nombre de planches complètes si nécessaire
    const usedPlanks = generateCuttingPlan(
      plankDimensions,
      shopPlankLength,
      sawBladeThickness,
      fullPlanks
    );
    displayCuttingPlan(usedPlanks);
  });

  // Gestion du bouton pour effacer le stockage local
  clearLocalStorageButton.addEventListener('click', () => {
    localStorage.clear();
    location.reload(); // Rafraîchir la page
  });
});
