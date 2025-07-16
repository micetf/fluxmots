// src/components/Settings/Settings.jsx

import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Icon, ICONS } from "@micetf/ui";
import { WORD_LISTS, LIST_METADATA } from "@data/wordLists";
import { DISPLAY_MODES, FONT_SIZES, VALIDATION_RULES } from "@data/constants";

/**
 * Composant des paramètres et configuration de FluxMots
 * Gestion des listes, modes d'affichage et listes personnalisées
 */
const Settings = ({
    selectedList,
    onListChange,
    displayMode,
    onDisplayModeChange,
    fontSize,
    onFontSizeChange,
    customLists = [],
    onCustomListAdd,
    onCustomListDelete,
    showProgress,
    onShowProgressChange,
    className = "",
}) => {
    const [activeTab, setActiveTab] = useState("lists");
    const [customListText, setCustomListText] = useState("");
    const [customListName, setCustomListName] = useState("");
    const [validationErrors, setValidationErrors] = useState([]);
    const [isAddingCustomList, setIsAddingCustomList] = useState(false);
    const fileInputRef = useRef(null);

    // Onglets disponibles
    const tabs = [
        { id: "lists", label: "Listes de mots", icon: ICONS.HOME },
        { id: "display", label: "Affichage", icon: ICONS.SEARCH },
        { id: "custom", label: "Listes personnalisées", icon: ICONS.HEART },
    ];

    // Validation d'une liste personnalisée
    const validateCustomList = (text, name) => {
        const errors = [];

        if (!name.trim()) {
            errors.push("Le nom de la liste est obligatoire");
        }

        if (!text.trim()) {
            errors.push("La liste de mots ne peut pas être vide");
        } else {
            // Nettoyer et séparer les mots
            const words = text
                .split(/[\n,;]+/)
                .map((word) => word.trim())
                .filter((word) => word.length > 0);

            if (words.length < VALIDATION_RULES.CUSTOM_LIST.MIN_WORDS) {
                errors.push(
                    `Minimum ${VALIDATION_RULES.CUSTOM_LIST.MIN_WORDS} mot requis`
                );
            }

            if (words.length > VALIDATION_RULES.CUSTOM_LIST.MAX_WORDS) {
                errors.push(
                    `Maximum ${VALIDATION_RULES.CUSTOM_LIST.MAX_WORDS} mots autorisés`
                );
            }

            // Vérifier la longueur des mots
            const longWords = words.filter(
                (word) =>
                    word.length > VALIDATION_RULES.CUSTOM_LIST.MAX_WORD_LENGTH
            );
            if (longWords.length > 0) {
                errors.push(
                    `Mots trop longs (max ${VALIDATION_RULES.CUSTOM_LIST.MAX_WORD_LENGTH} caractères): ${longWords.slice(0, 3).join(", ")}`
                );
            }

            // Vérifier les caractères interdits
            const invalidWords = words.filter((word) =>
                VALIDATION_RULES.CUSTOM_LIST.FORBIDDEN_CHARS.test(word)
            );
            if (invalidWords.length > 0) {
                errors.push(
                    `Caractères interdits dans: ${invalidWords.slice(0, 3).join(", ")}`
                );
            }
        }

        return errors;
    };

    // Ajout d'une liste personnalisée
    const handleAddCustomList = () => {
        const errors = validateCustomList(customListText, customListName);
        setValidationErrors(errors);

        if (errors.length === 0) {
            // Nettoyer et préparer les mots
            const words = customListText
                .split(/[\n,;]+/)
                .map((word) => word.trim())
                .filter((word) => word.length > 0);

            const newList = {
                name: customListName.trim(),
                description: `Liste personnalisée (${words.length} mots)`,
                level: "Personnalisé",
                words: words,
                isCustom: true,
            };

            onCustomListAdd(newList);

            // Reset du formulaire
            setCustomListText("");
            setCustomListName("");
            setValidationErrors([]);
            setIsAddingCustomList(false);
        }
    };

    // Import de fichier
    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            setCustomListText(content);
            setCustomListName(file.name.replace(/\.[^/.]+$/, "")); // Nom sans extension
        };
        reader.readAsText(file);
    };

    // Préparation des listes disponibles
    const allLists = [...Object.values(WORD_LISTS), ...customLists];

    // Rendu des onglets
    const TabButton = ({ tab, isActive, onClick }) => (
        <button
            onClick={() => onClick(tab.id)}
            className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
        ${
            isActive
                ? "bg-flux-primary text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }
      `}
        >
            <Icon name={tab.icon} size="4" />
            <span className="hidden sm:inline">{tab.label}</span>
        </button>
    );

    // Onglet Listes de mots
    const ListsTab = () => (
        <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800">
                Sélection de la liste
            </h3>

            <div className="grid gap-3">
                {allLists.map((list) => {
                    const isSelected = selectedList === list.id;
                    const metadata = LIST_METADATA[list.id];

                    return (
                        <div
                            key={list.id}
                            className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md
                ${
                    isSelected
                        ? "border-flux-primary bg-flux-primary bg-opacity-10"
                        : "border-gray-200 hover:border-flux-primary"
                }
              `}
                            onClick={() => onListChange(list.id)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-gray-800">
                                            {list.name}
                                        </h4>
                                        {list.isCustom && (
                                            <span className="px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded">
                                                Personnalisé
                                            </span>
                                        )}
                                        {isSelected && (
                                            <Icon
                                                name={ICONS.HEART}
                                                size="4"
                                                className="text-flux-primary"
                                            />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {list.description}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                        <span>Niveau: {list.level}</span>
                                        <span>{list.words.length} mots</span>
                                        {list.targetTempo && (
                                            <span>
                                                Cible:{" "}
                                                {Math.round(
                                                    60 / list.targetTempo
                                                )}{" "}
                                                mots/min
                                            </span>
                                        )}
                                    </div>
                                    {metadata && (
                                        <div className="text-xs text-gray-400 mt-1">
                                            Source: {metadata.source}
                                        </div>
                                    )}
                                </div>

                                {list.isCustom && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCustomListDelete(list.id);
                                        }}
                                        className="text-red-500 hover:text-red-700 p-1"
                                        title="Supprimer cette liste"
                                    >
                                        <Icon name={ICONS.QUESTION} size="4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // Onglet Affichage
    const DisplayTab = () => (
        <div className="space-y-6">
            <h3 className="font-bold text-lg text-gray-800">
                Paramètres d'affichage
            </h3>

            {/* Mode d'affichage */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    Ordre d'affichage des mots
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() =>
                            onDisplayModeChange(DISPLAY_MODES.SEQUENTIAL)
                        }
                        className={`
              p-3 rounded-lg border-2 text-left transition-all
              ${
                  displayMode === DISPLAY_MODES.SEQUENTIAL
                      ? "border-flux-primary bg-flux-primary bg-opacity-10"
                      : "border-gray-200 hover:border-flux-primary"
              }
            `}
                    >
                        <div className="font-medium">Séquentiel</div>
                        <div className="text-sm text-gray-600">
                            Ordre de la liste
                        </div>
                    </button>

                    <button
                        onClick={() =>
                            onDisplayModeChange(DISPLAY_MODES.RANDOM)
                        }
                        className={`
              p-3 rounded-lg border-2 text-left transition-all
              ${
                  displayMode === DISPLAY_MODES.RANDOM
                      ? "border-flux-primary bg-flux-primary bg-opacity-10"
                      : "border-gray-200 hover:border-flux-primary"
              }
            `}
                    >
                        <div className="font-medium">Aléatoire</div>
                        <div className="text-sm text-gray-600">
                            Ordre mélangé
                        </div>
                    </button>
                </div>
            </div>

            {/* Taille de police */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    Taille de police
                </label>
                <select
                    value={fontSize}
                    onChange={(e) => onFontSizeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flux-primary focus:border-flux-primary"
                >
                    <option value={FONT_SIZES.XS}>
                        Très petite (mobile portrait)
                    </option>
                    <option value={FONT_SIZES.SM}>
                        Petite (mobile paysage)
                    </option>
                    <option value={FONT_SIZES.MD}>Moyenne (tablette)</option>
                    <option value={FONT_SIZES.LG}>Grande (desktop)</option>
                    <option value={FONT_SIZES.XL}>
                        Très grande (vidéoprojecteur)
                    </option>
                    <option value={FONT_SIZES.XXL}>Énorme (grand écran)</option>
                </select>
            </div>

            {/* Options d'affichage */}
            <div className="space-y-3">
                <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={showProgress}
                        onChange={(e) => onShowProgressChange(e.target.checked)}
                        className="w-4 h-4 text-flux-primary border-gray-300 rounded focus:ring-flux-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">
                        Afficher la progression
                    </span>
                </label>
            </div>
        </div>
    );

    // Onglet Listes personnalisées
    const CustomTab = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-800">
                    Listes personnalisées
                </h3>
                <button
                    onClick={() => setIsAddingCustomList(!isAddingCustomList)}
                    className="px-4 py-2 bg-flux-primary text-white rounded-lg hover:bg-flux-secondary transition-colors"
                >
                    {isAddingCustomList ? "Annuler" : "Nouvelle liste"}
                </button>
            </div>

            {isAddingCustomList && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom de la liste
                        </label>
                        <input
                            type="text"
                            value={customListName}
                            onChange={(e) => setCustomListName(e.target.value)}
                            placeholder="Ex: Mes mots CP"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flux-primary focus:border-flux-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Liste de mots
                        </label>
                        <textarea
                            value={customListText}
                            onChange={(e) => setCustomListText(e.target.value)}
                            placeholder="Saisissez vos mots séparés par des retours à la ligne, virgules ou points-virgules"
                            rows={8}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flux-primary focus:border-flux-primary"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            Séparateurs acceptés: retour ligne, virgule,
                            point-virgule
                        </div>
                    </div>

                    {/* Import de fichier */}
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,.csv"
                            onChange={handleFileImport}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Importer un fichier
                        </button>
                    </div>

                    {/* Erreurs de validation */}
                    {validationErrors.length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="text-sm font-medium text-red-800 mb-1">
                                Erreurs :
                            </div>
                            <ul className="text-sm text-red-600 space-y-1">
                                {validationErrors.map((error, index) => (
                                    <li key={index}>• {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Boutons d'action */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddCustomList}
                            disabled={validationErrors.length > 0}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Ajouter la liste
                        </button>
                        <button
                            onClick={() => {
                                setIsAddingCustomList(false);
                                setCustomListText("");
                                setCustomListName("");
                                setValidationErrors([]);
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Liste des listes personnalisées existantes */}
            {customLists.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">
                        Listes existantes :
                    </h4>
                    {customLists.map((list) => (
                        <div
                            key={list.id}
                            className="flex items-center justify-between p-3 bg-white border rounded-lg"
                        >
                            <div>
                                <div className="font-medium">{list.name}</div>
                                <div className="text-sm text-gray-500">
                                    {list.words.length} mots
                                </div>
                            </div>
                            <button
                                onClick={() => onCustomListDelete(list.id)}
                                className="text-red-500 hover:text-red-700 p-2"
                                title="Supprimer cette liste"
                            >
                                <Icon name={ICONS.QUESTION} size="4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const containerClasses = [
        "bg-white rounded-lg shadow-sm border overflow-hidden",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={containerClasses}>
            {/* Navigation des onglets */}
            <div className="border-b bg-gray-50 p-4">
                <div className="flex gap-2 overflow-x-auto">
                    {tabs.map((tab) => (
                        <TabButton
                            key={tab.id}
                            tab={tab}
                            isActive={activeTab === tab.id}
                            onClick={setActiveTab}
                        />
                    ))}
                </div>
            </div>

            {/* Contenu des onglets */}
            <div className="p-6">
                {activeTab === "lists" && <ListsTab />}
                {activeTab === "display" && <DisplayTab />}
                {activeTab === "custom" && <CustomTab />}
            </div>
        </div>
    );
};

Settings.propTypes = {
    selectedList: PropTypes.string.isRequired,
    onListChange: PropTypes.func.isRequired,
    displayMode: PropTypes.oneOf(Object.values(DISPLAY_MODES)).isRequired,
    onDisplayModeChange: PropTypes.func.isRequired,
    fontSize: PropTypes.oneOf(Object.values(FONT_SIZES)).isRequired,
    onFontSizeChange: PropTypes.func.isRequired,
    customLists: PropTypes.array,
    onCustomListAdd: PropTypes.func.isRequired,
    onCustomListDelete: PropTypes.func.isRequired,
    showProgress: PropTypes.bool.isRequired,
    onShowProgressChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default Settings;
