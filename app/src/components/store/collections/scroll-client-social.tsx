import { useEffect, useRef, useState } from "react";

import MobileFilterControl from "@/components/store/shared/mobile-filter-control";
import { CollectionHeader } from "@/components/store/collections/collection-header";
import NoProductsFound from "@/components/store/products/no-products";
import { useProductInfiniteSearch } from "@/hooks/useProduct";
import ProductCardListings from "@/components/store/products/product-card-listings";
import { FilterSidebar } from "@/components/store/shared/filter-sidebar";
import SaleBanner from "@/components/store/sale-banner";
import { useSearch } from "@tanstack/react-router";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import { CollectionTemplateSkeleton } from "./skeleton";
import { Loader } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import ProductCardSocial from "../products/product-card-social";
import { ProductSearch } from "@/schemas";

interface Props {
    collection_slug?: string;
    searchTerm?: string;
    initialData: any;
}

export default function SocialInfiniteScrollClient({ initialData, collection_slug, searchTerm }: Props) {
    const isMobile = useIsMobile();
    const search = useSearch({
        strict: false,
    });
    // const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useProductInfiniteSearch(initialData, {
        ...search,
        show_facets: true,
        collections: collection_slug,
        search: searchTerm,
    });
    const [activeIndex, setActiveIndex] = useState(0);
    // const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (isMobile) {
                const scrollPosition = container.scrollTop;
                const cardHeight = container.clientHeight;
                const newIndex = Math.round(scrollPosition / cardHeight);
                setActiveIndex(newIndex);
            }

            // const { scrollTop, scrollHeight, clientHeight } = container;
            // if (scrollTop + clientHeight >= scrollHeight - 500) {
            //     loadMore();
            // }
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [isMobile]);

    // const handleProductClick = (product: Product) => {
    //     setSelectedProduct(product);
    //     setIsModalOpen(true);
    // };

    if (isLoading) {
        return <CollectionTemplateSkeleton />;
    }
    const products = data?.pages?.flatMap((page) => page.products) ?? initialData;
    // const facets = data?.pages?.[0]?.facets || {};

    const hasProducts = products.length > 0;

    // return (
    //     <div className="relative h-screen w-full bg-background overflow-hidden">
    //         <div
    //             ref={containerRef}
    //             className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
    //         >
    //             {products.map((product: ProductSearch, index: number) => (
    //                 <ProductCardSocial
    //                     key={product.id}
    //                     product={product}
    //                     isActive={index === activeIndex}
    //                     variant="mobile"
    //                 // onClick={() => handleProductClick(product)}
    //                 />
    //             ))}

    //             {/* {loading && (
    //                 <div className="h-screen snap-start flex items-center justify-center">
    //                     <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    //                 </div>
    //             )} */}
    //         </div>
    //     </div>
    // );

    return (
        // <div className="flex gap-6">
        <div className="w-full flex-1 flex-col relative">
            {/* <div
                    ref={containerRef}
                    className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
                >
                    {products.map((product: ProductSearch, index: number) => (
                        <ProductCardSocial
                            key={product.id}
                            product={product}
                            isActive={index === activeIndex}
                            variant="mobile"
                        />
                    ))}
                </div> */}
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
                        className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
                    >
                        {/* <ProductCardListings className="w-full pb-4" products={products!} viewMode={viewMode} /> */}
                        {products.map((product: ProductSearch, index: number) => (
                            <ProductCardSocial
                                key={product.id}
                                product={product}
                                isActive={index === activeIndex}
                                variant="mobile"
                            />
                        ))}
                    </InfiniteScroll>
                )}
            </main>
        </div>
        // </div>
    );
}
