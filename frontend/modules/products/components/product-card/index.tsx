import { Product, WishlistItem } from "types/global";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { Suspense } from "react";

import ProductActions from "../product-actions";

import { ProductWishList } from "./product-wishlist";

interface ComponentProps {
    product: Product;
    wishlist: WishlistItem[];
    showWishlist?: boolean;
}

const ProductCard: React.FC<ComponentProps> = async ({ product, wishlist, showWishlist = false }) => {
    const inWishlist = !!wishlist?.find((wishlist) => wishlist.product_id === product.id);

    return (
        <div key={product.id} className="relative flex flex-col rounded-t-md">
            <div className="relative">
                {showWishlist && <ProductWishList className="absolute right-6 top-6" inWishlist={inWishlist} product={product} />}

                <div className="relative h-72 w-full overflow-hidden rounded-lg p-2">
                    <img alt={product.name} className="h-full w-full object-cover object-center" src={product.image as string} />
                </div>
                <div className="relative mt-4">
                    <LocalizedClientLink className="font-medium text-default-900 text-base line-clamp-2" href={`/products/${product.slug}`}>
                        {product.name}
                    </LocalizedClientLink>
                </div>
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
