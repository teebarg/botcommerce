import { ProductPreviewType } from "types/global";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import ProductActionsWrapper from "@modules/products/templates/product-actions-wrapper";
import { Suspense } from "react";

interface ComponentProps {
    product: ProductPreviewType;
    region?: Region;
}

const ProductCard: React.FC<ComponentProps> = async ({ product, region }) => {
    return (
        <div key={product.id} className="relative flex flex-col">
            <div className="relative">
                <div className="relative h-72 w-full overflow-hidden rounded-lg">
                    <img alt={product.title} className="h-full w-full object-cover object-center" src={product.thumbnail as string} />
                </div>
                <div className="relative mt-4">
                    <LocalizedClientLink className="font-medium text-default-700 text-base line-clamp-2" href={`/products/${product.handle}`}>
                        {product.title}
                    </LocalizedClientLink>
                </div>
                <div className="absolute inset-x-0 top-0 flex h-72 items-end justify-end overflow-hidden rounded-lg p-4">
                    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-default-500 opacity-50" />
                    {/* <p className="relative text-lg font-semibold text-white">{product.price}</p> */}
                </div>
            </div>
            {region && (
                <div className="h-full flex flex-col-reverse">
                    <Suspense fallback={<div />}>
                        <ProductActionsWrapper id={product.id} region={region} />
                    </Suspense>
                </div>
            )}
        </div>
    );
};

export { ProductCard };
