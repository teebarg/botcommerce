"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Heart } from "nui-react-icons";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";

import { ProductSearch, WishItem } from "@/lib/models";
import { api } from "@/apis";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { currency } from "@/lib/util/util";
import { cn } from "@/lib/util/cn";

interface ProductCardProps {
    product: ProductSearch;
    showWishlist?: boolean;
    wishlist?: WishItem[];
}

const ProductCard: React.FC<ProductCardProps> = ({ product, wishlist, showWishlist = false }) => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const { id, slug, name, price, old_price, image, categories, variants, status } = product;
    const discountedPrice = old_price ? price - (price * (old_price - price)) / 100 : price;

    const discount = old_price ? Math.round((1 - price / old_price) * 100) : 0;
    const inWishlist = !!wishlist?.find((wishlist) => wishlist.product_id === product.id);

    const handleWishlistClick = async () => {
        try {
            const { error } = await api.user.addWishlist(id);

            if (error) {
                toast.error(error);

                return;
            }
            toast.success("Added to favorites");
        } catch (error) {
            toast.error("An error occurred!");
        }
    };

    const removeWishlist = async () => {
        try {
            const { error } = await api.user.deleteWishlist(id);

            if (error) {
                toast.error(error);

                return;
            }
            toast.success("Removed from favorites");
        } catch (error) {
            toast.error("An error occurred!");
        }
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
        try {
            const response = await api.cart.add({
                variant_id: variants[0].id,
                quantity: 1,
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
        <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.1 }}
        >
            <div className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => router.push(`/products/${slug}`)}>
                    <img
                        alt={name}
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                        src={image}
                    />
                    {showWishlist && (
                        <Button
                            className={cn(
                                "absolute top-4 right-4 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 bg-gray-500",
                                inWishlist && "bg-gray-400 opacity-100"
                            )}
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                inWishlist ? removeWishlist() : handleWishlistClick();
                            }}
                        >
                            <Heart className="w-5 h-5" />
                        </Button>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 cursor-pointer" onClick={() => router.push(`/products/${slug}`)}>
                    <div className="flex flex-nowrap overflow-hidden gap-1 h-5">
                        {categories.map((category: string, idx: number) => (
                            <Badge key={idx} variant="destructive">
                                {category}
                            </Badge>
                        ))}
                    </div>
                    <h3 className="font-medium text-default-900 my-2 line-clamp-1 hover:text-default-700 transition-colors">{name}</h3>
                    {old_price > price && (
                        <div className="absolute top-4 left-4">
                            <span className="text-sm font-semibold text-green-600">Save {(((old_price - price) / old_price) * 100).toFixed(0)}%</span>
                        </div>
                    )}
                    <div className="flex items-center">
                        <span className="text-lg font-semibold text-danger">{currency(price)}</span>
                        {old_price > price && <span className="ml-1 text-xs md:text-sm text-default-500 line-through">{currency(old_price)}</span>}
                    </div>
                    <Button
                        className="w-full gap-2"
                        disabled={loading || status == "OUT_OF_STOCK"}
                        isLoading={loading}
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
            </div>
        </motion.div>
    );
};

export default ProductCard;
