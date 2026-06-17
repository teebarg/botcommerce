import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/utils/seo";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import { collectionQuery, productFeedQuery } from "@/queries/user.queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FeedQuerySchema } from "@/schemas";

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
        await queryClient.ensureQueryData(productFeedQuery({ collections: collection?.slug, ...search }));
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
});

function RouteComponent() {
    const { slug } = Route.useParams();
    const { data } = useSuspenseQuery(productFeedQuery({ ...Route.useSearch(), collections: slug }));

    return <InfiniteScrollClient initialData={data} collection_slug={slug!} />;
}
