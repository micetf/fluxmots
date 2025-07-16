// src/data/wordLists.js

/**
 * Listes de mots officielles pour les évaluations de fluence
 * Basées sur les évaluations nationales CE1 2024 (DEPP/CSEN/DGESCO)
 */

export const WORD_LISTS = {
    CE1_OFFICIELLE: {
        id: "ce1_officielle",
        name: "CE1 - Liste officielle 2024",
        description:
            "Liste officielle des évaluations nationales CE1 (62 mots)",
        level: "CE1",
        targetTempo: 1.2, // secondes par mot (50 mots/min)
        words: [
            "le",
            "de",
            "un",
            "à",
            "être",
            "et",
            "en",
            "avoir",
            "que",
            "pour",
            "dans",
            "ce",
            "il",
            "une",
            "sur",
            "avec",
            "ne",
            "se",
            "pas",
            "tout",
            "plus",
            "pouvoir",
            "par",
            "je",
            "son",
            "que",
            "qui",
            "lui",
            "nous",
            "comme",
            "mais",
            "ou",
            "si",
            "leur",
            "temps",
            "très",
            "me",
            "savoir",
            "autre",
            "après",
            "notre",
            "deux",
            "comment",
            "alors",
            "sans",
            "sous",
            "eau",
            "peu",
            "prendre",
            "chez",
            "tant",
            "guerre",
            "état",
            "donner",
            "ordre",
            "général",
            "entre",
            "première",
            "vers",
            "toujours",
            "pays",
            "autour",
        ],
    },

    MI_CP: {
        id: "mi_cp",
        name: "Mi-CP - Liste adaptée",
        description:
            "Liste de mots fréquents adaptée au niveau Mi-CP (30 mots)",
        level: "CP",
        targetTempo: 2.0, // secondes par mot (30 mots/min)
        words: [
            "le",
            "la",
            "les",
            "un",
            "une",
            "des",
            "de",
            "du",
            "et",
            "est",
            "il",
            "elle",
            "je",
            "tu",
            "nous",
            "vous",
            "ce",
            "cette",
            "ses",
            "son",
            "sa",
            "ma",
            "mon",
            "mes",
            "dans",
            "sur",
            "avec",
            "pour",
            "pas",
            "très",
        ],
    },

    FIN_CP: {
        id: "fin_cp",
        name: "Fin CP - Liste progressive",
        description: "Liste de transition Fin CP vers CE1 (45 mots)",
        level: "CP-CE1",
        targetTempo: 1.5, // secondes par mot (40 mots/min)
        words: [
            "le",
            "de",
            "un",
            "à",
            "être",
            "et",
            "en",
            "avoir",
            "que",
            "pour",
            "dans",
            "ce",
            "il",
            "une",
            "sur",
            "avec",
            "ne",
            "se",
            "pas",
            "tout",
            "plus",
            "par",
            "je",
            "son",
            "qui",
            "lui",
            "nous",
            "comme",
            "mais",
            "ou",
            "si",
            "leur",
            "temps",
            "très",
            "me",
            "autre",
            "après",
            "deux",
            "comment",
            "alors",
            "sans",
            "eau",
            "peu",
            "chez",
            "donner",
        ],
    },
};

/**
 * Métadonnées des listes
 */
export const LIST_METADATA = {
    CE1_OFFICIELLE: {
        source: "Évaluations nationales CE1 2024",
        reference: "DEPP/CSEN/DGESCO",
        date: "2024",
        validated: true,
    },
    MI_CP: {
        source: "Adaptation MiCetF.fr",
        reference: "Mots fréquents Éduscol",
        date: "2024",
        validated: true,
    },
    FIN_CP: {
        source: "Progression MiCetF.fr",
        reference: "Transition CP-CE1",
        date: "2024",
        validated: true,
    },
};

/**
 * Utilitaires pour les listes
 */
export const getListById = (id) => {
    return Object.values(WORD_LISTS).find((list) => list.id === id);
};

export const getAllLists = () => {
    return Object.values(WORD_LISTS);
};

export const getListsByLevel = (level) => {
    return Object.values(WORD_LISTS).filter((list) => list.level === level);
};
