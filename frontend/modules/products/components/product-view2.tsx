"use client"

import React, { useState } from "react";

// TypeScript interfaces
interface ProductVariant {
    id: string;
    name: string;
    price: number;
    color: string;
    size: string;
    stock: number;
}

interface ProductImage {
    id: string;
    url: string;
    alt: string;
    isMain: boolean;
}

interface Product {
    id: string;
    name: string;
    description: string;
    images: ProductImage[];
    variants: ProductVariant[];
    features: string[];
}

// Sample product data
const productData: Product = {
    id: "modern-tshirt-101",
    name: "Modern Comfort T-Shirt",
    description:
        "Our premium Modern Comfort T-Shirt is crafted from 100% organic cotton, providing exceptional softness and durability. Perfect for everyday wear, this versatile piece combines style and comfort.",
    features: ["100% organic cotton", "Sustainably sourced materials", "Pre-shrunk fabric", "Machine washable", "Designed for everyday comfort"],
    images: [
        {
            id: "img1",
            url: "/api/placeholder/500/500",
            alt: "Modern Comfort T-Shirt - Front View",
            isMain: true,
        },
        {
            id: "img2",
            url: "/api/placeholder/500/500",
            alt: "Modern Comfort T-Shirt - Back View",
            isMain: false,
        },
        {
            id: "img3",
            url: "/api/placeholder/500/500",
            alt: "Modern Comfort T-Shirt - Side View",
            isMain: false,
        },
        {
            id: "img4",
            url: "/api/placeholder/500/500",
            alt: "Modern Comfort T-Shirt - Detail View",
            isMain: false,
        },
    ],
    variants: [
        {
            id: "v1",
            name: "Black / Small",
            price: 29.99,
            color: "Black",
            size: "S",
            stock: 10,
        },
        {
            id: "v2",
            name: "Black / Medium",
            price: 29.99,
            color: "Black",
            size: "M",
            stock: 8,
        },
        {
            id: "v3",
            name: "Black / Large",
            price: 29.99,
            color: "Black",
            size: "L",
            stock: 5,
        },
        {
            id: "v4",
            name: "Blue / Small",
            price: 29.99,
            color: "Blue",
            size: "S",
            stock: 7,
        },
        {
            id: "v5",
            name: "Blue / Medium",
            price: 34.99,
            color: "Blue",
            size: "M",
            stock: 0,
        },
        {
            id: "v6",
            name: "Blue / Large",
            price: 34.99,
            color: "Blue",
            size: "L",
            stock: 12,
        },
        {
            id: "v7",
            name: "White / Small",
            price: 27.99,
            color: "White",
            size: "S",
            stock: 3,
        },
        {
            id: "v8",
            name: "White / Medium",
            price: 27.99,
            color: "White",
            size: "M",
            stock: 9,
        },
        {
            id: "v9",
            name: "White / Large",
            price: 27.99,
            color: "White",
            size: "L",
            stock: 4,
        },
    ],
};

const ProductView2: React.FC = () => {
    const [selectedColor, setSelectedColor] = useState<string>(productData.variants[0].color);
    const [selectedSize, setSelectedSize] = useState<string>(productData.variants[0].size);
    const [quantity, setQuantity] = useState<number>(1);
    const [isAddedToCart, setIsAddedToCart] = useState<boolean>(false);
    const [selectedImageId, setSelectedImageId] = useState<string>(productData.images.find((img) => img.isMain)?.id || productData.images[0].id);

    // Get available colors and sizes
    const availableColors = Array.from(new Set(productData.variants.map((v) => v.color)));
    const availableSizes = Array.from(new Set(productData.variants.map((v) => v.size)));

    // Find the currently selected variant
    const selectedVariant = productData.variants.find((v) => v.color === selectedColor && v.size === selectedSize) || productData.variants[0];

    // Find the selected image
    const selectedImage = productData.images.find((img) => img.id === selectedImageId) || productData.images[0];

    // Check if the selected variant is in stock
    const isInStock = selectedVariant.stock > 0;

    // Handle add to cart
    const handleAddToCart = () => {
        if (isInStock) {
            console.log("Adding to cart:", {
                product: productData.name,
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
                                <img src={selectedImage.url} alt={selectedImage.alt} className="object-contain h-full w-full rounded" />
                            </div>
                            {/* Image Gallery */}
                            <div className="p-4 flex space-x-4 overflow-x-auto">
                                {productData.images.map((image) => (
                                    <button
                                        key={image.id}
                                        onClick={() => setSelectedImageId(image.id)}
                                        className={`w-16 h-16 rounded-md flex-shrink-0 border-2 overflow-hidden ${
                                            selectedImageId === image.id ? "border-indigo-500" : "border-gray-200"
                                        }`}
                                    >
                                        <img src={image.url} alt={`Thumbnail - ${image.alt}`} className="object-cover w-full h-full" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="md:w-1/2 p-6">
                            <div className="flex justify-between items-start">
                                <h1 className="text-3xl font-bold text-gray-800">{productData.name}</h1>
                                <span className="text-2xl font-semibold text-indigo-600">${selectedVariant.price.toFixed(2)}</span>
                            </div>

                            <p className="mt-4 text-gray-600">{productData.description}</p>

                            {/* Product Features */}
                            <div className="mt-6">
                                <h2 className="text-lg font-semibold text-gray-800">Features</h2>
                                <ul className="mt-2 list-disc pl-5 text-gray-600">
                                    {productData.features.map((feature, index) => (
                                        <li key={index}>{feature}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Color Selection */}
                            <div className="mt-6">
                                <h2 className="text-sm font-medium text-gray-700">Color</h2>
                                <div className="mt-2 flex space-x-2">
                                    {availableColors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`h-8 w-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                                selectedColor === color ? "ring-2 ring-indigo-500 ring-offset-2" : ""
                                            }`}
                                            style={{
                                                backgroundColor: color.toLowerCase(),
                                                border: color.toLowerCase() === "white" ? "1px solid #e5e7eb" : "none",
                                            }}
                                            aria-label={`Color: ${color}`}
                                        ></button>
                                    ))}
                                </div>
                            </div>

                            {/* Size Selection */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-medium text-gray-700">Size</h2>
                                    <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                        Size guide
                                    </a>
                                </div>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    {availableSizes.map((size) => {
                                        // Check if this size is available in selected color
                                        const variantForSize = productData.variants.find((v) => v.color === selectedColor && v.size === size);
                                        const sizeAvailable = variantForSize && variantForSize.stock > 0;

                                        return (
                                            <button
                                                key={size}
                                                onClick={() => sizeAvailable && setSelectedSize(size)}
                                                className={`py-2 px-4 border rounded-md flex items-center justify-center text-sm font-medium ${
                                                    selectedSize === size
                                                        ? "bg-indigo-600 border-indigo-600 text-white"
                                                        : sizeAvailable
                                                        ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                                                        : "border-gray-200 text-gray-300 cursor-not-allowed"
                                                }`}
                                                disabled={!sizeAvailable}
                                            >
                                                {size}
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
                                            onClick={() => quantity < selectedVariant.stock && setQuantity(quantity + 1)}
                                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                            disabled={quantity >= selectedVariant.stock || !isInStock}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <span className="text-sm text-gray-500">{isInStock ? `${selectedVariant.stock} available` : "Out of stock"}</span>
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

export default ProductView2;
