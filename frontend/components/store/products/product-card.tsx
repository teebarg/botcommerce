"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { Heart, ShoppingCart } from "lucide-react";
import { HeartFilled } from "nui-react-icons";

import { ProductSearch, WishItem } from "@/types/models";
import { api } from "@/apis";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/util/cn";
import { currency } from "@/lib/util/util";
import { useInvalidateCart, useInvalidateCartItem } from "@/lib/hooks/useCart";

interface ProductCardProps {
    product: ProductSearch;
    showWishlist?: boolean;
    wishlist?: WishItem[];
}

const ProductCard: React.FC<ProductCardProps> = ({ product, wishlist, showWishlist = false }) => {
    const invalidateCart = useInvalidateCart();
    const invalidateCartItems = useInvalidateCartItem();
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const { id, slug, name, price, old_price, image, variants, status } = product;
    // const discountedPrice = old_price ? price - (price * (old_price - price)) / 100 : price;

    // const discount = old_price ? Math.round((1 - price / old_price) * 100) : 0;
    const inWishlist = !!wishlist?.find((wishlist) => wishlist.product_id === product.id);

    const handleWishlistClick = async () => {
        const { error } = await api.user.addWishlist(id);

        if (error) {
            toast.error(error);

            return;
        }
        toast.success("Added to favorites");
    };

    const removeWishlist = async () => {
        const { error } = await api.user.deleteWishlist(id);

        if (error) {
            toast.error(error);

            return;
        }
        toast.success("Removed from favorites");
    };

    const handleAddToCart = async () => {
        // if (!isInStock) {
        //     toast.error("Product out of stock")
        //     return;
        // }

        if (!variants?.length) {
            toast.error("Product out of stock");

            return;
        }

        setLoading(true);
        const response = await api.cart.add({
            variant_id: variants[0].id,
            quantity: 1,
        });

        if (response.error) {
            toast.error(response.error);

            return;
        }
        invalidateCart();
        invalidateCartItems();
        toast.success("Added to cart successfully");
        setLoading(false);
    };

    return (
        <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-1 cursor-pointer group"
            initial={{ opacity: 0, scale: 0.5 }}
            transition={{
                duration: 0.8,
                delay: 0.5,
                ease: [0, 0.71, 0.2, 1.01],
            }}
            onClick={() => router.push(`/products/${slug}`)}
        >
            <div className="flex flex-col gap-2 w-full">
                <div className="aspect-square w-full relative overflow-hidden rounded-xl">
                    {image && <Image fill alt={name} className="object-cover h-full w-full group-hover:scale-110 transition" src={image} />}
                    {showWishlist && (
                        <Button
                            className={cn(
                                "absolute top-3 right-3 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100",
                                inWishlist && "opacity-100"
                            )}
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                inWishlist ? removeWishlist() : handleWishlistClick();
                            }}
                        >
                            {inWishlist ? <HeartFilled className="w-7 h-7 text-rose-400" /> : <Heart className="w-7 h-7" />}
                        </Button>
                    )}
                </div>
                <div className="font-semibold text-default-900 my-2 line-clamp-1 hover:text-default-700 transition-colors px-1">{name}</div>
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center">
                        <span className="text-lg font-semibold text-danger">{currency(price)}</span>
                        {old_price > price && <span className="ml-1 text-xs md:text-sm text-default-500 line-through">{currency(old_price)}</span>}
                    </div>
                    {old_price > price && (
                        <span className="text-xs font-semibold text-green-600">Save {(((old_price - price) / old_price) * 100).toFixed(0)}%</span>
                    )}
                </div>
                <Button
                    className="w-full gap-2 mt-1"
                    disabled={loading || status == "OUT_OF_STOCK"}
                    isLoading={loading}
                    size="lg"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart();
                    }}
                >
                    {status == "OUT_OF_STOCK" ? (
                        <span>Out of stock</span>
                    ) : (
                        <>
                            <ShoppingCart className="w-4 h-4" />
                            <span>Add</span>
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
};

export default ProductCard;
