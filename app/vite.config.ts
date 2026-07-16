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
        hmr: {
            overlay: true,
        },
        allowedHosts: true,
        watch: {
            ignored: ["**/routeTree.gen.ts"],
        },
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
        tanstackRouter({ autoCodeSplitting: true }),
        viteReact(),
        VitePWA({
            strategies: "injectManifest",
            srcDir: "src",
            filename: "sw.js",
            registerType: "prompt",
            outDir: "public",
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
                    "assets/main-*.js",
                    "assets/vendor-react-*.js",
                    "assets/radix-*.js",
                    "assets/icons-*.js",
                    "assets/vendor-*.js",
                    "assets/_mainLayout-*.js",
                    "assets/styles-*.css",
                    "assets/*.woff2",
                ],
                globIgnores: [
                    "**/node_modules/**/*",
                    "assets/_adminLayout*",
                    "assets/admin.*",
                    "**/*.lazy-*.js",
                ],
            },
            devOptions: {
                enabled: false,
                type: "module",
            },
        }),
    ],
    resolve: {
        alias: {
            'next/navigation': 'unenv/runtime/mock/proxy',
        },
    },
    build: {
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            external: ["node:stream", "node:stream/web", "node:async_hooks"],
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        if (id.includes("lucide-react")) return "icons";
                        if (id.includes("@radix-ui")) return "radix";
                        if (id.includes("react-dom") || id.includes("/react/") || id.includes("@tanstack/react-router") || id.includes("@tanstack/react-query")) return "vendor-react";
                        return "vendor"; // catch-all for the rest of node_modules
                    }
                },
            },
        },
    },
});

export default config;