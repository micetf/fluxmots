// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/globals.css";

// Enregistrement du Service Worker pour PWA
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
                console.log("SW registered: ", registration);
            })
            .catch((registrationError) => {
                console.log("SW registration failed: ", registrationError);
            });
    });
}

// Configuration des métadonnées PWA
document.addEventListener("DOMContentLoaded", () => {
    // Détection d'installation PWA
    let deferredPrompt;
    const installButton = document.getElementById("install-button");

    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;

        // Montrer le bouton d'installation si disponible
        if (installButton) {
            installButton.style.display = "block";
            installButton.addEventListener("click", () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === "accepted") {
                        console.log("User accepted the A2HS prompt");
                    } else {
                        console.log("User dismissed the A2HS prompt");
                    }
                    deferredPrompt = null;
                });
            });
        }
    });

    // Masquer le bouton après installation
    window.addEventListener("appinstalled", () => {
        console.log("PWA was installed");
        if (installButton) {
            installButton.style.display = "none";
        }
    });
});

// Gestion des erreurs globales
window.addEventListener("error", (event) => {
    console.error("Erreur globale:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
    console.error("Promise rejetée:", event.reason);
});

// Performance monitoring
if (window.performance && window.performance.mark) {
    window.performance.mark("app-start");
}

// Rendu de l'application - SANS React.StrictMode
ReactDOM.createRoot(document.getElementById("root")).render(<App />);

// Mesure de performance après rendu
if (window.performance && window.performance.mark) {
    window.performance.mark("app-end");
    window.performance.measure("app-duration", "app-start", "app-end");

    // Log des métriques de performance
    setTimeout(() => {
        const perfData = window.performance.getEntriesByName("app-duration")[0];
        if (perfData) {
            console.log(
                `Temps de chargement initial: ${perfData.duration.toFixed(2)}ms`
            );
        }
    }, 0);
}
