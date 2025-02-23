import dynamic from "next/dynamic";

import { api } from "@/api";
import { Product } from "@/lib/models";

const ProductCard = dynamic(() => import("@/components/product/product-card"), { loading: () => <p>Loading...</p> });

type RelatedProductsProps = {
    product: Product;
};

export default async function RelatedProducts({ product }: RelatedProductsProps) {
    // edit this function to define your related products logic
    const setQueryParams = (): any => {
        const params: any = {};

        if (product.collections) {
            params.collections = product.collections.map((p: any) => p.slug).join(",");
        }

        params.limit = 4;

        return params;
    };

    const queryParams = setQueryParams();
    const { products } = await api.product.search(queryParams);
    const productPreviews = products.filter((item: Product) => item.id !== product.id);

    if (!productPreviews.length) {
        return null;
    }

    return (
        <div>
            <div className="flex flex-col items-center text-center mb-12">
                <span className="text-base text-default-500 mb-2">Related products</span>
                <p className="text-lg md:text-2xl text-default-900 max-w-lg">You might also want to check out these products.</p>
            </div>

            <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-2 md:gap-x-6 gap-y-8">
                {productPreviews.slice(0, 4).map((product: Product) => (
                    <li key={product.id}>
                        <ProductCard product={product} wishlist={[]} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
