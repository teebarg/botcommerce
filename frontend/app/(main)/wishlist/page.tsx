import { Metadata } from "next";
import { Heart } from "nui-react-icons";

import WishlistItem from "@/modules/common/components/wishlist";
import { siteConfig } from "@/lib/config";
import { BtnLink } from "@/components/ui/btnLink";
import PromotionalBanner from "@/components/promotion";
import { api } from "@/apis";

export const revalidate = 3;

export async function generateMetadata(): Promise<Metadata> {
    const metadata = {
        title: `Wishlist | ${siteConfig.name} Store`,
        description: siteConfig.description,
    } as Metadata;

    return metadata;
}

export default async function Wishlist() {
    const res = await api.user.wishlist();
    const wishlists = res ? res.wishlists : null;

    if (!wishlists) {
        return (
            <div className="h-[55vh] flex flex-col justify-center items-center gap-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning">
                    <Heart className="w-10 h-10 text-white" />
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
        <div className="max-w-5xl mx-auto mt-4">
            <PromotionalBanner
                btnClass="text-purple-600"
                outerClass="from-purple-500 via-pink-500 to-orange-400 mx-2 md:mx-auto max-w-8xl"
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
            />
            <h1 className="text-3xl font-bold text-center text-default-900 mt-4">Your Wishlist</h1>
            <p className="text-center text-default-500">Curate your luxury collection.</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-8 mt-10 px-1">
                {wishlists?.map((item: any) => <WishlistItem key={item.id} {...item} />)}
            </div>
        </div>
    );
}
