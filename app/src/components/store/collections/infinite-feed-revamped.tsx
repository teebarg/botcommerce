import { useMemo, useRef, useEffect, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import NoProductsFound from "../products/no-products";
import { useProductFeed } from "@/hooks/useProduct";
import { FeedQuery, ProductFeed, ProductSearch } from "@/schemas";
import ProductCard from "../products/product-card-revamped";
import ProductCardPLP from "../products/product-card-plp";

// Helper hook to track column counts mirroring your Tailwind classes
function useGridColumns() {
    const [columns, setColumns] = useState(2); // mobile default: grid-cols-2

    useEffect(() => {
        if (typeof window === "undefined") return;
        const handleResize = () => {
            const width = window.innerWidth;
            if (width >= 1024) setColumns(4);      // lg:grid-cols-4
            else if (width >= 768) setColumns(3);  // md:grid-cols-3
            else setColumns(2);                    // default mobile
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return columns;
}

interface Props {
    initialData?: ProductFeed | null;
    params?: FeedQuery;
}

export default function InfiniteFeed({ initialData, params }: Props) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useProductFeed(initialData || null, params);
    const columns = useGridColumns();
    const containerRef = useRef<HTMLDivElement>(null);

    // Flatten data fallback
    const products = useMemo(() => {
        return data?.pages?.flatMap((page) => page.products) ?? (initialData ? initialData.products : []);
    }, [data, initialData]);

    // Group items into rows depending on column count
    const rows = useMemo(() => {
        const result = [];
        for (let i = 0; i < products.length; i += columns) {
            result.push(products.slice(i, i + columns));
        }
        return result;
    }, [products, columns]);

    const hasProducts = products.length > 0;

    // Window Virtualizer handles scrolling on the global document level
    const rowVirtualizer = useWindowVirtualizer({
        count: rows.length,
        estimateSize: () => 320, // Estimated height of your row/ProductCard in pixels
        overscan: 3,            // Extra rows rendered outside viewport boundary
        scrollMargin: containerRef.current?.offsetTop ?? 0,
    });

    // Infinite Loading Trigger: Triggers when the user is close to rendering the final rows
    useEffect(() => {
        const virtualItems = rowVirtualizer.getVirtualItems();
        if (virtualItems.length === 0) return;

        const lastItemIndex = virtualItems[virtualItems.length - 1].index;
        // Trigger fetch when user is 3 rows away from the end
        if (lastItemIndex >= rows.length - 3 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [rows.length, hasNextPage, isFetchingNextPage, rowVirtualizer.getVirtualItems(), fetchNextPage]);

    if (!hasProducts) {
        return <NoProductsFound />;
    }

    return (
        <div ref={containerRef} className="w-full">
            {/* The absolute-positioned virtual container */}
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const rowItems = rows[virtualRow.index];
                    return (
                        <div
                            key={virtualRow.key}
                            data-index={virtualRow.index}
                            ref={rowVirtualizer.measureElement} // Auto-calculates row height if variable
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4 gap-1.5"
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
                            }}
                        >
                            {rowItems.map((product: ProductSearch, idx: number) => (
                                <ProductCard key={product.id || idx} product={product} />
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Bottom Status Indicators */}
            {isFetchingNextPage && (
                <div className="py-10 text-center text-muted-foreground">Loading…</div>
            )}
        </div>
    );
}