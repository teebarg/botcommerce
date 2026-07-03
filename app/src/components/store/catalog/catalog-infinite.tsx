import { useInfiniteQuery } from "@tanstack/react-query";
import type { ProductSearch, SearchCatalog } from "@/schemas";
import NoProductsFound from "@/components/store/products/no-products";
import { api } from "@/utils/api";
import { InfiniteList } from "@/components/InfiniteList";
import ProductCard from "../products/product-card-revamped";
import { PageLoader } from "@/components/generic/page-loader";

interface Props {
    slug: string;
}

export default function CatalogInfinite({ slug }: Props) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useInfiniteQuery<SearchCatalog>({
        queryKey: ["catalog", slug, "infinite"],
        queryFn: async ({ pageParam }) => {
            const res = await api.get<SearchCatalog>(`/catalog/${slug}`, { params: { cursor: pageParam ?? undefined } });
            return res;
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage: SearchCatalog) => lastPage.next_cursor ?? undefined,
    });

    const products = data?.pages.flatMap((p) => p.products) || [];

    return (
        <main className="max-w-sxl mx-auto w-full px-2 py-4">
            {isPending ? (
                <PageLoader variant="grid" />
            ): products.length > 0 ? (
                <InfiniteList hasMore={!!hasNextPage} isLoading={isFetchingNextPage} onLoadMore={fetchNextPage}>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 md:gap-4 gap-2">
                        {products?.map((product: ProductSearch) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </InfiniteList>
            ): (
                <NoProductsFound />
            )}
        </main>
    );
}
