"use client";

import { useState, useEffect } from "react";
import React from "react";
import { ChevronRight, Tag } from "nui-react-icons";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

import { api } from "@/apis";
import { BtnLink } from "@/components/ui/btnLink";
import LocalizedClientLink from "@/components/ui/link";
import PromotionalBanner from "@/components/promotion";
import { Brand, Category, Collection, Facet, PaginatedProduct, PaginatedProductSearch, Product, ProductSearch, WishItem } from "@/lib/models";
import { CollectionsSideBar } from "@/modules/collections/templates/sidebar";
import { CollectionsTopBar } from "@/modules/collections/templates/topbar";
import ProductCard from "@/components/products/product-card";
// import ProductCard from "@/components/product/product-card";

interface SearchParams {
    page?: number;
    sortBy?: string;
    cat_ids?: string;
    maxPrice?: string;
    minPrice?: string;
}

export default function InfiniteScrollClient({
    initialSearchParams,
    data,
    brands,
    categories,
    collections,
    collection,
    wishlist,
    user,
}: {
    initialSearchParams: SearchParams;
    data: PaginatedProductSearch;
    brands?: Brand[];
    categories?: Category[];
    collections?: Collection[];
    collection?: Collection;
    wishlist: WishItem[];
    user?: any;
}) {
    const [products, setProducts] = useState<ProductSearch[]>(data.products);
    const [facets, setFacets] = useState<Facet>();
    const [hasNext, setHasNext] = useState<boolean>(data.page < data.total_pages);
    const [page, setPage] = useState<number>(data.page ?? 1);
    // const [loading, setLoading] = useState<boolean>(false);
    // const observerRef = useRef<IntersectionObserver | null>(null);
    const [scrollTrigger, isInView] = useInView();

    const filteredCategories = categories?.filter((cat: Category) => !cat.parent_id);

    const fetchItems = async (page: number) => {
        // setLoading(true);
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
        // setLoading(false);
    };

    useEffect(() => {
        setProducts(data.products);
        setPage(1);
        setHasNext(data.page < data.total_pages);
        setFacets(data.facets);
    }, [data]);

    useEffect(() => {
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

    return (
        <div className="flex gap-6 mt-0 md:mt-6">
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
                                    <div className="grid w-full gap-2 grid-cols-2 md:grid-cols-3 xl:grid-cols-4p pb-4">
                                        {products?.map((product: ProductSearch, index: number) => (
                                            <motion.div
                                                key={index}
                                                animate={{ opacity: 1, y: 0 }}
                                                initial={{ opacity: 0, y: 20 }}
                                                transition={{
                                                    duration: 0.4,
                                                    ease: [0.25, 0.25, 0, 1],
                                                    delay: index * 0.1,
                                                }}
                                            >
                                                <ProductCard key={index} product={product} />
                                                {/* <ProductCard key={index} product={product} showWishlist={Boolean(user)} wishlist={wishlist} /> */}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
                <div className="w-full">{(hasNext && <div ref={scrollTrigger}>Loading...</div>) || <p className="...">No more posts to load</p>}</div>
            </div>
        </div>
    );
}
