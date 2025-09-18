"use client";

import { HeartFilled } from "nui-react-icons";
import React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { ProductImage } from "@/schemas";
import { useUserDeleteWishlist } from "@/lib/hooks/useUser";

interface WishlistItemProps {
    id: number;
    slug: string;
    name: string;
    images: ProductImage[];
}

const WishlistItem: React.FC<WishlistItemProps> = ({ id, slug, name, images }) => {
    const { mutate: deleteWishlist } = useUserDeleteWishlist();
    const onRemove = async () => {
        deleteWishlist(id);
    };

    return (
        <div className="relative flex max-w-full flex-none flex-col gap-3 rounded-1xl md:bg-inherit w-full snap-start h-full" id={id.toString()}>
            <div className="relative flex max-h-full w-full flex-col items-center overflow-hidden rounded-xl bg-content2 h-64 md:h-80 justify-between">
                <div className="relative md:rounded-1xl z-0 h-full w-full overflow-visible">
                    {images[0] && (
                        <img alt={name} className="hover:scale-105 transition-all" src={images.sort((a, b) => a.order - b.order)[0].image} />
                    )}
                </div>
            </div>
            <div className="space-y-1">
                <Link prefetch className="font-medium line-clamp-1 text-lg" href={`/products/${slug}`}>
                    {name}
                </Link>
            </div>
            <div className="flex gap-3 absolute top-2 right-2">
                <button aria-label="remove from wishlist" className={cn("transition-colors text-secondary cursor-pointer")} onClick={onRemove}>
                    <HeartFilled className="w-10 h-10" />
                </button>
            </div>
        </div>
    );
};

export default WishlistItem;
