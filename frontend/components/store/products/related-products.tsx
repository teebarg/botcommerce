"use client";

import { Product, ProductSearch } from "@/schemas/product";
import ProductCard from "@/components/store/products/product-card";
import ServerError from "@/components/generic/server-error";
import { useProductSearch } from "@/lib/hooks/useProduct";
import { Skeleton } from "@/components/ui/skeletons";

type RelatedProductsProps = {
    product: Product;
};

export default function RelatedProducts({ product }: RelatedProductsProps) {
    const setQueryParams = (): any => {
        const params: any = {};

        if (product.collections) {
            params.collections = product.collections.map((p: any) => p.slug).join(",");
        }

        params.limit = 4;

        return params;
    };

    const queryParams = setQueryParams();
    const { data, isLoading, error } = useProductSearch(queryParams);

    if (isLoading) {
        return <Skeleton className="min-h-[400px]" />;
    }

    if (error || !data) {
        return <ServerError />;
    }

    const productPreviews = data.products?.filter((item: ProductSearch) => item.id !== product.id);

    if (!productPreviews.length) {
        return null;
    }

    return (
        <div>
            <div className="flex flex-col items-center text-center mb-12">
                <span className="text-base text-default-500">Related products</span>
                <p className="text-lg md:text-xl text-default-900 max-w-lg">You might also want to check out these products.</p>
            </div>

            <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-2 md:gap-x-6 gap-y-8">
                {productPreviews.slice(0, 4).map((product: ProductSearch, idx: number) => (
                    <li key={idx}>
                        <ProductCard product={product} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
