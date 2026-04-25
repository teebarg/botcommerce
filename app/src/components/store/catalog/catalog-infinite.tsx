import { useInfiniteQuery } from "@tanstack/react-query";
import type { ProductSearch, SearchCatalog } from "@/schemas";
import { useSearch } from "@tanstack/react-router";
import NoProductsFound from "@/components/store/products/no-products";
import { clientApi } from "@/utils/api.client";
import { InfiniteList } from "@/components/InfiniteList";
import ProductCardPLP from "../products/product-card-plp";

interface Props {
    slug: string;
    initialData: SearchCatalog;
}

export default function CatalogInfinite({ slug, initialData }: Props) {
    const search = useSearch({
        strict: false,
    });

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<SearchCatalog>({
        queryKey: ["products", "catalog", slug, JSON.stringify(search)],
        queryFn: async ({ pageParam }) => {
            const res = await clientApi.get<SearchCatalog>(`/catalog/${slug}`, { params: { slug, ...search, cursor: pageParam ?? undefined } });
            return res;
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage: SearchCatalog) => lastPage.next_cursor ?? undefined,
        staleTime: 1000 * 60 * 30,
        refetchOnMount: false,
        initialData: initialData
            ? {
                  pages: [initialData],
                  pageParams: [undefined],
              }
            : undefined,
        initialDataUpdatedAt: initialData ? Date.now() : undefined,
    });

    const products = data?.pages.flatMap((p) => p.products) || [];
    const hasProducts = products.length > 0;

    return (
        <main className="max-w-8xl mx-auto w-full px-2 py-4">
            {!hasProducts && <NoProductsFound />}
            {hasProducts && (
                <InfiniteList hasMore={!!hasNextPage} isLoading={isFetchingNextPage} onLoadMore={fetchNextPage}>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 md:gap-4 gap-2">
                        {products?.map((product: ProductSearch, idx: number) => (
                            <ProductCardPLP key={product.id + product.slug + idx} product={product} />
                        ))}
                    </div>
                </InfiniteList>
            )}
        </main>
    );
}
