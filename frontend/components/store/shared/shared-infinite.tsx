"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Grid3X3 } from "lucide-react";
import { useState } from "react";

import MobileFilterControl from "./mobile-filter-control";

import ProductCard from "@/components/store/products/product-card";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { api } from "@/apis/client";
import { Catalog, ProductSearch } from "@/schemas";
import { FilterSidebar } from "@/components/store/shared/filter-sidebar";
import { Button } from "@/components/ui/button";
import { useUpdateQuery } from "@/lib/hooks/useUpdateQuery";
import { SortOptions } from "@/types/models";
import { cn } from "@/lib/utils";

interface SearchParams {
    sortBy?: SortOptions;
    sizes?: string;
    colors?: string;
    maxPrice?: string;
    minPrice?: string;
    limit?: number;
}

interface Props {
    slug: string;
    initialCatalog: Catalog;
    initialSearchParams: SearchParams;
}

export default function SharedInfinite({ slug, initialCatalog, initialSearchParams }: Props) {
    const pageSize = initialCatalog.limit || 20;
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");

    const { updateQuery } = useUpdateQuery();

    const onClearAll = () => {
        updateQuery([
            { key: "sortBy", value: "id:desc" },
            { key: "sizes", value: "" },
            { key: "colors", value: "" },
        ]);
    };

    const query = useInfiniteQuery<Catalog>({
        queryKey: ["product", "catalog", slug, JSON.stringify(initialSearchParams)],
        queryFn: async ({ pageParam = 0 }) => await api.get<Catalog>(`/shared/${slug}`, { params: { skip: pageParam, ...initialSearchParams } }),
        initialPageParam: 0,
        getNextPageParam: (lastPage: Catalog) => {
            const nextSkip = (lastPage.skip || 0) + (lastPage.limit || pageSize);
            const hasMore = nextSkip < (lastPage.total_count || 0);

            return hasMore ? nextSkip : undefined;
        },
        initialData: { pages: [initialCatalog], pageParams: [0] },
    });

    const products = query.data?.pages.flatMap((p) => p.products) || [];
    const totalProducts = query.data?.pages[0].total_count || 0;

    const { lastElementRef } = useInfiniteScroll({
        onIntersect: () => {
            if (query.hasNextPage && !query.isFetchingNextPage) {
                query.fetchNextPage();
            }
        },
        isFetching: query.isFetchingNextPage,
    });

    return (
        <main className="w-full py-2">
            <div className="flex gap-6">
                <aside className="hidden lg:block w-80 flex-shrink-0">
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
                            <Button variant="indigo" onClick={onClearAll}>
                                Clear all filters
                            </Button>
                        </div>
                    )}

                    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4", viewMode === "grid" ? "" : "grid-cols-1")}>
                        {products.map((product: ProductSearch, idx: number) => {
                            const isLast = idx === products.length - 1;

                            return (
                                <div key={`${product.id}-${idx}`} ref={isLast ? (lastElementRef as any) : undefined}>
                                    <ProductCard product={product} />
                                </div>
                            );
                        })}
                    </div>
                    {query.isFetchingNextPage && <div className="col-span-full text-center py-4 text-muted-foreground">Loading...</div>}
                </div>
            </div>
        </main>
    );
}
