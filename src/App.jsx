// src/App.jsx

import React, { useState, useCallback, useEffect } from "react";
import { Navbar } from "@micetf/ui";
import WordDisplay from "@components/WordDisplay/WordDisplay";
import Controls from "@components/Controls/Controls";
import Settings from "@components/Settings/Settings";
import { useWordFlow } from "@hooks/useWordFlow";
import { useAppSettings, useCustomLists } from "@hooks/useLocalStorage";
import { WORD_LISTS, getListById } from "@data/wordLists";
import {
    DEFAULT_SETTINGS,
    MICETF_CONFIG,
    READING_STATES,
} from "@data/constants";
import { getPerformanceRating } from "@utils/performance";
import "@micetf/ui/index.css";

/**
 * Composant principal de l'application FluxMots
 */
function App() {
    // État des paramètres et persistance
    const {
        settings,
        updateSetting,
        isLoading: settingsLoading,
    } = useAppSettings(DEFAULT_SETTINGS);

    const {
        customLists,
        addCustomList,
        deleteCustomList,
        isLoading: customListsLoading,
    } = useCustomLists();

    // États locaux
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [lastSessionStats, setLastSessionStats] = useState(null);

    // Récupération de la liste sélectionnée
    const getCurrentList = useCallback(() => {
        // Vérifier d'abord dans les listes officielles
        const officialList = getListById(settings.selectedList);
        if (officialList) {
            return officialList;
        }

        // Puis dans les listes personnalisées
        const customList = customLists.find(
            (list) => list.id === settings.selectedList
        );
        if (customList) {
            return customList;
        }

        // Fallback vers la liste CE1 par défaut
        return WORD_LISTS.CE1_OFFICIELLE;
    }, [settings.selectedList, customLists]);

    const currentList = getCurrentList();
    const currentWords = currentList?.words || [];

    // Hook principal de gestion de la fluence
    const wordFlow = useWordFlow(
        currentWords,
        settings.tempo,
        settings.displayMode
    );

    // Gestion du plein écran
    const enterFullscreen = useCallback(() => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        setIsFullscreen(true);
    }, []);

    const exitFullscreen = useCallback(() => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        setIsFullscreen(false);
    }, []);

    // Écoute des changements de plein écran
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener(
            "webkitfullscreenchange",
            handleFullscreenChange
        );
        document.addEventListener("msfullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
            document.removeEventListener(
                "webkitfullscreenchange",
                handleFullscreenChange
            );
            document.removeEventListener(
                "msfullscreenchange",
                handleFullscreenChange
            );
        };
    }, []);

    // Gestion de la fin de session
    useEffect(() => {
        if (wordFlow.isFinished && wordFlow.stats) {
            setLastSessionStats(wordFlow.stats);
        }
    }, [wordFlow.isFinished, wordFlow.stats]);

    // Handlers des paramètres
    const handleListChange = useCallback(
        (listId) => {
            updateSetting("selectedList", listId);
        },
        [updateSetting]
    );

    const handleDisplayModeChange = useCallback(
        (mode) => {
            updateSetting("displayMode", mode);
        },
        [updateSetting]
    );

    const handleFontSizeChange = useCallback(
        (size) => {
            updateSetting("fontSize", size);
        },
        [updateSetting]
    );

    const handleShowProgressChange = useCallback(
        (show) => {
            updateSetting("showProgress", show);
        },
        [updateSetting]
    );

    const handleTempoChange = useCallback(
        (tempo) => {
            updateSetting("tempo", tempo);
        },
        [updateSetting]
    );

    // Handlers des listes personnalisées
    const handleCustomListAdd = useCallback(
        (listData) => {
            const listId = addCustomList(listData);
            updateSetting("selectedList", listId);
        },
        [addCustomList, updateSetting]
    );

    const handleCustomListDelete = useCallback(
        (listId) => {
            deleteCustomList(listId);
            if (settings.selectedList === listId) {
                updateSetting("selectedList", "ce1_officielle");
            }
        },
        [deleteCustomList, settings.selectedList, updateSetting]
    );

    // Composant des statistiques de fin de session
    const SessionStats = () => {
        if (!lastSessionStats) return null;

        const rating = getPerformanceRating(
            lastSessionStats.performance?.efficiency || 0
        );

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <div className="text-center">
                        <div className="text-4xl mb-4">{rating.emoji}</div>
                        <h2 className="text-xl font-bold mb-2">
                            Session terminée !
                        </h2>
                        <div
                            className={`text-lg font-medium mb-4 ${rating.color}`}
                        >
                            {rating.rating}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center">
                                <div className="font-medium text-gray-600">
                                    Durée
                                </div>
                                <div className="text-lg">
                                    {lastSessionStats.duration?.formatted ||
                                        "N/A"}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="font-medium text-gray-600">
                                    Vitesse
                                </div>
                                <div className="text-lg">
                                    {lastSessionStats.performance?.actualWPM ||
                                        0}{" "}
                                    mots/min
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="font-medium text-gray-600">
                                    Mots lus
                                </div>
                                <div className="text-lg">
                                    {lastSessionStats.summary?.totalWords || 0}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="font-medium text-gray-600">
                                    Efficacité
                                </div>
                                <div className="text-lg">
                                    {lastSessionStats.performance?.efficiency ||
                                        0}
                                    %
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            <button
                                onClick={() => setLastSessionStats(null)}
                                className="w-full px-4 py-2 bg-flux-primary text-white rounded-lg hover:bg-flux-secondary transition-colors"
                            >
                                Continuer
                            </button>
                            <button
                                onClick={() => {
                                    setLastSessionStats(null);
                                    wordFlow.play();
                                }}
                                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Recommencer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Composant d'aide
    const HelpModal = () => {
        if (!showHelp) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Aide - FluxMots</h2>
                        <button
                            onClick={() => setShowHelp(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <span className="text-2xl">×</span>
                        </button>
                    </div>

                    <div className="space-y-4 text-sm">
                        <section>
                            <h3 className="font-bold mb-2">
                                Qu'est-ce que FluxMots ?
                            </h3>
                            <p>
                                FluxMots est un outil de fluence de lecture qui
                                affiche des mots de façon rythmée pour
                                développer la vitesse et l'automatisation de la
                                lecture.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold mb-2">
                                Comment utiliser FluxMots ?
                            </h3>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>
                                    Sélectionnez une liste de mots adaptée au
                                    niveau
                                </li>
                                <li>Ajustez la vitesse de lecture (tempo)</li>
                                <li>Cliquez sur "Lecture" pour commencer</li>
                                <li>Suivez les mots affichés à l'écran</li>
                            </ol>
                        </section>

                        <section>
                            <h3 className="font-bold mb-2">
                                Raccourcis clavier
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <kbd className="px-2 py-1 bg-gray-100 rounded">
                                        Espace
                                    </kbd>
                                    Lecture/Pause
                                </div>
                                <div>
                                    <kbd className="px-2 py-1 bg-gray-100 rounded">
                                        Échap
                                    </kbd>
                                    Arrêter
                                </div>
                                <div>
                                    <kbd className="px-2 py-1 bg-gray-100 rounded">
                                        F
                                    </kbd>
                                    Plein écran
                                </div>
                                <div>
                                    <kbd className="px-2 py-1 bg-gray-100 rounded">
                                        S
                                    </kbd>
                                    Mélanger
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        );
    };

    // Affichage de chargement
    if (settingsLoading || customListsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl mb-4">📚</div>
                    <div className="text-lg font-medium">
                        Chargement de FluxMots...
                    </div>
                </div>
            </div>
        );
    }

    // Interface plein écran
    if (isFullscreen) {
        return (
            <div className="h-screen w-screen bg-white">
                <WordDisplay
                    currentWord={wordFlow.currentWord}
                    state={wordFlow.state}
                    fontSize={settings.fontSize}
                    progress={wordFlow.progress}
                    currentIndex={wordFlow.currentWordIndex}
                    totalWords={wordFlow.totalWords}
                    isFullscreen={true}
                    showProgress={settings.showProgress}
                    tempo={settings.tempo}
                />

                <button
                    onClick={exitFullscreen}
                    className="fixed top-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg hover:bg-opacity-70 transition-all"
                    title="Sortir du plein écran (Échap)"
                >
                    Quitter
                </button>

                <SessionStats />
            </div>
        );
    }

    // Interface normale
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar
                breadcrumb={MICETF_CONFIG.breadcrumb}
                subtitle={MICETF_CONFIG.subtitle}
                showHelp={MICETF_CONFIG.showHelp}
                onHelpClick={() => setShowHelp(true)}
                showSearch={MICETF_CONFIG.showSearch}
                baseUrl={MICETF_CONFIG.baseUrl}
                paypalId={MICETF_CONFIG.paypalId}
                contactEmail={MICETF_CONFIG.contactEmail}
            />

            <main className="pt-20 pb-8">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            FluxMots
                        </h1>
                        <p className="text-gray-600">
                            Entraînement à la fluence de lecture •{" "}
                            {currentList?.name || "Aucune liste"}
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Affichage principal */}
                        <div className="lg:col-span-2">
                            <WordDisplay
                                currentWord={wordFlow.currentWord}
                                state={wordFlow.state}
                                fontSize={settings.fontSize}
                                progress={wordFlow.progress}
                                currentIndex={wordFlow.currentWordIndex}
                                totalWords={wordFlow.totalWords}
                                isFullscreen={false}
                                showProgress={settings.showProgress}
                                tempo={settings.tempo}
                            />
                        </div>

                        {/* Panneau latéral */}
                        <div className="space-y-6">
                            <Controls
                                state={wordFlow.state}
                                onPlay={wordFlow.play}
                                onPause={wordFlow.pause}
                                onStop={wordFlow.stop}
                                onShuffle={wordFlow.shuffle}
                                onFullscreen={enterFullscreen}
                                tempo={settings.tempo}
                                onTempoChange={handleTempoChange}
                                canShuffle={wordFlow.canShuffle}
                                totalWords={wordFlow.totalWords}
                                isFullscreen={isFullscreen}
                            />

                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="text-lg">⚙️</span>
                                <span>
                                    {showSettings ? "Masquer" : "Paramètres"}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Panneau des paramètres */}
                    {showSettings && (
                        <div className="mt-8">
                            <Settings
                                selectedList={settings.selectedList}
                                onListChange={handleListChange}
                                displayMode={settings.displayMode}
                                onDisplayModeChange={handleDisplayModeChange}
                                fontSize={settings.fontSize}
                                onFontSizeChange={handleFontSizeChange}
                                customLists={customLists}
                                onCustomListAdd={handleCustomListAdd}
                                onCustomListDelete={handleCustomListDelete}
                                showProgress={settings.showProgress}
                                onShowProgressChange={handleShowProgressChange}
                            />
                        </div>
                    )}
                </div>
            </main>

            <HelpModal />
            <SessionStats />
        </div>
    );
}

export default App;
