/**
 * ========================================
 * BIBLIO IA 2025 - LOGIQUE JAVASCRIPT
 * ========================================
 * Ce fichier gère la logique principale de l'application, incluant
 * l'animation de code, la classification de livres, et les interactions utilisateur.
 */

/**
 * Références aux éléments DOM utilisés dans l'application.
 * @type {HTMLElement}
 */
let bookTitleInput, bookDescriptionInput, predictBtn, resultSection, resultContent, btnText, btnLoading, titleSuggestions, descriptionSuggestions, correctBtn, correctionSection, categorySelect, submitCorrection, confirmationText;

/**
 * Initialisation de l'application une fois le DOM chargé.
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Biblio IA 2025 - Application initialisée à', new Date().toLocaleString());
    
    initializeDOMElements();
    startCodeAnimation();
    setupEventListeners();
    console.log('📚 Éléments DOM initialisés');
});

/**
 * Initialise les références aux éléments DOM.
 */
function initializeDOMElements() {
    bookTitleInput = document.getElementById('book-title');
    bookDescriptionInput = document.getElementById('book-description');
    predictBtn = document.getElementById('predict-btn');
    resultSection = document.getElementById('result-section');
    resultContent = document.getElementById('result-content');
    btnText = document.getElementById('btn-text');
    btnLoading = document.getElementById('btn-loading');
    titleSuggestions = document.getElementById('title-suggestions');
    descriptionSuggestions = document.getElementById('description-suggestions');
    correctionSection = document.getElementById('correction-section');
    categorySelect = document.getElementById('category-select');
    submitCorrection = document.getElementById('submit-correction');
    confirmationText = document.getElementById('confirmation-text');

    if (!predictBtn) console.error('❌ #predict-btn non trouvé');
    if (!correctionSection || !categorySelect || !submitCorrection) console.warn('⚠️ Éléments de correction manquants');
}

/**
 * Démarre l'animation de code défilant.
 */
function startCodeAnimation() {
    const codeAnimationContainer = document.getElementById('code-animation');
    if (!codeAnimationContainer) return;
    setInterval(() => createCodeLine(codeAnimationContainer), 2000);
    for (let i = 0; i < 3; i++) setTimeout(() => createCodeLine(codeAnimationContainer), i * 500);
}


/**
 * Configure les écouteurs d'événements.
 */
function setupEventListeners() {
    if (predictBtn) predictBtn.addEventListener('click', handlePrediction);
    if (bookDescriptionInput) {
        bookDescriptionInput.addEventListener('input', autoResizeTextarea);
        bookDescriptionInput.addEventListener('input', debounce(() => updateSuggestions('description'), 300));
    }
    if (bookTitleInput) {
        bookTitleInput.addEventListener('input', autoResizeTextarea);
        bookTitleInput.addEventListener('input', debounce(() => updateSuggestions('title'), 300));
    }
    if (submitCorrection) submitCorrection.addEventListener('click', handleCorrection);
}

/**
 * Redimensionne automatiquement les textarea.
 */
function autoResizeTextarea() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
}

/**
 * Gère la prédiction de catégorie.
 */
async function handlePrediction() {
    console.log('📋 Début de handlePrediction');
    const title = bookTitleInput ? bookTitleInput.value.trim() : '';
    const description = bookDescriptionInput.value.trim();

    if (!description && !title) {
        showError('Veuillez saisir un titre ou une description.');
        focusInput();
        return;
    }
    if (description.length < 10 && (!title || title.length < 5)) {
        showError('Le titre doit avoir au moins 5 caractères ou la description 10 caractères.');
        focusInput();
        return;
    }

    try {
        setLoadingState(true);
        hideResult();
        const { category, confidenceScore } = await classifyBook(title, description);
        showResult(category, title, description, confidenceScore);
        askConfirmation(category);
    } catch (error) {
        console.error('❌ Erreur:', error);
        showError('Une erreur est survenue.');
    } finally {
        setLoadingState(false);
    }
}

/**
 * Simule la classification d'un livre.
 * @param {string} title - Le titre.
 * @param {string} description - La description.
 * @returns {Object} Objet contenant la catégorie et le score de confiance.
 */
async function classifyBook(title, description) {
  const text = `${title} ${description}`.trim();

  const response = await fetch('http://192.168.6.246:8000/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`Erreur serveur: ${response.status}`);
  }

  const result = await response.json();

  // On suppose que le serveur renvoie { category: "...", confidenceScore: ... }
  return {
    category: result.category,
    confidenceScore: result.confidenceScore,
  };
}

/**
 * Gère l'état de chargement du bouton.
 * @param {boolean} isLoading - Indique si le chargement est actif.
 */
function setLoadingState(isLoading) {
    if (!predictBtn || !btnText || !btnLoading) return;
    predictBtn.disabled = isLoading;
    if (isLoading) {
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        predictBtn.classList.add('opacity-75', 'cursor-not-allowed');
    } else {
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
        predictBtn.classList.remove('opacity-75', 'cursor-not-allowed');
    }
}

/**
 * Affiche les résultats avec une notation qualitative.
 * @param {string} category - La catégorie prédite.
 * @param {string} title - Le titre.
 * @param {string} description - La description.
 * @param {number} confidenceScore - Score de confiance (0 à 1).
 */
