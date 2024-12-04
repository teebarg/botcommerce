import React, { Suspense } from "react";
import ProductActions from "@modules/products/components/product-actions";
import RelatedProducts from "@modules/products/components/related-products";
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products";
import { notFound } from "next/navigation";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { ArrowUpRightMini, ChevronRight, Delivery } from "nui-react-icons";
import { Product } from "types/global";
import Image from "next/image";

import ProductDetails from "./details";

type ProductTemplateProps = {
    product: Product;
};

const ProductTemplate: React.FC<ProductTemplateProps> = ({ product }) => {
    if (!product || !product.id) {
        return notFound();
    }

    return (
        <React.Fragment>
            <div className="max-w-7xl mx-auto h-full w-full px-2 lg:px-12 my-8">
                <nav data-slot="base">
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
                            <img alt={product.name} className="h-[60vh]" src={product.image as string} />
                        </div>
                    </div>
                    <div className="flex flex-col px-2 md:px-0">
                        <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
                        <div className="my-2 flex items-center gap-2">
                            <p className="text-small text-default-500">669 reviews</p>
                        </div>
                        <div className="max-w-40 mt-2">
                            <Suspense fallback={<ProductActions disabled={true} product={product} />}>
                                <ProductActions product={product} />
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
            <div className="max-w-7xl mx-auto px-6 my-4" data-testid="related-products-container">
                <Suspense fallback={<SkeletonRelatedProducts />}>
                    <RelatedProducts product={product} />
                </Suspense>
            </div>
        </React.Fragment>
    );
};

export default ProductTemplate;
