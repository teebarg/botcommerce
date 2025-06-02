import type { Config } from "tailwindcss";

// Move your helper function above the config
const generateColorScale = (baseName: string) => {
    const scale: Record<string, string> = {};
    const steps = [100, 500, 900];

    steps.forEach((step) => {
        scale[step] = `hsl(var(--${baseName}-${step}))`;
    });

    scale["DEFAULT"] = `hsl(var(--${baseName}))`;
    scale["foreground"] = `hsl(var(--${baseName}-foreground))`;

    return scale;
};

const config: Config = {
    content: ["./modules/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            backgroundSize: {
                "200": "200% 100%",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            borderWidth: {
                "1": "1px",
                "3": "3px",
            },
            boxShadow: {
                small: "var(--box-shadow-small)",
                medium: "var(--box-shadow-medium)",
                large: "var(--box-shadow-large)",
            },
            transitionTimingFunction: {
                "custom-ease": "cubic-bezier(0.6, 0.05, 0.15, 0.95)",
            },
            colors: {
                default: {
                    "50": "hsl(var(--default-50))",
                    "100": "hsl(var(--default-100))",
                    "200": "hsl(var(--default-200))",
                    "300": "hsl(var(--default-300))",
                    "400": "hsl(var(--default-400))",
                    "500": "hsl(var(--default-500))",
                    "600": "hsl(var(--default-600))",
                    "700": "hsl(var(--default-700))",
                    "800": "hsl(var(--default-800))",
                    "900": "hsl(var(--default-900))",
                    DEFAULT: "hsl(var(--default))",
                    foreground: "hsl(var(--default-foreground))",
                },
                danger: 'generateColorScale("danger")',
                success: 'generateColorScale("success")',
                warning: 'generateColorScale("warning")',
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
                shimmer: {
                    "100%": {
                        content: "var(--tw-content)",
                        transform: "translateX(100%)",
                    },
                },
                shimmer2: {
                    "0%": {
                        backgroundPosition: "-200% 0",
                    },
                    "100%": {
                        backgroundPosition: "200% 0",
                    },
                },
                "indeterminate-bar": {
                    "0%": {
                        transform: "translateX(-50%) scaleX(.2)",
                    },
                    "100%": {
                        transform: "translateX(100%) scaleX(1)",
                    },
                },
                "gradient-move": {
                    "0%": {
                        backgroundPosition: "0% 50%",
                    },
                    "100%": {
                        backgroundPosition: "100% 50%",
                    },
                },
                "accordion-down": {
                    from: {
                        height: "0",
                    },
                    to: {
                        height: "var(--radix-accordion-content-height)",
                    },
                },
                "accordion-up": {
                    from: {
                        height: "var(--radix-accordion-content-height)",
                    },
                    to: {
                        height: "0",
                    },
                },
            },
            animation: {
                blob: "blob 15s infinite",
                "blob-delayed": "blob 15s infinite 2s",
                "spinner-ease-spin": "spinner-spin 0.8s ease infinite",
                "spinner-linear-spin": "spinner-spin 0.8s linear infinite",
                "indeterminate-bar": "indeterminate-bar 1.5s cubic-bezier(.65,.815,.735,.395) infinite",
                "gradient-move": "gradient-move 4s infinite alternate",
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                bounce: "bounce 1s infinite",
                shimmer: "shimmer2 2s infinite",
            },
        },
    },
    darkMode: ["class", "class"],
    plugins: [require("tailwindcss-animate")],
};

export default config;
