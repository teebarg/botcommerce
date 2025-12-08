import React, { useRef, useEffect, useCallback } from "react";

interface InfiniteScrollProps {
    children: React.ReactNode;
    onLoadMore: () => void;
    hasMore: boolean;
    isLoading: boolean;
    loader?: React.ReactNode;
    endMessage?: React.ReactNode;
    threshold?: number;
    className?: string;
}

export const InfiniteScroll = ({
    children,
    onLoadMore,
    hasMore,
    isLoading,
    loader = <div className="text-center py-4">Loading...</div>,
    endMessage = null,
    threshold = 500,
    className = "",
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
        const element = observerTarget.current;
        const option = { threshold: 0, rootMargin: `${threshold}px` };

        const observer = new IntersectionObserver(handleObserver, option);

        if (element) observer.observe(element);

        return () => {
            if (element) observer.unobserve(element);
        };
    }, [handleObserver, threshold]);

    return (
        <div className={className}>
            {children}
            <div ref={observerTarget} className="h-px" />
            {isLoading && loader}
            {!hasMore && !isLoading && endMessage}
        </div>
    );
};
