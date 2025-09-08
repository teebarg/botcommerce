"use client";

import { useSession } from "next-auth/react";

import ProductCard from "@/components/store/products/product-card2";
import { ProductSearch } from "@/schemas/product";
import { useProductRecommendations } from "@/lib/hooks/useProduct";
import ComponentLoader from "@/components/component-loader";
import ServerError from "@/components/generic/server-error";

type RecommendedProductsProps = {
    exclude?: number[];
};

export default function RecommendedProducts({ exclude = [] }: RecommendedProductsProps) {
    const { data: session } = useSession();
    const { data, isLoading, error } = useProductRecommendations(session?.id, 40);

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
