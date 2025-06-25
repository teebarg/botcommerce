"use client";

import useTheme from "@lib/hooks/use-theme";
import { MoonFilled, SunFilled } from "nui-react-icons";

import { Button } from "@/components/ui/button";
import ClientOnly from "@/components/generic/client-only";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    const icon = theme === "dark" ? <SunFilled className="h-8 w-8" /> : <MoonFilled className="h-8 w-8" />;

    return (
        <ClientOnly>
            <Button aria-label="theme" className="text-secondary hover:text-secondary" size="iconOnly" type="button" onClick={toggleTheme}>
                {icon}
            </Button>
        </ClientOnly>
    );
}
