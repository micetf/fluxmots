// src/components/Controls/Controls.jsx

import React, { useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Icon, ICONS } from "@micetf/ui";
import {
    READING_STATES,
    KEYBOARD_SHORTCUTS,
    TEMPO_CONFIG,
} from "@data/constants";
import {
    tempoToWordsPerMinute,
    calculateEstimatedTime,
} from "@utils/performance";

/**
 * Composant des contrôles de lecture de fluence
 * Inclut les boutons de contrôle, réglages de tempo et raccourcis clavier
 */
const Controls = ({
    state,
    onPlay,
    onPause,
    onStop,
    onShuffle,
    onFullscreen,
    tempo,
    onTempoChange,
    canShuffle = false,
    totalWords = 0,
    isFullscreen = false,
    className = "",
}) => {
    // Gestion des raccourcis clavier
    const handleKeyPress = useCallback(
        (event) => {
            // Ignorer si l'utilisateur tape dans un champ de saisie
            if (
                event.target.tagName === "INPUT" ||
                event.target.tagName === "TEXTAREA"
            ) {
                return;
            }

            switch (event.key) {
                case KEYBOARD_SHORTCUTS.PLAY_PAUSE:
                    event.preventDefault();
                    if (state === READING_STATES.PLAYING) {
                        onPause();
                    } else {
                        onPlay();
                    }
                    break;
                case KEYBOARD_SHORTCUTS.STOP:
                    event.preventDefault();
                    onStop();
                    break;
                case KEYBOARD_SHORTCUTS.FULLSCREEN:
                    if (!isFullscreen) {
                        event.preventDefault();
                        onFullscreen();
                    }
                    break;
                case KEYBOARD_SHORTCUTS.SHUFFLE:
                    if (canShuffle) {
                        event.preventDefault();
                        onShuffle();
                    }
                    break;
                default:
                    break;
            }
        },
        [
            state,
            onPlay,
            onPause,
            onStop,
            onFullscreen,
            onShuffle,
            canShuffle,
            isFullscreen,
        ]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyPress);
        return () => document.removeEventListener("keydown", handleKeyPress);
    }, [handleKeyPress]);

    // Boutons de contrôle principal
    const PlayButton = () => {
        const isPlaying = state === READING_STATES.PLAYING;
        const isPaused = state === READING_STATES.PAUSED;
        const isFinished = state === READING_STATES.FINISHED;

        const handleClick = () => {
            if (isPlaying) {
                onPause();
            } else {
                onPlay();
            }
        };

        const getButtonContent = () => {
            if (isPlaying) {
                return {
                    icon: "⏸️",
                    text: "Pause",
                    title: "Mettre en pause (Espace)",
                };
            } else if (isPaused) {
                return {
                    icon: "▶️",
                    text: "Reprendre",
                    title: "Reprendre la lecture (Espace)",
                };
            } else if (isFinished) {
                return {
                    icon: "🔄",
                    text: "Recommencer",
                    title: "Recommencer la lecture (Espace)",
                };
            } else {
                return {
                    icon: "▶️",
                    text: "Lecture",
                    title: "Démarrer la lecture (Espace)",
                };
            }
        };

        const content = getButtonContent();
        const disabled = totalWords === 0;

        return (
            <button
                onClick={handleClick}
                disabled={disabled}
                className={`
          flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
          ${
              disabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-flux-primary text-white hover:bg-flux-secondary shadow-lg hover:shadow-xl transform hover:scale-105"
          }
        `}
                title={content.title}
                aria-label={content.text}
            >
                <span className="text-lg">{content.icon}</span>
                <span>{content.text}</span>
            </button>
        );
    };

    // Contrôle du tempo
    const TempoControl = () => {
        const wpm = tempoToWordsPerMinute(tempo);
        const estimatedTime = calculateEstimatedTime(totalWords, tempo);

        const handleTempoChange = (event) => {
            const newTempo = parseFloat(event.target.value);
            onTempoChange(newTempo);
        };

        const presets = Object.entries(TEMPO_CONFIG.PRESETS);

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label
                        htmlFor="tempo-slider"
                        className="text-sm font-medium text-gray-700"
                    >
                        Vitesse de lecture
                    </label>
                    <div className="text-right">
                        <div className="text-sm font-bold text-flux-primary">
                            {wpm} mots/min
                        </div>
                        <div className="text-xs text-gray-500">
                            {tempo}s par mot
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <input
                        id="tempo-slider"
                        type="range"
                        min={TEMPO_CONFIG.MIN}
                        max={TEMPO_CONFIG.MAX}
                        step={TEMPO_CONFIG.STEP}
                        value={tempo}
                        onChange={handleTempoChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        disabled={state === READING_STATES.PLAYING}
                    />

                    <div className="flex justify-between text-xs text-gray-400">
                        <span>Rapide</span>
                        <span>Lent</span>
                    </div>
                </div>

                {/* Presets rapides */}
                <div className="grid grid-cols-2 gap-2">
                    {presets.slice(0, 4).map(([key, preset]) => (
                        <button
                            key={key}
                            onClick={() => onTempoChange(preset.value)}
                            disabled={state === READING_STATES.PLAYING}
                            className={`
                text-xs px-2 py-1 rounded border transition-colors
                ${
                    tempo === preset.value
                        ? "bg-flux-primary text-white border-flux-primary"
                        : "bg-white text-gray-600 border-gray-300 hover:border-flux-primary"
                }
                ${state === READING_STATES.PLAYING ? "opacity-50 cursor-not-allowed" : ""}
              `}
                            title={preset.label}
                        >
                            {preset.level}
                        </button>
                    ))}
                </div>

                {/* Temps estimé */}
                {totalWords > 0 && (
                    <div className="text-xs text-gray-500 text-center pt-2 border-t">
                        Durée estimée : {estimatedTime.formatted}
                    </div>
                )}
            </div>
        );
    };

    const containerClasses = [
        "bg-white rounded-lg shadow-sm border p-6 space-y-6",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={containerClasses}>
            {/* Contrôles principaux */}
            <div className="flex items-center justify-center gap-3">
                <PlayButton />

                <button
                    onClick={onStop}
                    disabled={state === READING_STATES.IDLE}
                    className={`
            flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
            ${
                state === READING_STATES.IDLE
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-500 text-white hover:bg-gray-600 shadow-md hover:shadow-lg"
            }
          `}
                    title="Arrêter et remettre à zéro (Échap)"
                    aria-label="Arrêter"
                >
                    <span className="text-lg">⏹️</span>
                    <span>Stop</span>
                </button>

                {canShuffle && (
                    <button
                        onClick={onShuffle}
                        disabled={state === READING_STATES.PLAYING}
                        className={`
              flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
              ${
                  state === READING_STATES.PLAYING
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg"
              }
            `}
                        title="Mélanger les mots (S)"
                        aria-label="Mélanger"
                    >
                        <span className="text-lg">🔀</span>
                        <span>Mélanger</span>
                    </button>
                )}
            </div>

            {/* Contrôle du tempo */}
            <TempoControl />

            {/* Actions secondaires */}
            <div className="flex justify-center gap-2 pt-4 border-t">
                <button
                    onClick={onFullscreen}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Mode plein écran (F)"
                    aria-label="Plein écran"
                >
                    <Icon name={ICONS.SEARCH} size="4" />
                    <span>Plein écran</span>
                </button>
            </div>

            {/* Raccourcis clavier */}
            <div className="text-xs text-gray-500 space-y-1 pt-4 border-t">
                <div className="font-medium mb-2">Raccourcis clavier :</div>
                <div className="grid grid-cols-2 gap-1">
                    <div>
                        <kbd className="px-1 py-0.5 bg-gray-100 rounded">
                            Espace
                        </kbd>{" "}
                        Lecture/Pause
                    </div>
                    <div>
                        <kbd className="px-1 py-0.5 bg-gray-100 rounded">
                            Échap
                        </kbd>{" "}
                        Stop
                    </div>
                    <div>
                        <kbd className="px-1 py-0.5 bg-gray-100 rounded">F</kbd>{" "}
                        Plein écran
                    </div>
                    {canShuffle && (
                        <div>
                            <kbd className="px-1 py-0.5 bg-gray-100 rounded">
                                S
                            </kbd>{" "}
                            Mélanger
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

Controls.propTypes = {
    state: PropTypes.oneOf(Object.values(READING_STATES)).isRequired,
    onPlay: PropTypes.func.isRequired,
    onPause: PropTypes.func.isRequired,
    onStop: PropTypes.func.isRequired,
    onShuffle: PropTypes.func.isRequired,
    onFullscreen: PropTypes.func.isRequired,
    tempo: PropTypes.number.isRequired,
    onTempoChange: PropTypes.func.isRequired,
    canShuffle: PropTypes.bool,
    totalWords: PropTypes.number,
    isFullscreen: PropTypes.bool,
    className: PropTypes.string,
};

export default Controls;
