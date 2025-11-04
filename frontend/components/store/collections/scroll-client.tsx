"use client";

import React, { useState } from "react";
import { Loader } from "lucide-react";

import MobileFilterControl from "@/components/store/shared/mobile-filter-control";
import { CollectionHeader } from "@/components/store/collections/collection-header";
import NoProductsFound from "@/components/store/products/no-products";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { Collection, ProductSearch } from "@/schemas/product";
import { useProductInfiniteSearch } from "@/lib/hooks/useProduct";
import ClientOnly from "@/components/generic/client-only";
import ProductCardListings from "@/components/store/products/product-card-listings";
import { FilterSidebar } from "@/components/store/shared/filter-sidebar";
import SaleBanner from "@/components/store/sale-banner";

interface SearchParams {
    sortBy?: string;
    cat_ids?: string;
    maxPrice?: string;
    minPrice?: string;
    search?: string;
    limit?: number;
}

interface Props {
    initialSearchParams: SearchParams;
    collection?: Collection;
    initialData?: ProductSearch[];
}

export default function InfiniteScrollClient({ initialSearchParams, initialData }: Props) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useProductInfiniteSearch({ ...initialSearchParams, show_facets: true });

    const { lastElementRef } = useInfiniteScroll({
        onIntersect: () => {
            if (!isFetchingNextPage && hasNextPage) {
                fetchNextPage();
            }
        },
        isFetching: isFetchingNextPage,
    });

    const products = data?.pages?.flatMap((page) => page.products) ?? initialData;
    const facets = data?.pages?.[0]?.facets || {};

    return (
        <div className="flex gap-6">
            <aside className="hidden lg:block w-96 shrink-0">
                <div className="sticky top-24 max-h-[calc(100vh-5rem)] overflow-y-auto">
                    <FilterSidebar facets={facets} />
                </div>
            </aside>
            <div className="w-full flex-1 flex-col relative">
                <SaleBanner />
                <CollectionHeader />
                <div className="w-full">
                    <MobileFilterControl facets={facets} setViewMode={setViewMode} viewMode={viewMode} />
                    <main className="w-full overflow-visible px-2 md:px-1 md:rounded-xl py-4 min-h-[50vh]">
                        <ProductCardListings className="w-full pb-4" products={products!} viewMode={viewMode} />
                        {products?.length == 0 && <NoProductsFound />}
                    </main>
                </div>
                <ClientOnly>
                    <div className="w-full absolute bottom-52">{hasNextPage && <div ref={lastElementRef} className="h-2" />}</div>
                </ClientOnly>
                {isFetchingNextPage && (
                    <div className="flex flex-col items-center justify-center text-blue-600">
                        <Loader className="h-8 w-8 animate-spin mb-2" />
                        <p className="text-sm font-medium text-muted-foreground">Loading more products...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
