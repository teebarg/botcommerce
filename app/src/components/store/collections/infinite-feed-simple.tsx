import { useEffect, useRef, useState, useMemo } from "react";
// import ProductCard from "../products/product-card-revamped";
import { useProductFeed } from "@/hooks/useProduct";
import { FeedQuery, ProductFeed } from "@/schemas";
import ProductCard from "../products/product-card-skin";

interface Props {
    initialData?: ProductFeed | null;
    params?: FeedQuery;
}

export default function InfiniteFeed({ initialData, params }: Props) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useProductFeed(initialData || null, params);
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Flatten data: O(n) but happens only when page data changes
    const products = useMemo(() =>
        data?.pages?.flatMap((page) => page.products) ?? (initialData?.products ?? []),
    [data, initialData]);

    // Intersection Observer to trigger next page
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }, { rootMargin: '400px' }); // Load early before user hits the bottom

        const currentSentinel = sentinelRef.current;
        if (currentSentinel) observer.observe(currentSentinel);

        return () => {
            if (currentSentinel) observer.unobserve(currentSentinel);
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <div className="w-full">
            {/* Native Grid: No absolute positioning, perfectly responsive */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 md:gap-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {/* Sentinel at the bottom */}
            <div ref={sentinelRef} className="h-10 w-full" />

            {/* Loading indicator */}
            {isFetchingNextPage && (
                <div className="py-10 text-center">Loading more products...</div>
            )}
        </div>
    );
}