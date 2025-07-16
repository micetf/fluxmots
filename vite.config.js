import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
    plugins: [react()],
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
    },
});
