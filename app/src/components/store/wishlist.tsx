import type React from "react";
import { Link } from "@tanstack/react-router"
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
        <div className="relative flex max-w-full flex-none flex-col gap-3 rounded-1xl md:bg-card w-full snap-start h-full" id={id.toString()}>
            <div className="relative flex max-h-full w-full flex-col items-center overflow-hidden rounded-xl h-64 md:h-80 justify-between">
                <div className="relative md:rounded-1xl z-0 h-full w-full overflow-visible">
                    {images[0] && <ImageDisplay alt={name} url={images.sort((a, b) => a.order - b.order)[0].image} />}
                </div>
            </div>
            <div className="space-y-1 px-1">
                <Link className="font-medium line-clamp-1 text-lg" to={`/products/${slug}`}>
                    {name}
                </Link>
            </div>
            <button aria-label="remove from wishlist" className="absolute top-2 right-2 cursor-pointer" onClick={onRemove}>
                <Heart className="w-10 h-10 fill-primary text-transparent" />
            </button>
        </div>
    );
};

export default WishlistItem;
