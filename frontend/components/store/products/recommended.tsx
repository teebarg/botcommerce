"use client";

import ProductCard from "@/components/store/products/product-card";
import { ProductSearch } from "@/schemas/product";
import { useProductRecommendations, useProductSearch } from "@/lib/hooks/useProduct";
import ComponentLoader from "@/components/component-loader";
import ServerError from "@/components/generic/server-error";

type RecommendedProductsProps = {
    exclude?: number[];
};

export default function RecommendedProducts({ exclude = [] }: RecommendedProductsProps) {
    const { data, isLoading, error } = useProductSearch({ limit: 40 });
    const { data: recommendations, isLoading: recommendationsLoading, error: recommendationsError } = useProductRecommendations(1);

    console.log("🚀 ~ RecommendedProducts ~ recommendationsError:", recommendationsError);
    console.log("🚀 ~ RecommendedProducts ~ recommendationsLoading:", recommendationsLoading);
    console.log("🚀 ~ RecommendedProducts ~ recommendations:", recommendations);

    if (error) {
        return <ServerError error={error.message} scenario="recommended-products" stack={error.stack} />;
    }

    if (isLoading) {
        return <ComponentLoader className="h-[400px]" />;
    }

    const filteredProducts = exclude?.length
        ? (data?.products?.filter((product: ProductSearch) => !exclude.includes(product.variants?.[0].id!)) ?? [])
        : (data?.products ?? []);

    return (
        <div>
            <ul className="grid grid-cols-1 md:grid-cols-4 gap-x-2 md:gap-x-4 gap-y-8">
                {filteredProducts.map((product: ProductSearch, idx: number) => (
                    <li key={idx}>
                        <ProductCard product={product} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
