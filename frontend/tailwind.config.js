/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx}",
        "./src/pages/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
        "./src/modules/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundColor: {
                content1: "hsl(var( --content1))",
                content2: "hsl(var( --content2))",
                content3: "hsl(var( --content3))",
                content4: "hsl(var( --content4))",
                "content1-foreground": "hsl(var( --content1-foreground))",
                "content2-foreground": "hsl(var( --content2-foreground))",
                "content3-foreground": "hsl(var( --content3-foreground))",
                "content4-foreground": "hsl(var( --content4-foreground))",
                divider: "hsl(var(--divider) / var(--divider-opacity, 1))",
            },
            borderColor: {
                divider: "hsl(var(--divider) / var(--divider-opacity, 1))",
            },
            borderRadius: {
                small: "var(--radius-small)",
                medium: "var(--radius-medium)",
                large: "var(--radius-large)",
                50: "50%",
                'top-corners': '5px 5px 0 0',
            },
            borderWidth: {
                small: "var(--border-width-small)",
                medium: "var(--border-width-medium)",
                large: "var(--border-width-large)",
            },
            boxShadow: {
                small: "var(--box-shadow-small)",
                medium: "var(--box-shadow-medium)",
                large: "var(--box-shadow-large)",
            },
            fontSize: {
                tiny: ["var(--font-size-tiny)", { lineHeight: "var(--line-height-tiny)" }],
                small: ["var(--font-size-small)", { lineHeight: "var(--line-height-small)" }],
                medium: ["var(--font-size-medium)", { lineHeight: "var(--line-height-medium)" }],
                large: ["var(--font-size-large)", { lineHeight: "var(--line-height-large)" }],
            },
            fontFamily: {
                sans: "var(--font-inter)",
                display: "var(--font-lexend)",
            },
            transitionTimingFunction: {
                "custom-ease": "cubic-bezier(0.6, 0.05, 0.15, 0.95)",
            },
            colors: {
                background: {
                    DEFAULT: "hsl(var(--background))",
                    100: "hsl(var(--background-100))",
                    500: "hsl(var(--background-500))",
                    900: "hsl(var(--background-900))",
                },
                foreground: {
                    DEFAULT: "hsl(var(--foreground))",
                    100: "hsl(var(--foreground-100))",
                    500: "hsl(var(--foreground-500))",
                    900: "hsl(var(--foreground-900))",
                },
                default: {
                    DEFAULT: "hsl(var(--default))",
                    100: "hsl(var(--default-100))",
                    500: "hsl(var(--default-500))",
                    900: "hsl(var(--default-900))",
                    foreground: "hsl(var(--default-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    100: "hsl(var(--primary-100))",
                    500: "hsl(var(--primary-500))",
                    900: "hsl(var(--primary-900))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    100: "hsl(var(--secondary-100))",
                    500: "hsl(var(--secondary-500))",
                    900: "hsl(var(--secondary-900))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                success: {
                    DEFAULT: "hsl(var(--success))",
                    100: "hsl(var(--success-100))",
                    500: "hsl(var(--success-500))",
                    900: "hsl(var(--success-900))",
                    foreground: "hsl(var(--success-foreground))",
                },
                danger: {
                    DEFAULT: "hsl(var(--danger))",
                    100: "hsl(var(--danger-100))",
                    500: "hsl(var(--danger-500))",
                    900: "hsl(var(--danger-900))",
                    foreground: "hsl(var(--danger-foreground))",
                },
                warning: {
                    DEFAULT: "hsl(var(--warning))",
                    100: "hsl(var(--warning-100))",
                    500: "hsl(var(--warning-500))",
                    900: "hsl(var(--warning-900))",
                    foreground: "hsl(var(--warning-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                border: "hsl(var(--border))",
                divider: "hsl(var(--divider))",
            },
            keyframes: {
                blob: {
                    "0%": {
                        transform: "translate(0, 0) scale(1)",
                    },
                    "33%": {
                        transform: "translate(30px, -50px) scale(1.1)",
                    },
                    "66%": {
                        transform: "translate(-20px, 20px) scale(0.9)",
                    },
                    "100%": {
                        transform: "translate(0, 0) scale(1)",
                    },
                },
                "spinner-spin": {
                    "0%": {
                        transform: "rotate(0deg)",
                    },
                    "100%": {
                        transform: "rotate(360deg)",
                    },
                },
            },
            animation: {
                blob: "blob 15s infinite",
                "blob-delayed": "blob 15s infinite 2s",
                "spinner-ease-spin": "spinner-spin 0.8s ease infinite",
                "spinner-linear-spin": "spinner-spin 0.8s linear infinite",
            },
        },
    },
    darkMode: "class",
    plugins: [],
};
