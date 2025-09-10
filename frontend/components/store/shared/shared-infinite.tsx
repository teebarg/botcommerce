"use client";

import ProductCard from "@/components/store/products/product-card2";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { api } from "@/apis/client";
import { Catalog, ProductSearch } from "@/schemas";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FilterSidebar } from "@/components/store/shared/filter-sidebar";
import { Button } from "@/components/ui/button";
import { Grid3X3, LayoutList, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import Overlay from "@/components/overlay";
import { useOverlayTriggerState } from "@react-stately/overlays";
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
        queryKey: ["shared-collections", slug, "infinite", pageSize],
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
        <>
            <div className="min-h-screen bg-background">
                <main className="container mx-auto px-2 py-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold mb-2">Search results for</h1>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-3xl font-bold">"MENS SHORTS"</span>
                        </div>
                        <p className="text-muted-foreground">{totalProducts} Products</p>
                    </div>

                    <div className="flex gap-6">
                        <aside className="hidden lg:block w-64 flex-shrink-0">
                            <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto">
                                <FilterSidebar />
                            </div>
                        </aside>

                        <div className="flex-1">
                            <div className="sticky top-16 z-50 bg-background border-b border-border mb-6 lg:hidden py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="rounded-full px-4 py-2 flex items-center gap-2 bg-content2 flex-1">
                                        <div className={cn("rounded-full flex flex-1 items-center justify-center py-2", viewMode === "grid" ? "bg-content3" : "bg-content2")}>
                                            <Button
                                                variant={viewMode === "grid" ? "default" : "outline"}
                                                size="iconOnly"
                                                className="rounded-lg"
                                                onClick={() => setViewMode("grid")}
                                            >
                                                <Grid3X3 className="h-6 w-6" />
                                            </Button>
                                        </div>
                                        <div className={cn("rounded-full flex flex-1 items-center justify-center py-2", viewMode === "list" ? "bg-content3" : "bg-content2")}>
                                            <Button
                                                variant={viewMode === "list" ? "default" : "outline"}
                                                size="iconOnly"
                                                className="rounded-lg"
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
                                                <Button variant="transparent" className="flex items-center gap-2 rounded-lg">
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

                            {/* Desktop Sort & View Controls */}
                            <div className="hidden lg:flex items-center justify-between mb-6">
                                <p className="text-sm text-muted-foreground">Showing {totalProducts} products</p>

                                <div className="flex items-center gap-2">
                                    <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                    <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
                                        <LayoutList className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className={`${viewMode === "grid" ? "grid grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-4"}`}>
                                {products.map((product: ProductSearch) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product, idx) => {
                    const isLast = idx === products.length - 1;
                    return (
                        <div key={`${product.id}-${idx}`} ref={isLast ? (lastElementRef as any) : undefined}>
                            <ProductCard product={product} />
                        </div>
                    );
                })}
                {query.isFetchingNextPage && <div className="col-span-full text-center py-4 text-default-500">Loading...</div>}
            </div>
        </>
    );
}
