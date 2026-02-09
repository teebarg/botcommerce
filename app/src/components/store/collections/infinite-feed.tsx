import { useProductFeed } from "@/hooks/useProduct";
import { CollectionTemplateSkeleton } from "./skeleton";
import { ProductSearch } from "@/schemas";
import { InfiniteList } from "@/components/InfiniteList";
import ProductCardLight from "../products/product-card-light";

export default function InfiniteFeed() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useProductFeed(null);

    if (isLoading) {
        return <CollectionTemplateSkeleton />;
    }
    const products = data?.pages?.flatMap((page) => page.products) ?? [];

    return (
        <InfiniteList
            hasMore={!!hasNextPage}
            isLoading={isFetchingNextPage}
            onLoadMore={fetchNextPage}
            // endMessage={<p className="py-12 text-center text-muted-foreground">You’ve reached the end ✨</p>}
        >
            <div className="grid grid-cols-2 md:grid-cols-6 px-2 md:gap-4 gap-2">
                {products.map((product: ProductSearch, idx: number) => (
                    <ProductCardLight key={product.id + product.name + idx + "-mobile"} product={product} />
                ))}
            </div>
        </InfiniteList>
    );
}
