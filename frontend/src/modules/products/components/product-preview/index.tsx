import { ProductPreviewType } from "types/global";
import { retrievePricedProductById } from "@lib/data";
import { getProductPrice } from "@lib/util/get-product-price";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

import PreviewPrice from "./price";

export default async function ProductPreview({
    productPreview,
    isFeatured,
    region,
}: {
    productPreview: ProductPreviewType;
    isFeatured?: boolean;
    region: any;
}) {
    const pricedProduct = await retrievePricedProductById({
        id: productPreview.id,
        regionId: region.id,
    }).then((product: any) => product);

    if (!pricedProduct) {
        return null;
    }

    const { cheapestPrice } = getProductPrice({
        product: pricedProduct,
        region,
    });

    return (
        <LocalizedClientLink className="block h-full" data-testid="product-wrapper" href={`/products/${productPreview.handle}`}>
            <div key={productPreview.id}>
                <div className="relative">
                    <div className="relative h-72 w-full overflow-hidden rounded-lg">
                        <img
                            alt={productPreview.title}
                            className="h-full w-full object-cover object-center"
                            src={productPreview.thumbnail as string}
                        />
                    </div>
                    <div className="relative mt-4">
                        <span className="font-medium text-default-700 text-base line-clamp-2">{productPreview.title}</span>
                    </div>
                    <div className="absolute inset-x-0 top-0 flex h-72 items-end justify-end overflow-hidden rounded-lg p-4">
                        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-default-500 opacity-50" />
                        <span className="relative text-lg font-semibold text-default-50">
                            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
                        </span>
                    </div>
                </div>
            </div>
        </LocalizedClientLink>
    );
}
