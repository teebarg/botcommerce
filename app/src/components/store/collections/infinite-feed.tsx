import { useProductFeed } from "@/hooks/useProduct";
import { FeedQuery, ProductFeed, ProductSearch } from "@/schemas";
import { InfiniteList } from "@/components/InfiniteList";
import NoProductsFound from "../products/no-products";
import { useMemo } from "react";
import ProductCardPLP from "../products/product-card-plp";

interface Props {
    initialData?: ProductFeed | null;
    params?: FeedQuery;
}

export default function InfiniteFeed({ initialData, params }: Props) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useProductFeed(initialData || null, params);
    const products = useMemo(() => {
        return data?.pages?.flatMap((page) => page.products) ?? (initialData ? initialData.products : []);
    }, [data, initialData]);
    const hasProducts = products.length > 0;

    if (!hasProducts) {
        return <NoProductsFound />
    }

    return (
        <InfiniteList hasMore={!!hasNextPage} isLoading={isFetchingNextPage} onLoadMore={fetchNextPage}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4 gap-1.5">
                {products?.map((product: ProductSearch, idx: number) => (
                    <ProductCardPLP key={idx} product={product} />
                ))}
            </div>
        </InfiniteList>
    );
}
