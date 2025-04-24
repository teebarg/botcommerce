"use client";

import React, { useState } from "react";
import { ArrowUpRightMini, ChevronRight, Delivery } from "nui-react-icons";
import { toast } from "sonner";
import Image from "next/image";

import { currency } from "@/lib/util/util";
import ProductDetails from "@/components/store/products/product-details";
import LocalizedClientLink from "@/components/ui/link";
import { api } from "@/apis";
import ProductShare from "@/components/product/product-share";
import { Product, ProductImage } from "@/types/models";
import { Button } from "@/components/ui/button";
import { useInvalidateCart, useInvalidateCartItem } from "@/lib/hooks/useCart";

interface Props {
    product: Product;
}

const ProductView: React.FC<Props> = ({ product }) => {
    const invalidateCart = useInvalidateCart();
    const invalidateCartItems = useInvalidateCartItem();
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedImageId, setSelectedImageId] = useState<number>(product.images[0]?.id || 0);
    const [loading, setLoading] = useState<boolean>(false);

    // Find the selected image
    const selectedImage = product.images.find((img: ProductImage) => img.id === selectedImageId) || product.images[0];

    // Check if the selected variant is in stock
    // const isInStock = selectedVariant.inventory > 0;

    // Handle add to cart
    const handleAddToCart = async () => {
        if (!product.variants[0]) {
            toast.error("Please select a variant");

            return;
        }

        // if (!isInStock) {
        //     toast.error("Product out of stock")
        //     return;
        // }

        setLoading(true);
        const response = await api.cart.add({
            variant_id: product.variants[0].id,
            quantity,
        });

        if (response.error) {
            toast.error(response.error);

            return;
        }
        invalidateCartItems();
        invalidateCart();

        toast.success("Added to cart successfully");
        setLoading(false);
    };

    return (
        <React.Fragment>
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
                        <div className="flex md:flex-col gap-4 px-2 md:px-0">
                            {product.images.map((image: ProductImage, idx: number) => (
                                <button
                                    key={idx}
                                    className={`w-16 h-16 rounded-md flex-shrink-0 border-2 overflow-hidden relative ${
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
                                {selectedImage && (
                                    <Image
                                        fill
                                        alt={selectedImage.image}
                                        className="object-contain h-full w-full rounded"
                                        src={selectedImage.image}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col px-2 md:px-0 mt-6 md:mt-0">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
                            <ProductShare name={product.name} />
                        </div>
                        <div className="text-2xl font-bold hidden md:block">{currency(product.variants[0].price)}</div>
                        <div className="my-2 flex items-center gap-2">
                            <p className="text-sm text-default-500">{product?.reviews?.length || 0} reviews</p>
                        </div>
                        <div className="bg-orange-800 py-4 px-4 md:hidden -mx-2 mb-4">
                            <div className="flex items-center text-white">
                                <span className="text-3xl font-semibold ">{currency(product.variants[0].price)}</span>
                                {product.variants[0].old_price > product.variants[0].price && (
                                    <span className="ml-1 text-sm line-through">{currency(product.variants[0].old_price)}</span>
                                )}
                            </div>
                            {product.variants[0].old_price > product.variants[0].price && (
                                <div className="mt-1 -mb-1.5">
                                    <span className="text-xl font-medium text-orange-400">
                                        Save{" "}
                                        {(
                                            ((product.variants[0].old_price - product.variants[0].price) / product.variants[0].old_price) *
                                            100
                                        ).toFixed(0)}
                                        %
                                    </span>
                                </div>
                            )}
                        </div>
                        {/* <div className="max-w-40 mt-2 hidden md:block">
                            <Suspense fallback={<div>Loading</div>}>prod action</Suspense>
                        </div> */}
                        {/* Quantity Selection */}
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-default-700">Quantity:</label>
                            <div className="flex items-center border rounded-md">
                                <Button size="sm" variant="ghost" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                    -
                                </Button>
                                <span className="px-4">{quantity}</span>
                                <Button size="sm" variant="ghost" onClick={() => setQuantity(quantity + 1)}>
                                    +
                                </Button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        {product.variants[0].status == "OUT_OF_STOCK" ? (
                            <Button className="w-full mt-4 cursor-not-allowed" disabled={true} size="lg">
                                Out of Stock
                            </Button>
                        ) : (
                            <Button
                                className="w-full mt-4"
                                disabled={loading || !product.variants[0]}
                                size="lg"
                                type="button"
                                onClick={handleAddToCart}
                            >
                                {loading ? "Adding to cart..." : "Add to Cart"}
                            </Button>
                        )}

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
                        <ProductDetails product={product} />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default ProductView;
