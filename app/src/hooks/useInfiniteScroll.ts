import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
    onLoadMore: () => void;
    rootMargin?: string;
    threshold?: number;
    disabled?: boolean;
}

export function useInfiniteScroll({ onLoadMore, rootMargin = "600px", threshold = 0, disabled = false }: UseInfiniteScrollOptions) {
    const observerRef = useRef<IntersectionObserver | null>(null);

    const lastElementRef = useCallback(
        (node: Element | null) => {
            if (disabled) return;

            if (observerRef.current) observerRef.current.disconnect();

            observerRef.current = new IntersectionObserver(
                (entries) => {
                    const entry = entries[0];
                    if (entry.isIntersecting && !disabled) {
                        onLoadMore();
                    }
                },
                {
                    root: null,
                    rootMargin,
                    threshold,
                }
            );

            if (node) observerRef.current.observe(node);
        },
        [onLoadMore, rootMargin, threshold, disabled]
    );

    useEffect(() => {
        return () => observerRef.current?.disconnect();
    }, []);

    return { lastElementRef };
}
