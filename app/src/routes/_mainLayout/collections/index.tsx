import { createFileRoute } from "@tanstack/react-router";
import { productFeedQuery } from "@/queries/user.queries";
import { useQuery } from "@tanstack/react-query";
import { FeedQuery, FeedQuerySchema } from "@/schemas";
import { PageLoader } from "@/components/generic/page-loader";
import InfiniteFeed from "@/components/store/collections/infinite-feed";

export const Route = createFileRoute("/_mainLayout/collections/")({
    validateSearch: (search: FeedQuery) => {
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
    const search = Route.useSearch();
    const { data, isLoading } = useQuery(productFeedQuery(search));

    if (isLoading) return <PageLoader variant="grid" />

    return <InfiniteFeed initialData={data} params={{ ...search }} />
}
