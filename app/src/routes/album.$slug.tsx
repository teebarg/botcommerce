import AlbumPage from "@/components/album/AlbumPage";
import { getCampaignFn } from "@/server/product.server";
import { APP_URL } from "@/utils";
import { seo } from "@/utils/seo";
import { queryOptions } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

const campaignQuery = (slug: string) =>
    queryOptions({
        queryKey: ["products", "campaign", slug],
        queryFn: () => getCampaignFn({ data: slug }),
    });

export const Route = createFileRoute("/album/$slug")({
    loader: async ({ context: { queryClient }, params: { slug } }) => {
        const campaign = await queryClient.ensureQueryData(
            campaignQuery(slug)
        );

        return { campaign };
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
});

function RouteComponent() {
    const { campaign } = Route.useLoaderData();
    return <AlbumPage data={campaign} />;
}
