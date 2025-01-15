import { Metadata } from "next";
import { Heart } from "nui-react-icons";

import WishlistItem from "@/modules/common/components/wishlist";
import { getWishlist } from "@/lib/data";
import LocalizedClientLink from "@/modules/common/components/localized-client-link";
import { siteConfig } from "@/lib/config";

export const revalidate = 3;

export async function generateMetadata(): Promise<Metadata> {
    const metadata = {
        title: `Wishlist | ${siteConfig.name} Store`,
        description: siteConfig.description,
    } as Metadata;

    return metadata;
}

export default async function Wishlist() {
    const { wishlists } = await getWishlist();

    if (!wishlists) {
        return (
            <div className="text-center py-24 space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning">
                    <Heart className="w-10 h-10 text-default-500" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-default-900">Your Wishlist is Empty</h2>
                    <p className="text-default-500 max-w-md mx-auto">Explore our collection and save your favorite luxury items for later</p>
                </div>

                <LocalizedClientLink
                    className="inline-flex items-center justify-center px-8 py-3 font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                    href="/collections"
                >
                    Explore Collection
                </LocalizedClientLink>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto mt-6">
            <h1 className="text-3xl font-bold text-center text-default-900">Your Wishlist</h1>
            <p className="text-center text-default-500 mt-1">Curate your luxury collection.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
                {wishlists.map((item: any) => (
                    <WishlistItem key={item.id} {...item} />
                ))}
            </div>
            {wishlists.length === 0 && (
                <p className="text-center text-default-500 mt-10">Your wishlist is empty. Explore our luxury collection to add items.</p>
            )}
        </div>
    );
}
