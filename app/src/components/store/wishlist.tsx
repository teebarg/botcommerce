import type React from "react";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { ProductImage } from "@/schemas";
import { useUserDeleteWishlist } from "@/hooks/useUser";
import ImageLightbox from "../image-lightbox";
import { Button } from "@/components/ui/button";

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
        <Link to="/products/$slug" params={{ slug }} id={id.toString()} className="relative group bg-card aspect-gallery rounded-2xl overflow-hidden">
            <ImageLightbox
                url={images?.[0].image}
                alt={name}
                className="w-full h-full"
                imgClassName="w-full h-full object-cover"
            />
            <Button
                onClick={onRemove}
                aria-label="Remove from wishlist"
                className="absolute top-2 right-2 z-10 rounded-full bg-black/35"
                size="icon"
                variant="ghost"
            >
                <Heart className="w-4 h-4 fill-destructive text-destructive" />
            </Button>
            <div
                className="absolute bottom-0 inset-x-0 pt-6 pb-2 px-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            >
                <div className="text-white text-xs font-medium truncate drop-shadow-sm pr-8">
                    {name}
                </div>
            </div>
        </Link>
    );
};

export default WishlistItem;
