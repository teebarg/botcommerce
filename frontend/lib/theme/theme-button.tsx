"use client";

import { useTheme } from "@lib/hooks/use-theme";
import { MoonFilledIcon, SunFilledIcon } from "nui-react-icons";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const icon = theme === "dark" ? <SunFilledIcon className="h-8 w-8" size={30} /> : <MoonFilledIcon className="h-8 w-8" size={30} />;

    return (
        <button className="text-primary" type="button" onClick={toggleTheme}>
            {icon}
        </button>
    );
}
