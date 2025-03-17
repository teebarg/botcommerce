"use client";

import React, { Suspense, useState } from "react";
import { notFound } from "next/navigation";
import ProductActions from "@modules/products/components/product-actions";
import RelatedProducts from "@modules/products/components/related-products";
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products";
import { ArrowUpRightMini, ChevronRight, Delivery } from "nui-react-icons";
import Image from "next/image";

import { siteConfig } from "@/lib/config";
import SkeletonProductTemplate from "@/modules/products/skeleton-product";
import { currency } from "@/lib/util/util";
import ProductDetails from "@/modules/products/templates/details";
import LocalizedClientLink from "@/components/ui/link";
import ReviewsSection from "@/components/product/product-reviews";
import { Skeleton } from "@/components/skeleton";
import { api } from "@/apis";
import ServerError from "@/components/server-error";
import ProductShare from "@/components/product/product-share";
import { Product, ProductImage, ProductVariant } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
    product: Product;
}

const ProductView3: React.FC<Props> = ({ product }) => {
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
    const [quantity, setQuantity] = useState<number>(1);
    const [isAddedToCart, setIsAddedToCart] = useState<boolean>(false);
    const [selectedImageId, setSelectedImageId] = useState<number>(product.images[0].id);
    const [loading, setLoading] = useState(false);

    // Find the selected image
    const selectedImage = product.images.find((img: ProductImage) => img.id === selectedImageId) || product.images[0];

    // Check if the selected variant is in stock
    const isInStock = selectedVariant.inventory > 0;

    // Handle add to cart
    // const handleAddToCart = () => {
    //     if (isInStock) {
    //         console.log("Adding to cart:", {
    //             product: product.name,
    //             variant: selectedVariant.name,
    //             price: selectedVariant.price,
    //             quantity,
    //         });

    //         setIsAddedToCart(true);
    //         setTimeout(() => setIsAddedToCart(false), 3000);
    //     }
    // };

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            toast.error("Please select a variant");
            return;
        }

        // if (!isInStock) {
        //     toast.error("Product out of stock")
        //     return;
        // }

        setLoading(true);
        try {
            const response = await api.cart.add({
                variant_id: selectedVariant.id,
                quantity,
            });

            if (response.error) {
                toast.error(response.error);
                return;
            }

            toast.success("Added to cart successfully");
            // router.refresh();
        } catch (error) {
            toast.error("Failed to add to cart");
        } finally {
            setLoading(false);
        }
    };

    return (
        <React.Fragment>
            {/* <div className="sticky top-14 z-50 w-full px-8 py-4 bg-background shadow-xl md:hidden">
                    <ProductActions btnClassName="font-semibold bg-rose-500 text-white" className="w-full" product={product} showPrice={false} />
                </div> */}
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
                            {/* {product?.images?.map((image: any, index: number) => (
                                <div key={index} className="w-[80px] h-[120px] relative rounded-lg overflow-hidden">
                                    <Image fill alt={`Product ${index + 1}`} src={image.image} />
                                </div>
                            ))} */}
                            {product.images.map((image: ProductImage, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImageId(image.id)}
                                    className={`w-16 h-16 rounded-md flex-shrink-0 border-2 overflow-hidden ${
                                        selectedImageId === image.id ? "border-indigo-500" : "border-gray-200"
                                    }`}
                                >
                                    <img src={image.image} alt={`Thumbnail - ${image.image}`} className="object-cover w-full h-full" />
                                </button>
                            ))}
                        </div>
                        <div className="flex-1">
                            {/* <div className="h-[60vh] relative rounded-lg overflow-hidden">
                                {product.images[0] && <Image fill alt={product.name} src={product.images[0].image} />}
                            </div> */}
                            <div className="h-[60vh] flex items-center justify-center p-4">
                                <img src={selectedImage.image} alt={selectedImage.image} className="object-contain h-full w-full rounded" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col px-2 md:px-0 mt-6 md:mt-0">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
                            <ProductShare name={product.name} />
                        </div>
                        <div className="text-2xl font-bold">{selectedVariant ? currency(selectedVariant.price) : currency(product.price)}</div>
                        <div className="my-2 flex items-center gap-2">
                            <p className="text-sm text-default-500">{product?.reviews?.length || 0} reviews</p>
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
                        {/* <div className="max-w-40 mt-2 hidden md:block">
                            <Suspense fallback={<div>Loading</div>}>prod action</Suspense>
                        </div> */}
                        {/* Quantity Selection */}
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700">Quantity:</label>
                            <div className="flex items-center border rounded-md">
                                <Button variant="ghost" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                    -
                                </Button>
                                <span className="px-4">{quantity}</span>
                                <Button variant="ghost" size="sm" onClick={() => setQuantity(quantity + 1)}>
                                    +
                                </Button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <Button type="button" size="lg" onClick={handleAddToCart} disabled={loading || !selectedVariant} className="w-full mt-4">
                            {loading ? "Adding to cart..." : "Add to Cart"}
                        </Button>
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

export default ProductView3;
