import { useUserDeleteWishlist, useUserCreateWishlist, wishlistQueryOptions } from "@/hooks/useUser";
import { cn } from "@/utils/cn";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";

export function WishlistButton({ productId, className }: { productId: number; className?: string }) {
    const { data } = useQuery(wishlistQueryOptions());
    const createWishlist = useUserCreateWishlist();
    const deleteWishlist = useUserDeleteWishlist();

    const isWishlisted = data?.some((w) => w.product?.id == productId) ?? false;
    const isPending = createWishlist.isPending || deleteWishlist.isPending;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault(); // stops the click bubbling into a wrapping <Link> on product cards
        e.stopPropagation();
        if (isWishlisted) {
            deleteWishlist.mutate(productId);
        } else {
            createWishlist.mutate(productId);
        }
    };

    return (
        <button
            type="button"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleClick}
            disabled={isPending}
            className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/70 bg-card/90 backdrop-blur-sm transition-colors duration-300 hover:border-foreground/30",
                className
            )}
        >
            <Heart className={cn("h-4 w-4 transition-colors", isWishlisted ? "fill-destructive text-destructive" : "text-foreground/70")} />
        </button>
    );
}
