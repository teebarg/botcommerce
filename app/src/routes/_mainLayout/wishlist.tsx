import { createFileRoute } from "@tanstack/react-router";
import { wishlistQueryOptions } from "@/hooks/useUser";
import { SignInRedirect } from "@/utils/reuseable";

export const Route = createFileRoute("/_mainLayout/wishlist")({
    beforeLoad: ({ context }) => {
        if (!context.isAuthenticated) {
            throw new Error("Not authenticated");
        }
    },
    loader: ({ context }) => context.queryClient.ensureQueryData(wishlistQueryOptions()),
    errorComponent: ({ error }) => {
        if (error.message === "Not authenticated") {
            return <SignInRedirect />;
        }

        throw error;
    },
});
