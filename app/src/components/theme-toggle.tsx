import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

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
        setTheme(userTheme === "dark" ? "light" : "dark");
    };

    const getThemeIcon = () => {
        switch (userTheme) {
            case "dark":
                return <Sun className="h-4 w-4" />;
            case "light":
                return <Moon className="h-4 w-4" />;
            default:
                return <Monitor className="h-4 w-4" />;
        }
    };

    return (
        <Button
            aria-label="Toggle theme"
            size="icon"
            variant="outline"
            onClick={toggleTheme}
        >
            {getThemeIcon()}
        </Button>
    );
}
