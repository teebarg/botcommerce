"use client";

import { ProductSearch } from "@/schemas";
import ProductCard from "@/components/store/products/product-card";

export default function ScrollableListing({ products }: { products: ProductSearch[] }) {
    return (
        <div className="mt-4">
            <div className="hidden lg:grid lg:grid-cols-5 gap-2">
                {products?.map((product: ProductSearch, idx: number) => <ProductCard key={idx} product={product} />)}
            </div>
            <div className="lg:hidden overflow-x-auto pb-4">
                <div className="flex gap-4 w-max">
                    {products.map((product) => (
                        <div key={product.id} className="w-72 flex-shrink-0 snap-start">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
