"use client";

import { useEffect, useRef, useState } from "react";

type Options<T> = {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
};

export function usePersistentState<T>(key: string, initialValue: T, options?: Options<T>) {
    const { serialize = JSON.stringify, deserialize = JSON.parse } = options || {};

    const isHydrated = useRef(false);

    const [state, setState] = useState<T>(initialValue);

    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const stored = localStorage.getItem(key);
            if (stored !== null) {
                setState(deserialize(stored));
            }
        } catch (error) {
            console.warn(`usePersistentState: Failed to deserialize key "${key}"`, error);
        } finally {
            isHydrated.current = true;
        }
    }, [key, deserialize]);

    useEffect(() => {
        if (!isHydrated.current) return;

        try {
            localStorage.setItem(key, serialize(state));
        } catch (error) {
            console.warn(`usePersistentState: Failed to serialize key "${key}"`, error);
        }
    }, [key, state, serialize]);

    return [state, setState] as const;
}
