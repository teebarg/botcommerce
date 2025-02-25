"use client";

import { Suspense } from "react";
import React from "react";
import Image from "next/image";

import { ProductWishList } from "./product-wishlist";

import ProductActions from "@/modules/products/components/product-actions";
import { Product, WishItem } from "@/lib/models";

interface ComponentProps {
    product: Product;
    wishlist?: WishItem[];
    showWishlist?: boolean;
}

const ProductCard: React.FC<ComponentProps> = ({ product, wishlist = [], showWishlist = false }) => {
    const inWishlist = !!wishlist?.find((wishlist) => wishlist.product_id === product.id);

    return (
        <>
            <React.Fragment>
                <div className="flex flex-col gap-3 h-full" id={`${product.id}`}>
                    {/* <div className="max-w-fit min-w-min inline-flex items-center justify-between box-border whitespace-nowrap px-1 h-5 text-xs rounded-lg bg-secondary-100 text-secondary-foreground absolute right-7 top-4 z-20">
                        <span className="flex-1 text-inherit px-1 pl-0.5 font-semibold">New</span>
                    </div> */}
                    <div className="relative flex max-h-full w-full flex-col items-center overflow-hidden rounded-xl bg-content2 h-[15rem] md:h-[18rem] justify-between">
                        <div className="relative md:rounded-1xl z-0 max-h-full w-full md:w-[80%] overflow-visible h-72">
                            {product.image && (
                                <Image
                                    fill
                                    alt={product.name}
                                    className="hover:scale-95"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    src={product.image}
                                />
                            )}
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
                </div>
            </React.Fragment>
        </>
    );
};

export default ProductCard;
