import React, { useEffect, useState } from "react";
import { ArrowLeft, Heart, Star, Plus, Minus, ShoppingCart } from "lucide-react";

import { ProductSearch, ProductVariant } from "@/types/models";

const ProductDetail: React.FC<{
    product: ProductSearch;
    onClose: () => void;
    isVisible: boolean;
}> = ({ product, onClose, isVisible }) => {
    const [selectedColor, setSelectedColor] = useState<string | null>(product.variants?.[0].color || null);
    const [selectedSize, setSelectedSize] = useState<string | null>(product.variants?.[0].size || null);
    const [quantity, setQuantity] = useState<number>(1);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
        product.variants?.find((v) => v.status === "IN_STOCK") || product.variants?.[0]
    );

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

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-4 flex items-center justify-between z-10">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={onClose}>
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setIsLiked(!isLiked)}>
                    <Heart className={`w-6 h-6 ${isLiked ? "text-red-500 fill-current" : "text-gray-600"}`} />
                </button>
            </div>

            {/* Product Image */}
            <div className="relative">
                <img alt={product.name} className="w-full h-80 object-cover" src={product.images[0]} />
                {product.old_price && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        -{Math.round((1 - product.price / product.old_price) * 100)}% OFF
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Product Info */}
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
                        <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                        {product.old_price && <span className="text-xl text-gray-400 line-through">${product.old_price}</span>}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                {/* Color Selection */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
                    <div className="flex space-x-3">
                        {colors?.map((color) => (
                            <button
                                key={color.name}
                                className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                                    selectedColor === color.name ? "border-blue-500 scale-110" : "border-gray-300"
                                }`}
                                style={{ backgroundColor: color.value }}
                                onClick={() => toggleColorSelect(color)}
                            >
                                {selectedColor === color.name && <div className="absolute inset-0 rounded-full border-2 border-white" />}
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{selectedColor}</p>
                </div>

                {/* Size Selection */}
                {sizes?.length > 1 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Size</h3>
                        <div className="flex flex-wrap gap-2">
                            {sizes?.map((size) => (
                                <button
                                    key={size}
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

            {/* Bottom Action */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6">
                <div className="flex items-center justify-between space-x-4">
                    <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-2xl font-bold text-gray-900">${(product.price * quantity).toFixed(2)}</p>
                    </div>
                    <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] shadow-lg">
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
