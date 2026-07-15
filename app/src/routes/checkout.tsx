import { createFileRoute } from "@tanstack/react-router";
import { meQuery } from "@/queries/user.queries";
import { SignInRedirect } from "@/utils/reuseable";

export const Route = createFileRoute("/checkout")({
    beforeLoad: ({ context }) => {
        if (!context.isAuthenticated) {
            throw new Error("Not authenticated");
        }
    },
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(meQuery());
    },
    head: () => ({
        meta: [
            {
                name: "description",
                content: "Checkout",
            },
            {
                title: "Checkout",
            },
        ],
    }),
    errorComponent: ({ error }) => {
        if (error.message === "Not authenticated") {
            return <SignInRedirect />;
        }

        throw error;
    },
    ssr: false,
});
