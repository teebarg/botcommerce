import { useState } from "react";

import MobileFilterControl from "@/components/store/shared/mobile-filter-control";
import { CollectionHeader } from "@/components/store/collections/collection-header";
import NoProductsFound from "@/components/store/products/no-products";
import { Collection } from "@/schemas/product";
import { useProductInfiniteSearch, useProductInfiniteSearch1 } from "@/hooks/useProduct";
import ProductCardListings from "@/components/store/products/product-card-listings";
import { FilterSidebar } from "@/components/store/shared/filter-sidebar";
import SaleBanner from "@/components/store/sale-banner";
import { useSearch } from "@tanstack/react-router";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import { CollectionTemplateSkeleton } from "./skeleton";
import { Loader } from "lucide-react";

interface Props {
    collection?: Collection;
    searchTerm?: string;
    initialData: any;
}

export default function InfiniteScrollClient({ initialData, collection, searchTerm }: Props) {
    const search = useSearch({
        strict: false,
    });
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useProductInfiniteSearch1(initialData, {
        ...search,
        show_facets: true,
        collections: collection?.slug,
        search: searchTerm,
    });

    if (isLoading) {
        return <CollectionTemplateSkeleton />;
    }

    if (isError) {
        return <div className="p-4 bg-red-50 text-red-800 rounded">Error loading products: {error.message}</div>;
    }

    const products = data?.pages?.flatMap((page) => page.products) ?? initialData;
    const facets = data?.pages?.[0]?.facets || {};

    const hasProducts = products.length > 0;

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
                <MobileFilterControl facets={facets} setViewMode={setViewMode} viewMode={viewMode} />
                <main className="w-full px-2 md:px-1 md:rounded-xl py-4 min-h-[50vh]">
                    {!isLoading && !hasProducts && <NoProductsFound />}
                    {!isLoading && hasProducts && (
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
                            <ProductCardListings className="w-full pb-4" products={products!} viewMode={viewMode} />
                        </InfiniteScroll>
                    )}
                </main>
            </div>
        </div>
    );
}
