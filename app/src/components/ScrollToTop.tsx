import { useEffect } from "react";
import { useLocation, useRouterState } from "@tanstack/react-router";

const getHashId = (hash: string) => {
    const rawId = hash.slice(1);
    try {
        return decodeURIComponent(rawId);
    } catch {
        return rawId;
    }
};

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();
    // Get the latest history action (PUSH, POP, REPLACE)
    const navigationType = useRouterState({
        select: (state) => state.location.state?.type,
    });

    useEffect(() => {
        // Skip adjusting scroll on browser Back/Forward (POP) actions
        if (navigationType === "POP") return;

        if (hash) {
            const id = getHashId(hash);
            const timer = window.setTimeout(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
            }, 50);
            return () => window.clearTimeout(timer);
        }

        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname, hash, navigationType]);

    return null;
}
