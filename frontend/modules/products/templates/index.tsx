import React, { Suspense } from "react";
import ProductActions from "@modules/products/components/product-actions";
import RelatedProducts from "@modules/products/components/related-products";
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products";
import { notFound } from "next/navigation";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { ArrowUpRightMini, ChevronRight, Delivery, HomeIcon } from "nui-react-icons";
import { Product } from "types/global";
import Image from "next/image";

import ProductDetails from "./details";

import { currency } from "@/lib/util/util";

type ProductTemplateProps = {
    product: Product;
};

const ProductTemplate: React.FC<ProductTemplateProps> = ({ product }) => {
    if (!product || !product.id) {
        return notFound();
    }

    return (
        <React.Fragment>
            <div className="max-w-7xl mx-auto h-full w-full my-8">
                <nav className="hidden md:block" data-slot="base">
                    <ol className="flex flex-wrap list-none rounded-small" data-slot="list">
                        <li className="flex items-center" data-slot="base">
                            <LocalizedClientLink href="/">Home</LocalizedClientLink>
                        </li>
                        <li className="flex items-center" data-slot="base">
                            <span aria-hidden="true" className="px-1 text-foreground/50" data-slot="separator">
                                <ChevronRight />
                            </span>
                            <LocalizedClientLink href="/collections">Collection</LocalizedClientLink>
                        </li>
                        {product?.name && (
                            <li className="flex items-center" data-slot="base">
                                <span aria-hidden="true" className="px-1 text-foreground/50" data-slot="separator">
                                    <ChevronRight />
                                </span>
                                <span>{product.name}</span>
                            </li>
                        )}
                    </ol>
                </nav>
                <div className="relative flex flex-col lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8 mt-4">
                    <div className="relative h-full w-full flex-none flex gap-4">
                        <div className="flex flex-col gap-4">
                            {product?.images?.map((image: string, index: number) => (
                                <div key={index} className="w-[80px] h-[80px] relative rounded-lg overflow-hidden">
                                    <Image fill alt={`Product ${index + 1}`} src={image} />
                                </div>
                            ))}
                        </div>
                        <div className="flex-1">
                            <div className="h-[60vh]">
                                <Image fill alt={product.name} src={product.image as string} />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col px-2 md:px-0">
                        <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
                        <div className="my-2 flex items-center gap-2">
                            <p className="text-small text-default-500">669 reviews</p>
                        </div>
                        <div className="bg-orange-800 py-4 px-4 md:hidden -mx-2">
                            <div className="flex items-center text-white">
                                <span className="text-3xl font-semibold ">{currency(product.price)}</span>
                                {product.old_price > product.price && (
                                    <span className="ml-1 text-sm line-through">{currency(product.old_price)}</span>
                                )}
                            </div>
                            {product.old_price > product.price && (
                                <div className="mt-1 -mb-1.5">
                                    <span className="text-xl font-medium text-orange-400">
                                        Save {(((product.old_price - product.price) / product.old_price) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="max-w-40 mt-2 hidden md:block">
                            <Suspense fallback={<ProductActions disabled={true} product={product} />}>
                                <ProductActions product={product} showDetails={false} />
                            </Suspense>
                        </div>
                        <div className="mt-4">
                            <p className="line-clamp-3 text-medium text-default-500">{product.description}</p>
                        </div>
                        <div className="mt-6 flex flex-col gap-1">
                            <div className="mb-4 flex items-center gap-2 text-default-900">
                                <Delivery />
                                <p className="text-small font-medium">Free shipping and 30 days return</p>
                            </div>
                            <LocalizedClientLink
                                className="inline-flex items-center text-small hover:opacity-80 transition-opacity my-2 text-default-500"
                                href={"/"}
                            >
                                See guide
                                <ArrowUpRightMini />
                            </LocalizedClientLink>
                        </div>
                        <ProductDetails product={product} />
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-2 md:px-6 my-4" data-testid="related-products-container">
                <Suspense fallback={<SkeletonRelatedProducts />}>
                    <RelatedProducts product={product} />
                </Suspense>
            </div>
            <div className="fixed bottom-0 z-50 w-full px-6 py-3 flex gap-2 bg-background shadow-lg md:hidden">
                <LocalizedClientLink
                    className="relative inline-flex items-center justify-center outline-none px-3 h-10 rounded-small bg-transparent border border-default-500 text-default-500"
                    href="/"
                >
                    <HomeIcon />
                </LocalizedClientLink>
                <ProductActions btnClassName="font-semibold" className="w-full" product={product} showPrice={false} />
            </div>
        </React.Fragment>
    );
};

export default ProductTemplate;
