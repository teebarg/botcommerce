"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/apis";
import { ExtendedProduct, Pagination } from "@/types/global";

import React from "react";
import { ChevronRight, Exclamation, Tag } from "nui-react-icons";
import { SortOptions } from "types/global";
import dynamic from "next/dynamic";

import { BtnLink } from "@/components/ui/btnLink";
import LocalizedClientLink from "@/components/ui/link";
import PromotionalBanner from "@/components/promotion";
import { Category, Collection, Product, WishItem } from "@/lib/models";
import { auth } from "@/actions/auth";
import ServerError from "@/components/server-error";
import { CollectionsSideBar } from "@/modules/collections/templates/sidebar";
import { CollectionsTopBar } from "@/modules/collections/templates/topbar";
import ProductCard from "@/components/product/product-card";
import { set } from "lodash";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

interface SearchParams {
    page?: number;
    sortBy?: string;
    cat_ids?: string;
    maxPrice?: string;
    minPrice?: string;
}

export default function InfiniteScrollClient({
    initialProducts,
    initialSearchParams,
    dataHasNext,
    brands,
    categories,
    collections,
    facets,
    minPrice,
    maxPrice,
    collection,
    wishlist,
    user,
    initialPage, // changed to match the prop name
}: {
    initialProducts: Product[];
    initialSearchParams: SearchParams;
    dataHasNext: boolean;
    brands: any; // replace with appropriate type
    categories: any; // replace with appropriate type
    collections: any; // replace with appropriate type
    facets: any; // replace with appropriate type
    minPrice: string; // replace with appropriate type
    maxPrice: string; // replace with appropriate type
    collection?: any; // replace with appropriate type
    wishlist: WishItem[]; // replace with appropriate type
    user: any; // replace with appropriate type
    initialPage: number; // replace with appropriate type
}) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [hasNext, setHasNext] = useState<boolean>(dataHasNext);
    const [page, setPage] = useState<number>(initialPage ?? 1);
    const [loading, setLoading] = useState<boolean>(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [scrollTrigger, isInView] = useInView();
    console.log(initialProducts);
    console.log(products);

    const filteredCategories = categories?.filter((cat: Category) => !cat.parent_id);

    const fetchItems = async (page: number) => {
        setLoading(true);
        try {
            const res = await api.product.search({ ...initialSearchParams, page });
            const data = await res.data;
            if (!data) {
                return;
            }
            setProducts((prev) => [...prev, ...data.products]);
            setHasNext(data.page < data.total_pages);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        setProducts(initialProducts);
        setPage(1);
        setHasNext(dataHasNext);
    }, [initialProducts]);

    useEffect(() => {
        console.log("page", page);
        if (page === 1) {
            return;
        }
        fetchItems(page);
    }, [page]);

    useEffect(() => {
        if (isInView && hasNext) {
            setPage((prev) => prev + 1);
        }
    }, [isInView, hasNext]);

    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loading && hasNext) {
                setPage((prev) => prev + 1);
            }
        });

        const loadMoreTrigger = document.getElementById("loadMoreTrigger");
        if (observerRef.current && loadMoreTrigger) {
            observerRef.current.observe(loadMoreTrigger);
        }

        return () => observerRef.current?.disconnect();
    }, [loading]);

    return (
        <div className="flex gap-6 mt-0 md:mt-6">
            <div className="hidden md:block">
                <CollectionsSideBar
                    brands={brands}
                    categories={filteredCategories}
                    collections={collections}
                    facets={facets}
                    searchParams={{ minPrice, maxPrice }}
                />
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
                    <h2 className="text-lg font-semibold mb-2">Categories</h2>
                    <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                        {categories?.map((category: Category, index: number) => (
                            <BtnLink key={index} className="flex-none rounded-full" color="secondary" href={`/collections?cat_ids=${category.slug}`}>
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
                    <div className="flex gap-6 mt-0 md:mt-6">
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
                            <main className="mt-4 w-full overflow-visible px-1">
                                <div className="block md:rounded-xl md:border-2 border-dashed border-divider md:px-2 py-4 min-h-[50vh]">
                                    {/* {JSON.stringify(products)} */}
                                    <div className="grid w-full gap-2 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 pb-4">
                                        {products.map((product: Product, index: number) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.4,
                                                    ease: [0.25, 0.25, 0, 1],
                                                    delay: index * 0.1,
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
                <div className="absolute bottom-10 w-full">
                    {(hasNext && <div ref={scrollTrigger}>Loading...</div>) || <p className="...">No more posts to load</p>}
                </div>
                {/* <div className="absolute bottom-10 w-full" id="loadMoreTrigger" style={{ height: "200px", background: "transparent" }}></div>
                {loading && <p>Loading...</p>} */}
            </div>
        </div>
    );
}
