// src/components/WordDisplay/WordDisplay.jsx

import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { READING_STATES, FONT_SIZES } from "@data/constants";

/**
 * Composant principal d'affichage des mots en fluence
 */
const WordDisplay = ({
    currentWord = "",
    state = READING_STATES.IDLE,
    fontSize = FONT_SIZES.LG,
    progress = 0,
    currentIndex = 0,
    totalWords = 0,
    isFullscreen = false,
    showProgress = true,
    className = "",
    onWordChange,
    tempo = 1.2,
}) => {
    const [displayWord, setDisplayWord] = useState(currentWord);
    const [isAnimating, setIsAnimating] = useState(false);
    const wordRef = useRef(null);
    const previousWord = useRef("");

    // Animation lors du changement de mot
    useEffect(() => {
        if (
            currentWord !== previousWord.current &&
            state === READING_STATES.PLAYING
        ) {
            setIsAnimating(true);

            const timer = setTimeout(() => {
                setDisplayWord(currentWord);
                setIsAnimating(false);

                if (onWordChange) {
                    onWordChange(currentWord, currentIndex);
                }
            }, 100);

            previousWord.current = currentWord;
            return () => clearTimeout(timer);
        } else {
            setDisplayWord(currentWord);
        }
    }, [currentWord, state, currentIndex, onWordChange]);

    // Mapping des tailles de police - CORRIGÉ
    const getFontSizeClass = () => {
        const sizeMultiplier = isFullscreen ? 1.2 : 1;

        switch (fontSize) {
            case FONT_SIZES.XS:
                return isFullscreen ? "text-6xl" : "text-4xl"; // ~2rem base
            case FONT_SIZES.SM:
                return isFullscreen ? "text-7xl" : "text-5xl"; // ~3rem base
            case FONT_SIZES.MD:
                return isFullscreen ? "text-8xl" : "text-6xl"; // ~4rem base
            case FONT_SIZES.LG:
                return isFullscreen ? "text-9xl" : "text-7xl"; // ~6rem base
            case FONT_SIZES.XL:
                return isFullscreen ? "text-[10rem]" : "text-8xl"; // ~8rem base
            case FONT_SIZES.XXL:
                return "text-[12rem]"; // ~12rem
            default:
                return isFullscreen ? "text-9xl" : "text-7xl";
        }
    };

    // Classes CSS pour l'affichage
    const wordClasses = [
        getFontSizeClass(),
        "font-reading",
        "font-bold",
        "text-center",
        "select-none",
        "transition-all",
        "duration-300",
        "ease-in-out",
        "leading-tight",
        // Animation lors du changement
        isAnimating
            ? "opacity-50 transform scale-95"
            : "opacity-100 transform scale-100",
        // Couleur selon l'état
        state === READING_STATES.PLAYING
            ? "text-flux-primary"
            : "text-gray-800",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    // Classes pour le conteneur
    const containerClasses = [
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "w-full",
        "h-full",
        "relative",
        "overflow-hidden",
        "px-4",
        isFullscreen ? "min-h-screen bg-white" : "min-h-[400px] bg-gray-50",
    ].join(" ");

    // Barre de progression
    const ProgressIndicator = () => {
        if (!showProgress || totalWords <= 1) return null;

        if (isFullscreen) {
            // Progression circulaire en plein écran
            const circumference = 2 * Math.PI * 20;
            const strokeDasharray = circumference;
            const strokeDashoffset =
                circumference - (progress / 100) * circumference;

            return (
                <div className="absolute top-8 right-8 z-10">
                    <div className="relative w-16 h-16">
                        <svg
                            className="w-16 h-16 -rotate-90"
                            viewBox="0 0 50 50"
                        >
                            <circle
                                cx="25"
                                cy="25"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="transparent"
                                className="text-gray-200"
                            />
                            <circle
                                cx="25"
                                cy="25"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="transparent"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                className="text-flux-primary transition-all duration-300 ease-in-out"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                                {currentIndex + 1}/{totalWords}
                            </span>
                        </div>
                    </div>
                </div>
            );
        } else {
            // Barre de progression linéaire
            return (
                <div className="absolute bottom-0 left-0 w-full bg-white">
                    <div className="bg-gray-200 h-2">
                        <div
                            className="bg-flux-primary h-2 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="text-center py-2 text-sm text-gray-600">
                        Mot {currentIndex + 1} sur {totalWords}
                    </div>
                </div>
            );
        }
    };

    // Indicateur d'état
    const StateIndicator = () => {
        if (!isFullscreen || state === READING_STATES.IDLE) return null;

        const getStateInfo = () => {
            switch (state) {
                case READING_STATES.PLAYING:
                    return {
                        icon: "▶️",
                        text: "En cours",
                        color: "text-green-600",
                        bgColor: "bg-green-100",
                    };
                case READING_STATES.PAUSED:
                    return {
                        icon: "⏸️",
                        text: "En pause",
                        color: "text-yellow-600",
                        bgColor: "bg-yellow-100",
                    };
                case READING_STATES.FINISHED:
                    return {
                        icon: "✅",
                        text: "Terminé",
                        color: "text-blue-600",
                        bgColor: "bg-blue-100",
                    };
                default:
                    return null;
            }
        };

        const stateInfo = getStateInfo();
        if (!stateInfo) return null;

        return (
            <div
                className={`absolute top-8 left-8 px-4 py-2 rounded-lg z-10 ${stateInfo.bgColor}`}
            >
                <div
                    className={`flex items-center gap-2 text-sm font-medium ${stateInfo.color}`}
                >
                    <span>{stateInfo.icon}</span>
                    <span>{stateInfo.text}</span>
                </div>
            </div>
        );
    };

    // Message d'état
    const getStatusMessage = () => {
        switch (state) {
            case READING_STATES.IDLE:
                return totalWords > 0
                    ? "Prêt à commencer la lecture"
                    : "Sélectionnez une liste de mots";
            case READING_STATES.FINISHED:
                return "Lecture terminée ! 🎉";
            case READING_STATES.PAUSED:
                return "Lecture en pause";
            default:
                return "";
        }
    };

    return (
        <div className={containerClasses}>
            <StateIndicator />

            {/* Zone d'affichage principal du mot */}
            <div className="flex-1 flex items-center justify-center px-8 w-full">
                {displayWord ? (
                    <div
                        ref={wordRef}
                        className={wordClasses}
                        role="img"
                        aria-label={`Mot actuel: ${displayWord}`}
                        tabIndex={-1}
                        style={{
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                            maxWidth: "100%",
                        }}
                    >
                        {displayWord}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 px-4">
                        <div className="text-xl mb-4">{getStatusMessage()}</div>
                        {state === READING_STATES.IDLE && totalWords > 0 && (
                            <div className="text-sm text-gray-400">
                                Cliquez sur lecture pour commencer
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Indicateur de progression */}
            <ProgressIndicator />

            {/* Informations de tempo en plein écran */}
            {isFullscreen && state === READING_STATES.PLAYING && (
                <div className="absolute bottom-8 left-8 text-sm text-gray-600 bg-white bg-opacity-90 px-3 py-2 rounded z-10">
                    {Math.round(60 / tempo)} mots/min
                </div>
            )}
        </div>
    );
};

WordDisplay.propTypes = {
    currentWord: PropTypes.string,
    state: PropTypes.oneOf(Object.values(READING_STATES)),
    fontSize: PropTypes.oneOf(Object.values(FONT_SIZES)),
    progress: PropTypes.number,
    currentIndex: PropTypes.number,
    totalWords: PropTypes.number,
    isFullscreen: PropTypes.bool,
    showProgress: PropTypes.bool,
    className: PropTypes.string,
    onWordChange: PropTypes.func,
    tempo: PropTypes.number,
};

export default WordDisplay;
