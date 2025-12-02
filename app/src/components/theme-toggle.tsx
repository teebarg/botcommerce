import { Moon, Sun, Monitor } from "lucide-react";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
    const { userTheme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(userTheme === "dark" ? "light" : "dark");
    };

    const getThemeIcon = () => {
        switch (userTheme) {
            case "dark":
                return <Sun className="h-5 w-5" />;
            case "light":
                return <Moon className="h-5 w-5" />;
            default:
                return <Monitor className="h-5 w-5" />;
        }
    };

    return (
        <button
            aria-label="Toggle theme"
            className="h-10 w-10 rounded-md border p-2 hover:bg-accent hover:text-accent-foreground"
            onClick={toggleTheme}
        >
            {getThemeIcon()}
        </button>
    );
}
