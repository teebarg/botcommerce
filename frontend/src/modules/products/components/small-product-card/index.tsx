import { Product, WishlistItem } from "types/global";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { Suspense } from "react";

import ProductActions from "../product-actions";
import { ProductWishList } from "../product-card/product-wishlist";
import React from "react";

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
                    id={`${product.id}`}
                    className="relative flex max-w-full flex-none scroll-ml-6 flex-col gap-3 rounded-large bg-content1 p-2 shadow-medium w-full snap-start"
                >
                    <span className="absolute right-7 top-6 z-20 text-tiny font-semibold text-default-500">NEW</span>
                    <div className="relative flex max-h-full w-full flex-col items-center overflow-visible rounded-medium bg-content2 h-full justify-between">
                        <div className="flex flex-col gap-2 px-4 pt-6 w-full">
                            <h3 className="text-base font-semibold tracking-tight text-default-900 line-clamp-2 text-left2">
                                <LocalizedClientLink className="" href={`/products/${product.slug}`}>
                                    {product.name}
                                </LocalizedClientLink>
                            </h3>
                            {/* <p className="text-small text-default-500 line-clamp-1">{product.description}</p> */}
                        </div>
                        <img
                            alt={product.name}
                            className="relative rounded-large z-0 max-h-full max-w-[80%] overflow-visible object-contain object-center hover:scale-110 flex h-72 w-auto items-center"
                            src={product.image as string}
                        />
                    </div>
                    <div className="flex flex-col gap-3 px-1 flex-1">
                        {/* <div className="items-center justify-between">
                            <h3 className="text-medium font-medium text-default-900">
                                <LocalizedClientLink className="" href={`/products/${product.slug}`}>
                                    {product.name}
                                </LocalizedClientLink>
                            </h3>
                        </div> */}
                        <div className="h-full flex flex-col-reverse">
                            <Suspense fallback={<div />}>
                                <ProductActions product={product} wishlist={showWishlist && <ProductWishList className="relative flex" product={product} inWishlist={inWishlist} />} />
                            </Suspense>
                        </div>
                        {/* <div className="flex gap-2">
                            <button
                                className="z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap subpixel-antialiased overflow-hidden tap-highlight-transparent data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 px-4 min-w-20 h-10 text-small gap-2 rounded-large w-full [&>svg]:max-w-[theme(spacing.8)] transition-transform-colors-opacity motion-reduce:transition-none data-[hover=true]:opacity-hover bg-default-300/20 font-medium text-default-700"
                                type="button"
                            >
                                Save
                            </button>
                            <button
                                className="z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap subpixel-antialiased overflow-hidden tap-highlight-transparent data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 px-4 min-w-20 h-10 text-small gap-2 rounded-large w-full [&>svg]:max-w-[theme(spacing.8)] transition-transform-colors-opacity motion-reduce:transition-none bg-primary/20 text-primary data-[hover=true]:opacity-hover font-medium"
                                type="button"
                            >
                                Add to cart
                            </button>
                        </div> */}
                    </div>
                </div>
            </React.Fragment>
            {/* <div key={product.id} className="relative flex flex-col rounded-t-md">
                <div className="relative">
                    {showWishlist && <ProductWishList product={product} inWishlist={inWishlist} />}

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
            </div> */}
        </>
    );
};

export { SMProductCard };
