import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
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

export const Route = createFileRoute("/_mainLayout/collections/")({
    validateSearch: FeedQuerySchema,
    component: RouteComponent,
    beforeLoad: ({ search }) => {
        return {
            search,
        };
    },
    loader: async ({ context: { search } }) => {
        const res = await getProductsFeedFn({ data: { ...search, feed_seed: Math.random() } });
        return { data: res };
    },
});

function RouteComponent() {
    const { data } = Route.useLoaderData();

    return <InfiniteScrollClient initialData={data} />;
}
