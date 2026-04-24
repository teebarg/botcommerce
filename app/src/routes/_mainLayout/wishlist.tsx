import { createFileRoute } from "@tanstack/react-router";
import WishlistItem from "@/components/store/wishlist";
import type { WishItem } from "@/schemas";
import { ZeroState } from "@/components/zero";
import { userWishlistQuery, useUserWishlist } from "@/hooks/useUser";
import { SignInRedirect } from "@/utils/reuseable";

export const Route = createFileRoute("/_mainLayout/wishlist")({
    beforeLoad: ({ context }) => {
        if (!context.isAuthenticated) {
            throw new Error("Not authenticated");
        }
    },
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(userWishlistQuery());
    },
    errorComponent: ({ error }) => {
        if (error.message === "Not authenticated") {
            return <SignInRedirect />;
        }

        throw error;
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { data } = useUserWishlist();

    return (
        <div className="max-w-6xl mx-auto w-full py-6 px-2 md:px-0">
            <h1 className="text-xl font-bold text-center mb-4">Your Wishlist</h1>
            {data?.wishlists && data.wishlists.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-8 mt-6">
                    {data.wishlists.map((item: WishItem, idx: number) => (
                        <WishlistItem key={idx} {...item.product} />
                    ))}
                </div>
            ) : (
                <ZeroState title="Your wishlist is empty" description="Start adding items to your wishlist to see them here." />
            )}
        </div>
    );
}
