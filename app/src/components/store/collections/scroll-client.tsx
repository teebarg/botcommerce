import { useRef } from "react";
import { CollectionHeader } from "@/components/store/collections/collection-header";
import NoProductsFound from "@/components/store/products/no-products";
import { useProductFeed } from "@/hooks/useProduct";
import ProductCardListings from "@/components/store/products/product-card-listings";
import SaleBanner from "@/components/store/sale-banner";
import { useSearch } from "@tanstack/react-router";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import { CollectionTemplateSkeleton } from "./skeleton";
import { Loader } from "lucide-react";
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

export default function InfiniteScrollClient({ initialData, collection_slug, searchTerm }: Props) {
    const sidebarRef = useRef<FilterSidebarRef>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const search = useSearch({
        strict: false,
    });
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useProductFeed(initialData, {
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

    return (
        <div>
            <div className="hidden md:block max-w-8xl mx-auto w-full py-4 px-2">
                <div className="flex gap-6">
                    <aside className="h-[calc(100vh-6rem)] w-96 flex flex-col overflow-hidden sticky top-24">
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
                        <ScrollArea className="flex-1 px-2">
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
                    <div className="flex-1 relative">
                        <SaleBanner />
                        <CollectionHeader />
                        <main className="w-full px-1 rounded-xl py-4">
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
                                    scrollRef={scrollRef}
                                >
                                    <ProductCardListings className="w-full pb-4" products={products!} />
                                </InfiniteScroll>
                            )}
                        </main>
                    </div>
                </div>
            </div>

            <div className="block md:hidden">
                {!isLoading && !hasProducts && <NoProductsFound />}
                {!isLoading && hasProducts && (
                    <InfiniteScroll
                        scrollRef={scrollRef}
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
                        {products?.map((product: ProductSearch, idx: number) => (
                            <ProductCardSocial key={product.id + product.slug + idx} product={product} facets={facets} scrollRef={scrollRef} />
                        ))}
                    </InfiniteScroll>
                )}
            </div>
        </div>
    );
}
