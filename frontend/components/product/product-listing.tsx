import React from "react";
import { ExclamationIcon } from "nui-react-icons";
import { Pagination } from "@modules/common/components/pagination";
import { getCustomer, productSearch } from "@lib/data";
import { Collection, Customer, Product, SearchParams, SortOptions, WishlistItem } from "types/global";
import dynamic from "next/dynamic";
import { BtnLink } from "@/components/ui/btnLink";

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
    wishlist: WishlistItem[];
}

const ProductListings: React.FC<ComponentProps> = async ({ query = "", collection, page, sortBy, searchParams, wishlist }) => {
    const customer: Customer = await getCustomer().catch(() => null);
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

    const { products, facets, ...pagination } = await productSearch(queryParams);

    return (
        <React.Fragment>
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
        </React.Fragment>
    );
};

export default ProductListings;
