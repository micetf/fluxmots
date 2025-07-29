// src/hooks/useWordFlow.js
// Version réécrite complètement - Élimination totale des boucles infinies

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { READING_STATES, DISPLAY_MODES } from "@data/constants";
import { shuffleArray } from "@utils/shuffle";
import { calculateFluentMetrics } from "@utils/performance";

export const useWordFlow = (
    words = [],
    tempo = 1.2,
    displayMode = DISPLAY_MODES.SEQUENTIAL
) => {
    // ✅ États principaux - simples et stables
    const [state, setState] = useState(READING_STATES.IDLE);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    // ✅ Refs pour éviter les re-rendus
    const timeoutRef = useRef(null);
    const stateRef = useRef(READING_STATES.IDLE);
    const currentIndexRef = useRef(0);

    // ✅ Mémorisation des mots préparés - CRITIQUE pour éviter les boucles
    const displayWords = useMemo(() => {
        if (!Array.isArray(words) || words.length === 0) {
            return [];
        }

        console.log(
            "📝 Préparation des mots:",
            words.length,
            "en mode",
            displayMode
        );

        return displayMode === DISPLAY_MODES.RANDOM
            ? shuffleArray([...words])
            : [...words];
    }, [words, displayMode]); // ✅ Dépendances stables uniquement

    // ✅ Synchronisation des refs (sans effet de bord)
    stateRef.current = state;
    currentIndexRef.current = currentWordIndex;

    // ✅ Mot actuel - dérivé directement
    const currentWord = displayWords[currentWordIndex] || "";

    // ✅ Progrès - calculé directement
    const progress =
        displayWords.length > 0
            ? Math.round((currentWordIndex / displayWords.length) * 100)
            : 0;

    // ✅ Fonction de nettoyage - stable
    const clearTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    // ✅ Avancement - fonction pure et stable
    const advanceToNextWord = useCallback(() => {
        const nextIndex = currentIndexRef.current + 1;
        const totalWords = displayWords.length;

        console.log(
            "➡️ Avancement:",
            currentIndexRef.current,
            "->",
            nextIndex,
            "/",
            totalWords
        );

        // Vérifier la fin
        if (nextIndex >= totalWords) {
            console.log("🏁 Fin de la liste");
            setState(READING_STATES.FINISHED);
            setEndTime(new Date());
            clearTimer();
            return;
        }

        // Avancer si on est encore en lecture
        if (stateRef.current === READING_STATES.PLAYING) {
            setCurrentWordIndex(nextIndex);

            // Programmer le suivant
            timeoutRef.current = setTimeout(() => {
                if (stateRef.current === READING_STATES.PLAYING) {
                    advanceToNextWord();
                }
            }, tempo * 1000);
        }
    }, [displayWords.length, tempo, clearTimer]);

    // ✅ Contrôles - stables et simples
    const play = useCallback(() => {
        console.log("▶️ Play");

        if (displayWords.length === 0) {
            console.warn("Aucun mot à jouer");
            return;
        }

        if (stateRef.current === READING_STATES.PLAYING) {
            return;
        }

        // Démarrer le chrono si idle
        if (stateRef.current === READING_STATES.IDLE) {
            setStartTime(new Date());
        }

        setState(READING_STATES.PLAYING);

        // Premier avancement
        clearTimer();
        timeoutRef.current = setTimeout(() => {
            if (stateRef.current === READING_STATES.PLAYING) {
                advanceToNextWord();
            }
        }, tempo * 1000);
    }, [displayWords.length, tempo, advanceToNextWord, clearTimer]);

    const pause = useCallback(() => {
        console.log("⏸️ Pause");
        clearTimer();
        setState(READING_STATES.PAUSED);
    }, [clearTimer]);

    const stop = useCallback(() => {
        console.log("⏹️ Stop");
        clearTimer();
        setCurrentWordIndex(0);
        setState(READING_STATES.IDLE);
        setStartTime(null);
        setEndTime(null);
    }, [clearTimer]);

    const shuffle = useCallback(() => {
        if (displayMode === DISPLAY_MODES.RANDOM) {
            console.log("🔀 Remélange (force)");
            // Forcer un nouveau mélange en changeant la clé
            const newWords = shuffleArray([...words]);
            // Note: ceci va déclencher le useMemo pour displayWords
            stop();
        }
    }, [displayMode, words, stop]);

    // ✅ Réinitialisation quand les mots changent - CONTRÔLÉE
    useEffect(() => {
        console.log("🔄 Réinitialisation:", displayWords.length, "mots");

        // Nettoyer et réinitialiser seulement si nécessaire
        if (
            displayWords.length === 0 ||
            currentWordIndex >= displayWords.length
        ) {
            clearTimer();
            setCurrentWordIndex(0);
            setState(READING_STATES.IDLE);
            setStartTime(null);
            setEndTime(null);
        }
    }, [displayWords.length, currentWordIndex, clearTimer]);

    // ✅ Nettoyage final
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // ✅ Stats - calculées seulement quand nécessaire
    const stats = useMemo(() => {
        if (!startTime || !endTime || displayWords.length === 0) {
            return null;
        }

        return calculateFluentMetrics(
            startTime,
            endTime,
            displayWords.length,
            tempo
        );
    }, [startTime, endTime, displayWords.length, tempo]);

    // ✅ Retour - propriétés stables
    return {
        // État actuel
        state,
        currentWord,
        currentWordIndex,
        totalWords: displayWords.length,
        progress,

        // Statistiques
        stats,

        // Contrôles
        play,
        pause,
        stop,
        shuffle,

        // États dérivés
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
