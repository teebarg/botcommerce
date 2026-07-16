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
        nitro(),
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
                    "assets/vendor-clerk-*.js",
                    "assets/vendor-stately-*.js",
                    "assets/radix-*.js",
                    "assets/icons-*.js",
                    "assets/_mainLayout-*.js",
                    "assets/styles-*.css",
                    "assets/*.woff2",
                ],
                globIgnores: [
                    "**/node_modules/**/*",
                    "assets/account*",
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
                experimentalMinChunkSize: 5000,
                manualChunks(id) {
                    const filepath = id.replace(/\\/g, '/');
                    if (filepath.includes("node_modules")) {
                        if (filepath.includes("lucide-react")) return "icons";
                        if (filepath.includes("@radix-ui")) return "radix";
                        if (filepath.includes("@clerk/")) return "vendor-clerk";
                        if (filepath.includes("react-stately")) return "vendor-stately";

                        if (filepath.includes("src/components/ui/")) {
                            return "shared-ui-primitives";
                        }
                    }
                },
            },
        },
    },
});

export default config;