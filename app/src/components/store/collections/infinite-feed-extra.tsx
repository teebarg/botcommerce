import { useVirtualizer } from '@tanstack/react-virtual';
import { memo, useMemo, useRef } from 'react';
import ProductCard from '../products/product-card-revamped';
import { useProductFeed } from '@/hooks/useProduct';
import { FeedQuery, ProductFeed } from '@/schemas';

// Memoize the card to prevent re-renders when other cards in the feed change
const MemoizedProductCard = memo(ProductCard);

interface Props {
    initialData?: ProductFeed | null;
    params?: FeedQuery;
}

export default function InfiniteFeed({ initialData, params }: Props) {
    const parentRef = useRef<HTMLDivElement>(null);
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useProductFeed(initialData || null, params);

    const products = useMemo(() =>
        data?.pages?.flatMap((page) => page.products) ?? (initialData?.products ?? []),
    [data, initialData]);

    // Calculate grid layout dynamically based on breakpoints
    // Note: Use a resize observer if the columns change often,
    // or simply hardcode based on your Tailwind config.
    const columnCount = 4;
    const rowCount = Math.ceil(products.length / columnCount);

    const rowVirtualizer = useVirtualizer({
        count: hasNextPage ? rowCount + 1 : rowCount,
        getScrollElement: () => parentRef.current,
        // Set a fixed height that includes card + gap.
        // Ensure your CSS accounts for the exact same height.
        estimateSize: () => 400,
        overscan: 5,
    });

    return (
        <div ref={parentRef} className="h-screen overflow-auto contain-strict">
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                    <div
                        key={virtualRow.key}
                        style={{
                            position: 'absolute', // This is for the virtualizer to place the row
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualRow.start}px)`, // Vertical offset
                        }}
                        // The container of the row MUST have the grid classes
                        className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-4 px-1.5"
                    >
                        {/* Do NOT use absolute positioning on the cards themselves */}
                        {products
                            .slice(virtualRow.index * 4, (virtualRow.index + 1) * 4)
                            .map((product) => (
                                <div key={product.id}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                    </div>
                ))}
                {/* {rowVirtualizer.getVirtualItems().map((virtualRow: any) => {
                    const rowItems = products.slice(
                        virtualRow.index * columnCount,
                        (virtualRow.index + 1) * columnCount
                    );

                    return (
                        <div
                            key={virtualRow.key}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4"
                        >
                            {rowItems.map((product) => (
                                <MemoizedProductCard key={product.id} product={product} />
                            ))}

                            {virtualRow.index === rowCount && (
                                <div className="col-span-full py-10 text-center">
                                    Loading more...
                                </div>
                            )}
                        </div>
                    );
                })} */}
            </div>
        </div>
    );
}