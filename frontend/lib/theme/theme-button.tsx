"use client";

import useTheme from "@lib/hooks/use-theme";
import { Sun, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
    const { toggleTheme } = useTheme();

    return (
        <Button id="theme-toggle" size="icon" variant="ghost" onClick={toggleTheme}>
            <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
    );
}
