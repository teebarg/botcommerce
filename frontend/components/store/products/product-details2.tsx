import React, { useEffect, useState } from "react";
import { ArrowLeft, Heart, Star, Plus, Minus, ShoppingCart, MessageCircle } from "lucide-react";

import { ProductSearch, ProductVariant } from "@/types/models";
import { cn, currency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useInvalidateCart, useInvalidateCartItem } from "@/lib/hooks/useCart";
import { api } from "@/apis";
import { useStore } from "@/app/store/use-store";

const ProductDetail: React.FC<{
    product: ProductSearch;
    onClose: () => void;
    isVisible?: boolean;
}> = ({ product, onClose, isVisible = true }) => {
    const invalidateCart = useInvalidateCart();
    const invalidateCartItems = useInvalidateCartItem();
    const [selectedColor, setSelectedColor] = useState<string | null>(product.variants?.[0].color || null);
    const [selectedSize, setSelectedSize] = useState<string | null>(product.variants?.[0].size || null);
    const [quantity, setQuantity] = useState<number>(1);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
    const [loading, setLoading] = useState<boolean>(false);
    const { shopSettings } = useStore();

    const sizes = [...new Set(product.variants?.filter((v) => v.size).map((v) => v.size))];
    const colors = [...new Set(product.variants?.filter((v) => v.color).map((v) => v.color))];

    const findMatchingVariant = (size: string | null, color: string | null) => {
        return product.variants?.find((variant) => variant.size === size && variant.color === color);
    };

    useEffect(() => {
        setSelectedVariant(product.variants?.find((v) => v.status === "IN_STOCK") || product.variants?.[0]);
    }, []);

    useEffect(() => {
        const matchingVariant = findMatchingVariant(selectedSize, selectedColor);

        if (matchingVariant && matchingVariant !== selectedVariant) {
            setSelectedVariant(matchingVariant);
        } else {
            setSelectedVariant(undefined);
        }
    }, [selectedSize, selectedColor]);

    const toggleSizeSelect = (size: string) => {
        setSelectedSize((prev) => (prev === size ? null : size));
    };

    const toggleColorSelect = (color: string) => {
        setSelectedColor((prev) => (prev === color ? null : color));
    };

    const handleAddToCart = async () => {
        setLoading(true);
        const response = await api.cart.add({
            variant_id: selectedVariant?.id!,
            quantity,
        });

        if (response.error) {
            toast.error(response.error);
            setLoading(false);

            return;
        }
        invalidateCartItems();
        invalidateCart();

        toast.success("Added to cart successfully");
        setLoading(false);
    };

    const handleWhatsAppPurchase = (e: React.MouseEvent) => {
        e.stopPropagation();
        const variantInfo = selectedVariant
            ? `\nSelected Variant:\nSize: ${selectedVariant.size || "N/A"}\nColor: ${selectedVariant.color || "N/A"}\nPrice: ${currency(selectedVariant.price)}`
            : "";

        const message = `Hi! I'm interested in purchasing:\n\n*${product.name}*${variantInfo}\nProduct Link: ${typeof window !== "undefined" ? window.location.origin : ""}/products/${product.slug}`;

        const whatsappUrl = `https://wa.me/${shopSettings?.whatsapp}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, "_blank");
    };

    if (!isVisible) return null;

    return (
        <div className="bg-white z-50 overflow-y-auto duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-2 flex items-center justify-between z-10">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={onClose}>
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setIsLiked(!isLiked)}>
                    <Heart className={`w-6 h-6 ${isLiked ? "text-red-500 fill-current" : "text-gray-600"}`} />
                </button>
            </div>

            {/* Product Image */}
            <div className="relative pt-4">
                <img alt={product.name} className="w-full h-80 object-cover" src={product.images[0]} />
                {product.old_price > product.price && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        -{Math.round((1 - product.price / product.old_price) * 100)}% OFF
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                    <div className="flex items-center mb-3">
                        <div className="flex items-center">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="text-lg font-medium text-gray-900 ml-1">{product.ratings}</span>
                        </div>
                        <span className="text-gray-500 ml-2">({product.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-3xl font-bold text-gray-900">{currency(product.price)}</span>
                        {product.old_price > product.price && (
                            <span className="text-xl text-gray-400 line-through">{currency(product.old_price)}</span>
                        )}
                    </div>
                </div>

                <div>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                {/* Color */}
                <div className={cn("hidden", colors?.length > 1 && "block")}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
                    <div className="flex space-x-3">
                        {colors?.map((color: string, idx: number) => (
                            <button
                                key={idx}
                                className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                                    selectedColor === color ? "border-blue-500 scale-110" : "border-gray-300"
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => toggleColorSelect(color)}
                            >
                                {selectedColor === color && <div className="absolute inset-0 rounded-full border-2 border-white" />}
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{selectedColor}</p>
                </div>

                {/* Size */}
                {sizes?.length > 1 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Size</h3>
                        <div className="flex flex-wrap gap-2">
                            {sizes?.map((size: string, idx: number) => (
                                <button
                                    key={idx}
                                    className={`px-4 py-2 rounded-lg border transition-all ${
                                        selectedSize === size
                                            ? "border-blue-500 bg-blue-50 text-blue-600"
                                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                                    }`}
                                    onClick={() => toggleSizeSelect(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{selectedSize}</p>
                    </div>
                )}

                {/* Quantity */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
                    <div className="flex items-center space-x-4">
                        <button
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-xl font-medium w-8 text-center">{quantity}</span>
                        <button
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            onClick={() => setQuantity(quantity + 1)}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
                <div className="space-y-3 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{currency(product.price * quantity)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Quantity</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {quantity} item{quantity > 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    <div className={cn("flex gap-3 flex-col md:flex-row")}>
                        <Button onClick={handleAddToCart} variant="primary" size="lg" isLoading={loading} disabled={loading || !selectedVariant}>
                            <ShoppingCart className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                            <span className="relative z-10">Add to Cart</span>
                        </Button>
                        <Button onClick={handleWhatsAppPurchase} variant="emerald" size="lg" disabled={loading || !selectedVariant}>
                            <MessageCircle className="w-5 h-5 relative z-10 group-hover:bounce transition-transform duration-300" />
                            <span className="relative z-10">Buy on WhatsApp</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
