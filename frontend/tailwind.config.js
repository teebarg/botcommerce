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
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            backgroundColor: {
                content1: "hsl(var( --content1))",
                content2: "hsl(var( --content2))",
                content3: "hsl(var( --content3))",
                content4: "hsl(var( --content4))",
                "content1-foreground": "hsl(var( --content1-foreground))",
                "content2-foreground": "hsl(var( --content2-foreground))",
                "content3-foreground": "hsl(var( --content3-foreground))",
                "content4-foreground": "hsl(var( --content4-foreground))",
                divider: "hsl(var(--divider) / 0.15)",
            },
            borderColor: {
                divider: "hsl(var(--divider))",
                content1: "hsl(var(--content1))",
                content2: "hsl(var(--content2))",
                content3: "hsl(var(--content3))",
                content4: "hsl(var(--content4))",
            },
            borderRadius: {
                50: "50%",
                "1xl": "0.875rem",
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
                xxs: ["0.625rem", { lineHeight: "0.875" }],
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
                default: generateColorScale("default"),
                danger: generateColorScale("danger"),
                success: generateColorScale("success"), // Add other color names as needed
                warning: generateColorScale("warning"),
                divider: "hsl(var(--divider))",
                divider: "hsl(var(--divider))",
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                chart: {
                    1: "hsl(var(--chart-1))",
                    2: "hsl(var(--chart-2))",
                    3: "hsl(var(--chart-3))",
                    4: "hsl(var(--chart-4))",
                    5: "hsl(var(--chart-5))",
                },
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
