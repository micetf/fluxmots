// src/hooks/useWordFlow.js

import { useState, useEffect, useCallback, useRef } from "react";
import { READING_STATES, DISPLAY_MODES } from "@data/constants";
import { shuffleArray } from "@utils/shuffle";

/**
 * Hook principal pour la gestion de la fluence de lecture
 *
 * @param {Array} words - Liste des mots à afficher
 * @param {number} tempo - Temps d'affichage par mot en secondes
 * @param {string} displayMode - Mode d'affichage (sequential/random)
 * @returns {Object} État et contrôles de la fluence
 */
export const useWordFlow = (
    words = [],
    tempo = 1.2,
    displayMode = DISPLAY_MODES.SEQUENTIAL
) => {
    // États principaux
    const [state, setState] = useState(READING_STATES.IDLE);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [displayWords, setDisplayWords] = useState([]);
    const [progress, setProgress] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    // Références pour les timers
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);

    /**
     * Prépare la liste des mots selon le mode d'affichage
     */
    const prepareWords = useCallback(() => {
        if (!words.length) return [];

        if (displayMode === DISPLAY_MODES.RANDOM) {
            return shuffleArray([...words]);
        }
        return [...words];
    }, [words, displayMode]);

    /**
     * Initialise ou réinitialise la session
     */
    const initializeSession = useCallback(() => {
        const preparedWords = prepareWords();
        setDisplayWords(preparedWords);
        setCurrentWordIndex(0);
        setProgress(0);
        setState(READING_STATES.IDLE);
        setStartTime(null);
        setEndTime(null);
    }, [prepareWords]);

    /**
     * Démarre la lecture
     */
    const play = useCallback(() => {
        if (displayWords.length === 0) return;

        if (state === READING_STATES.IDLE) {
            setStartTime(new Date());
        }

        setState(READING_STATES.PLAYING);

        // Passer au mot suivant après le délai spécifié
        timeoutRef.current = setTimeout(() => {
            setCurrentWordIndex((prev) => {
                const nextIndex = prev + 1;

                if (nextIndex >= displayWords.length) {
                    // Fin de la liste
                    setState(READING_STATES.FINISHED);
                    setEndTime(new Date());
                    setProgress(100);
                    return prev;
                }

                // Calculer et mettre à jour le progrès
                const newProgress = Math.round(
                    (nextIndex / displayWords.length) * 100
                );
                setProgress(newProgress);

                return nextIndex;
            });
        }, tempo * 1000);
    }, [state, displayWords.length, tempo]);

    /**
     * Met en pause la lecture
     */
    const pause = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setState(READING_STATES.PAUSED);
    }, []);

    /**
     * Arrête la lecture et remet à zéro
     */
    const stop = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setCurrentWordIndex(0);
        setProgress(0);
        setState(READING_STATES.IDLE);
        setStartTime(null);
        setEndTime(null);
    }, []);

    /**
     * Mélange à nouveau les mots (mode aléatoire uniquement)
     */
    const shuffle = useCallback(() => {
        if (displayMode === DISPLAY_MODES.RANDOM) {
            const shuffledWords = shuffleArray([...words]);
            setDisplayWords(shuffledWords);
            stop(); // Remet à zéro la lecture
        }
    }, [displayMode, words, stop]);

    /**
     * Bascule entre lecture et pause
     */
    const togglePlayPause = useCallback(() => {
        if (state === READING_STATES.PLAYING) {
            pause();
        } else if (
            state === READING_STATES.PAUSED ||
            state === READING_STATES.IDLE
        ) {
            play();
        }
    }, [state, play, pause]);

    /**
     * Va au mot précédent (mode manuel)
     */
    const previousWord = useCallback(() => {
        if (state === READING_STATES.PLAYING) return;

        setCurrentWordIndex((prev) => Math.max(0, prev - 1));
        setProgress(
            Math.round(
                (Math.max(0, currentWordIndex - 1) / displayWords.length) * 100
            )
        );
    }, [state, currentWordIndex, displayWords.length]);

    /**
     * Va au mot suivant (mode manuel)
     */
    const nextWord = useCallback(() => {
        if (state === READING_STATES.PLAYING) return;

        setCurrentWordIndex((prev) => {
            const nextIndex = Math.min(displayWords.length - 1, prev + 1);
            setProgress(Math.round((nextIndex / displayWords.length) * 100));
            return nextIndex;
        });
    }, [state, displayWords.length]);

    /**
     * Calcule les statistiques de performance
     */
    const getStats = useCallback(() => {
        if (!startTime || !endTime || !displayWords.length) {
            return null;
        }

        const durationMs = endTime.getTime() - startTime.getTime();
        const durationMin = durationMs / (1000 * 60);
        const wordsPerMinute = Math.round(displayWords.length / durationMin);
        const averageTimePerWord = durationMs / displayWords.length / 1000;

        return {
            duration: durationMs,
            durationFormatted: formatDuration(durationMs),
            wordsPerMinute,
            averageTimePerWord: Math.round(averageTimePerWord * 10) / 10,
            totalWords: displayWords.length,
            targetTempo: tempo,
        };
    }, [startTime, endTime, displayWords.length, tempo]);

    /**
     * Formate la durée en mm:ss
     */
    const formatDuration = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    // Effet pour initialiser/réinitialiser quand les mots changent
    useEffect(() => {
        initializeSession();
    }, [initializeSession]);

    // Effet pour continuer la lecture automatique
    useEffect(() => {
        if (
            state === READING_STATES.PLAYING &&
            currentWordIndex < displayWords.length - 1
        ) {
            play();
        }
    }, [currentWordIndex, state, displayWords.length, play]); // Retiré play() des dépendances pour éviter la boucle

    // Nettoyage des timers
    useEffect(() => {
        const cleanup = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };

        // Nettoyage à la destruction du composant
        return cleanup;
    }, []);

    return {
        // État actuel
        state,
        currentWord: displayWords[currentWordIndex] || "",
        currentWordIndex,
        totalWords: displayWords.length,
        progress,

        // Statistiques
        stats: getStats(),

        // Contrôles
        play,
        pause,
        stop,
        shuffle,
        togglePlayPause,
        previousWord,
        nextWord,

        // Informations
        isPlaying: state === READING_STATES.PLAYING,
        isPaused: state === READING_STATES.PAUSED,
        isFinished: state === READING_STATES.FINISHED,
        isIdle: state === READING_STATES.IDLE,
        canShuffle: displayMode === DISPLAY_MODES.RANDOM,

        // Configuration
        displayMode,
        tempo,
    };
};
