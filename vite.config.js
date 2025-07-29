import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
            },
            manifest: {
                name: "FluxMots - Fluence de Lecture",
                short_name: "FluxMots",
                description:
                    "Application de fluence de lecture pour enseignants",
                theme_color: "#4a90e2",
                start_url: "/",
                display: "standalone",
                background_color: "#ffffff",
                icons: [
                    {
                        src: "/icons/icon-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "/icons/icon-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
            "@components": fileURLToPath(
                new URL("./src/components", import.meta.url)
            ),
            "@hooks": fileURLToPath(new URL("./src/hooks", import.meta.url)),
            "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
            "@data": fileURLToPath(new URL("./src/data", import.meta.url)),
        },
    },
    server: {
        port: 3000,
        host: true,
    },
    build: {
        target: "es2020",
        rollupOptions: {
            output: {
                manualChunks: {
                    "vendor-react": ["react", "react-dom"],
                    "vendor-micetf": ["@micetf/ui"],
                },
            },
        },
    },
});
