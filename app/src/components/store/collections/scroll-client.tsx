import { useRef } from "react";
import NoProductsFound from "@/components/store/products/no-products";
import { useProductFeed } from "@/hooks/useProduct";
import { useSearch } from "@tanstack/react-router";
import { ProductSearch } from "@/schemas";
import { FilterSidebarLogic, FilterSidebarRef } from "../catalog/filter-sidebar-logic";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { InfiniteList } from "@/components/InfiniteList";
import ProductCardPLP from "../products/product-card-plp";

interface Props {
    collection_slug?: string;
    searchTerm?: string;
    initialData: any;
}

export default function InfiniteScrollClient({ initialData, collection_slug, searchTerm }: Props) {
    const sidebarRef = useRef<FilterSidebarRef>(null);
    const search = useSearch({
        strict: false,
    });
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useProductFeed(initialData, {
        ...search,
        // show_facets: true,
        collections: collection_slug,
        search: searchTerm,
    });
    const products = data?.pages?.flatMap((page) => page.products) ?? initialData;
    const facets = data?.pages?.[0]?.facets || {};

    const hasProducts = products.length > 0;

    return (
        <div className="max-w-8xl mx-auto w-full py-4 px-2">
            <div className="flex gap-6">
                <aside className="h-[calc(100vh-6rem)] w-96 hidden md:flex flex-col overflow-hidden sticky top-24">
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
                <main className="w-full flex-1 relative px-1 rounded-xl">
                    {!hasProducts && <NoProductsFound />}
                    {hasProducts && (
                        <InfiniteList hasMore={!!hasNextPage} isLoading={isFetchingNextPage} onLoadMore={fetchNextPage}>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:gap-4 gap-2">
                                {products?.map((product: ProductSearch, idx: number) => (
                                    <ProductCardPLP key={product.id + product.slug + idx} product={product} />
                                ))}
                            </div>
                        </InfiniteList>
                    )}
                </main>
            </div>
        </div>
    );
}
