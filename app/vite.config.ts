import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
    server: {
        port: 5173,
        watch: {
            usePolling: true,
            interval: 1000,
        },
    },
    plugins: [
        tailwindcss(),
        tsconfigPaths({
            projects: ["./tsconfig.json"],
        }),
        tanstackStart(),
        nitro(),
        viteReact(),
    ],
});
