"use client";

import ProductCard from "@/components/store/products/product-card";
import { ProductSearch } from "@/schemas/product";
import { useRecommendedProducts } from "@/lib/hooks/useProduct";
import ComponentLoader from "@/components/component-loader";
import ServerError from "@/components/generic/server-error";

type RecommendedProductsProps = {
    exclude?: number[];
};

export default function RecommendedProducts({ exclude = [] }: RecommendedProductsProps) {
    const { data, isLoading, error } = useRecommendedProducts(12);

    if (error) {
        return <ServerError error={error.message} scenario="recommended-products" stack={error.stack} />;
    }

    if (isLoading) {
        return <ComponentLoader className="h-[400px]" />;
    }

    return (
        <ul className="grid grid-cols-1 md:grid-cols-4 gap-x-2 md:gap-x-4 gap-y-8">
            {data?.recommended?.map((product: ProductSearch, idx: number) => (
                <li key={idx}>
                    <ProductCard product={product} />
                </li>
            ))}
        </ul>
    );
}
