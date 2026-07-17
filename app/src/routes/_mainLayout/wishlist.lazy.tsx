import { createLazyFileRoute } from "@tanstack/react-router";
import Wishlist from "@/components/store/wishlist";
import { PageLoader } from "@/components/generic/page-loader";

export const Route = createLazyFileRoute("/_mainLayout/wishlist")({
    pendingComponent: () => <PageLoader variant="grid" />,
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="max-w-6xl mx-auto py-6 px-2">
            <h1 className="text-xl font-semibold text-center mb-4">Your Wishlist</h1>
            <Wishlist />
        </div>
    );
}
