import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Heart } from "nui-react-icons";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";

import { ProductSearch } from "@/lib/models";
import { api } from "@/apis";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
    product: ProductSearch;
    isNew?: boolean;
    isSale?: boolean;
    onAddToCart?: (id: number) => void;
    onAddToWishlist?: (id: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isNew = false, isSale = false, onAddToCart, onAddToWishlist }) => {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
    const { id, slug, name, description, price, old_price, image, categories, variants } = product;
    const discountedPrice = old_price ? price - (price * (old_price - price)) / 100 : price;

    const discount = old_price ? Math.round((1 - price / old_price) * 100) : 0;

    const handleWishlistClick = () => {
        setIsWishlisted(!isWishlisted);
        onAddToWishlist?.(id);
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
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => router.push(`/product/${slug}`)}>
                    <img
                        alt={name}
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                        src={image}
                    />
                    <Button
                        size="icon"
                        variant="primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleWishlistClick();
                        }}
                    >
                        <Heart className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-4 cursor-pointer" onClick={() => router.push(`/product/${slug}`)}>
                    <div className="flex flex-wrap gap-1">
                        {categories.map((category: string, idx: number) => (
                            <Badge key={idx} variant="secondary">
                                {category}
                            </Badge>
                        ))}
                    </div>
                    <h3 className="font-medium text-default-900 mb-2 line-clamp-2 hover:text-default-700 transition-colors">{name}</h3>
                    <div className="flex items-center">
                        <p className="text-lg font-semibold">${price.toFixed(2)}</p>
                    </div>
                    <Button
                        className="w-full"
                        disabled={loading}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart();
                        }}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add</span>
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
