// src/hooks/useWordFlow.js

import { useState, useEffect, useCallback, useRef } from "react";
import { READING_STATES, DISPLAY_MODES } from "@data/constants";
import { shuffleArray } from "@utils/shuffle";
import { calculateFluentMetrics } from "@utils/performance";

/**
 * Hook principal pour la gestion de la fluence de lecture
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
    const timeoutRef = useRef(null);
    const currentIndexRef = useRef(0);

    // Prépare la liste des mots selon le mode d'affichage
    const prepareWords = useCallback(() => {
        if (!words.length) return [];

        if (displayMode === DISPLAY_MODES.RANDOM) {
            return shuffleArray([...words]);
        }
        return [...words];
    }, [words, displayMode]);

    // Initialise ou réinitialise la session
    const initializeSession = useCallback(() => {
        const preparedWords = prepareWords();
        setDisplayWords(preparedWords);
        setCurrentWordIndex(0);
        currentIndexRef.current = 0;
        setProgress(0);
        setState(READING_STATES.IDLE);
        setStartTime(null);
        setEndTime(null);

        // Nettoyer les timers
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, [prepareWords]);

    // Avance au mot suivant
    const advanceWord = useCallback(() => {
        const nextIndex = currentIndexRef.current + 1;

        if (nextIndex >= displayWords.length) {
            // Fin de la liste
            setState(READING_STATES.FINISHED);
            setEndTime(new Date());
            setProgress(100);
            return;
        }

        currentIndexRef.current = nextIndex;
        setCurrentWordIndex(nextIndex);

        // Calculer et mettre à jour le progrès
        const newProgress = Math.round((nextIndex / displayWords.length) * 100);
        setProgress(newProgress);

        // Programmer le mot suivant
        timeoutRef.current = setTimeout(advanceWord, tempo * 1000);
    }, [displayWords.length, tempo]);

    // Démarre la lecture
    const play = useCallback(() => {
        if (displayWords.length === 0) return;

        if (state === READING_STATES.IDLE) {
            setStartTime(new Date());
        }

        setState(READING_STATES.PLAYING);

        // Commencer l'avancement automatique
        timeoutRef.current = setTimeout(advanceWord, tempo * 1000);
    }, [state, displayWords.length, tempo, advanceWord]);

    // Met en pause la lecture
    const pause = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setState(READING_STATES.PAUSED);
    }, []);

    // Arrête la lecture et remet à zéro
    const stop = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setCurrentWordIndex(0);
        currentIndexRef.current = 0;
        setProgress(0);
        setState(READING_STATES.IDLE);
        setStartTime(null);
        setEndTime(null);
    }, []);

    // Mélange à nouveau les mots
    const shuffle = useCallback(() => {
        if (displayMode === DISPLAY_MODES.RANDOM) {
            const shuffledWords = shuffleArray([...words]);
            setDisplayWords(shuffledWords);
            stop();
        }
    }, [displayMode, words, stop]);

    // Calcule les statistiques de performance
    const getStats = useCallback(() => {
        if (!startTime || !endTime || !displayWords.length) {
            return null;
        }

        return calculateFluentMetrics(
            startTime,
            endTime,
            displayWords.length,
            tempo
        );
    }, [startTime, endTime, displayWords.length, tempo]);

    // Effet pour initialiser/réinitialiser quand les mots changent
    useEffect(() => {
        initializeSession();
    }, [initializeSession]);

    // Nettoyage des timers
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
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
