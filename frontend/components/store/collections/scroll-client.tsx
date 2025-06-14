"use client";

import { useState, useEffect } from "react";
import React from "react";
import { ChevronRight, Loader, Tag } from "nui-react-icons";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

import { BtnLink } from "@/components/ui/btnLink";
import LocalizedClientLink from "@/components/ui/link";
import PromotionalBanner from "@/components/promotion";
import { WishItem } from "@/schemas";
import { CollectionsSideBar } from "@/components/store/collections/checkbox-sidebar";
import { CollectionsTopBar } from "@/components/store/collections/checkout-topbar";
import NoProductsFound from "@/components/store/products/no-products";
import ProductCard from "@/components/store/products/product-card";
import { cn } from "@/lib/utils";
import { useBrands, useCategories, useCollections } from "@/lib/hooks/useApi";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { api } from "@/apis/client";
import { Category, Collection, Facet, PaginatedProductSearch, ProductSearch } from "@/schemas/product";

interface SearchParams {
    page?: number;
    sortBy?: string;
    cat_ids?: string;
    maxPrice?: string;
    minPrice?: string;
    search?: string;
}

export default function InfiniteScrollClient({
    initialSearchParams,
    data,
    collection,
    wishlist,
    user,
}: {
    initialSearchParams: SearchParams;
    data: PaginatedProductSearch;
    collection?: Collection;
    wishlist: WishItem[];
    user?: any;
}) {
    const { data: brands } = useBrands();
    const { data: categories } = useCategories();
    const { data: collections } = useCollections();
    const [products, setProducts] = useState<ProductSearch[]>(data.products);
    const [facets, setFacets] = useState<Facet>();
    const [hasNext, setHasNext] = useState<boolean>(data.page < data.total_pages);
    const [page, setPage] = useState<number>(data.page ?? 1);
    const [loading, setLoading] = useState<boolean>(false);

    const searchParams = useSearchParams();

    const filteredCategories = categories?.filter((cat: Category) => !cat.parent_id);

    const fetchItems = async (page: number) => {
        setLoading(true);
        const data = await api.get<PaginatedProductSearch>("/product/search", { params: { ...initialSearchParams, page } });

        if (!data) {
            return;
        }
        setProducts((prev) => [...prev, ...data.products]);
        setHasNext(data.page < data.total_pages);
        setLoading(false);
    };

    useEffect(() => {
        setProducts(data.products);
        setPage(data.page);
        setHasNext(data.page < data.total_pages);
        setFacets(data.facets);
    }, [data]);

    useEffect(() => {
        if (page === 1) {
            return;
        }
        fetchItems(page);
    }, [page]);

    const { lastElementRef } = useInfiniteScroll({
        onIntersect: () => {
            if (hasNext) {
                setPage((prev) => prev + 1);
            }
        },
        isFetching: loading,
    });

    return (
        <div className="flex gap-6">
            <div className="hidden md:block">
                <CollectionsSideBar brands={brands} categories={filteredCategories} collections={collections} facets={facets} />
            </div>
            <div className="w-full flex-1 flex-col relative">
                {/* Mobile banner */}
                <PromotionalBanner
                    btnClass="text-blue-600"
                    icon={<Tag className="text-white w-8 h-8 bg-white/20 p-1.5 rounded-lg animate-spin" />}
                    outerClass="from-blue-600 to-purple-700"
                    subtitle="Get 20% Off Today"
                    title="Exclusive Offer!"
                />
                {/* Categories */}
                <div className="px-4 my-6 md:hidden">
                    <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                        <BtnLink
                            className={cn(
                                "flex-none rounded-full bg-content1 text-foreground font-semibold text-base py-2 min-w-min px-6",
                                searchParams.get("cat_ids") === null && "border border-foreground"
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
                                    searchParams.get("cat_ids") === category.slug && "border border-foreground"
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
                            <div className="sticky md:relative top-14 md:top-0 z-30 md:z-10">
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
                                                <ProductCard key={index} product={product} showWishlist={Boolean(user)} wishlist={wishlist} />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
                <div className="w-full">
                    {hasNext && (
                        <div ref={lastElementRef} className="flex flex-col items-center justify-center text-blue-600">
                            <Loader className="h-8 w-8 animate-spin mb-2" />
                            <p className="text-sm font-medium text-default-500">Loading more products...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
