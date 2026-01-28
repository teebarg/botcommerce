import { useRef, useState } from "react";

import MobileFilterControl from "@/components/store/shared/mobile-filter-control";
import { CollectionHeader } from "@/components/store/collections/collection-header";
import NoProductsFound from "@/components/store/products/no-products";
import { useProductInfiniteSearch } from "@/hooks/useProduct";
import ProductCardListings from "@/components/store/products/product-card-listings";
import SaleBanner from "@/components/store/sale-banner";
import { useSearch } from "@tanstack/react-router";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import { CollectionTemplateSkeleton } from "./skeleton";
import { Loader } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import ProductCardSocial from "../products/product-card-social";
import { ProductSearch } from "@/schemas";
import { FilterSidebarLogic, FilterSidebarRef } from "../shared/filter-sidebar-logic";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface Props {
    collection_slug?: string;
    searchTerm?: string;
    initialData: any;
}

export default function SocialInfiniteScrollClient({ initialData, collection_slug, searchTerm }: Props) {
    const sidebarRef = useRef<FilterSidebarRef>(null);
    const isMobile = useIsMobile();
    const search = useSearch({
        strict: false,
    });
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useProductInfiniteSearch(initialData, {
        ...search,
        show_facets: true,
        collections: collection_slug,
        search: searchTerm,
    });

    if (isLoading) {
        return <CollectionTemplateSkeleton />;
    }
    const products = data?.pages?.flatMap((page) => page.products) ?? initialData;
    const facets = data?.pages?.[0]?.facets || {};

    const hasProducts = products.length > 0;

    if (isMobile) {
        return (
            <div>
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
                        className="h-[calc(100dvh-64px-88px)]! w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
                    >
                        {products.map((product: ProductSearch) => (
                            <ProductCardSocial key={product.id} product={product} facets={facets} />
                        ))}
                    </InfiniteScroll>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-9xl mx-auto w-full py-4 px-2">
            <div className="flex gap-6">
                <aside className="h-[calc(100vh-5rem)] w-96 flex flex-col overflow-hidden sticky top-24">
                    <div className="flex items-center justify-between w-full">
                        <h2 className="font-semibold">FILTER & SORT</h2>
                        <Button
                            className="text-primary px-0 justify-end hover:bg-transparent"
                            variant="ghost"
                            onClick={() => sidebarRef.current?.clear()}
                        >
                            Clear All
                        </Button>
                    </div>
                    <ScrollArea className="flex-1">
                        <FilterSidebarLogic ref={sidebarRef} facets={facets} />
                    </ScrollArea>
                    <div className="flex justify-center gap-2 p-4 mt-2 border-t border-border">
                        <Button className="w-full rounded-full py-6" onClick={() => sidebarRef.current?.apply()}>
                            Apply
                        </Button>
                        <Button className="w-full rounded-full py-6" variant="destructive" onClick={() => sidebarRef.current?.clear()}>
                            Clear
                        </Button>
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
                            >
                                <ProductCardListings className="w-full pb-4" products={products!} viewMode={viewMode} />
                            </InfiniteScroll>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
