"use client";

import useTheme from "@lib/hooks/use-theme";
import { Sun, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    const icon = theme === "dark" ? <Sun className="h-7 w-7" /> : <Moon className="h-7 w-7" />;

    return (
        <Button aria-label="theme" className="text-secondary hover:text-secondary" size="iconOnly" type="button" onClick={toggleTheme}>
                {icon}
            </Button>
    );
}
