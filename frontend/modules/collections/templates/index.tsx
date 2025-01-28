import React from "react";
import { ChevronRight, ExclamationIcon, Tag } from "nui-react-icons";
import { Pagination } from "@modules/common/components/pagination";
import { getBrands, getCategories, getCollectionsList, getCustomer, getWishlist, search } from "@lib/data";
import { Category, Collection, Customer, Product, SearchParams, SortOptions, WishlistItem } from "types/global";
import dynamic from "next/dynamic";

import { CollectionsTopBar } from "./topbar";
import { CollectionsSideBar } from "./sidebar";

import { BtnLink } from "@/components/ui/btnLink";
import LocalizedClientLink from "@/components/ui/link";
import PromotionalBanner from "@/components/promotion";

const ProductCard = dynamic(() => import("@/components/product/product-card"), { ssr: false });

interface ComponentProps {
    query?: string;
    collection?: Collection;
    page?: number;
    sortBy?: SortOptions;
    searchParams?: {
        page?: number;
        sortBy?: SortOptions;
        cat_ids?: string;
        maxPrice?: string;
        minPrice?: string;
    };
}

const CollectionTemplate: React.FC<ComponentProps> = async ({ query = "", collection, page, sortBy, searchParams }) => {
    const { brands } = await getBrands();
    const { collections } = await getCollectionsList();
    const customer: Customer = await getCustomer().catch(() => null);
    let wishlist: WishlistItem[] = [];

    if (customer) {
        const { wishlists } = (await getWishlist()) || {};

        wishlist = wishlists;
    }

    const { categories: cat } = await getCategories();
    const categories = cat?.filter((cat: Category) => !cat.parent_id);

    const queryParams: SearchParams = {
        query,
        limit: 12,
        page: page ?? 1,
        sort: sortBy ?? "created_at:desc",
        max_price: searchParams?.maxPrice ?? 100000000,
        min_price: searchParams?.minPrice ?? 0,
    };

    if (collection?.id) {
        queryParams["collections"] = collection.slug as string;
    }

    if (searchParams?.cat_ids) {
        queryParams["categories"] = searchParams?.cat_ids;
    }

    const { products, facets, ...pagination } = await search(queryParams);

    return (
        <React.Fragment>
            <div className="hidden md:block">
                <CollectionsSideBar brands={brands} categories={categories} collections={collections} facets={facets} searchParams={searchParams} />
            </div>
            <div className="w-full flex-1 flex-col">
                {/* Mobile banner */}
                <PromotionalBanner
                    title="Exclusive Offer!"
                    subtitle="Get 20% Off Today"
                    icon={<Tag className="text-white w-8 h-8 bg-white/20 p-1.5 rounded-lg animate-spin" />}
                    outerClass="from-blue-600 to-purple-700"
                    btnClass="text-blue-600"
                />
                {/* Categories */}
                <div className="px-4 my-6 md:hidden">
                    <h2 className="text-lg font-semibold mb-2">Categories</h2>
                    <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                        {cat.map((category: Collection, index: number) => (
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
                                    categories={categories}
                                    collections={collections}
                                    count={pagination.total_count}
                                    slug={collection?.slug}
                                    sortBy={sortBy}
                                />
                            </div>
                            <main className="mt-4 w-full overflow-visible px-1">
                                <div className="block md:rounded-xl md:border-2 border-dashed border-divider md:px-2 py-4 min-h-[50vh]">
                                    {products.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-content1">
                                            <div className="max-w-md mx-auto text-center">
                                                <ExclamationIcon className="w-20 h-20 mx-auto text-danger" />
                                                <h1 className="text-4xl font-bold mt-6">Oops! No Products Found</h1>
                                                <p className="text-default-500 my-4">{`There are no products in this category`}</p>
                                                <BtnLink color="primary" href="/">
                                                    Go to Home
                                                </BtnLink>
                                            </div>
                                        </div>
                                    ) : (
                                        <React.Fragment>
                                            <div className="grid w-full gap-2 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 pb-4">
                                                {products.map((product: Product, index: number) => (
                                                    <ProductCard key={index} product={product} showWishlist={Boolean(customer)} wishlist={wishlist} />
                                                ))}
                                            </div>
                                            {pagination.total_pages > 1 && <Pagination pagination={pagination} />}
                                        </React.Fragment>
                                    )}
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export { CollectionTemplate };
