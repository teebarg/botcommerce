import { useEffect, useState } from "react";

export function useLocalStorageFlag(key: string) {
    const [enabled, setEnabled] = useState<boolean>(false);
    const [hydrated, setHydrated] = useState<boolean>(false);

    useEffect(() => {
        const stored = localStorage.getItem(key);
        setEnabled(Boolean(stored));
        setHydrated(true);
    }, [key]);

    const enable = () => {
        localStorage.setItem(key, "true");
        setEnabled(true);
    };

    const disable = () => {
        localStorage.removeItem(key);
        setEnabled(false);
    };

    return { enabled, enable, disable, hydrated };
}
