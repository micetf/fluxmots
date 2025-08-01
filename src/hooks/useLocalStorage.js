// src/hooks/useLocalStorage.js
// Version corrigée - Stabilisation des callbacks

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook pour la gestion de la persistance dans le localStorage
 * avec gestion d'erreurs et fallback
 *
 * @param {string} key - Clé du localStorage
 * @param {*} initialValue - Valeur initiale si aucune valeur sauvegardée
 * @returns {Array} [value, setValue, removeValue, isLoading]
 */
export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(initialValue);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ CORRECTION: Ref pour stabiliser initialValue
    const initialValueRef = useRef(initialValue);
    useEffect(() => {
        initialValueRef.current = initialValue;
    }, [initialValue]);

    /**
     * Lecture sécurisée du localStorage
     */
    const readValue = useCallback(() => {
        try {
            if (typeof window === "undefined") {
                return initialValueRef.current;
            }

            const item = window.localStorage.getItem(key);

            if (item === null) {
                return initialValueRef.current;
            }

            return JSON.parse(item);
        } catch (error) {
            console.warn(
                `Erreur lecture localStorage pour la clé "${key}":`,
                error
            );
            return initialValueRef.current;
        }
    }, [key]); // ✅ Suppression de initialValue des dépendances

    /**
     * Écriture sécurisée dans le localStorage
     */
    const writeValue = useCallback(
        (value) => {
            try {
                if (typeof window === "undefined") {
                    console.warn("localStorage non disponible (SSR)");
                    return false;
                }

                // Permettre les fonctions de mise à jour comme avec useState
                const valueToStore =
                    value instanceof Function ? value(storedValue) : value;

                // Sauvegarder dans l'état
                setStoredValue(valueToStore);

                // Sauvegarder dans localStorage
                if (valueToStore === undefined) {
                    window.localStorage.removeItem(key);
                } else {
                    window.localStorage.setItem(
                        key,
                        JSON.stringify(valueToStore)
                    );
                }

                return true;
            } catch (error) {
                console.error(
                    `Erreur écriture localStorage pour la clé "${key}":`,
                    error
                );
                return false;
            }
        },
        [key, storedValue]
    );

    /**
     * Suppression d'une valeur du localStorage
     */
    const removeValue = useCallback(() => {
        try {
            if (typeof window === "undefined") {
                return false;
            }

            setStoredValue(initialValueRef.current);
            window.localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(
                `Erreur suppression localStorage pour la clé "${key}":`,
                error
            );
            return false;
        }
    }, [key]); // ✅ Suppression de initialValue des dépendances

    // Lecture initiale
    useEffect(() => {
        const value = readValue();
        setStoredValue(value);
        setIsLoading(false);
    }, [readValue]);

    // Écoute des changements dans les autres onglets
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key && e.newValue !== e.oldValue) {
                try {
                    const newValue = e.newValue
                        ? JSON.parse(e.newValue)
                        : initialValueRef.current;
                    setStoredValue(newValue);
                } catch (error) {
                    console.warn(
                        `Erreur synchronisation localStorage pour la clé "${key}":`,
                        error
                    );
                }
            }
        };

        if (typeof window !== "undefined") {
            window.addEventListener("storage", handleStorageChange);
            return () =>
                window.removeEventListener("storage", handleStorageChange);
        }
    }, [key]); // ✅ Suppression de initialValue des dépendances

    return [storedValue, writeValue, removeValue, isLoading];
};

/**
 * Hook spécialisé pour les paramètres de l'application
 */
export const useAppSettings = (defaultSettings) => {
    const [settings, setSettings, , isLoading] = useLocalStorage(
        "fluxmots_settings",
        defaultSettings
    );

    // ✅ CORRECTION: Callback stable avec ref
    const defaultSettingsRef = useRef(defaultSettings);
    useEffect(() => {
        defaultSettingsRef.current = defaultSettings;
    }, [defaultSettings]);

    const updateSetting = useCallback(
        (key, value) => {
            setSettings((prev) => ({
                ...prev,
                [key]: value,
            }));
        },
        [setSettings]
    );

    const resetSettings = useCallback(() => {
        setSettings(defaultSettingsRef.current);
    }, [setSettings]); // ✅ Suppression de defaultSettings des dépendances

    return {
        settings,
        updateSetting,
        resetSettings,
        isLoading,
    };
};

/**
 * Hook pour les listes personnalisées
 */
export const useCustomLists = () => {
    const [customLists, setCustomLists, removeCustomLists, isLoading] =
        useLocalStorage("fluxmots_custom_lists", []);

    const addCustomList = useCallback(
        (list) => {
            const newList = {
                ...list,
                id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // ✅ ID plus unique
                created: new Date().toISOString(),
                isCustom: true,
            };

            setCustomLists((prev) => [...prev, newList]);
            return newList.id;
        },
        [setCustomLists]
    );

    const updateCustomList = useCallback(
        (id, updates) => {
            setCustomLists((prev) =>
                prev.map((list) =>
                    list.id === id
                        ? {
                              ...list,
                              ...updates,
                              modified: new Date().toISOString(),
                          }
                        : list
                )
            );
        },
        [setCustomLists]
    );

    const deleteCustomList = useCallback(
        (id) => {
            setCustomLists((prev) => prev.filter((list) => list.id !== id));
        },
        [setCustomLists]
    );

    const getCustomListById = useCallback(
        (id) => {
            return customLists.find((list) => list.id === id);
        },
        [customLists]
    );

    return {
        customLists,
        addCustomList,
        updateCustomList,
        deleteCustomList,
        getCustomListById,
        clearAllCustomLists: removeCustomLists,
        isLoading,
    };
};

/**
 * Hook pour la sauvegarde de session
 */
export const useSessionStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(initialValue);

    // ✅ CORRECTION: Ref pour stabiliser initialValue
    const initialValueRef = useRef(initialValue);
    useEffect(() => {
        initialValueRef.current = initialValue;
    }, [initialValue]);

    const readValue = useCallback(() => {
        try {
            if (typeof window === "undefined") {
                return initialValueRef.current;
            }

            const item = window.sessionStorage.getItem(key);
            return item ? JSON.parse(item) : initialValueRef.current;
        } catch (error) {
            console.warn(
                `Erreur lecture sessionStorage pour la clé "${key}":`,
                error
            );
            return initialValueRef.current;
        }
    }, [key]); // ✅ Suppression de initialValue des dépendances

    const writeValue = useCallback(
        (value) => {
            try {
                if (typeof window === "undefined") {
                    return false;
                }

                const valueToStore =
                    value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);

                if (valueToStore === undefined) {
                    window.sessionStorage.removeItem(key);
                } else {
                    window.sessionStorage.setItem(
                        key,
                        JSON.stringify(valueToStore)
                    );
                }

                return true;
            } catch (error) {
                console.error(
                    `Erreur écriture sessionStorage pour la clé "${key}":`,
                    error
                );
                return false;
            }
        },
        [key, storedValue]
    );

    // Lecture initiale
    useEffect(() => {
        const value = readValue();
        setStoredValue(value);
    }, [readValue]);

    return [storedValue, writeValue];
};
