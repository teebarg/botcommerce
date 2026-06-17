import { createFileRoute } from "@tanstack/react-router";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import { productFeedQuery } from "@/queries/user.queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FeedQuerySchema } from "@/schemas";

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
    loader: async ({ context: { search, queryClient } }) => {
        await queryClient.ensureQueryData(productFeedQuery({ ...search }));
    },
});

function RouteComponent() {
    const { data } = useSuspenseQuery(productFeedQuery(Route.useSearch()));

    return <InfiniteScrollClient initialData={data} />;
}
