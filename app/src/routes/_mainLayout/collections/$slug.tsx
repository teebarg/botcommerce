import { createFileRoute } from "@tanstack/react-router";
import { tryCatch } from "@/utils/try-catch";
import z from "zod";
import { getCollectionFn } from "@/server/collections.server";
import { seo } from "@/utils/seo";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import { getProductsFeedFn } from "@/server/product.server";

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
    loader: async ({ params: { slug }, context: { search, config } }) => {
        const { data: collection } = await tryCatch(getCollectionFn({ data: slug }));
        const res = await getProductsFeedFn({ data: { collections: collection?.slug, ...search, feed_seed: Math.random() } });
        return {
            collection,
            config,
            data: res,
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
    const { data } = Route.useLoaderData();

    return <InfiniteScrollClient initialData={data} collection_slug={slug!} />;
}
