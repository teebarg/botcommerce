import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import { productFeedQuery } from "@/queries/user.queries";
import { useSuspenseQuery } from "@tanstack/react-query";

const productSearchSchema = z.object({
    sort: z.enum(["min_variant_price:asc", "min_variant_price:desc", "id:desc", "created_at:desc"]).optional(),
    max_price: z.number().optional(),
    min_price: z.number().optional(),
    cat_ids: z.string().optional(),
    sizes: z.number().optional(),
    colors: z.string().optional(),
    ages: z.string().optional(),
});

export const Route = createFileRoute("/_mainLayout/search/$query")({
    validateSearch: productSearchSchema,
    beforeLoad: ({ search }) => {
        return {
            search,
        };
    },
    loader: async ({ params: { query }, context: { queryClient, search } }) => {
        await queryClient.ensureQueryData(productFeedQuery({ search: query, ...search }));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const query = Route.useParams().query;
    const { data } = useSuspenseQuery(productFeedQuery({ search: query, ...Route.useSearch() }));
    return <InfiniteScrollClient initialData={data} searchTerm={query} />;
}
