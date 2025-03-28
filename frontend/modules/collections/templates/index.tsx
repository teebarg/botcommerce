import React from "react";
import { ChevronRight, Exclamation, Tag } from "nui-react-icons";
import { Pagination } from "@modules/common/components/pagination";

import { CollectionsTopBar } from "./topbar";
import { CollectionsSideBar } from "./sidebar";

import { BtnLink } from "@/components/ui/btnLink";
import LocalizedClientLink from "@/components/ui/link";
import PromotionalBanner from "@/components/promotion";
import { api } from "@/apis";
import { auth } from "@/actions/auth";
import ServerError from "@/components/server-error";
import ProductCard from "@/components/store/products/product-card";
import { Category, Collection, ProductSearch, SortOptions, WishItem } from "@/types/models";

type SearchParams = Promise<{
    page?: number;
    sortBy?: SortOptions;
    cat_ids?: string;
    maxPrice?: string;
    minPrice?: string;
}>;

interface ComponentProps {
    query?: string;
    collection?: Collection;
    searchParams?: SearchParams;
}

const CollectionTemplate: React.FC<ComponentProps> = async ({ query = "", collection, searchParams }) => {
    const { minPrice, maxPrice, cat_ids, page, sortBy } = (await searchParams) || {};
    const user = await auth();
    const [brandRes, collectionsRes, catRes] = await Promise.all([api.brand.all(), api.collection.all(), api.category.all()]);

    // Early returns for error handling
    if (!brandRes || !collectionsRes || !catRes) {
        return <ServerError />;
    }

    const { brands } = brandRes;
    const { collections } = collectionsRes;
    const { categories: cat } = catRes.data ?? {};
    const categories = cat?.filter((cat: Category) => !cat.parent_id);

    let wishlist: WishItem[] = [];

    if (user) {
        const { data: res } = await api.user.wishlist();

        wishlist = res ? res.wishlists : [];
    }

    const queryParams: any = {
        query,
        limit: 12,
        page: page ?? 1,
        sort: sortBy ?? "created_at:desc",
        max_price: maxPrice ?? 100000000,
        min_price: minPrice ?? 0,
        collections: collection?.slug,
        categories: cat_ids,
    };

    const res = await api.product.search(queryParams);

    if (res.error) {
        return <ServerError />;
    }

    if (!res.data) {
        return <>No Products</>;
    }

    const { products, facets, ...pagination } = res.data;

    return (
        <React.Fragment>
            <div className="hidden md:block">
                <CollectionsSideBar brands={brands} categories={categories} collections={collections} facets={facets} />
            </div>
            <div className="w-full flex-1 flex-col">
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
                        {cat?.map((category: Category, index: number) => (
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
                                                <Exclamation className="w-20 h-20 mx-auto text-danger" />
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
                                                {products.map((product: ProductSearch, index: number) => (
                                                    <ProductCard key={index} product={product} showWishlist={Boolean(user)} wishlist={wishlist} />
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
