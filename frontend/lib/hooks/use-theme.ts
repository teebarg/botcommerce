"use client";

import { useState, useEffect, useCallback } from "react";

const useTheme = () => {
    const [theme, setTheme] = useState(typeof window === "undefined" ? "light" : window.__theme || "light");

    const toggleTheme = useCallback(() => {
        if (typeof window !== "undefined" && typeof window.__setPreferredTheme === "function") {
            window.__setPreferredTheme(theme === "light" ? "dark" : "light");
        } else {
            console.warn("__setPreferredTheme is not yet available");
        }
    }, [theme]);

    useEffect(() => {
        window.__onThemeChange = setTheme;
    }, []);

    return { theme, toggleTheme };
};

export default useTheme;
