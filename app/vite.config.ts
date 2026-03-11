import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";

const config = defineConfig({
    server: {
        port: 5173,
        allowedHosts: true
    },
    plugins: [
        devtools(),
        nitro({
            externals: {
                inline: ["@auth/core"],
            },
        }),
        viteTsConfigPaths({
            projects: ["./tsconfig.json"],
        }),
        tailwindcss(),
        tanstackStart(),
        viteReact(),
        tanstackRouter({
            autoCodeSplitting: true,
        }),
        VitePWA({
            strategies: "injectManifest",
            srcDir: "src",
            filename: "sw.js",
            registerType: "prompt",
            outDir: ".output/public",
            injectRegister: "auto",
            includeAssets: ["robots.txt", "favicon.ico", "favicon-32x32.png", "favicon-16x16.png", "icon.png", "placeholder.jpg", "pr-logo.png"],
            manifest: {
                name: "Revoque",
                short_name: "Revoque",
                start_url: "/",
                display: "standalone",
                background_color: "#2EC6FE",
                theme_color: "#0F63FF",
                icons: [
                    { src: "icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
                    { src: "icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
                    { src: "icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
                ],
            },
            injectManifest: {
                globDirectory: ".output/public",
                globPatterns: [
                    "**/*.{js,css,html,png,svg,ico,woff2}",
                    "assets/*.css",
                    "_server/assets/*.css",
                ],
            },
            devOptions: {
                enabled: true,
                type: "module",
            },
        }),
    ],
});

export default config;
