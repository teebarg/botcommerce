import { createFileRoute } from "@tanstack/react-router";
import WishlistItem from "@/components/store/wishlist";
import { BtnLink } from "@/components/ui/btnLink";
import type { WishItem } from "@/schemas";
import { redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { wishlistQuery } from "@/queries/user.queries";

export const Route = createFileRoute("/_mainLayout/wishlist")({
    beforeLoad: ({ context, location }) => {
        if (!context.session) {
            throw redirect({ to: "/auth/signin", search: { callbackUrl: location.href } });
        }
    },
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(wishlistQuery());
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { data } = useSuspenseQuery(wishlistQuery());

    return (
        <div className="max-w-6xl mx-auto w-full mb-4 py-8 px-2 md:px-0">
            {data.wishlists.length > 0 ? (
                <div>
                    <h1 className="text-2xl font-bold text-center">Your Wishlist</h1>
                    <p className="text-center text-muted-foreground">Curate your luxury collection.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-8 mt-6 px-1">
                        {data.wishlists.map((item: WishItem, idx: number) => (
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
