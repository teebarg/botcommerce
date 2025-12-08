import { useInfiniteQuery } from "@tanstack/react-query";
import { Grid3X3, Loader } from "lucide-react";
import { useState } from "react";

import MobileFilterControl from "./mobile-filter-control";
import ProductCard from "@/components/store/products/product-card";
import { Catalog, ProductSearch } from "@/schemas";
import { FilterSidebar } from "@/components/store/shared/filter-sidebar";
import { Button } from "@/components/ui/button";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";
import { cn } from "@/utils";
import { useSearch } from "@tanstack/react-router";
import { getCatalogFn } from "@/server/catalog.server";
import { InfiniteScroll } from "@/components/InfiniteScroll";

interface Props {
    slug: string;
    initialCatalog: Catalog;
}

export default function SharedInfinite({ slug, initialCatalog }: Props) {
    const search = useSearch({
        strict: false,
    });
    const pageSize = initialCatalog.limit || 20;
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");

    const { updateQuery } = useUpdateQuery();

    const onClearAll = () => {
        updateQuery([
            { key: "sort", value: "id:desc" },
            { key: "sizes", value: "" },
            { key: "colors", value: "" },
        ]);
    };

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<Catalog>({
        queryKey: ["product", "catalog", slug, JSON.stringify(search)],
        queryFn: ({ pageParam = 0 }) => getCatalogFn({ data: { skip: pageParam, ...search, slug } }),
        initialPageParam: 0,
        getNextPageParam: (lastPage: Catalog) => {
            const nextSkip = (lastPage.skip || 0) + (lastPage.limit || pageSize);
            const hasMore = nextSkip < (lastPage.total_count || 0);

            return hasMore ? nextSkip : undefined;
        },
        initialData: { pages: [initialCatalog], pageParams: [0] },
    });

    const products = data?.pages.flatMap((p) => p.products) || [];
    const totalProducts = data?.pages[0].total_count || 0;

    return (
        <main className="w-full py-2">
            <div className="flex gap-6">
                <aside className="hidden lg:block w-80 shrink-0">
                    <div className="sticky top-24 max-h-[calc(100vh-5rem)] overflow-y-auto">
                        <FilterSidebar />
                    </div>
                </aside>

                <div className="flex-1">
                    <MobileFilterControl setViewMode={setViewMode} viewMode={viewMode} />

                    <div className="hidden lg:flex items-center justify-between mb-6">
                        <p className="text-sm text-muted-foreground">Showing {totalProducts} products</p>
                    </div>

                    {!products.length && (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                                <Grid3X3 className="w-12 h-12 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No products found</h3>
                            <p className="text-muted-foreground mb-6 max-w-md">
                                {`We couldn't find any products matching your search criteria. Try adjusting your filters or search terms.`}
                            </p>
                            <Button onClick={onClearAll}>Clear all filters</Button>
                        </div>
                    )}

                    <InfiniteScroll
                        onLoadMore={fetchNextPage}
                        hasMore={!!hasNextPage}
                        isLoading={isFetchingNextPage}
                        loader={
                            <div className="flex flex-col items-center justify-center text-blue-600">
                                <Loader className="h-8 w-8 animate-spin mb-2" />
                                <p className="text-sm font-medium text-muted-foreground">Loading more products...</p>
                            </div>
                        }
                        endMessage={<div className="text-center py-8 text-muted-foreground">You've viewed all products</div>}
                    >
                        <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4", viewMode === "grid" ? "" : "grid-cols-1")}>
                            {products.map((product: ProductSearch, idx: number) => (
                                <div key={`product-${idx}`}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </InfiniteScroll>
                </div>
            </div>
        </main>
    );
}
