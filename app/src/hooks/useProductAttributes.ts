
import { ProductSearch, ProductVariant } from "@/schemas";
import { useMemo } from "react";

export function useProductAttributes(variants?: ProductVariant[] | null) {
    const attributeLabels = useMemo(() => {
        const attributes = variants?.flatMap(
            (variant) => Object.entries(variant.attributes ?? {})
        ) ?? [];

        const grouped = new Map<string, Set<string>>();

        for (const [key, value] of attributes) {
            if (value == null || value === "") continue;

            if (!grouped.has(key)) {
                grouped.set(key, new Set());
            }

            grouped.get(key)!.add(String(value));
        }

        return Array.from(grouped, ([name, values]) => ({
            name,
            values: Array.from(values),
        }));
    }, [variants]);

    const attributes = useMemo(
        () =>
            attributeLabels.map(
                ({ name, values }) => `${name}: ${values.join(", ")}`
            ),
        [attributeLabels]
    );

    return { attributeLabels, attributes };
}
