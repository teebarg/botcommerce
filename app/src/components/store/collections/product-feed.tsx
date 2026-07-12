import { InfiniteList } from "@/components/InfiniteList";
import { FeedQuery, ProductSearch } from "@/schemas";
import ProductCard from "@/components/store/products/product-card-revamped";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { productFeedInfiniteQuery } from "@/queries/user.queries";

interface Props {
    params?: FeedQuery;
}

export function ProductFeed({ params }: Props) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useSuspenseInfiniteQuery(
        productFeedInfiniteQuery(params)
    );

    const products = data.pages.flatMap(page => page.products);
    return (
        <InfiniteList hasMore={!!hasNextPage} isLoading={isFetchingNextPage} onLoadMore={fetchNextPage}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-2 gap-1.5">
                {products?.map((product: ProductSearch, idx: number) => (
                    <ProductCard key={idx} product={product} />
                ))}
            </div>
        </InfiniteList>
    );
}