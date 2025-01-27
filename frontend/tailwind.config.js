const generateColorScale = (baseName) => {
    const scale = {};
    const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

    // Dynamically generate color scales
    steps.forEach((step) => {
        scale[step] = `hsl(var(--${baseName}-${step}))`;
    });

    // Add the default and foreground variants
    scale["DEFAULT"] = `hsl(var(--${baseName}))`;
    scale["foreground"] = `hsl(var(--${baseName}-foreground))`;

    return scale;
};

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./modules/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
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
                divider: "hsl(var(--divider))",
                content1: "hsl(var(--content1))",
                content2: "hsl(var(--content2))",
                content3: "hsl(var(--content3))",
                content4: "hsl(var(--content4))",
            },
            borderRadius: {
                small: "var(--radius-small)",
                medium: "var(--radius-medium)",
                large: "var(--radius-large)",
                50: "50%",
                "top-corners": "5px 5px 0 0",
            },
            borderWidth: {
                1: "1px",
                3: "3px",
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
                default: generateColorScale("default"),
                danger: generateColorScale("danger"),
                success: generateColorScale("success"), // Add other color names as needed
                warning: generateColorScale("warning"),
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
                shimmer: {
                    "100%": {
                        content: "var(--tw-content)",
                        transform: "translateX(100%)",
                    },
                },
                "indeterminate-bar": {
                    "0%": { transform: "translateX(-50%) scaleX(.2)" },
                    "100%": { transform: "translateX(100%) scaleX(1)" },
                },
                "gradient-move": {
                    "0%": { backgroundPosition: "0% 50%" },
                    "100%": { backgroundPosition: "100% 50%" },
                },
            },
            animation: {
                blob: "blob 15s infinite",
                "blob-delayed": "blob 15s infinite 2s",
                "spinner-ease-spin": "spinner-spin 0.8s ease infinite",
                "spinner-linear-spin": "spinner-spin 0.8s linear infinite",
                "indeterminate-bar": "indeterminate-bar 1.5s cubic-bezier(.65,.815,.735,.395) infinite",
                "gradient-move": "gradient-move 4s infinite alternate",
            },
            maxWidth: {
                "8xl": "88rem", // 1408px
                "9xl": "96rem", // 1536px
            },
        },
    },
    darkMode: "class",
    plugins: [],
};
