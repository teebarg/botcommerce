import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/utils/seo";
import { collectionQuery, productFeedInfiniteQuery } from "@/queries/user.queries";
import { FeedQuerySchema } from "@/schemas";
import { PageLoader } from "@/components/generic/page-loader";
import { Suspense } from "react";
import { ProductFeed } from "@/components/store/collections/product-feed";

export const Route = createFileRoute("/_mainLayout/collections/$slug")({
    validateSearch: FeedQuerySchema,
    beforeLoad: ({ search }) => {
        return {
            search,
        };
    },
    loaderDeps: ({ search }) => search,
    loader: async ({ params: { slug }, context: { search, config, queryClient } }) => {
        const collection = await queryClient.ensureQueryData(collectionQuery(slug));
        queryClient.fetchInfiniteQuery(productFeedInfiniteQuery({ collections: collection?.slug, ...search }));
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
    const search = Route.useSearch();

    return (
        <Suspense fallback={<PageLoader variant="grid" />}>
            <ProductFeed params={{ ...search, collections: slug }} />
        </Suspense>
    );
}
