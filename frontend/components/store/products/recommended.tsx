"use client";

import { Skeleton } from "@/components/ui/skeletons";
import ProductCard from "@/components/store/products/product-card";
import { useProductSearch } from "@/lib/hooks/useApi";
import { ProductSearch } from "@/schemas/product";

type RecommendedProductsProps = {
    exclude?: number[];
};

export default function RecommendedProducts({ exclude = [] }: RecommendedProductsProps) {
    const { data, isLoading, error } = useProductSearch({ limit: 40 });

    if (error || !data) {
        return null;
    }

    if (isLoading) {
        return <Skeleton className="h-[400px]" />;
    }

    const filteredProducts = exclude?.length
        ? data.products.filter((product: ProductSearch) => !exclude.includes(product.variants?.[0].id!))
        : data.products;

    return (
        <div>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-2 md:gap-x-4 gap-y-8">
                {filteredProducts.map((product: ProductSearch, idx: number) => (
                    <li key={idx}>
                        <ProductCard product={product} wishlist={[]} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
