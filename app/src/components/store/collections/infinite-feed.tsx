import { FeedParams, useProductFeed } from "@/hooks/useProduct";
import { ProductFeed, ProductSearch } from "@/schemas";
import { InfiniteList } from "@/components/InfiniteList";
import ProductCardPLP from "../products/product-card-plp";
import NoProductsFound from "../products/no-products";

interface Props {
    initialData?: ProductFeed | null;
    params?: FeedParams;
}

export default function InfiniteFeed({ initialData, params }: Props) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useProductFeed(initialData || null, params);
    const products = data?.pages?.flatMap((page) => page.products) ?? (initialData ? initialData.products : []);
    const hasProducts = products.length > 0;

    if (isPending) {
        return (
            <div className="flex items-center justify-center gap-1.5 pt-6" aria-live="polite">
                <span className="size-1.5 rounded-full bg-foreground/60 animate-bounce [animation-delay:-0.2s]" />
                <span className="size-1.5 rounded-full bg-foreground/60 animate-bounce [animation-delay:-0.1s]" />
                <span className="size-1.5 rounded-full bg-foreground/60 animate-bounce" />
            </div>
        )
    }


    if (!hasProducts) {
        return <NoProductsFound />
    }

    return (
        <InfiniteList hasMore={!!hasNextPage} isLoading={isFetchingNextPage} onLoadMore={fetchNextPage}>
            <div className="grid grid-cols-2 md:grid-cols-6 md:gap-4 gap-2">
                {products?.map((product: ProductSearch, idx: number) => (
                    <ProductCardPLP key={product.id + product.slug + idx} product={product} />
                ))}
            </div>
        </InfiniteList>
    );
}
