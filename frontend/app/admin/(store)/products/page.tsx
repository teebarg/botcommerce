import { Metadata } from "next";
import React from "react";

import { api } from "@/apis";
import ServerError from "@/components/server-error";
import { ProductInventory } from "@/components/products/product-inventory";

export const metadata: Metadata = {
    title: "Children clothing",
};

type SearchParams = Promise<{
    page?: string;
    limit?: string;
    search?: string;
}>;

type ProductPageProps = {
    searchParams: SearchParams;
};

export default async function ProductsPage({ searchParams }: ProductPageProps) {
    const { search = "", page: pageStr = "1", limit: limitStr = "10" } = await searchParams;
    const page = parseInt(pageStr, 10);
    const limit = parseInt(limitStr, 10);

    const [productsResponse, brandRes, collectionsRes, catRes] = await Promise.all([
        api.product.all({ query: search, limit, page }),
        api.brand.all(),
        api.collection.all({ page: 1, limit: 100 }),
        api.category.all(),
    ]);

    // Early returns for error handling
    if (!brandRes || !collectionsRes.data || !catRes || productsResponse.error) {
        return <ServerError />;
    }

    if (!productsResponse.data) {
        return <div>No data found</div>;
    }

    const { products, ...pagination } = productsResponse.data;
    const { brands } = brandRes;
    const { collections } = collectionsRes.data;
    const { categories } = catRes.data ?? {};

    return (
        <React.Fragment>
            <ProductInventory
                brands={brands ?? []}
                categories={categories ?? []}
                collections={collections ?? []}
                pagination={pagination}
                products={products}
            />
        </React.Fragment>
    );
}
