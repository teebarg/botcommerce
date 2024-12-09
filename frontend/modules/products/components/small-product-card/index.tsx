import { Product, WishlistItem } from "types/global";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { Suspense } from "react";
import React from "react";

import ProductActions from "../product-actions";
import { ProductWishList } from "../product-card/product-wishlist";

interface ComponentProps {
    product: Product;
    wishlist: WishlistItem[];
    showWishlist?: boolean;
}

const SMProductCard: React.FC<ComponentProps> = async ({ product, wishlist, showWishlist = false }) => {
    const inWishlist = !!wishlist?.find((wishlist) => wishlist.product_id === product.id);

    return (
        <>
            <React.Fragment>
                <div
                    className="relative flex max-w-full flex-none scroll-ml-6 flex-col gap-3 rounded-large bg-content1 p-2 shadow-medium w-full snap-start"
                    id={`${product.id}`}
                >
                    {/* <div className="max-w-fit min-w-min inline-flex items-center justify-between box-border whitespace-nowrap px-1 h-5 text-tiny rounded-small bg-secondary-100 text-secondary-foreground absolute right-7 top-4 z-20">
                        <span className="flex-1 text-inherit px-1 pl-0.5 font-semibold">New</span>
                    </div> */}
                    <div className="relative flex max-h-full w-full flex-col items-center overflow-visible rounded-medium bg-content2 h-[22rem] justify-between">
                        <div className="flex flex-col gap-2 px-4 pt-6 w-full">
                            <h3 className="text-base font-semibold tracking-tight leading-4 text-default-900 line-clamp-2">
                                <LocalizedClientLink className="" href={`/products/${product.slug}`}>
                                    {product.name}
                                </LocalizedClientLink>
                            </h3>
                            {/* <p className="text-small text-default-500 line-clamp-1">{product.description}</p> */}
                        </div>
                        <img
                            alt={product.name}
                            className="relative rounded-large z-0 max-h-full max-w-[80%] overflow-visible object-contain object-center hover:scale-110 h-72 w-auto"
                            src={product.image as string}
                        />
                    </div>
                    <div className="flex flex-col gap-3 px-1 flex-1">
                        <div className="h-full flex flex-col-reverse">
                            <Suspense fallback={<div />}>
                                <ProductActions
                                    product={product}
                                    wishlist={showWishlist && <ProductWishList className="relative flex" inWishlist={inWishlist} product={product} />}
                                />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        </>
    );
};

export { SMProductCard };
