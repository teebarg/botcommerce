"use client";

import React, { useState } from "react";
import { ArrowUpRightMini, ChevronRight, Delivery } from "nui-react-icons";
import Image from "next/image";

import { cn, currency } from "@/lib/utils";
import ProductDetails from "@/components/store/products/product-details";
import LocalizedClientLink from "@/components/ui/link";
import ProductShare from "@/components/product/product-share";
import { ProductImage, ProductVariant } from "@/schemas";
import { ProductVariantSelection } from "@/components/product/product-variant-selection";
import { Product } from "@/schemas/product";

interface Props {
    product: Product;
}

const ProductView: React.FC<Props> = ({ product }) => {
    const [selectedImageId, setSelectedImageId] = useState<number>(product.images[0]?.id || 0);

    const selectedImage = product.images.find((img: ProductImage) => img.id === selectedImageId) || product.images[0];

    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product.variants?.[0]);

    return (
        <div className="max-w-7xl mx-auto h-full w-full md:my-8">
            <nav className="hidden md:block mb-4" data-slot="base">
                <ol className="flex flex-wrap list-none rounded-lg" data-slot="list">
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
            <div className="relative flex flex-col lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
                <div className="relative h-full w-full flex-none flex flex-col-reverse md:flex-row gap-2 md:gap-4">
                    {/* Image Gallery */}
                    <div className="flex flex-wrap md:flex-col gap-4 px-2 md:px-0">
                        {product.images
                            ?.sort((a, b) => a.order - b.order)
                            ?.map((image: ProductImage, idx: number) => (
                                <button
                                    key={idx}
                                    className={`w-16 h-16 rounded-md shrink-0 border-2 overflow-hidden relative ${
                                        selectedImageId === image.id ? "border-indigo-500" : "border-gray-200"
                                    }`}
                                    onClick={() => setSelectedImageId(image.id)}
                                >
                                    <Image fill alt={`Thumbnail - ${image.image}`} className="object-cover w-full h-full" src={image.image} />
                                </button>
                            ))}
                    </div>
                    <div className="flex-1">
                        <div className="h-[60vh] flex items-center justify-center p-4 relative">
                            <Image
                                fill
                                alt={selectedImage?.image || product.image || "placeholder"}
                                className="object-contain h-full w-full rounded"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                src={selectedImage?.image || product.image || "/placeholder.jpg"}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col px-2 md:px-0 mt-6 md:mt-0">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold tracking-tight">{product.name}</h1>
                        <ProductShare name={product.name} />
                    </div>
                    <div className={cn("text-4xl font-bold", selectedVariant ? "hidden md:block" : "hidden")}>{currency(selectedVariant?.price)}</div>
                    <div className="my-2 flex items-center gap-2">
                        <p className="text-sm text-default-500">{product?.reviews?.length || 0} reviews</p>
                    </div>
                    <div className={cn("bg-orange-800 py-4 px-4 md:hidden -mx-2 mb-4", selectedVariant ? "" : "hidden")}>
                        <div className="flex items-center text-white">
                            <span className="text-3xl font-semibold">{currency(selectedVariant?.price)}</span>
                            {selectedVariant?.old_price > selectedVariant?.price && (
                                <span className="ml-1 text-sm line-through">{currency(selectedVariant?.old_price)}</span>
                            )}
                        </div>
                        {selectedVariant?.old_price > selectedVariant?.price && (
                            <div className="mt-1 -mb-1.5">
                                <span className="text-xl font-medium text-orange-400">
                                    Save {(((selectedVariant?.old_price - selectedVariant?.price) / selectedVariant?.old_price) * 100).toFixed(0)}%
                                </span>
                            </div>
                        )}
                    </div>

                    <ProductVariantSelection product={product} onVariantChange={setSelectedVariant} />

                    <div className="mt-4">
                        <p className="line-clamp-3 text-base text-default-500">{product.description}</p>
                    </div>
                    <div className="mt-6 flex flex-col gap-1">
                        <div className="mb-4 flex items-center gap-2 text-default-900">
                            <Delivery />
                            <p className="text-sm font-medium">Free shipping and 30 days return</p>
                        </div>
                        <LocalizedClientLink
                            className="inline-flex items-center text-sm hover:opacity-80 transition-opacity my-2 text-default-500"
                            href={"/"}
                        >
                            See guide
                            <ArrowUpRightMini />
                        </LocalizedClientLink>
                    </div>
                    <ProductDetails />
                </div>
            </div>
        </div>
    );
};

export default ProductView;
