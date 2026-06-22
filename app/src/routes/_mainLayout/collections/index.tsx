import { createFileRoute, useSearch } from "@tanstack/react-router";
import { productFeedQuery } from "@/queries/user.queries";
import { useQuery } from "@tanstack/react-query";
import { FeedQuerySchema } from "@/schemas";
import { PageLoader } from "@/components/generic/page-loader";
import InfiniteFeed from "@/components/store/collections/infinite-feed";
import { LightboxProvider } from "@/providers/lightbox-provider";

export const Route = createFileRoute("/_mainLayout/collections/")({
    validateSearch: (search: Record<string, unknown>) => {
        const parsed = FeedQuerySchema.parse(search);
        if (!parsed.feed_seed) {
            parsed.feed_seed = Math.floor(Math.random() * 1000) + 1000;
        }
        return parsed;
    },
    component: RouteComponent,
    beforeLoad: ({ search }) => {
        return {
            search,
        };
    },
    loader: async ({ context: { queryClient, search } }) => {
        queryClient.prefetchQuery(productFeedQuery({ ...search }));
    },
});

function RouteComponent() {
    const search = useSearch({ strict: false });
    const { data, isLoading } = useQuery(productFeedQuery(Route.useSearch()));

    if (isLoading) return <PageLoader variant="grid" rows={6} className="max-w-7xl w-full mx-auto py-2" />
    // return (
    //     <LightboxProvider>
    //         <InfiniteFeed initialData={data} params={{ ...search }} />
    //     </LightboxProvider>
    // );

    return <InfiniteFeed initialData={data} params={{ ...search }} />
}
