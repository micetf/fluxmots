// src/utils/performance.js

/**
 * Utilitaires pour le calcul de performance et métriques de fluence
 */

/**
 * Convertit un tempo (secondes/mot) en mots par minute
 *
 * @param {number} tempoSeconds - Temps en secondes par mot
 * @returns {number} Nombre de mots par minute (arrondi)
 */
export const tempoToWordsPerMinute = (tempoSeconds) => {
    if (tempoSeconds <= 0) return 0;
    return Math.round(60 / tempoSeconds);
};

/**
 * Convertit des mots par minute en tempo (secondes/mot)
 *
 * @param {number} wordsPerMinute - Nombre de mots par minute
 * @returns {number} Temps en secondes par mot (2 décimales)
 */
export const wordsPerMinuteToTempo = (wordsPerMinute) => {
    if (wordsPerMinute <= 0) return 10; // Valeur max par défaut
    return Math.round((60 / wordsPerMinute) * 100) / 100;
};

/**
 * Calcule les métriques de performance d'une session de fluence
 *
 * @param {Date} startTime - Heure de début
 * @param {Date} endTime - Heure de fin
 * @param {number} wordCount - Nombre de mots lus
 * @param {number} targetTempo - Tempo cible en secondes/mot
 * @returns {Object} Métriques calculées
 */
export const calculateFluentMetrics = (
    startTime,
    endTime,
    wordCount,
    targetTempo
) => {
    if (!startTime || !endTime || wordCount <= 0) {
        return null;
    }

    const durationMs = endTime.getTime() - startTime.getTime();
    const durationSeconds = durationMs / 1000;
    const durationMinutes = durationSeconds / 60;

    const actualWordsPerMinute = Math.round(wordCount / durationMinutes);
    const targetWordsPerMinute = tempoToWordsPerMinute(targetTempo);
    const averageTimePerWord = durationSeconds / wordCount;

    const efficiency = Math.round(
        (actualWordsPerMinute / targetWordsPerMinute) * 100
    );
    const tempoVariance = Math.abs(averageTimePerWord - targetTempo);

    return {
        duration: {
            milliseconds: durationMs,
            seconds: Math.round(durationSeconds),
            minutes: Math.round(durationMinutes * 100) / 100,
            formatted: formatDuration(durationMs),
        },
        performance: {
            actualWPM: actualWordsPerMinute,
            targetWPM: targetWordsPerMinute,
            efficiency: efficiency,
            averageTimePerWord: Math.round(averageTimePerWord * 100) / 100,
            tempoVariance: Math.round(tempoVariance * 100) / 100,
        },
        summary: {
            totalWords: wordCount,
            readingLevel: getReadingLevel(actualWordsPerMinute),
            performanceRating: getPerformanceRating(efficiency),
        },
    };
};

/**
 * Détermine le niveau de lecture basé sur les mots par minute
 *
 * @param {number} wpm - Mots par minute
 * @returns {Object} Niveau et description
 */
export const getReadingLevel = (wpm) => {
    if (wpm >= 120) {
        return {
            level: "Expert",
            description: "Lecture très fluide",
            color: "text-green-600",
        };
    } else if (wpm >= 75) {
        return {
            level: "CE2+",
            description: "Lecture fluide",
            color: "text-green-500",
        };
    } else if (wpm >= 50) {
        return {
            level: "CE1",
            description: "Niveau CE1 atteint",
            color: "text-blue-500",
        };
    } else if (wpm >= 40) {
        return {
            level: "Fin CP",
            description: "Progression satisfaisante",
            color: "text-yellow-500",
        };
    } else if (wpm >= 30) {
        return {
            level: "Mi-CP",
            description: "En cours d'apprentissage",
            color: "text-orange-500",
        };
    } else {
        return {
            level: "Début CP",
            description: "Apprentissage en cours",
            color: "text-red-500",
        };
    }
};

/**
 * Évalue la performance par rapport à l'objectif
 *
 * @param {number} efficiency - Pourcentage d'efficacité
 * @returns {Object} Évaluation de la performance
 */
