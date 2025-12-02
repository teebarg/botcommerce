"use client";

import WishlistItem from "@/components/store/wishlist";
import { BtnLink } from "@/components/ui/btnLink";
import PromotionalBanner from "@/components/promotion";
import ServerError from "@/components/generic/server-error";
import { WishItem } from "@/schemas";
import { useUserWishlist } from "@/lib/hooks/useUser";
import ComponentLoader from "@/components/component-loader";

export default function Wishlist() {
    const { data, isLoading, error } = useUserWishlist();

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto mt-2 mb-4 w-full">
                <ComponentLoader className="h-[55vh]" />
            </div>
        );
    }

    if (error) {
        return <ServerError error={error.message} scenario="wishlist" stack={error.stack} />;
    }

    const wishlists = data ? data.wishlists : [];

    return (
        <div className="max-w-7xl mx-auto w-full mt-2 mb-4 py-8 px-2 md:px-0">
            <PromotionalBanner
                btnClass="text-purple-600"
                outerClass="from-purple-500 via-pink-500 to-orange-400 mx-2 md:mx-auto max-w-8xl"
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
            />

            {wishlists.length > 0 ? (
                <div>
                    <h1 className="text-2xl font-bold text-center mt-4">Your Wishlist</h1>
                    <p className="text-center text-muted-foreground">Curate your luxury collection.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-8 mt-6 px-1">
                        {wishlists?.map((item: WishItem, idx: number) => (
                            <WishlistItem key={idx} {...item.product} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col justify-center items-center gap-4 mt-4 py-8">
                    <div className="space-y-2 text-center mb-4">
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Your Wishlist is Empty</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto">Explore our luxury collection to add items</p>
                    </div>

                    <BtnLink href="/collections" size="lg">
                        Explore Collection
                    </BtnLink>
                </div>
            )}
        </div>
    );
}