function showResult(category, title, description, confidenceScore) {
    if (!resultSection || !resultContent) return;
    const categoryEmojis = {
        'Science-Fiction': '🚀', 'Romance': '💕', 'Thriller': '🔍', 'Fantasy': '🐉', 'Histoire': '📜',
        'Littérature Générale': '📖'
    };
    const emoji = categoryEmojis[category] || '📚';
    const notation = confidenceScore >= 0.8 ? 'Élevée' : confidenceScore >= 0.5 ? 'Moyenne' : 'Faible';
    resultContent.innerHTML = `
        <div class="flex items-center space-x-3 mb-3">
            <span class="text-3xl">${emoji}</span>
            <div>
                <h4 class="text-xl font-bold text-green-100">Catégorie : <span id="result-category">${category}</span></h4>
                <p class="text-green-200 text-sm">Basé sur : ${title || 'Sans titre'}, ${description}</p>
            </div>
        </div>
        <div class="mt-4 p-3 bg-black bg-opacity-20 rounded-lg">
            <p class="text-green-100 text-sm"><strong>Notation :</strong> ${notation}</p>
            <p class="text-green-200 text-xs mt-1">Analyse sur ${description.length} caractères</p>
        </div>
    `;
    resultSection.classList.remove('hidden');
    console.log('✅ Résultat affiché');
}

/**
 * Masque la section des résultats.
 */
function hideResult() {
    if (resultSection) resultSection.classList.add('hidden');
    if (correctionSection) correctionSection.classList.add('hidden');
}

/**
 * Affiche un message d'erreur.
 * @param {string} message - Le message d'erreur.
 */
function showError(message) {
    if (!resultSection || !resultContent) return;
    resultContent.innerHTML = `<div class="flex items-center space-x-3"><span class="text-3xl">⚠️</span><div><h4 class="text-xl font-bold text-red-100">Erreur</h4><p class="text-red-200">${message}</p></div></div>`;
    resultContent.className = 'p-4 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 rounded-xl';
    resultSection.classList.remove('hidden');
    setTimeout(() => { resultContent.className = 'p-4 bg-green-500 bg-opacity-20 border border-green-400 border-opacity-30 rounded-xl'; }, 5000);
}

/**
 * Place le focus sur le premier champ de saisie.
 */
function focusInput() {
    if (bookTitleInput) bookTitleInput.focus();
    else if (bookDescriptionInput) bookDescriptionInput.focus();
}

/**
 * Crée une fonction différée.
 * @param {Function} func - La fonction à différer.
 * @param {number} wait - Le délai en millisecondes.
 * @returns {Function} La fonction différée.
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Met à jour les suggestions de catégories.
 * @param {string} type - Type d'entrée ('title' ou 'description').
 */
function updateSuggestions(type) {
    const input = type === 'title' ? bookTitleInput : bookDescriptionInput;
    const suggestionsDiv = type === 'title' ? titleSuggestions : descriptionSuggestions;
    if (!input || !suggestionsDiv) return;
    const text = input.value.toLowerCase().trim();
    if (!text) {
        suggestionsDiv.classList.add('hidden');
        return;
    }
    const keywords = {
        'Science-Fiction': ['espace', 'futur', 'robot', 'technologie', 'alien'],
        'Romance': ['amour', 'cœur', 'passion', 'relation'],
        'Thriller': ['mystère', 'enquête', 'meurtre', 'suspense'],
        'Fantasy': ['magie', 'dragon', 'épée', 'royaume'],
        'Histoire': ['guerre', 'siècle', 'époque', 'historique'],
    };
    const suggestions = [];
    for (const [category, words] of Object.entries(keywords)) {
        if (words.some(word => text.includes(word))) suggestions.push(category);
    }
    if (suggestions.length > 0) {
        suggestionsDiv.innerHTML = suggestions.map(cat => `<div class="suggestion-item">${cat}</div>`).join('');
        suggestionsDiv.classList.remove('hidden');
    } else {
        suggestionsDiv.classList.add('hidden');
    }
}

/**
 * Demande une confirmation à l'utilisateur.
 * @param {string} category - La catégorie prédite.
 */
function askConfirmation(category) {
    if (!confirmationText || !correctionSection || !categorySelect || !submitCorrection) return;
    confirmationText.textContent = `La catégorie "${category}" est-elle correcte ? (Oui/Non)`;
    correctionSection.classList.remove('hidden');
    categorySelect.innerHTML = `
        <option value="">Choisissez une catégorie</option>
        <option value="Science-Fiction">Science-Fiction</option>
        <option value="Romance">Romance</option>
        <option value="Thriller">Thriller</option>
        <option value="Fantasy">Fantasy</option>
        <option value="Histoire">Histoire</option>
        <option value="Littérature Générale">Littérature Générale</option>
    `;
    submitCorrection.classList.add('hidden');

    const confirm = prompt('La catégorie est-elle correcte ? (Oui/Non)').toLowerCase();
    if (confirm === 'non' || confirm === 'n') {
        categorySelect.classList.remove('hidden');
        submitCorrection.classList.remove('hidden');
    } else if (confirm === 'oui' || confirm === 'o') {
        correctionSection.classList.add('hidden');
    } else {
        alert('Veuillez répondre par "Oui" ou "Non".');
        askConfirmation(category); // Redemande
    }
}

/**
 * Gère la soumission de la correction.
 */
function handleCorrection() {
    if (!resultContent || !categorySelect || !submitCorrection) return;
    const newCategory = categorySelect.value;
    if (newCategory) {
        const categoryElement = resultContent.querySelector('#result-category');
        if (categoryElement) {
            categoryElement.textContent = newCategory;
            alert(`Merci ! La catégorie a été corrigée à ${newCategory}.`);
            // Simulation d'envoi au serveur (à remplacer par un appel API si nécessaire)
            console.log(`📡 Correction envoyée : ${newCategory}`);
        }
        correctionSection.classList.add('hidden');
    } else {
        alert('Veuillez choisir une catégorie.');
    }
}