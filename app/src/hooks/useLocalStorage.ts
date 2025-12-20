import { useEffect, useState } from "react";

export function useLocalStorageFlag(key: string) {
    const [enabled, setEnabled] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(key);
        setEnabled(Boolean(stored));
        setHydrated(true);
    }, [key]);

    const enable = () => {
        localStorage.setItem(key, "true");
        setEnabled(true);
    };

    return { enabled, enable, hydrated };
}
