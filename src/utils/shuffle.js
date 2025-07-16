// src/utils/shuffle.js

/**
 * Implémentation de l'algorithme Fisher-Yates pour le mélange aléatoire
 * Garantit une distribution uniforme et évite les biais
 */

/**
 * Mélange un tableau en utilisant l'algorithme Fisher-Yates moderne
 *
 * @param {Array} array - Tableau à mélanger
 * @returns {Array} Nouveau tableau mélangé (ne modifie pas l'original)
 */
export const shuffleArray = (array) => {
    if (!Array.isArray(array)) {
        console.warn("shuffleArray: paramètre doit être un tableau");
        return [];
    }

    if (array.length <= 1) {
        return [...array];
    }

    // Créer une copie pour ne pas modifier l'original
    const shuffled = [...array];

    // Algorithme Fisher-Yates moderne (Knuth shuffle)
    for (let i = shuffled.length - 1; i > 0; i--) {
        // Générer un index aléatoire entre 0 et i (inclus)
        const randomIndex = Math.floor(Math.random() * (i + 1));

        // Échanger les éléments
        [shuffled[i], shuffled[randomIndex]] = [
            shuffled[randomIndex],
            shuffled[i],
        ];
    }

    return shuffled;
};

/**
 * Mélange avec seed pour la reproductibilité (utile pour les tests)
 *
 * @param {Array} array - Tableau à mélanger
 * @param {number} seed - Graine pour la génération aléatoire
 * @returns {Array} Tableau mélangé de manière reproductible
 */
export const shuffleArrayWithSeed = (array, seed = 1) => {
    if (!Array.isArray(array)) {
        return [];
    }

    if (array.length <= 1) {
        return [...array];
    }

    // Générateur pseudo-aléatoire simple avec seed
    let rng = seed;
    const random = () => {
        rng = (rng * 9301 + 49297) % 233280;
        return rng / 233280;
    };

    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[randomIndex]] = [
            shuffled[randomIndex],
            shuffled[i],
        ];
    }

    return shuffled;
};

/**
 * Mélange partiel - mélange seulement les N premiers éléments
 * Utile pour créer des variations dans l'ordre sans tout chambouler
 *
 * @param {Array} array - Tableau source
 * @param {number} count - Nombre d'éléments à mélanger depuis le début
 * @returns {Array} Tableau avec les N premiers éléments mélangés
 */
export const shuffleFirstN = (array, count) => {
    if (!Array.isArray(array) || count <= 0) {
        return [...array];
    }

    const shuffled = [...array];
    const actualCount = Math.min(count, array.length);

    for (let i = actualCount - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[randomIndex]] = [
            shuffled[randomIndex],
            shuffled[i],
        ];
    }

    return shuffled;
};

/**
 * Créer plusieurs variations mélangées d'un même tableau
 * Utile pour générer plusieurs sessions différentes
 *
 * @param {Array} array - Tableau source
 * @param {number} count - Nombre de variations à créer
 * @returns {Array<Array>} Tableau de tableaux mélangés
 */
export const createShuffleVariations = (array, count = 3) => {
    if (!Array.isArray(array) || count <= 0) {
        return [array];
    }

    const variations = [];

    for (let i = 0; i < count; i++) {
        variations.push(shuffleArray(array));
    }

    return variations;
};

/**
 * Vérifie si deux tableaux ont le même ordre (pour éviter les "faux" mélanges)
 *
 * @param {Array} array1 - Premier tableau
 * @param {Array} array2 - Deuxième tableau
 * @returns {boolean} true si les tableaux ont le même ordre
 */
export const isSameOrder = (array1, array2) => {
    if (!Array.isArray(array1) || !Array.isArray(array2)) {
        return false;
    }

    if (array1.length !== array2.length) {
        return false;
    }

    return array1.every((item, index) => item === array2[index]);
};

/**
 * Mélange "intelligent" qui garantit un ordre différent de l'original
 * Répète le mélange si l'ordre reste identique (pour les petits tableaux)
 *
 * @param {Array} array - Tableau à mélanger
 * @param {number} maxAttempts - Nombre maximum de tentatives
 * @returns {Array} Tableau mélangé avec un ordre différent de l'original
 */
export const smartShuffle = (array, maxAttempts = 10) => {
    if (!Array.isArray(array) || array.length <= 1) {
        return [...array];
    }

    let shuffled = shuffleArray(array);
    let attempts = 0;

    // Pour les petits tableaux, s'assurer que l'ordre est différent
    while (isSameOrder(array, shuffled) && attempts < maxAttempts) {
        shuffled = shuffleArray(array);
        attempts++;
    }

    return shuffled;
};

/**
 * Utilitaire pour mélanger les mots avec métadonnées
 * Conserve les informations additionnelles liées aux mots
 *
 * @param {Array} wordObjects - Tableau d'objets avec propriétés word, index, etc.
 * @returns {Array} Objets mélangés avec index original préservé
 */
export const shuffleWordObjects = (wordObjects) => {
    if (!Array.isArray(wordObjects)) {
        return [];
    }

    return shuffleArray(
        wordObjects.map((item, originalIndex) => ({
            ...item,
            originalIndex,
            shuffledAt: new Date().toISOString(),
        }))
    );
};
