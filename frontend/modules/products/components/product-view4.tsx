"use client";

import { Product, ProductImage, ProductVariant } from "@/lib/models";
import React, { useState } from "react";

interface Props {
    product: Product;
}

const ProductView4: React.FC<Props> = ({ product }) => {
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
    const [quantity, setQuantity] = useState<number>(1);
    const [isAddedToCart, setIsAddedToCart] = useState<boolean>(false);
    const [selectedImageId, setSelectedImageId] = useState<number>(product.images[0].id);

    // Find the selected image
    const selectedImage = product.images.find((img: ProductImage) => img.id === selectedImageId) || product.images[0];

    // Check if the selected variant is in stock
    const isInStock = selectedVariant.inventory > 0;

    // Handle add to cart
    const handleAddToCart = () => {
        if (isInStock) {
            console.log("Adding to cart:", {
                product: product.name,
                variant: selectedVariant.name,
                price: selectedVariant.price,
                quantity,
            });

            setIsAddedToCart(true);
            setTimeout(() => setIsAddedToCart(false), 3000);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="md:flex">
                        {/* Product Images */}
                        <div className="md:w-1/2">
                            <div className="h-96 bg-gray-100 flex items-center justify-center p-4">
                                <img src={selectedImage.image} alt={selectedImage.image} className="object-contain h-full w-full rounded" />
                            </div>
                            {/* Image Gallery */}
                            <div className="p-4 flex space-x-4 overflow-x-auto">
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
                        </div>

                        {/* Product Details */}
                        <div className="md:w-1/2 p-6">
                            <div className="flex justify-between items-start">
                                <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
                                <span className="text-2xl font-semibold text-indigo-600">${selectedVariant.price.toFixed(2)}</span>
                            </div>

                            <p className="mt-4 text-gray-600">{product.description}</p>

                            {/* Product Features */}
                            {/* <div className="mt-6">
                                <h2 className="text-lg font-semibold text-gray-800">Features</h2>
                                <ul className="mt-2 list-disc pl-5 text-gray-600">
                                    {product.features.map((feature, index: number) => (
                                        <li key={index}>{feature}</li>
                                    ))}
                                </ul>
                            </div> */}

                            {/* Size Selection */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-medium text-gray-700">Variants</h2>
                                    <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                        Size guide
                                    </a>
                                </div>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    {product.variants.map((variant: ProductVariant, idx: number) => {
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedVariant(variant)}
                                                className={`py-2 px-4 border rounded-md flex items-center justify-center text-sm font-medium ${
                                                    selectedVariant.id === variant.id
                                                        ? "bg-indigo-600 border-indigo-600 text-white"
                                                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                                }`}
                                            >
                                                {variant.sku}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quantity and Add to Cart */}
                            <div className="mt-6">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center border border-gray-300 rounded">
                                        <button
                                            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                            disabled={quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-1 text-gray-800">{quantity}</span>
                                        <button
                                            onClick={() => quantity < selectedVariant.inventory && setQuantity(quantity + 1)}
                                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                            disabled={quantity >= selectedVariant.inventory || !isInStock}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <span className="text-sm text-gray-500">{isInStock ? `${selectedVariant.inventory} available` : "Out of stock"}</span>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={!isInStock}
                                    className={`mt-4 w-full py-3 px-6 rounded-md flex items-center justify-center text-white font-medium ${
                                        isInStock
                                            ? "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            : "bg-gray-300 cursor-not-allowed"
                                    }`}
                                >
                                    {isInStock ? "Add to Cart" : "Out of Stock"}
                                </button>

                                {isAddedToCart && (
                                    <div className="mt-3 p-2 bg-green-100 text-green-700 text-sm rounded-md text-center">
                                        Added to cart successfully!
                                    </div>
                                )}
                            </div>

                            {/* Shipping Info */}
                            <div className="mt-6 border-t border-gray-200 pt-4">
                                <div className="flex items-center text-sm text-gray-500">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h18M3 12h18M3 19h18" />
                                    </svg>
                                    Free shipping on orders over $50
                                </div>
                                <div className="flex items-center mt-2 text-sm text-gray-500">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    Ships within 1-2 business days
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductView4;
