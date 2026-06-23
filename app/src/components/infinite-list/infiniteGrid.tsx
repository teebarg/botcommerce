import { useRef, useEffect, useState, useCallback, type ReactNode } from "react";
import { cn } from "@/utils";
import { useInfiniteScroll } from "./useInfiniteScroll";


interface InfiniteGridProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    keyExtractor: (item: T, index: number) => string | number;
    fetchNextPage: () => void;
    hasNextPage: boolean | undefined;
    isFetchingNextPage: boolean;

    /** CSS grid column classes. Defaults to the gallery layout. */
    gridClassName?: string;

    /** How many px before the bottom to pre-fetch. @default "400px" */
    rootMargin?: string;

    /**
     * Max rendered items before pruning the top of the list.
     * Set to Infinity to disable pruning (fine for smaller lists).
     * For 2k+ images, a value of ~120 keeps DOM nodes bounded.
     * @default 160
     */
    maxRendered?: number;

    /** Shown while fetching the next page */
    loadingSlots?: number;

    /** Rendered when there are no items */
    emptyState?: ReactNode;

    /** Rendered after the last page has loaded */
    endMessage?: ReactNode;

    className?: string;
}

/**
 * InfiniteGrid — reusable infinite-scroll grid with optional top-pruning.
 *
 * Pruning keeps the rendered DOM bounded for very large feeds. When
 * `maxRendered` is set, items scrolled far above the viewport are removed.
 * A spacer div preserves scroll position so the layout doesn't jump.
 *
 * For smaller feeds (< ~500 items) set maxRendered={Infinity} and skip the
 * spacer logic entirely.
 */
export function InfiniteGrid<T>({
    items,
    renderItem,
    keyExtractor,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    gridClassName = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3",
    rootMargin = "400px",
    maxRendered = 160,
    loadingSlots = 8,
    emptyState,
    endMessage,
    className,
}: InfiniteGridProps<T>) {
    const { sentinelRef } = useInfiniteScroll({
        onLoadMore: fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        rootMargin,
    });

    // --- DOM pruning state ---
    // We track how many items to skip from the top. When the skipped count
    // grows, we increase a top-spacer height to compensate so scroll doesn't jump.
    const [skipCount, setSkipCount] = useState(0);
    const gridRef = useRef<HTMLDivElement>(null);
    const spacerRef = useRef<HTMLDivElement>(null);
    const itemHeightsRef = useRef<number[]>([]);
    const rowHeightRef = useRef<number>(0);

    const shouldPrune = maxRendered !== Infinity && items.length > maxRendered;

    // Measure a card row height once after first render
    useEffect(() => {
        if (!gridRef.current || !shouldPrune) return;
        const firstCard = gridRef.current.querySelector("[data-infinite-item]") as HTMLElement | null;
        if (firstCard) {
            rowHeightRef.current = firstCard.getBoundingClientRect().height;
        }
    }, [items.length > 0, shouldPrune]);

    // Prune items that are far above the viewport
    const prune = useCallback(() => {
        if (!shouldPrune || !gridRef.current) return;
        if (items.length - skipCount <= maxRendered) return;

        const gridTop = gridRef.current.getBoundingClientRect().top;
        // If the grid top is still in the viewport-ish zone, don't prune yet
        if (gridTop > -500) return;

        const cardHeight = rowHeightRef.current;
        if (!cardHeight) return;

        // Work out how many items are safely above the fold
        const colCount = getColCount(gridRef.current);
        const rowsAbove = Math.floor(Math.abs(gridTop) / cardHeight) - 2; // keep 2 buffer rows
        const itemsToSkip = Math.max(0, rowsAbove * colCount);
        const newSkip = skipCount + Math.min(itemsToSkip - skipCount, 40); // prune in batches

        if (newSkip > skipCount) {
            setSkipCount(newSkip);
        }
    }, [shouldPrune, items.length, skipCount, maxRendered]);

    useEffect(() => {
        if (!shouldPrune) return;
        const onScroll = () => prune();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [prune, shouldPrune]);

    // Compute top spacer height from pruned items
    const spacerHeight = useSpacerHeight(skipCount, gridRef, rowHeightRef);

    const visibleItems = shouldPrune ? items.slice(skipCount) : items;

    if (!items.length && !isFetchingNextPage) {
        return <>{emptyState ?? null}</>;
    }

    return (
        <div className={cn("relative w-full", className)}>
            {/* Top spacer to compensate for pruned items */}
            {skipCount > 0 && (
                <div
                    ref={spacerRef}
                    aria-hidden
                    style={{ height: spacerHeight }}
                />
            )}

            <div ref={gridRef} className={gridClassName}>
                {visibleItems.map((item, i) => (
                    <div
                        key={keyExtractor(item, skipCount + i)}
                        data-infinite-item
                        className="w-full"
                    >
                        {renderItem(item, skipCount + i)}
                    </div>
                ))}

                {/* Skeleton loading slots */}
                {isFetchingNextPage &&
                    Array.from({ length: loadingSlots }).map((_, i) => (
                        <GalleryCardSkeleton key={`skeleton-${i}`} />
                    ))}
            </div>

            {/* Sentinel — IntersectionObserver target */}
            <div
                ref={sentinelRef}
                aria-hidden
                className="h-px w-full"
            />

            {!hasNextPage && !isFetchingNextPage && items.length > 0 && endMessage && (
                <div className="mt-6">{endMessage}</div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getColCount(gridEl: HTMLElement): number {
    const style = window.getComputedStyle(gridEl);
    const cols = style.getPropertyValue("grid-template-columns");
    return cols.split(" ").filter(Boolean).length || 1;
}

function useSpacerHeight(
    skipCount: number,
    gridRef: React.RefObject<HTMLDivElement | null>,
    rowHeightRef: React.RefObject<number>,
): number {
    if (skipCount === 0 || !gridRef.current) return 0;
    const colCount = getColCount(gridRef.current);
    const skippedRows = Math.ceil(skipCount / colCount);
    // +gap compensation: assume gap-3 = 12px
    return skippedRows * (rowHeightRef.current + 12);
}

// ---------------------------------------------------------------------------
// Skeleton card — mirrors GalleryCard aspect ratio
// ---------------------------------------------------------------------------
function GalleryCardSkeleton() {
    return (
        <div className="w-full aspect-gallery rounded-1xl bg-muted animate-pulse" />
    );
}