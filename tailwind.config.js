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
                    "gray-50": "#f9fafb",
                    "gray-100": "#f3f4f6",
                    "gray-200": "#e5e7eb",
                    "gray-300": "#d1d5db",
                    "gray-400": "#9ca3af",
                    "gray-500": "#6b7280",
                    "gray-600": "#4b5563",
                    "gray-700": "#374151",
                    "gray-800": "#1f2937",
                    "gray-900": "#111827",
                },
            },
            fontFamily: {
                display: ["Segoe UI", "system-ui", "sans-serif"],
                reading: ["Georgia", "Times New Roman", "serif"],
            },
            fontSize: {
                // Tailles pour l'affichage des mots - CORRIGÉES
                "word-xs": ["2rem", { lineHeight: "2.2rem" }], // 32px
                "word-sm": ["3rem", { lineHeight: "3.2rem" }], // 48px
                "word-md": ["4rem", { lineHeight: "4.2rem" }], // 64px
                "word-lg": ["6rem", { lineHeight: "6.2rem" }], // 96px
                "word-xl": ["8rem", { lineHeight: "8.2rem" }], // 128px
                "word-2xl": ["12rem", { lineHeight: "12.2rem" }], // 192px
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-in-out",
                "slide-in": "slideIn 0.2s ease-out",
                "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "word-in": "wordFadeIn 0.3s ease-out",
                "word-out": "wordFadeOut 0.2s ease-in",
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
                wordFadeIn: {
                    "0%": {
                        opacity: "0",
                        transform: "scale(0.95) translateY(-10px)",
                    },
                    "100%": {
                        opacity: "1",
                        transform: "scale(1) translateY(0)",
                    },
                },
                wordFadeOut: {
                    "0%": { opacity: "1", transform: "scale(1) translateY(0)" },
                    "100%": {
                        opacity: "0",
                        transform: "scale(0.95) translateY(10px)",
                    },
                },
            },
        },
    },
    plugins: [],
    // Classes de sécurité pour l'affichage dynamique - ÉTENDUES
    safelist: [
        // Patterns pour les classes dynamiques
        {
            pattern: /^(text-word|font-reading|animate-|text-flux|bg-flux)-.*/,
        },
        {
            pattern: /^(h|w)-\d+$/,
        },
        // Classes spécifiques pour les tailles de mots
        "text-word-xs",
        "text-word-sm",
        "text-word-md",
        "text-word-lg",
        "text-word-xl",
        "text-word-2xl",
        // Classes pour les animations
        "animate-word-in",
        "animate-word-out",
        "animate-fade-in",
        "animate-slide-in",
        // Classes couleurs flux
        "text-flux-primary",
        "text-flux-secondary",
        "bg-flux-primary",
        "bg-flux-secondary",
        "hover:bg-flux-secondary",
        "border-flux-primary",
        "hover:border-flux-primary",
        "bg-flux-gray-50",
        "bg-flux-gray-100",
        "bg-flux-gray-200",
        "text-flux-gray-600",
        "text-flux-gray-700",
        "text-flux-gray-800",
        // Classes pour les états
        "opacity-50",
        "opacity-100",
        "scale-95",
        "scale-100",
        "transform",
        "transition-all",
        "duration-300",
        "ease-in-out",
        // Classes pour l'affichage responsive
        "min-h-screen",
        "min-h-[400px]",
        "font-bold",
        "font-reading",
        "text-center",
        "select-none",
    ],
};
