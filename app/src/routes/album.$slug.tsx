import AlbumPage from "@/components/album/AlbumPage";
import NotFound from "@/components/generic/not-found";
import { campaignQuery } from "@/queries/user.queries";
import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/album/$slug")({
    loader: async ({ context: { queryClient }, params: { slug } }) => {
        try {
            const campaign = await queryClient.fetchQuery(campaignQuery(slug));
            return {
                campaign,
            };
        } catch (err) {
            throw notFound();
        }
    },
    head: () => ({
        meta: [
            { title: "Shared fashion album — Occasion Edit" },
            { name: "description", content: "Browse and select pieces from a shared Occasion Edit fashion album." },
            { property: "og:title", content: "Shared fashion album — Occasion Edit" },
            { property: "og:description", content: "Browse and select pieces from a shared Occasion Edit fashion album." },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
        ],
    }),
    component: RouteComponent,
    notFoundComponent: () => {
        console.log("🚀 ~ notFoundComponent ~ notFoundComponent:");
        return (
            <NotFound
                eyebrow="Product unavailable"
                title="Product not found"
                description="This product may have been removed or the link is incorrect."
                showSearch
                primaryAction={{ label: "Browse collections", to: "/collections" }}
                variant="auto"
            />
        );
    },
});

function RouteComponent() {
    const { campaign } = Route.useLoaderData();
    console.log("🚀 ~ RouteComponent ~ campaign:", campaign);
    return <AlbumPage data={campaign} />;
}
