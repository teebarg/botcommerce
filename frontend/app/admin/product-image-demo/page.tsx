"use client";

import React from "react";

import ProductImageUpload from "@/components/products/product-image-upload";

// Mock data for demo
const mockCategories = [
    {
        id: 1,
        name: "Electronics",
        slug: "electronics",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        products: null,
        display_order: 1,
        parent_id: null,
        parent: null,
        image: undefined,
        subcategories: [],
    },
    {
        id: 2,
        name: "Clothing",
        slug: "clothing",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        products: null,
        display_order: 2,
        parent_id: null,
        parent: null,
        image: undefined,
        subcategories: [],
    },
    {
        id: 3,
        name: "Home & Garden",
        slug: "home-garden",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        products: null,
        display_order: 3,
        parent_id: null,
        parent: null,
        image: undefined,
        subcategories: [],
    },
];

const mockCollections = [
    {
        id: 1,
        name: "Summer Sale",
        slug: "summer-sale",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        products: null,
    },
    {
        id: 2,
        name: "New Arrivals",
        slug: "new-arrivals",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        products: null,
    },
    {
        id: 3,
        name: "Best Sellers",
        slug: "best-sellers",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        products: null,
    },
];

const mockVariants = [
    {
        id: 1,
        name: "Small",
        sku: "PROD-SM",
        price: 29.99,
        status: "IN_STOCK",
        product_id: 1,
        old_price: null,
        inventory: 100,
        size: "S",
        color: "Red",
        order_items: null,
        cart_items: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
    },
    {
        id: 2,
        name: "Medium",
        sku: "PROD-MD",
        price: 39.99,
        status: "IN_STOCK",
        product_id: 1,
        old_price: null,
        inventory: 100,
        size: "M",
        color: "Blue",
        order_items: null,
        cart_items: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
    },
    {
        id: 3,
        name: "Large",
        sku: "PROD-LG",
        price: 49.99,
        status: "IN_STOCK",
        product_id: 1,
        old_price: null,
        inventory: 100,
        size: "L",
        color: "Green",
        order_items: null,
        cart_items: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
    },
];

export default function ProductImageDemoPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Image Upload Demo</h1>
                    <p className="text-gray-600">
                        This page demonstrates the new product image upload functionality with drag & drop, camera capture, metadata editing, and bulk
                        operations.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <ProductImageUpload
                        categories={mockCategories}
                        collections={mockCollections}
                        variants={mockVariants}
                        onImagesUploaded={(images) => {
                            console.log("Images uploaded:", images);
                        }}
                    />
                </div>

                <div className="mt-8 bg-blue-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-blue-900 mb-4">Features Demonstrated</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-medium text-blue-800 mb-2">Image Selection</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Drag & drop multiple images</li>
                                <li>• Camera capture support</li>
                                <li>• Gallery selection</li>
                                <li>• File type validation</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-blue-800 mb-2">Image Management</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Drag & drop reordering</li>
                                <li>• Set primary image</li>
                                <li>• Remove images</li>
                                <li>• Preview grid</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-blue-800 mb-2">Metadata Editing</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Individual image editing</li>
                                <li>• Categories & collections</li>
                                <li>• Tags & descriptions</li>
                                <li>• Alt text for accessibility</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-blue-800 mb-2">Bulk Operations</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Select multiple images</li>
                                <li>• Bulk metadata editing</li>
                                <li>• Progress tracking</li>
                                <li>• Error handling & retry</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
