import React from "react";
import { ChevronRightIcon, ExclamationIcon } from "nui-react-icons";
import { ProductItem } from "@modules/products/components/product-item";
import { PaginationComponent } from "@modules/common/components/pagination";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { getCategoriesList, getCollectionsList, getProductsListWithSort, getRegion } from "@lib/data";
import { ProductPreviewType } from "types/global";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";

import { CollectionsTopBar } from "./topbar";
import { CollectionsSideBar } from "./sidebar";

interface ComponentProps {
    productsIds?: string[];
    collection?: any;
    page?: string;
    sortBy?: SortOptions;
    searchParams?: {
        page?: string;
        sortBy?: SortOptions;
        cat_ids?: string;
    };
}

type PaginatedProductsParams = {
    limit: number;
    collection_id?: string[];
    category_id?: string[];
    id?: string[];
};

const PRODUCT_LIMIT = 2;

const CollectionTemplate: React.FC<ComponentProps> = async ({ collection, page, productsIds, sortBy, searchParams }) => {
    const { collections } = await getCollectionsList();
    const { product_categories } = await getCategoriesList();
    const region = (await getRegion("ng")) as Region;

    const queryParams: PaginatedProductsParams = {
        limit: PRODUCT_LIMIT,
    };

    if (collection?.id) {
        queryParams["collection_id"] = [collection.id];
    }

    if (searchParams?.cat_ids) {
        queryParams["category_id"] = searchParams?.cat_ids?.split(",");
    }

    if (productsIds) {
        queryParams["id"] = productsIds;
    }

    const {
        response: { products, count },
    } = await getProductsListWithSort({
        page: page ? parseInt(page) : 1,
        queryParams,
        sortBy,
        countryCode: "ng",
    });
    const totalPages = Math.ceil(count / PRODUCT_LIMIT);

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
                        <CollectionsTopBar count={count} slug={collection?.title} sortBy={sortBy} />
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
                                            {products.map((product: ProductPreviewType, index: number) => (
                                                <ProductItem key={index} product={product} region={region} />
                                            ))}
                                        </div>
                                        {totalPages > 1 && <PaginationComponent pagination={{ page: Number(page), totalPages }} />}
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
