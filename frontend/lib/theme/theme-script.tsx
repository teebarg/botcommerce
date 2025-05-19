import React from "react";
import Script from "next/script";

type Theme = "dark" | "light";

declare global {
    interface Window {
        __theme: Theme;
        __onThemeChange: (theme: Theme) => void;
        __setPreferredTheme: (theme: Theme) => void;
    }
}

const code = function () {
    const localStorageKey = "__PREFERRED_THEME__";

    window.__onThemeChange = function () {};

    window.__setPreferredTheme = function (newTheme: Theme) {
        setTheme(newTheme);
        try {
            localStorage.setItem(localStorageKey, newTheme);
        } catch (err) {
            console.error(err);
        }
    };

    function setTheme(newTheme: Theme) {
        document.documentElement.classList.remove(window.__theme);
        window.__theme = newTheme;
        preferredTheme = newTheme;
        document.documentElement.dataset.theme = newTheme;
        window.__onThemeChange(newTheme);
        document.documentElement.classList.add(newTheme);
    }

    let preferredTheme;

    try {
        preferredTheme = localStorage.getItem(localStorageKey) as Theme;
    } catch (err) {
        console.error(err);
    }

    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    darkQuery.addEventListener("change", function (e) {
        window.__setPreferredTheme(e.matches ? "dark" : "light");
    });

    setTheme(preferredTheme || (darkQuery.matches ? "dark" : "light"));
};

const getTheme = `(${code})();`;

export function ThemeScript() {
    return (
        <Script id="theme-script" strategy="beforeInteractive">
            {`(${code.toString()})();`}
        </Script>
    );
}
