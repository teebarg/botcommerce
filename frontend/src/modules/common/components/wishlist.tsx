"use client";

import React from "react";

interface WishlistItemProps {
    id: string;
    name: string;
    image: string;
    price: string;
    description: string;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ id, name, image, price, description }) => {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-white shadow-md p-6 rounded-lg">
            <img src={image} alt={name} className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-md" />
            <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
                <p className="text-gray-600 text-sm mt-2">{description}</p>
                <div className="mt-4 text-lg font-bold text-gray-800">{price}</div>
            </div>
            <div className="flex flex-col gap-3">
                <button
                    className="px-4 py-2 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition"
                >
                    Move to Cart
                </button>
                <button
                    className="px-4 py-2 border border-red-500 text-red-500 font-medium rounded-md hover:bg-red-500 hover:text-white transition"
                >
                    Remove
                </button>
            </div>
        </div>
    );
};

export default WishlistItem;
