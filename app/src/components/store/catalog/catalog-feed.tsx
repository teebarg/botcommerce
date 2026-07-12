import { InfiniteList } from "@/components/InfiniteList";
import { ProductSearch } from "@/schemas";
import ProductCard from "@/components/store/products/product-card-revamped";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { catalogInfiniteQuery } from "@/queries/user.queries";
import NoProductsFound from "@/components/store/products/no-products";

interface Props {
    slug: string;
}

export function CatalogFeed({ slug }: Props) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useSuspenseInfiniteQuery(
        catalogInfiniteQuery(slug)
    );

    const products = data.pages.flatMap(page => page.products);
    if (products.length === 0) {
        return <NoProductsFound />;
    }
    return (
        <InfiniteList hasMore={!!hasNextPage} isLoading={isFetchingNextPage} onLoadMore={fetchNextPage}>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                {products?.map((product: ProductSearch) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </InfiniteList>
    )
}