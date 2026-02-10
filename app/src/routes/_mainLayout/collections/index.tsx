import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import { productFeedQuery } from "@/queries/user.queries";
import { useSuspenseQuery } from "@tanstack/react-query";

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
    loader: async ({ context: { search, queryClient } }) => {
        await queryClient.ensureQueryData(productFeedQuery({ ...search }));
    },
});

function RouteComponent() {
    const { data } = useSuspenseQuery(productFeedQuery(Route.useSearch()));

    return <InfiniteScrollClient initialData={data} />;
}
