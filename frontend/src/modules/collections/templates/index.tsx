import React from "react";
import { ChevronRightIcon, ExclamationIcon } from "nui-react-icons";
import { Pagination } from "@modules/common/components/pagination";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { getCategoriesList, getCollectionsList, searchProducts } from "@lib/data";
import { Product, SortOptions } from "types/global";
import { ProductCard } from "@modules/products/components/product-card";

import { CollectionsTopBar } from "./topbar";
import { CollectionsSideBar } from "./sidebar";

interface ComponentProps {
    query?: string;
    productsIds?: (string | number)[];
    collection?: any;
    page?: string;
    sortBy?: SortOptions;
    searchParams?: {
        page?: string;
        sortBy?: SortOptions;
        cat_ids?: string;
    };
}

const CollectionTemplate: React.FC<ComponentProps> = async ({ query = "", collection, page, productsIds, sortBy, searchParams }) => {
    const { collections } = await getCollectionsList();
    const { product_categories } = await getCategoriesList();

    const queryParams: any = {
        query,
        limit: 12,
        page: page ?? 1,
        sort: sortBy ?? "created_at:desc",
    };

    if (collection?.id) {
        queryParams["collections"] = [collection.slug];
    }

    if (searchParams?.cat_ids) {
        queryParams["category_id"] = searchParams?.cat_ids?.split(",");
    }

    if (productsIds) {
        queryParams["id"] = productsIds;
    }

    const { products, ...pagination } = await searchProducts(queryParams);

    return (
        <React.Fragment>
            <div className="w-full px-2 lg:px-24 py-4 mt-4">
                <nav data-slot="base">
                    <ol className="flex flex-wrap list-none rounded-small" data-slot="list">
                        <li className="flex items-center" data-slot="base">
                            <LocalizedClientLink href="/">Home</LocalizedClientLink>
                            <span aria-hidden="true" className="px-1 text-foreground/50" data-slot="separator">
                                <ChevronRightIcon />
                            </span>
                        </li>
                        <li className="flex items-center" data-slot="base">
                            <LocalizedClientLink href="/collections">Collection</LocalizedClientLink>
                        </li>
                        {collection?.title && (
                            <li className="flex items-center" data-slot="base">
                                <span aria-hidden="true" className="px-1 text-foreground/50" data-slot="separator">
                                    <ChevronRightIcon />
                                </span>
                                <span>{collection.title}</span>
                            </li>
                        )}
                    </ol>
                </nav>
                <div className="flex gap-6 mt-6">
                    <CollectionsSideBar categories={product_categories} collections={collections} />
                    <div className="w-full flex-1 flex-col">
                        <CollectionsTopBar count={pagination.total_count} slug={collection?.title} sortBy={sortBy} />
                        <main className="mt-4 w-full overflow-visible px-1">
                            <div className="block rounded-medium border-medium border-dashed border-divider px-2 py-4 min-h-[50vh]">
                                {products.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-content1">
                                        <div className="max-w-md mx-auto text-center">
                                            <ExclamationIcon className="w-20 h-20 mx-auto text-danger" />
                                            <h1 className="text-4xl font-bold mt-6">Oops! No Products Found</h1>
                                            <p className="text-default-500 mt-4">{`There are no products in this category`}</p>
                                            <LocalizedClientLink
                                                className="bg-primary text-white font-semibold py-2 px-4 rounded mt-6 inline-block"
                                                href="/"
                                            >
                                                Go to Home
                                            </LocalizedClientLink>
                                        </div>
                                    </div>
                                ) : (
                                    <React.Fragment>
                                        <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-4">
                                            {products.map((product: Product, index: number) => (
                                                <ProductCard key={index} product={product} />
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
        </React.Fragment>
    );
};

export { CollectionTemplate };
