import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { productFeedOptions } from "@/hooks/useProduct";
import SocialInfiniteScrollClient from "@/components/store/collections/scroll-client-social";

const FeedQuerySchema = z.object({
    sort: z.enum(["min_variant_price:asc", "min_variant_price:desc", "id:desc", "created_at:desc"]).optional(),
    max_price: z.number().optional(),
    min_price: z.number().optional(),
    cat_ids: z.string().optional(),
    sizes: z.number().optional(),
    colors: z.string().optional(),
    ages: z.string().optional(),
});

export const Route = createFileRoute("/_mainLayout/featured")({
    validateSearch: FeedQuerySchema,
    component: RouteComponent,
    beforeLoad: ({ search }) => {
        return {
            search,
        };
    },
    loader: async ({ context: { queryClient, search } }) => {
        await queryClient.ensureQueryData(productFeedOptions({ ...search }));
    },
});

function RouteComponent() {
    const search = Route.useSearch();
    const { data } = useSuspenseQuery(productFeedOptions(search));

    return <SocialInfiniteScrollClient initialData={data} />;
}
