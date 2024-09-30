import { Product } from "types/global";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { Suspense } from "react";

import ProductActions from "../product-actions";

interface ComponentProps {
    product: Product;
}

const ProductCard: React.FC<ComponentProps> = async ({ product }) => {
    return (
        <div key={product.id} className="relative flex flex-col rounded-t-md">
            <div className="relative">
                <div className="relative h-72 w-full overflow-hidden rounded-lg p-2">
                    <img alt={product.name} className="h-full w-full object-cover object-center" src={product.image as string} />
                </div>
                <div className="relative mt-4">
                    <LocalizedClientLink className="font-medium text-default-700 text-base line-clamp-2" href={`/products/${product.slug}`}>
                        {product.name}
                    </LocalizedClientLink>
                </div>
                {/* <div className="absolute inset-x-0 top-0 flex h-72 items-end justify-end overflow-hidden rounded-lg p-4">
                    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-default-500 opacity-50" />
                </div> */}
            </div>
            <div className="h-full flex flex-col-reverse">
                <Suspense fallback={<div />}>
                    <ProductActions product={product} />
                </Suspense>
            </div>
        </div>
    );
};

export { ProductCard };
