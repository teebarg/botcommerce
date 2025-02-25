"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@lib/hooks/use-theme";
import { MoonFilled, SunFilled } from "nui-react-icons";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const [isClient, setIsClient] = useState<boolean>(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    const icon = theme === "dark" ? <SunFilled className="h-8 w-8" /> : <MoonFilled className="h-8 w-8" />;

    return (
        <button aria-label="theme" className="text-primary" type="button" onClick={toggleTheme}>
            {icon}
        </button>
    );
}
