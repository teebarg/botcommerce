import { Loader2 } from "lucide-react";
import type React from "react";
import { useRef, useEffect, useCallback } from "react";

interface InfiniteScrollProps {
    children: React.ReactNode;
    onLoadMore: () => void;
    hasMore: boolean;
    isLoading: boolean;
    loader?: React.ReactNode;
    endMessage?: React.ReactNode;
    threshold?: number;
    className?: string;
    scrollRef?: React.RefObject<HTMLElement | null>;
}

export const InfiniteScroll = ({
    children,
    onLoadMore,
    hasMore,
    isLoading,
    loader = (
        <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">Loading more...</span>
        </div>
    ),
    endMessage = null,
    threshold = 800,
    className = "",
    scrollRef,
}: InfiniteScrollProps) => {
    const observerTarget = useRef<HTMLDivElement>(null);

    const handleObserver = useCallback(
        (entries: any) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !isLoading) {
                onLoadMore();
            }
        },
        [hasMore, isLoading, onLoadMore]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, {
            root: scrollRef?.current ?? null,
            threshold: 0,
            rootMargin: `${threshold}px`,
        });

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [handleObserver, threshold, scrollRef]);

    return (
        <div className={className}>
            {children}
            <div ref={observerTarget} className="h-px" />
            {isLoading && loader}
            {!hasMore && !isLoading && endMessage}
        </div>
    );
};
