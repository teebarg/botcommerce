import { searchProducts } from "@lib/data";
import { Product } from "types/global";

import { ProductCard } from "../product-card";

type RelatedProductsProps = {
    product: Product;
};

export default async function RelatedProducts({ product }: RelatedProductsProps) {
    // edit this function to define your related products logic
    const setQueryParams = (): any => {
        const params: any = {};

        if (product.collections) {
            params.collections = [...product.collections];
        }

        params.limit = 4
        params.sort = "created_at:desc"

        return params;
    };

    const queryParams = setQueryParams();
    const { products } = await searchProducts(queryParams);
    const productPreviews = products.filter((item: Product) => item.id !== product.id);

    if (!productPreviews.length) {
        return null;
    }

    return (
        <div>
            <div className="flex flex-col items-center text-center mb-12">
                <span className="text-base text-gray-600 mb-6">Related products</span>
                <p className="text-2xl text-default-800 max-w-lg">You might also want to check out these products.</p>
            </div>

            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {productPreviews.slice(0, 4).map((product: Product) => (
                    <li key={product.id}>
                        <ProductCard product={product} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
