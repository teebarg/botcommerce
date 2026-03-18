import type React from "react";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import type { ProductImage } from "@/schemas";
import { useUserDeleteWishlist } from "@/hooks/useUser";
import ImageDisplay from "../image-display";

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
        <div id={id.toString()} className="relative group md:bg-card">
            <div className="relative aspect-[3/4] overflow-hidden bg-secondary" style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)" }}>
                {images?.[0] && <ImageDisplay alt={name} url={images?.[0].image} />}
            </div>
            <Link className="font-medium line-clamp-1 text-sm mt-1" to="/products/$slug" params={{ slug }}>
                {name}
            </Link>
            <button aria-label="remove from wishlist" className="absolute top-2 right-2 cursor-pointer" onClick={onRemove}>
                <Heart className="w-10 h-10 fill-primary text-transparent" />
            </button>
        </div>
    );
};

export default WishlistItem;
