import AlbumPage from "@/components/album/AlbumPage";
import NotFound from "@/components/generic/not-found";
import { getCampaignFn } from "@/server/product.server";
import { APP_URL } from "@/utils";
import { seo } from "@/utils/seo";
import { queryOptions } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

const campaignQuery = (slug: string) =>
    queryOptions({
        queryKey: ["products", "campaign", slug],
        queryFn: () => getCampaignFn({ data: slug }),
    });

export const Route = createFileRoute("/album/$slug")({
    loader: async ({ context: { queryClient }, params: { slug } }) => {
        try {
            const campaign = await queryClient.ensureQueryData(campaignQuery(slug));
            return {
                campaign,
            };
        } catch (err) {
            throw notFound();
        }
    },
    head: ({ loaderData, params }) => {
        const campaign = loaderData?.campaign;
        const count = campaign?.products?.length ?? 0;

        const title = campaign?.title ? campaign.title : "Fashion album";
        const description = count
            ? `${count} piece${count === 1 ? "" : "s"} picked for you. Tap to browse and select.`
            : "Browse and select pieces from fashion album.";

        return {
            meta: seo({
                title,
                description,
                url: `${APP_URL}/album/${params.slug}`,
                image: campaign?.products?.[0]?.image,
            }),
        };
    },
    component: RouteComponent,
    notFoundComponent: () => {
        return (
            <NotFound
                eyebrow="Album unavailable"
                title="The gallery could not be found"
                description="The requested gallery may have been removed or the link is incorrect."
                showSearch
                primaryAction={{ label: "Browse collections", to: "/collections" }}
                variant="auto"
            />
        );
    },
});

function RouteComponent() {
    const { campaign } = Route.useLoaderData();
    return <AlbumPage data={campaign} />;
}
