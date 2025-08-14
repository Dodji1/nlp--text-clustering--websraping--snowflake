/**
 * ========================================
 * BIBLIO IA 2025 - LOGIQUE JAVASCRIPT
 * ========================================
 * Ce fichier gère la logique principale de l'application pour les deux pages.
 */

/**
 * Références aux éléments DOM utilisés dans l'application.
 * @type {HTMLElement}
 */
let bookTitleInput, bookDescriptionInput, predictBtn, resultSection, resultContent, btnText, btnLoading;
let bookDescriptionSuggest, suggestBtn, suggestionSection, suggestionCatalog, suggestText, suggestLoading;
let titleSuggestions, descriptionSuggestions, correctionSection, categorySelect, submitCorrection, confirmationText;

/**
 * Initialisation de l'application une fois le DOM chargé.
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 BooksClass IA 2025 - Application initialisée à', new Date().toLocaleString());
    
    initializeDOMElements();
    setupEventListeners();
    console.log('📚 Éléments DOM initialisés');
});

/**
 * Initialise les références aux éléments DOM en fonction de la page.
 */
function initializeDOMElements() {
    // Page de prédiction (index.html)
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

    // Page de suggestion (suggest-books.html)
    bookDescriptionSuggest = document.getElementById('book-description-suggest');
    suggestBtn = document.getElementById('suggest-btn');
    suggestionSection = document.getElementById('suggestion-section');
    suggestionCatalog = document.getElementById('suggestion-catalog');
    suggestText = document.getElementById('suggest-text');
    suggestLoading = document.getElementById('suggest-loading');

    if (!predictBtn && !suggestBtn) {
        console.error('❌ Aucun bouton de prédiction ou suggestion trouvé');
        return;
    }
    if ((predictBtn && !resultSection) || (suggestBtn && !suggestionSection)) {
        console.warn('⚠️ Section de résultat manquante');
    }
}

/**
 * Configure les écouteurs d'événements en fonction de la page.
 */
function setupEventListeners() {
    // Page de prédiction
    if (predictBtn) {
        predictBtn.addEventListener('click', handlePrediction);
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

    // Page de suggestion
    if (suggestBtn) {
        suggestBtn.addEventListener('click', handleSuggestion);
        if (bookDescriptionSuggest) {
            bookDescriptionSuggest.addEventListener('input', autoResizeTextarea);
        }
    }
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
        setLoadingState(true, 'predict');
        hideResult(); // Appel de la fonction ajoutée
        const { category, confidenceScore } = await classifyBook(title, description);
        showResult(category, title, description, confidenceScore);
        askConfirmation(category);
    } catch (error) {
        console.error('❌ Erreur:', error);
        showError(`Une erreur est survenue: ${error.message}`);
    } finally {
        setLoadingState(false, 'predict');
    }
}

/**
 * Masque la section des résultats de prédiction.
 */
function hideResult() {
    if (resultSection) {
        resultSection.classList.add('hidden');
    }
}

/**
 * Appelle l'API FastAPI pour classifier le livre.
 * @param {string} title - Le titre.
 * @param {string} description - La description.
 * @returns {Object} Objet contenant la catégorie et le score de confiance.
 */
async function classifyBook(title, description) {
    const text = `${title} ${description}`.trim();

    try {
        const response = await fetch('http://192.168.6.246:8000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur API /predict: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        return {
            category: result.cluster,
            confidenceScore: result.confidenceScore
        };
    } catch (error) {
        console.error('Erreur réseau ou API:', error);
        throw new Error('Échec de la connexion à l\'API. Vérifiez votre réseau ou l\'URL.');
    }
}

/**
 * Gère l'état de chargement du bouton.
 * @param {boolean} isLoading - Indique si le chargement est actif.
 * @param {string} type - Type de bouton ('predict' ou 'suggest').
 */
