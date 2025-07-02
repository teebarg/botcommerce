"use client";

import React from "react";
import { ChevronRight, Loader, Tag } from "nui-react-icons";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

import { BtnLink } from "@/components/ui/btnLink";
import LocalizedClientLink from "@/components/ui/link";
import PromotionalBanner from "@/components/promotion";
import { CollectionsSideBar } from "@/components/store/collections/checkbox-sidebar";
import { CollectionsTopBar } from "@/components/store/collections/checkout-topbar";
import NoProductsFound from "@/components/store/products/no-products";
import ProductCard from "@/components/store/products/product-card";
import { cn } from "@/lib/utils";
import { useBrands } from "@/lib/hooks/useBrand";
import { useCategories } from "@/lib/hooks/useCategories";
import { useCollections } from "@/lib/hooks/useCollection";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { Category, Collection, ProductSearch } from "@/schemas/product";
import { useProductInfiniteSearch } from "@/lib/hooks/useProduct";
import { Skeleton } from "@/components/ui/skeletons";

interface SearchParams {
    sortBy?: string;
    cat_ids?: string;
    maxPrice?: string;
    minPrice?: string;
    search?: string;
    limit?: number;
}

export default function InfiniteScrollClient({ initialSearchParams, collection }: { initialSearchParams: SearchParams; collection?: Collection }) {
    const searchParams = useSearchParams();
    const { data: brands } = useBrands();
    const { data: categories } = useCategories();
    const { data: collections } = useCollections();
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useProductInfiniteSearch(initialSearchParams);

    const { lastElementRef } = useInfiniteScroll({
        onIntersect: () => {
            if (!isFetchingNextPage && hasNextPage) {
                fetchNextPage();
            }
        },
        isFetching: isFetchingNextPage,
    });

    if (isPending) {
        return <Skeleton className="min-h-[400px]" />;
    }

    const products = data?.pages?.flatMap((page) => page.products) || [];
    const facets = data?.pages?.flatMap((page) => page.facets) || {};
    const filteredCategories = categories?.filter((cat: Category) => !cat.parent_id);

    return (
        <div className="flex gap-6">
            <div className="hidden md:block">
                <CollectionsSideBar brands={brands} categories={filteredCategories} collections={collections} facets={facets} />
            </div>
            <div className="w-full flex-1 flex-col relative">
                <PromotionalBanner
                    btnClass="text-blue-600"
                    icon={<Tag className="text-white w-8 h-8 bg-white/20 p-1.5 rounded-lg animate-spin" />}
                    outerClass="from-blue-600 to-purple-700"
                    subtitle="Get 20% Off Today"
                    title="Exclusive Offer!"
                />
                <div className="px-4 my-6 md:hidden">
                    <div className="flex overflow-x-auto gap-3 pb-2">
                        <BtnLink
                            className={cn(
                                "flex-none rounded-full bg-content1 text-foreground font-semibold text-base py-2 min-w-min px-6",
                                searchParams.get("cat_ids") === null && "border border-primary text-primary"
                            )}
                            href="/collections"
                        >
                            All
                        </BtnLink>
                        {categories?.map((category: Category, index: number) => (
                            <BtnLink
                                key={index}
                                className={cn(
                                    "flex-none rounded-full bg-content1 text-foreground font-semibold text-base py-2 min-w-min",
                                    searchParams.get("cat_ids") === category.slug && "border border-primary text-primary"
                                )}
                                href={`/collections?cat_ids=${category.slug}`}
                            >
                                {category.name}
                            </BtnLink>
                        ))}
                    </div>
                </div>
                <div className="w-full">
                    <nav className="hidden md:block mt-6" data-slot="base">
                        <ol className="flex flex-wrap list-none rounded-lg" data-slot="list">
                            <li className="flex items-center" data-slot="base">
                                <LocalizedClientLink href="/">Home</LocalizedClientLink>
                                <span className="px-1 text-foreground/50" data-slot="separator">
                                    <ChevronRight />
                                </span>
                            </li>
                            <li className="flex items-center" data-slot="base">
                                <LocalizedClientLink href="/collections">Collection</LocalizedClientLink>
                            </li>
                            {collection?.name && (
                                <li className="flex items-center" data-slot="base">
                                    <span aria-hidden="true" className="px-1 text-foreground/50" data-slot="separator">
                                        <ChevronRight />
                                    </span>
                                    <span>{collection.name}</span>
                                </li>
                            )}
                        </ol>
                    </nav>
                    <div className="flex gap-6">
                        <div className="w-full flex-1 flex-col">
                            <div className="sticky md:relative top-16 md:top-0 z-30 md:z-10">
                                <CollectionsTopBar
                                    brands={brands}
                                    categories={filteredCategories}
                                    collections={collections}
                                    count={4}
                                    slug={collection?.slug}
                                    sortBy={"created_at:desc"}
                                />
                            </div>
                            <main className="w-full overflow-visible px-1">
                                <div className="block md:rounded-xl py-4 min-h-[50vh]">
                                    <div className="grid w-full gap-2 grid-cols-2 md:grid-cols-3 pb-4">
                                        {products.length == 0 && (
                                            <div className="col-span-2 md:col-span-3">
                                                <NoProductsFound />
                                            </div>
                                        )}
                                        {products?.map((product: ProductSearch, index: number) => (
                                            <motion.div
                                                key={index}
                                                animate={{ opacity: 1, y: 0 }}
                                                initial={{ opacity: 0, y: 20 }}
                                                transition={{
                                                    duration: 0.2,
                                                    ease: [0.25, 0.25, 0, 1],
                                                    delay: index * 0.05,
                                                }}
                                            >
                                                <ProductCard key={index} product={product} />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
                <div className="w-full absolute bottom-52">{hasNextPage && <div ref={lastElementRef} className="h-2" />}</div>
                {isFetchingNextPage && (
                    <div className="flex flex-col items-center justify-center text-blue-600">
                        <Loader className="h-8 w-8 animate-spin mb-2" />
                        <p className="text-sm font-medium text-default-500">Loading more products...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
