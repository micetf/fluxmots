// src/hooks/useWordFlow.js
// Version finale stable - Protection contre StrictMode et conditions de course

import { useState, useEffect, useCallback, useRef } from "react";
import { READING_STATES, DISPLAY_MODES } from "@data/constants";
import { shuffleArray } from "@utils/shuffle";
import { calculateFluentMetrics } from "@utils/performance";

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

    // Refs pour éviter les conditions de course
    const timeoutRef = useRef(null);
    const stateRef = useRef(READING_STATES.IDLE);
    const currentIndexRef = useRef(0);
    const displayWordsRef = useRef([]);
    const tempoRef = useRef(tempo);
    const startTimeRef = useRef(null);

    console.log("🔄 useWordFlow render:", {
        wordsLength: words.length,
        state,
        currentIndex: currentWordIndex,
        totalWords: displayWords.length,
        tempo,
    });

    // Synchronisation des refs avec les états
    useEffect(() => {
        stateRef.current = state;
    }, [state]);
    useEffect(() => {
        currentIndexRef.current = currentWordIndex;
    }, [currentWordIndex]);
    useEffect(() => {
        displayWordsRef.current = displayWords;
    }, [displayWords]);
    useEffect(() => {
        tempoRef.current = tempo;
    }, [tempo]);
    useEffect(() => {
        startTimeRef.current = startTime;
    }, [startTime]);

    // Fonction de nettoyage sécurisée
    const clearTimer = useCallback(() => {
        if (timeoutRef.current) {
            console.log("🧹 Nettoyage timer");
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    // Préparation des mots - FONCTION PURE
    const prepareWords = useCallback((inputWords, mode) => {
        if (!Array.isArray(inputWords) || inputWords.length === 0) {
            console.log("📝 prepareWords: tableau vide");
            return [];
        }

        const prepared =
            mode === DISPLAY_MODES.RANDOM
                ? shuffleArray([...inputWords])
                : [...inputWords];

        console.log("📝 prepareWords:", prepared.length, "mots en mode", mode);
        return prepared;
    }, []);

    // Fonction d'avancement - STABLE et SÉCURISÉE
    const advanceToNextWord = useCallback(() => {
        // Vérifications de sécurité
        if (stateRef.current !== READING_STATES.PLAYING) {
            console.log("⏸️ Arrêt - plus en lecture");
            clearTimer();
            return;
        }

        const nextIndex = currentIndexRef.current + 1;
        const totalWords = displayWordsRef.current.length;

        console.log(
            "➡️ Avancement:",
            currentIndexRef.current,
            "->",
            nextIndex,
            "/",
            totalWords
        );

        // Vérifier la fin AVANT de modifier l'état
        if (nextIndex >= totalWords) {
            console.log("🏁 Fin de la liste atteinte");
            setState(READING_STATES.FINISHED);
            setEndTime(new Date());
            setProgress(100);
            clearTimer();
            return;
        }

        // Mettre à jour l'index et le progrès
        setCurrentWordIndex(nextIndex);
        const newProgress = Math.round((nextIndex / totalWords) * 100);
        setProgress(newProgress);

        // Programmer le mot suivant SEULEMENT si on est encore en lecture
        clearTimer();
        if (stateRef.current === READING_STATES.PLAYING) {
            console.log("⏱️ Prochain mot dans", tempoRef.current, "secondes");
            timeoutRef.current = setTimeout(() => {
                // Double vérification avant d'avancer
                if (stateRef.current === READING_STATES.PLAYING) {
                    advanceToNextWord();
                }
            }, tempoRef.current * 1000);
        }
    }, [clearTimer]);

    // Contrôles principaux - STABLES
    const play = useCallback(() => {
        console.log("▶️ Play demandé, état actuel:", stateRef.current);

        const currentWords = displayWordsRef.current;
        if (currentWords.length === 0) {
            console.warn("⚠️ Aucun mot à jouer");
            return;
        }

        if (stateRef.current === READING_STATES.PLAYING) {
            console.log("⚠️ Déjà en lecture");
            return;
        }

        console.log("▶️ Démarrage avec", currentWords.length, "mots");

        // Démarrer le chronomètre si nécessaire
        if (stateRef.current === READING_STATES.IDLE) {
            const now = new Date();
            setStartTime(now);
            console.log("⏱️ Chronomètre démarré");
        }

        // Changer l'état
        setState(READING_STATES.PLAYING);

        // Démarrer l'avancement avec délai initial
        clearTimer();
        console.log("⏱️ Premier avancement dans", tempoRef.current, "secondes");
        timeoutRef.current = setTimeout(() => {
            if (stateRef.current === READING_STATES.PLAYING) {
                advanceToNextWord();
            }
        }, tempoRef.current * 1000);
    }, [advanceToNextWord, clearTimer]);

    const pause = useCallback(() => {
        console.log("⏸️ Pause");
        clearTimer();
        setState(READING_STATES.PAUSED);
    }, [clearTimer]);

    const stop = useCallback(() => {
        console.log("⏹️ Stop");
        clearTimer();
        setCurrentWordIndex(0);
        setProgress(0);
        setState(READING_STATES.IDLE);
        setStartTime(null);
        setEndTime(null);
    }, [clearTimer]);

    const shuffle = useCallback(() => {
        if (displayMode === DISPLAY_MODES.RANDOM && words.length > 0) {
            console.log("🔀 Mélange des mots");
            const shuffled = shuffleArray([...words]);
            setDisplayWords(shuffled);
            stop();
        }
    }, [displayMode, words, stop]);

    // Initialisation - PROTECTION contre les changements inutiles
    useEffect(() => {
        console.log("🔄 Vérification initialisation:", {
            wordsLength: words.length,
            displayMode,
            currentDisplayWords: displayWords.length,
        });

        // Préparer les nouveaux mots
        const prepared = prepareWords(words, displayMode);

        // Ne réinitialiser que si quelque chose a vraiment changé
        if (JSON.stringify(prepared) !== JSON.stringify(displayWords)) {
            console.log("🔄 Initialisation nécessaire");

            // Nettoyer l'état précédent
            clearTimer();

            // Mettre à jour l'état
            setDisplayWords(prepared);
            setCurrentWordIndex(0);
            setProgress(0);
            setState(READING_STATES.IDLE);
            setStartTime(null);
            setEndTime(null);

            console.log("✅ Initialisation terminée:", prepared.length, "mots");
        } else {
            console.log("ℹ️ Pas de changement, initialisation ignorée");
        }
    }, [words, displayMode, prepareWords, clearTimer, displayWords]);

    // Nettoyage à la destruction
    useEffect(() => {
        return () => {
            console.log("🧹 Nettoyage useWordFlow complet");
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Calcul des statistiques
    const stats =
        startTimeRef.current && endTime && displayWords.length > 0
            ? calculateFluentMetrics(
                  startTimeRef.current,
                  endTime,
                  displayWords.length,
                  tempo
              )
            : null;

    return {
        // État actuel
        state,
        currentWord: displayWords[currentWordIndex] || "",
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
