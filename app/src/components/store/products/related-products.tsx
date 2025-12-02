"use client";

import { Product, ProductSearch } from "@/schemas/product";
import { useSimilarProducts } from "@/hooks/useProduct";
import ComponentLoader from "@/components/component-loader";
import ProductCard from "@/components/store/products/product-card";

type RelatedProductsProps = {
    product: Product;
};

export default function RelatedProducts({ product }: RelatedProductsProps) {
    const { data, isLoading, error } = useSimilarProducts(product.id, 4);

    if (isLoading) {
        return <ComponentLoader className="min-h-[400px]" />;
    }

    if (error) {
        return null;
    }

    const productPreviews = data?.similar?.filter((item: ProductSearch) => item.id !== product.id);

    if (!productPreviews?.length) {
        return null;
    }

    return (
        <div>
            <div className="flex flex-col items-center text-center mb-12">
                <span className="text-base text-muted-foreground">Related products</span>
                <p className="text-lg md:text-xl text-foreground max-w-lg">You might also want to check out these products.</p>
            </div>

            <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-2 md:gap-x-6 gap-y-8">
                {productPreviews?.slice(0, 4).map((product: ProductSearch, idx: number) => (
                    <li key={idx}>
                        <ProductCard product={product} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