export const getPerformanceRating = (efficiency) => {
    if (efficiency >= 100) {
        return {
            rating: "Excellent",
            description: "Objectif atteint ou dépassé",
            emoji: "🌟",
            color: "text-green-600",
        };
    } else if (efficiency >= 80) {
        return {
            rating: "Très bien",
            description: "Proche de l'objectif",
            emoji: "✨",
            color: "text-green-500",
        };
    } else if (efficiency >= 60) {
        return {
            rating: "Bien",
            description: "Bonne progression",
            emoji: "👍",
            color: "text-blue-500",
        };
    } else if (efficiency >= 40) {
        return {
            rating: "À améliorer",
            description: "Continues à progresser",
            emoji: "💪",
            color: "text-yellow-500",
        };
    } else {
        return {
            rating: "En apprentissage",
            description: "Continue tes efforts",
            emoji: "🌱",
            color: "text-orange-500",
        };
    }
};

/**
 * Formate une durée en millisecondes en format lisible
 *
 * @param {number} milliseconds - Durée en millisecondes
 * @returns {string} Durée formatée (ex: "2:35" pour 2 minutes 35 secondes)
 */
export const formatDuration = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    } else {
        return `${seconds}s`;
    }
};

/**
 * Calcule le temps estimé pour une liste de mots
 *
 * @param {number} wordCount - Nombre de mots
 * @param {number} tempo - Tempo en secondes/mot
 * @returns {Object} Temps estimé formaté
 */
export const calculateEstimatedTime = (wordCount, tempo) => {
    if (wordCount <= 0 || tempo <= 0) {
        return { seconds: 0, formatted: "0s" };
    }

    const totalSeconds = wordCount * tempo;
    return {
        seconds: Math.round(totalSeconds),
        formatted: formatDuration(totalSeconds * 1000),
    };
};

/**
 * Génère des statistiques de progression pour une série de sessions
 *
 * @param {Array} sessions - Tableau des sessions passées
 * @returns {Object} Statistiques de progression
 */
export const calculateProgressStats = (sessions) => {
    if (!Array.isArray(sessions) || sessions.length === 0) {
        return null;
    }

    const validSessions = sessions.filter(
        (s) => s.metrics && s.metrics.performance
    );

    if (validSessions.length === 0) {
        return null;
    }

    const wpmValues = validSessions.map((s) => s.metrics.performance.actualWPM);
    // const efficiencyValues = validSessions.map(
    //     (s) => s.metrics.performance.efficiency
    // );

    const averageWPM = Math.round(
        wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length
    );
    const bestWPM = Math.max(...wpmValues);
    const recentWPM = wpmValues.slice(-3); // 3 dernières sessions
    const recentAverage = Math.round(
        recentWPM.reduce((a, b) => a + b, 0) / recentWPM.length
    );

    const trend =
        recentAverage > averageWPM
            ? "amélioration"
            : recentAverage < averageWPM
              ? "baisse"
              : "stable";

    return {
        totalSessions: validSessions.length,
        averageWPM,
        bestWPM,
        recentAverage,
        trend,
        improvement: recentAverage - averageWPM,
        consistency: calculateConsistency(wpmValues),
    };
};

/**
 * Calcule la consistance (écart-type relatif) des performances
 *
 * @param {Array} values - Valeurs à analyser
 * @returns {Object} Métriques de consistance
 */
export const calculateConsistency = (values) => {
    if (values.length < 2) {
        return { score: 100, description: "Données insuffisantes" };
    }

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
        values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = (standardDeviation / mean) * 100;

    // Score de consistance inversé (plus le CV est faible, plus le score est élevé)
    const consistencyScore = Math.max(
        0,
        Math.round(100 - coefficientOfVariation)
    );

    let description;
    if (consistencyScore >= 80) {
        description = "Très régulier";
    } else if (consistencyScore >= 60) {
        description = "Assez régulier";
    } else if (consistencyScore >= 40) {
        description = "Irrégulier";
    } else {
        description = "Très irrégulier";
    }

    return {
        score: consistencyScore,
        description,
        standardDeviation: Math.round(standardDeviation * 10) / 10,
        coefficientOfVariation: Math.round(coefficientOfVariation * 10) / 10,
    };
};
