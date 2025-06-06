"use client";

import { useEffect, useState } from "react";
import useTheme from "@lib/hooks/use-theme";
import { MoonFilled, SunFilled } from "nui-react-icons";

import { Button } from "@/components/ui/button";

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
        <Button aria-label="theme" className="text-secondary hover:text-secondary" size="iconOnly" type="button" onClick={toggleTheme}>
            {icon}
        </Button>
    );
}
