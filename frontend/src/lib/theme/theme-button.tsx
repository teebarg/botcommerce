"use client";

import { useTheme } from "@lib/hooks/use-theme";
import { MoonFilledIcon, SunFilledIcon } from "nui-react-icons";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const icon = theme === "dark" ? <SunFilledIcon size={30} /> : <MoonFilledIcon size={30} />;

    return (
        <button type="button" onClick={toggleTheme}>
            {icon}
        </button>
    );
}
