import dynamic from "next/dynamic";

import { api } from "@/api";
import { Product } from "@/lib/models";
const ProductCard = dynamic(() => import("@/components/product/product-card"), { loading: () => <p>Loading...</p> });

type RecommendedProductsProps = {
    exclude?: Array<string | number>;
};

export default async function RecommendedProducts({ exclude = [] }: RecommendedProductsProps) {
    const { products } = await api.product.search({ limit: 40 });

    if (!products.length) {
        return null;
    }

    const filteredProducts = exclude?.length ? products.filter((product: Product) => !exclude.includes(product.id!.toString())) : products;

    return (
        <div>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-2 md:gap-x-4 gap-y-8">
                {filteredProducts.map((product: Product) => (
                    <li key={product.id}>
                        <ProductCard product={product} wishlist={[]} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
