import { useEffect, useRef } from "react";

interface InfiniteListProps {
    children: React.ReactNode;
    onLoadMore: () => void;
    hasMore: boolean;
    isLoading: boolean;
    /**
     * Distance (px) before reaching the bottom
     * that triggers prefetch
     */
    preloadOffset?: number;
    loader?: React.ReactNode;
    endMessage?: React.ReactNode;
    className?: string;
}

export function InfiniteList({
    children,
    onLoadMore,
    hasMore,
    isLoading,
    preloadOffset = 800,
    loader = <div className="py-10 text-center text-muted-foreground">Loading…</div>,
    endMessage = null,
    className = "",
}: InfiniteListProps) {
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const lockRef = useRef(false);

    useEffect(() => {
        if (!hasMore) return;
        if (typeof window === "undefined") return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                if (isLoading || lockRef.current) return;

                lockRef.current = true;
                onLoadMore();
            },
            {
                root: null,
                rootMargin: `0px 0px ${preloadOffset}px 0px`,
                threshold: 0,
            }
        );

        const node = sentinelRef.current;
        if (node) observer.observe(node);

        return () => observer.disconnect();
    }, [hasMore, isLoading, onLoadMore, preloadOffset]);

    useEffect(() => {
        if (!isLoading) {
            lockRef.current = false;
        }
    }, [isLoading]);

    return (
        <div className={className}>
            {children}

            {/* single observer target */}
            <div ref={sentinelRef} className="h-px w-full" />

            {isLoading && loader}
            {!hasMore && !isLoading && endMessage}
        </div>
    );
}
