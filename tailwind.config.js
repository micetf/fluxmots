/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
        // Inclure les composants du package @micetf/ui
        "./node_modules/@micetf/ui/dist/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#f0f9ff",
                    100: "#e0f2fe",
                    200: "#bae6fd",
                    300: "#7dd3fc",
                    400: "#38bdf8",
                    500: "#0ea5e9",
                    600: "#0284c7",
                    700: "#0369a1",
                    800: "#075985",
                    900: "#0c4a6e",
                    950: "#082f49",
                },
                // Couleurs spécifiques FluxMots
                flux: {
                    primary: "#4a90e2",
                    secondary: "#357abd",
                    success: "#10b981",
                    warning: "#f59e0b",
                    error: "#ef4444",
                },
            },
            fontFamily: {
                display: ["Segoe UI", "system-ui", "sans-serif"],
                reading: ["Georgia", "Times New Roman", "serif"], // Police pour l'affichage des mots
            },
            fontSize: {
                "word-xs": ["2rem", "2.5rem"],
                "word-sm": ["3rem", "3.5rem"],
                "word-md": ["4rem", "4.5rem"],
                "word-lg": ["6rem", "6.5rem"],
                "word-xl": ["8rem", "8.5rem"],
                "word-2xl": ["12rem", "12.5rem"],
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-in-out",
                "slide-in": "slideIn 0.2s ease-out",
                "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0", transform: "scale(0.9)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
                slideIn: {
                    "0%": { transform: "translateY(-10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
            },
        },
    },
    plugins: [],
    // Classes de sécurité pour l'affichage dynamique
    safelist: [
        {
            pattern: /^(text-word|font-reading|animate-)/,
        },
    ],
};
