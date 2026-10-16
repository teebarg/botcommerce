import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProductSearch } from "@/schemas/product";
import { defaultVariant, getPriceInfo, variantLabel } from "@/lib/variant";

export type SelectedItem = {
    id: number;
    slug: string;
    name: string;
    price: number;
    label?: string;
    image?: string;
};

const STORAGE_KEY = "quick-order:v1";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // keep for a week

export function toSelectedItem(p: ProductSearch): SelectedItem {
    return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: getPriceInfo(p).minPrice,
        label: variantLabel(defaultVariant(p)) || undefined,
        image: p.image || undefined,
    };
}

function load(): SelectedItem[] {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const { savedAt, items } = JSON.parse(raw);
        if (!Array.isArray(items) || Date.now() - savedAt > MAX_AGE_MS) return [];
        return items.filter((i: SelectedItem) => typeof i?.id === "number" && typeof i?.slug === "string");
    } catch {
        return [];
    }
}

export function useQuickOrderSelection() {
    const [items, setItems] = useState<SelectedItem[]>([]);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setItems(load());
        setHydrated(true);
    }, []);

    // Only write after hydrating, otherwise the initial empty state would wipe what was saved
    useEffect(() => {
        if (!hydrated) return;
        try {
            if (items.length === 0) window.localStorage.removeItem(STORAGE_KEY);
            else window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), items }));
        } catch {
            /* storage blocked (private mode, quota): selection still works for this visit */
        }
    }, [items, hydrated]);

    const toggle = useCallback((item: SelectedItem) => {
        setItems((prev) => (prev.some((i) => i.id === item.id) ? prev.filter((i) => i.id !== item.id) : [...prev, item]));
    }, []);

    const remove = useCallback((id: number) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }, []);

    const clear = useCallback(() => setItems([]), []);
    const ids = useMemo(() => new Set(items.map((i) => i.id)), [items]);

    return { items, ids, toggle, remove, clear };
}
