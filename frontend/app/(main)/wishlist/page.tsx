"use client";

import { Heart } from "lucide-react";

import WishlistItem from "@/modules/common/components/wishlist";
import { BtnLink } from "@/components/ui/btnLink";
import PromotionalBanner from "@/components/promotion";
import ServerError from "@/components/server-error";
import { WishItem } from "@/types/models";
import { useUserWishlist } from "@/lib/hooks/useCart";

export default function Wishlist() {
    const { data, isLoading, error } = useUserWishlist();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <ServerError />;
    }

    const wishlists = data ? data.wishlists : [];

    if (wishlists.length === 0) {
        return (
            <div className="h-[55vh] flex flex-col justify-center items-center gap-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning">
                    <Heart className="w-12 h-12 text-white" />
                </div>

                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight text-default-900">Your Wishlist is Empty</h2>
                    <p className="text-default-500 max-w-sm mx-auto">Explore our luxury collection to add items</p>
                </div>

                <BtnLink color="primary" href="/collections" size="md">
                    Explore Collection
                </BtnLink>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto mt-2 mb-4">
            <PromotionalBanner
                btnClass="text-purple-600"
                outerClass="from-purple-500 via-pink-500 to-orange-400 mx-2 md:mx-auto max-w-8xl"
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
            />
            <h1 className="text-3xl font-bold text-center text-default-900 mt-4">Your Wishlist</h1>
            <p className="text-center text-default-500">Curate your luxury collection.</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-8 mt-6 px-1">
                {wishlists?.map((item: WishItem, idx: number) => <WishlistItem key={idx} {...item.product} />)}
            </div>
        </div>
    );
}
