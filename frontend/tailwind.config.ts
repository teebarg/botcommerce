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
            borderColor: {
                divider: "hsl(var(--divider))",
                content1: "var(--content1)",
            },
            borderRadius: {
                "50": "50%",
                "1xl": "0.875rem",
                "top-corners": "5px 5px 0 0",
                "bottom-corners": "0 0 5px 5px",
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
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
            fontSize: {
                xxs: [
                    "0.625rem",
                    {
                        lineHeight: "0.875",
                    },
                ],
            },
            fontFamily: {
                sans: "var(--font-inter)",
                display: "var(--font-lexend)",
            },
            transitionTimingFunction: {
                "custom-ease": "cubic-bezier(0.6, 0.05, 0.15, 0.95)",
            },
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
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
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                content1: "var(--content1)",
                content2: "hsl(var(--content2))",
                content3: "hsl(var(--content3))",
                content4: "hsl(var(--content4))",
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                chart: {
                    "1": "hsl(var(--chart-1))",
                    "2": "hsl(var(--chart-2))",
                    "3": "hsl(var(--chart-3))",
                    "4": "hsl(var(--chart-4))",
                    "5": "hsl(var(--chart-5))",
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
            maxWidth: {
                "8xl": "88rem",
                "9xl": "96rem",
            },
        },
    },
    darkMode: ["class", "class"],
    plugins: [require("tailwindcss-animate")],
};

export default config;
