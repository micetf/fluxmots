// src/data/constants.js

/**
 * Constantes de configuration de l'application FluxMots
 */

export const APP_CONFIG = {
    name: "FluxMots",
    version: "1.0.0",
    author: "MiCetF.fr",
    domain: "https://micetf.fr",
    contact: "webmaster@micetf.fr",
};

export const TEMPO_CONFIG = {
    MIN: 0.5, // Minimum 0.5 secondes par mot
    MAX: 10.0, // Maximum 10 secondes par mot
    STEP: 0.1, // Pas d'ajustement
    DEFAULT: 1.2, // Valeur par défaut (CE1)
    PRESETS: {
        TRÈS_RAPIDE: {
            value: 0.5,
            label: "Très rapide (120 mots/min)",
            level: "Expert",
        },
        RAPIDE: { value: 0.8, label: "Rapide (75 mots/min)", level: "CE2+" },
        NORMAL_CE1: {
            value: 1.2,
            label: "Normal CE1 (50 mots/min)",
            level: "CE1",
        },
        NORMAL_CP: {
            value: 1.5,
            label: "Normal CP (40 mots/min)",
            level: "Fin CP",
        },
        LENT: { value: 2.0, label: "Lent (30 mots/min)", level: "Mi-CP" },
        TRÈS_LENT: {
            value: 3.0,
            label: "Très lent (20 mots/min)",
            level: "Début CP",
        },
    },
};

export const DISPLAY_MODES = {
    SEQUENTIAL: "sequential",
    RANDOM: "random",
};

export const READING_STATES = {
    IDLE: "idle",
    PLAYING: "playing",
    PAUSED: "paused",
    FINISHED: "finished",
};

export const WORD_SEPARATORS = {
    NEWLINE: "\n",
    COMMA: ",",
    SEMICOLON: ";",
    SPACE: " ",
};

export const FONT_SIZES = {
    XS: "word-xs", // 2rem - Mobile portrait
    SM: "word-sm", // 3rem - Mobile paysage
    MD: "word-md", // 4rem - Tablette
    LG: "word-lg", // 6rem - Desktop
    XL: "word-xl", // 8rem - Vidéoprojecteur
    XXL: "word-2xl", // 12rem - Très grand écran
};

export const SCREEN_BREAKPOINTS = {
    SM: 640, // Mobile
    MD: 768, // Tablette
    LG: 1024, // Desktop
    XL: 1280, // Grand écran
    XXL: 1536, // Très grand écran
};

export const STORAGE_KEYS = {
    SETTINGS: "fluxmots_settings",
    CUSTOM_LISTS: "fluxmots_custom_lists",
    LAST_SESSION: "fluxmots_last_session",
};

export const DEFAULT_SETTINGS = {
    tempo: TEMPO_CONFIG.DEFAULT,
    displayMode: DISPLAY_MODES.SEQUENTIAL,
    fontSize: FONT_SIZES.LG,
    autoFullscreen: false,
    showProgress: true,
    soundEnabled: false,
    darkMode: false,
    selectedList: "ce1_officielle",
};

export const KEYBOARD_SHORTCUTS = {
    PLAY_PAUSE: " ", // Espace
    STOP: "Escape", // Échap
    FULLSCREEN: "f", // F
    SHUFFLE: "s", // S
    SETTINGS: ",", // Virgule
    HELP: "?", // Point d'interrogation
};

export const VALIDATION_RULES = {
    CUSTOM_LIST: {
        MIN_WORDS: 1,
        MAX_WORDS: 200,
        MAX_WORD_LENGTH: 50,
        FORBIDDEN_CHARS: /[<>{}[\]|\\`~]/,
        ALLOWED_SEPARATORS: ["\n", ",", ";", " ", "\t"],
    },
};

export const PERFORMANCE_TARGETS = {
    LOAD_TIME: 2000, // 2 secondes max
    TRANSITION_TIME: 50, // 50ms max entre mots
    BUNDLE_SIZE: 1048576, // 1MB max (gzippé)
};

// Configuration spécifique MiCetF.fr
export const MICETF_CONFIG = {
    breadcrumb: ["MiCetF", "outils", "fluxmots"],
    subtitle: "Fluence de lecture",
    showHelp: true,
    showSearch: true,
    baseUrl: "https://micetf.fr",
    paypalId: "Q2XYVFP4EEX2J",
    contactEmail: "webmaster@micetf.fr",
};
