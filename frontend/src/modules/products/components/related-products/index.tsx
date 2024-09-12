import { getProductsList, getRegion } from "@lib/data";

import ProductPreview from "../product-preview";

type RelatedProductsProps = {
    product: any;
    countryCode: string;
};

export default async function RelatedProducts({ product, countryCode }: RelatedProductsProps) {
    const region = await getRegion(countryCode);

    if (!region) {
        return null;
    }

    // edit this function to define your related products logic
    const setQueryParams = (): any => {
        const params: any = {};

        if (region?.id) {
            params.region_id = region.id;
        }

        if (region?.currency_code) {
            params.currency_code = region.currency_code;
        }

        if (product.collection_id) {
            params.collection_id = [product.collection_id];
        }

        if (product.tags) {
            params.tags = product.tags.map((t) => t.value);
        }

        params.is_giftcard = false;

        return params;
    };

    const queryParams = setQueryParams();

    const productPreviews = await getProductsList({
        queryParams,
        countryCode,
    }).then(({ response }) => response.products.filter((productPreview) => productPreview.id !== product.id));

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
                {productPreviews.slice(0, 4).map((productPreview) => (
                    <li key={productPreview.id}>
                        <ProductPreview productPreview={productPreview} region={region} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
