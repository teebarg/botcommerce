import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/utils/seo";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import { collectionQuery, productFeedQuery } from "@/queries/user.queries";
import { useQuery } from "@tanstack/react-query";
import { FeedQuerySchema } from "@/schemas";
import { PageLoader } from "@/components/generic/page-loader";

export const Route = createFileRoute("/_mainLayout/collections/$slug")({
    validateSearch: (search: Record<string, unknown>) => {
        const parsed = FeedQuerySchema.parse(search);
        if (!parsed.feed_seed) {
            parsed.feed_seed = Math.floor(Math.random() * 1000) + 1000;
        }
        return parsed;
    },
    beforeLoad: ({ search }) => {
        return {
            search,
        };
    },
    loaderDeps: ({ search }) => search,
    loader: async ({ params: { slug }, context: { search, config, queryClient } }) => {
        const collection = await queryClient.ensureQueryData(collectionQuery(slug));
        queryClient.prefetchQuery(productFeedQuery({ collections: collection?.slug, ...search }));
        return {
            collection,
            config,
        };
    },
    head: ({ loaderData }) => {
        const collection = loaderData?.collection;
        const baseUrl = import.meta.env.VITE_BASE_URL;
        const name = collection?.name;
        const title = `${name} Collection | ${loaderData?.config?.shop_name}`;
        const description = `Explore ${name} at ${loaderData?.config?.shop_name}`;

        return {
            title,
            meta: [
                ...seo({
                    title,
                    description,
                    url: `${baseUrl}/collections/${collection?.slug}`,
                    image: "/default-og.png",
                    name,
                }),
            ],
        };
    },
    component: RouteComponent,
    pendingComponent: () => (<PageLoader variant="grid" cols={4} rows={6} className="max-w-7xl w-full mx-auto py-2" />)
});

function RouteComponent() {
    const { slug } = Route.useParams();
    const { data } = useQuery(productFeedQuery({ ...Route.useSearch(), collections: slug }));

    return <InfiniteScrollClient initialData={data} collection_slug={slug!} />;
}
