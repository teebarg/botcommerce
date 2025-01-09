"use client";

import { useTheme } from "@lib/hooks/use-theme";
import { MoonFilled, SunFilled } from "nui-react-icons";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const icon = theme === "dark" ? <SunFilled className="h-8 w-8" size={30} /> : <MoonFilled className="h-8 w-8" size={30} />;

    return (
        <button aria-label="theme" className="text-primary" type="button" onClick={toggleTheme}>
            {icon}
        </button>
    );
}
