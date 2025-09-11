"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Grid3X3, LayoutList, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import ProductCard from "@/components/store/products/product-card2";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { api } from "@/apis/client";
import { Catalog, ProductSearch } from "@/schemas";
import { FilterSidebar } from "@/components/store/shared/filter-sidebar";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";
import { cn } from "@/lib/utils";

interface Props {
    slug: string;
    initialCatalog: Catalog;
}

export default function SharedInfinite({ slug, initialCatalog }: Props) {
    const editState = useOverlayTriggerState({});
    const pageSize = initialCatalog.limit || 20;
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const query = useInfiniteQuery<Catalog>({
        queryKey: ["products", "shared-collections", slug, "infinite", pageSize],
        queryFn: async ({ pageParam = 0 }) => await api.get<Catalog>(`/shared/${slug}`, { params: { skip: pageParam, limit: pageSize } }),
        initialPageParam: 0,
        getNextPageParam: (lastPage: Catalog) => {
            const nextSkip = (lastPage.skip || 0) + (lastPage.limit || pageSize);
            const hasMore = nextSkip < (lastPage.total_count || 0);

            return hasMore ? nextSkip : undefined;
        },
        initialData: { pages: [initialCatalog], pageParams: [0] },
    });

    const products = query.data?.pages.flatMap((p) => p.products) || [];
    const totalProducts = query.data?.pages.flatMap((p) => p.total_count) || 0;

    const { lastElementRef } = useInfiniteScroll({
        onIntersect: () => {
            if (query.hasNextPage && !query.isFetchingNextPage) {
                query.fetchNextPage();
            }
        },
        isFetching: query.isFetchingNextPage,
    });

    if (!products.length) return <div>No products in this collection.</div>;

    return (
        <main className="container mx-auto px-2 py-6">
            <div className="flex gap-6">
                <aside className="hidden lg:block w-80 flex-shrink-0">
                    <div className="sticky top-24 max-h-[calc(100vh-5rem)] overflow-y-auto">
                        <FilterSidebar />
                    </div>
                </aside>

                <div className="flex-1">
                    <div className="sticky top-16 z-50 bg-background border-b border-border mb-6 lg:hidden py-4">
                        <div className="flex items-center justify-center gap-2">
                            <div className="rounded-full px-4 py-2 flex items-center gap-2 bg-content2 flex-1">
                                <div
                                    className={cn(
                                        "rounded-full flex flex-1 items-center justify-center py-2",
                                        viewMode === "grid" ? "bg-content3" : "bg-content2"
                                    )}
                                >
                                    <Button
                                        className="rounded-lg"
                                        size="iconOnly"
                                        variant={viewMode === "grid" ? "default" : "outline"}
                                        onClick={() => setViewMode("grid")}
                                    >
                                        <Grid3X3 className="h-6 w-6" />
                                    </Button>
                                </div>
                                <div
                                    className={cn(
                                        "rounded-full flex flex-1 items-center justify-center py-2",
                                        viewMode === "list" ? "bg-content3" : "bg-content2"
                                    )}
                                >
                                    <Button
                                        className="rounded-lg"
                                        size="iconOnly"
                                        variant={viewMode === "list" ? "default" : "outline"}
                                        onClick={() => setViewMode("list")}
                                    >
                                        <LayoutList className="h-6 w-6" />
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-full px-4 py-2 bg-content2 flex-1 flex justify-center">
                                <Overlay
                                    open={editState.isOpen}
                                    title="Edit Brand"
                                    trigger={
                                        <Button className="flex items-center gap-2 rounded-lg" variant="transparent">
                                            <SlidersHorizontal className="h-4 w-4" />
                                            FILTER & SORT
                                        </Button>
                                    }
                                    onOpenChange={editState.setOpen}
                                >
                                    <FilterSidebar />
                                </Overlay>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center justify-between mb-6">
                        <p className="text-sm text-muted-foreground">Showing {totalProducts} products</p>
                    </div>

                    <div className={`${viewMode === "grid" ? "grid grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-4"}`}>
                        {products.map((product: ProductSearch, idx: number) => {
                            const isLast = idx === products.length - 1;

                            return (
                                <div key={`${product.id}-${idx}`} ref={isLast ? (lastElementRef as any) : undefined}>
                                    <ProductCard product={product} />
                                </div>
                            );
                        })}
                    </div>
                    {query.isFetchingNextPage && <div className="col-span-full text-center py-4 text-default-500">Loading...</div>}
                </div>
            </div>
        </main>
    );
}
