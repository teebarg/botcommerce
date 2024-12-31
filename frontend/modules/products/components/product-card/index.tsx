"use client";

import { Product, WishlistItem } from "types/global";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { Suspense } from "react";
import React from "react";
import Image from "next/image";

import ProductActions from "../product-actions";
import { ProductWishList } from "../product-card/product-wishlist";

interface ComponentProps {
    product: Product;
    wishlist?: WishlistItem[];
    showWishlist?: boolean;
}

const ProductCard: React.FC<ComponentProps> = ({ product, wishlist = [], showWishlist = false }) => {
    const inWishlist = !!wishlist?.find((wishlist) => wishlist.product_id === product.id);

    return (
        <>
            <React.Fragment>
                <LocalizedClientLink
                    className="relative flex max-w-full flex-none flex-col gap-3 rounded-large md:bg-content1 md:p-2 w-full snap-start"
                    href={`/products/${product.slug}`}
                    id={`${product.id}`}
                >
                    {/* <div className="max-w-fit min-w-min inline-flex items-center justify-between box-border whitespace-nowrap px-1 h-5 text-tiny rounded-small bg-secondary-100 text-secondary-foreground absolute right-7 top-4 z-20">
                        <span className="flex-1 text-inherit px-1 pl-0.5 font-semibold">New</span>
                    </div> */}
                    <div className="relative flex max-h-full w-full flex-col items-center overflow-hidden rounded-medium bg-content2 h-[12rem] md:h-[20rem] justify-between">
                        <div className="relative md:rounded-large z-0 max-h-full w-full md:w-[80%] overflow-visible h-72">
                            <Image fill alt={product.name} className="hover:scale-95" src={product.image as string} />
                        </div>
                    </div>
                    <div className="flex flex-col md:px-1 flex-1">
                        <div className="h-full flex flex-col-reverse">
                            <Suspense fallback={<div />}>
                                <ProductActions
                                    product={product}
                                    wishlist={showWishlist && <ProductWishList className="relative flex" inWishlist={inWishlist} product={product} />}
                                />
                            </Suspense>
                        </div>
                    </div>
                </LocalizedClientLink>
            </React.Fragment>
        </>
    );
};

export { ProductCard };
