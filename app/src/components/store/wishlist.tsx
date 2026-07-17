import type React from "react";
import type { WishItem } from "@/schemas";
import { wishlistQueryOptions } from "@/hooks/useUser";
import { useSuspenseQuery } from "@tanstack/react-query";
import WishlistItem from "./wishlist-item";
import EmptyState from "../generic/empty";

interface Props {}

const Wishlist: React.FC<Props> = () => {
    const { data } = useSuspenseQuery(wishlistQueryOptions());

    return (
        <div>
            {data?.wishlists && data.wishlists.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-6">
                    {data.wishlists.map((item: WishItem, idx: number) => (
                        <WishlistItem key={idx} {...item.product} />
                    ))}
                </div>
            ) : (
                <EmptyState title="Your wishlist is empty" description="Start adding items to your wishlist to see them here." />
            )}
        </div>
    );
};

export default Wishlist;
