import { useMemo } from "react";
import ProductCard from "../products/product-card-revamped";
import { useProductFeed } from "@/hooks/useProduct";
import { FeedQuery, ProductFeed, ProductSearch } from "@/schemas";
import { InfiniteGrid } from "@/components/infinite-list/infiniteGrid";
import EmptyState from "@/components/generic/empty";
import { Package } from "lucide-react";

interface Props {
    initialData?: ProductFeed | null;
    params?: FeedQuery;
}

export default function InfiniteFeed({ initialData, params }: Props) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useProductFeed(initialData || null, params);

    // Flatten data: O(n) but happens only when page data changes
    const items = useMemo(() =>
        data?.pages?.flatMap((page) => page.products) ?? (initialData?.products ?? []),
        [data, initialData]);

    return (
        <InfiniteGrid
            items={items}
            keyExtractor={(product) => product.id}
            renderItem={(product: ProductSearch) => (
                <ProductCard
                    product={product}
                />
            )}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            // Gallery-specific grid layout
            gridClassName="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
            // Pre-fetch 2 viewport heights ahead
            rootMargin="800px"
            // Keep ~160 cards rendered at once (40 rows @ 4 cols)
            maxRendered={160}
            loadingSlots={8}
            emptyState={<EmptyState
                icon={Package}
                title="No orders yet"
                description={`Your orders will appear here when they are available`}
            />}
            endMessage={
                <p className="text-center text-sm text-muted-foreground py-8">
                    All {items.length} images loaded
                </p>
            }
        />
    )
}