import { useProductFeed } from "@/hooks/useProduct";
import { CollectionTemplateSkeleton } from "./skeleton";
import { ProductSearch } from "@/schemas";
import { InfiniteList } from "@/components/InfiniteList";
import ProductCardPLP from "../products/product-card-plp";

export default function InfiniteFeed() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useProductFeed(null);

    if (isPending) {
        return <CollectionTemplateSkeleton />;
    }
    const products = data?.pages?.flatMap((page) => page.products) ?? [];

    return (
        <InfiniteList
            hasMore={!!hasNextPage}
            isLoading={isFetchingNextPage}
            onLoadMore={fetchNextPage}
        >
            <div className="grid grid-cols-2 md:grid-cols-6 px-2 md:gap-4 gap-2">
                {products?.map((product: ProductSearch, idx: number) => (
                    <ProductCardPLP key={product.id + product.slug + idx} product={product} />
                ))}
            </div>
        </InfiniteList>
    );
}
