"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
    onIntersect: () => void;
    isFetching?: boolean;
    root?: Element | null;
    rootMargin?: string;
    threshold?: number;
}

export const useInfiniteScroll = ({ onIntersect, root = null, rootMargin = "0px", threshold = 0, isFetching = false }: UseInfiniteScrollOptions) => {
    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback(
        (node: Element | null) => {
            if (observer.current) {
                observer.current.disconnect();
            }

            observer.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && !isFetching) {
                        onIntersect();
                    }
                },
                { root, rootMargin, threshold }
            );

            if (node) {
                observer.current.observe(node);
            }
        },
        [onIntersect, root, rootMargin, threshold, isFetching]
    );

    useEffect(() => {
        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, []);

    return { lastElementRef };
};
