import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
    /** Called when the sentinel enters the viewport */
    onLoadMore: () => void;
    /** Whether there are more pages to load */
    hasNextPage: boolean | undefined;
    /** Whether a fetch is already in flight */
    isFetchingNextPage: boolean;
    /**
     * How far from the bottom of the sentinel to trigger the callback.
     * E.g. "400px" pre-fetches before the user reaches the end.
     * @default "400px"
     */
    rootMargin?: string;
    /**
     * Fraction of the sentinel that must be visible before triggering.
     * @default 0
     */
    threshold?: number;
    /**
     * The scrollable ancestor to observe against. Defaults to the viewport.
     */
    root?: Element | null;
}

interface UseInfiniteScrollReturn {
    /** Attach this ref to the sentinel element placed at the bottom of the list */
    sentinelRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Generic hook for infinite scroll via IntersectionObserver.
 *
 * Usage:
 *   const { sentinelRef } = useInfiniteScroll({ onLoadMore, hasNextPage, isFetchingNextPage });
 *   ...
 *   <div ref={sentinelRef} />
 */
export function useInfiniteScroll({
    onLoadMore,
    hasNextPage,
    isFetchingNextPage,
    rootMargin = "400px",
    threshold = 0,
    root = null,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
    const sentinelRef = useRef<HTMLDivElement>(null);

    const handleIntersection = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                onLoadMore();
            }
        },
        [onLoadMore, hasNextPage, isFetchingNextPage],
    );

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(handleIntersection, {
            root,
            rootMargin,
            threshold,
        });

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [handleIntersection, root, rootMargin, threshold]);

    return { sentinelRef };
}