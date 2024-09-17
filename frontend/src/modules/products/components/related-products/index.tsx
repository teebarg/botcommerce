import { getProductsList } from "@lib/data";

import ProductPreview from "../product-preview";
import { Product } from "types/global";

type RelatedProductsProps = {
    product: any;
};

export default async function RelatedProducts({ product }: RelatedProductsProps) {
    // edit this function to define your related products logic
    const setQueryParams = (): any => {
        const params: any = {};

        if (product.collections) {
            params.collections = [...product.collections.map((item: any) => item.name)];
        }

        if (product.tags) {
            params.tags = product.tags.map((t: any) => t.value);
        }

        return params;
    };

    const queryParams = setQueryParams();
    const { products } = await getProductsList(queryParams);
    const productPreviews = products.filter((item: Product) => item.id !== product.id);

    if (!productPreviews.length) {
        return null;
    }

    return (
        <div className="product-page-constraint">
            <div className="flex flex-col items-center text-center mb-16">
                <span className="text-base text-gray-600 mb-6">Related products</span>
                <p className="text-2xl text-default-800 max-w-lg">You might also want to check out these products.</p>
            </div>

            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {productPreviews.slice(0, 4).map((product: any) => (
                    <li key={product.id}>
                        <ProductPreview product={product} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
