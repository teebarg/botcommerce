import { Product } from "types/global";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

import PreviewPrice from "./price";

export default async function ProductPreview({ product }: { product: Product }) {
    return (
        <LocalizedClientLink className="block h-full" data-testid="product-wrapper" href={`/products/${product.slug}`}>
            <div key={product.id}>
                <div className="relative">
                    <div className="relative h-72 w-full overflow-hidden rounded-lg">
                        <img alt={product.name} className="h-full w-full object-cover object-center" src={product.image as string} />
                    </div>
                    <div className="relative mt-4">
                        <span className="font-medium text-default-700 text-base line-clamp-2">{product.name}</span>
                    </div>
                    <div className="absolute inset-x-0 top-0 flex h-72 items-end justify-end overflow-hidden rounded-lg p-4">
                        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-default-500 opacity-50" />
                        <span className="relative text-lg font-semibold text-default-50">
                            {product.price && <PreviewPrice price={product.price} />}
                        </span>
                    </div>
                </div>
            </div>
        </LocalizedClientLink>
    );
}