function setLoadingState(isLoading, type) {
    const btn = type === 'predict' ? predictBtn : suggestBtn;
    const btnTextEl = type === 'predict' ? btnText : suggestText;
    const btnLoadingEl = type === 'predict' ? btnLoading : suggestLoading;
    if (!btn || !btnTextEl || !btnLoadingEl) return;
    btn.disabled = isLoading;
    if (isLoading) {
        btnTextEl.classList.add('hidden');
        btnLoadingEl.classList.remove('hidden');
        btn.classList.add('opacity-75', 'cursor-not-allowed');
    } else {
        btnTextEl.classList.remove('hidden');
        btnLoadingEl.classList.add('hidden');
        btn.classList.remove('opacity-75', 'cursor-not-allowed');
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
            </div>
        </div>
        <div class="mt-4 p-3 bg-black bg-opacity-20 rounded-lg">
            <p class="text-green-200 text-xs mt-1">Analyse sur ${description.length} caractères</p>
        </div>
    `;
    resultSection.classList.remove('hidden');
    console.log('✅ Résultat affiché');
}

/**
 * Gère la suggestion de livres.
 */
async function handleSuggestion() {
    console.log('📋 Début de handleSuggestion');
    const description = bookDescriptionSuggest ? bookDescriptionSuggest.value.trim() : '';

    if (!description || description.length < 10) {
        showError('Veuillez saisir une description d\'au moins 10 caractères.');
        return;
    }

    try {
        setLoadingState(true, 'suggest');
        hideSuggestion();
        const { category, suggestedBooks } = await suggestBooks(description);
        showSuggestions(category, suggestedBooks, description);
    } catch (error) {
        console.error('❌ Erreur:', error);
        showError(`Une erreur est survenue: ${error.message}`);
    } finally {
        setLoadingState(false, 'suggest');
    }
}

/**
 * Appelle l'API FastAPI pour suggérer des livres.
 * @param {string} description - La description du livre.
 * @returns {Object} Objet contenant la catégorie et les livres suggérés.
 */
async function suggestBooks(description) {
    const text = description.trim();

    try {
        const response = await fetch('http://192.168.6.246:8000/suggest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur API /suggest: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        if (!result.category || !result.suggestedBooks) {
            throw new Error('Réponse API invalide : missing category or suggestedBooks');
        }
        return {
            category: result.category,
            suggestedBooks: result.suggestedBooks
        };
    } catch (error) {
        console.error('Erreur réseau ou API:', error);
        throw new Error('Échec de la connexion à l\'API. Vérifiez votre réseau ou l\'URL.');
    }
}

/**
 * Affiche les suggestions de livres sous forme de catalogue visuel.
 * @param {string} category - La catégorie déduite.
 * @param {string[]} books - Liste des titres de livres suggérés.
 * @param {string} description - La description analysée.
 */
function showSuggestions(category, books, description) {
    if (!suggestionSection || !suggestionCatalog) return;
    const categoryEmojis = {
        'Science-Fiction': '🚀', 'Romance': '💕', 'Thriller': '🔍', 'Fantasy': '🐉', 'Histoire': '📜',
        'Littérature Générale': '📖'
    };
    const emoji = categoryEmojis[category] || '📚';
    const limitedBooks = books.slice(0, 3); // Limite à 3 livres

    const bookDatabase = {
        'Science-Fiction': [
            { title: 'Dune', image: 'https://via.placeholder.com/150', url: 'https://example.com/dune' },
            { title: 'Fondation', image: 'https://via.placeholder.com/150', url: 'https://example.com/fondation' },
            { title: '2001: L\'Odyssée de l\'espace', image: 'https://via.placeholder.com/150', url: 'https://example.com/2001' }
        ],
        'Romance': [
            { title: 'Orgueil et Préjugés', image: 'https://via.placeholder.com/150', url: 'https://example.com/orgueil' },
            { title: 'Le Journal de Bridget Jones', image: 'https://via.placeholder.com/150', url: 'https://example.com/bridget' },
            { title: 'Nuits Blanches', image: 'https://via.placeholder.com/150', url: 'https://example.com/nuits' }
        ],
        'Thriller': [
            { title: 'Le Silence des Agneaux', image: 'https://via.placeholder.com/150', url: 'https://example.com/silence' },
            { title: 'Millénium', image: 'https://via.placeholder.com/150', url: 'https://example.com/millenium' },
            { title: 'Gone Girl', image: 'https://via.placeholder.com/150', url: 'https://example.com/gone' }
        ],
        'Fantasy': [
            { title: 'Le Seigneur des Anneaux', image: 'https://via.placeholder.com/150', url: 'https://example.com/lotr' },
            { title: 'Harry Potter', image: 'https://via.placeholder.com/150', url: 'https://example.com/harry' },
            { title: 'Le Trône de Fer', image: 'https://via.placeholder.com/150', url: 'https://example.com/got' }
        ],
        'Histoire': [
            { title: 'Sapiens', image: 'https://via.placeholder.com/150', url: 'https://example.com/sapiens' },
            { title: 'Guerre et Paix', image: 'https://via.placeholder.com/150', url: 'https://example.com/guerre' },
            { title: 'L\'Histoire de France', image: 'https://via.placeholder.com/150', url: 'https://example.com/histoire' }
        ],
        'Littérature Générale': [
            { title: 'Cent Ans de Solitude', image: 'https://via.placeholder.com/150', url: 'https://example.com/centans' },
            { title: 'Les Misérables', image: 'https://via.placeholder.com/150', url: 'https://example.com/miserables' },
            { title: 'L\'Étranger', image: 'https://via.placeholder.com/150', url: 'https://example.com/etranger' }
        ]
    };

    const booksWithDetails = limitedBooks.map(title => {
        const book = bookDatabase[category].find(b => b.title === title) || { title, image: 'https://via.placeholder.com/150', url: '#' };
        return book;
    });

    suggestionCatalog.innerHTML = `
        <div class="flex items-center space-x-3 mb-3">
            <span class="text-3xl">${emoji}</span>
            <div>
                <h4 class="text-xl font-bold text-green-100">Catégorie : ${category}</h4>
            </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            ${booksWithDetails.map(book => `
                <a href="${book.url}" target="_blank" class="book-shelf-item bg-white bg-opacity-10 rounded-lg p-2 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <img src="${book.image}" alt="${book.title}" class="w-full h-48 object-cover rounded-t-lg">
                    <p class="text-center text-green-100 mt-2">${book.title}</p>
                </a>
            `).join('')}
        </div>
        ${limitedBooks.length < bookDatabase[category].length ? '<p class="text-green-200 text-xs mt-2">Et d\'autres...</p>' : ''}
    `;
    suggestionSection.classList.remove('hidden');
    console.log('✅ Catalogue affiché');
}

/**
 * Masque la section des suggestions.
 */
function hideSuggestion() {
    if (suggestionSection) {
        suggestionSection.classList.add('hidden');
    }
}

/**
 * Affiche un message d'erreur.
 * @param {string} message - Le message d'erreur.
 */
function showError(message) {
    const content = predictBtn ? resultContent : suggestionCatalog;
    const section = predictBtn ? resultSection : suggestionSection;
    if (!section || !content) return;
    content.innerHTML = `<div class="flex items-center space-x-3"><span class="text-3xl">⚠️</span><div><h4 class="text-xl font-bold text-red-100">Erreur</h4><p class="text-red-200">${message}</p></div></div>`;
    content.className = 'p-4 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 rounded-xl';
    section.classList.remove('hidden');
    setTimeout(() => { content.className = 'p-4 bg-green-500 bg-opacity-20 border border-green-400 border-opacity-30 rounded-xl'; }, 5000);
}

/**
 * Place le focus sur le premier champ de saisie.
 */
function focusInput() {
    if (bookTitleInput) bookTitleInput.focus();
    else if (bookDescriptionInput) bookDescriptionInput.focus();
    else if (bookDescriptionSuggest) bookDescriptionSuggest.focus();
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
        askConfirmation(category);
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
            console.log(`📡 Correction envoyée : ${newCategory}`);
        }
        correctionSection.classList.add('hidden');
    } else {
        alert('Veuillez choisir une catégorie.');
    }
}