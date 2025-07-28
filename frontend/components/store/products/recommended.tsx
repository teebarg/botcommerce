"use client";

import ProductCard from "@/components/store/products/product-shared-card";
import { ProductSearch } from "@/schemas/product";
import { useProductRecommendations } from "@/lib/hooks/useProduct";
import ComponentLoader from "@/components/component-loader";
import ServerError from "@/components/generic/server-error";
import { useAuth } from "@/providers/auth-provider";

type RecommendedProductsProps = {
    exclude?: number[];
};

export default function RecommendedProducts({ exclude = [] }: RecommendedProductsProps) {
    const { user } = useAuth();
    const { data, isLoading, error } = useProductRecommendations(user?.id, 40);

    if (error) {
        return <ServerError error={error.message} scenario="recommended-products" stack={error.stack} />;
    }

    if (isLoading) {
        return <ComponentLoader className="h-[400px]" />;
    }

    return (
        <ul className="grid grid-cols-1 md:grid-cols-4 gap-x-2 md:gap-x-4 gap-y-8">
            {data?.recommendations?.map((product: ProductSearch, idx: number) => (
                <li key={idx}>
                    <ProductCard product={product} />
                </li>
            ))}
        </ul>
    );
}
