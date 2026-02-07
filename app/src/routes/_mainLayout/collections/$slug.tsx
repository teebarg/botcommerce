import { createFileRoute } from "@tanstack/react-router";
import { tryCatch } from "@/utils/try-catch";
import z from "zod";
import { getCollectionFn } from "@/server/collections.server";
import { seo } from "@/utils/seo";
import { productFeedOptions } from "@/hooks/useProduct";
import { useSuspenseQuery } from "@tanstack/react-query";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";

const FeedQuerySchema = z.object({
    sort: z.enum(["min_variant_price:asc", "min_variant_price:desc", "id:desc", "created_at:desc"]).optional(),
    max_price: z.number().optional(),
    min_price: z.number().optional(),
    cat_ids: z.string().optional(),
    sizes: z.number().optional(),
    colors: z.string().optional(),
    ages: z.string().optional(),
});

export const Route = createFileRoute("/_mainLayout/collections/$slug")({
    validateSearch: FeedQuerySchema,
    beforeLoad: ({ search }) => {
        return {
            search,
        };
    },
    loader: async ({ params: { slug }, context: { queryClient, search, config } }) => {
        const { data: collection } = await tryCatch(getCollectionFn({ data: slug }));
        await queryClient.ensureQueryData(productFeedOptions({ collections: collection?.slug, ...search }));
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
    const { data } = useSuspenseQuery(productFeedOptions({ collections: slug, ...search }));

    return <InfiniteScrollClient initialData={data} collection_slug={slug!} />;
}
