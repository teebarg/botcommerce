import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme, type UserTheme } from "@/providers/theme-provider";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { userTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <button aria-label="Toggle theme" className="h-9 w-9" suppressHydrationWarning />;
    }

    const toggleTheme = () => {
        const cycleMap: Record<UserTheme, UserTheme> = {
            light: "dark",
            dark: "system",
            system: "light",
        };
        setTheme(cycleMap[userTheme]);
    };

    const getThemeIcon = () => {
        switch (userTheme) {
            case "light":
                return <Sun className="h-4 w-4" />;
            case "dark":
                return <Moon className="h-4 w-4" />;
            case "system":
                return <Monitor className="h-4 w-4" />;
        }
    };

    const getAriaLabel = () => {
        switch (userTheme) {
            case "light":
                return "Switch to dark theme";
            case "dark":
                return "Switch to system theme";
            case "system":
                return "Switch to light theme";
        }
    };

    return (
        <Button
            aria-label={getAriaLabel()}
            size="icon"
            variant="outline"
            onClick={toggleTheme}
            title={`Theme: ${userTheme}`}
        >
            {getThemeIcon()}
        </Button>
    );
}
