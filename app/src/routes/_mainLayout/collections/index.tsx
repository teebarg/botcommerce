import { createFileRoute } from "@tanstack/react-router";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import { productFeedQuery } from "@/queries/user.queries";
import { useQuery } from "@tanstack/react-query";
import { FeedQuerySchema } from "@/schemas";
import { PageLoader } from "@/components/generic/page-loader";

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
    loader: async ({ context: { queryClient, search }, params }) => {
        queryClient.prefetchQuery(productFeedQuery({ ...search }));
    },
    pendingComponent: () => (<PageLoader variant="grid" cols={4} rows={6} className="max-w-7xl w-full mx-auto py-2" />)
});

function RouteComponent() {
    const { data } = useQuery(productFeedQuery(Route.useSearch()));

    return <InfiniteScrollClient initialData={data} />;
}
