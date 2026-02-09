import { createFileRoute } from "@tanstack/react-router";
import ServerError from "@/components/generic/server-error";
import { tryCatch } from "@/utils/try-catch";
import { getProductsFeedFn } from "@/server/product.server";
import z from "zod";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";

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
    loader: async ({ params: { query }, context }) => {
        const { data, error } = await tryCatch(getProductsFeedFn({ data: { search: query, ...context.search } }));
        return {
            query,
            data,
            error,
        };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { data, error, query } = Route.useLoaderData();
    if (error) {
        return <ServerError error={error} scenario="server" stack="SearchResults" />;
    }
    return <InfiniteScrollClient initialData={data} searchTerm={query} />;
}
