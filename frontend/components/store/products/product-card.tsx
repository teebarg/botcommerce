"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import { Heart, Star } from "lucide-react";
import { HeartFilled } from "nui-react-icons";
import { useOverlayTriggerState } from "@react-stately/overlays";

import ProductOverview from "./product-overview";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Overlay from "@/components/overlay";
import { ProductSearch } from "@/schemas/product";
import { useUserWishlist } from "@/lib/hooks/useUser";
import { useAuth } from "@/providers/auth-provider";

interface ProductCardProps {
    product: ProductSearch;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { name, image, images } = product;
    const dialogState = useOverlayTriggerState({});

    const { user } = useAuth();

    const { data } = useUserWishlist(user?.id);

    const inWishlist = !!data?.wishlists?.find((wishlist) => wishlist.product_id === product.id);

    return (
        <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="cursor-pointer group"
            initial={{ opacity: 0, scale: 0.5 }}
            transition={{
                duration: 0.8,
                delay: 0.5,
                ease: [0, 0.71, 0.2, 1.01],
            }}
        >
            <Overlay
                open={dialogState.isOpen}
                sheetClassName="min-w-[40vw]"
                showCloseButton={false}
                title="Details"
                trigger={
                    <div>
                        <div className="aspect-square w-full relative overflow-hidden rounded-xl bg-transparent">
                            <Image
                                fill
                                alt={name}
                                className="object-cover h-full w-full group-hover:scale-110 transition"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                src={images?.[0] || image || "/placeholder.jpg"}
                            />
                            {Boolean(user) && (
                                <Button
                                    className={cn(
                                        "absolute top-3 right-3 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100",
                                        inWishlist && "opacity-100"
                                    )}
                                    size="iconOnly"
                                >
                                    {inWishlist ? <HeartFilled className="w-7 h-7 text-rose-400" /> : <Heart className="w-7 h-7" />}
                                </Button>
                            )}
                        </div>
                        <div className="py-2">
                            <h3 className="font-semibold text-default-900 mb-2 line-clamp-2">{product.name}</h3>
                            <div className="flex items-center mb-2">
                                <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-sm text-default-600 ml-1">{product.average_rating}</span>
                                </div>
                                <span className="text-sm text-default-400 ml-2">({product.review_count || 1})</span>
                            </div>
                        </div>
                    </div>
                }
                onOpenChange={dialogState.setOpen}
            >
                <ProductOverview isLiked={inWishlist} product={product} onClose={dialogState.close} />
            </Overlay>
        </motion.div>
    );
};

export default ProductCard;
