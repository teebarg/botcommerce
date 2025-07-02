"use client";

import useTheme from "@lib/hooks/use-theme";

import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    const icon = theme === "dark" ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />;

    return (
        <Button aria-label="theme" className="text-secondary hover:text-secondary" size="iconOnly" type="button" onClick={toggleTheme}>
            {icon}
        </Button>
    );
}
