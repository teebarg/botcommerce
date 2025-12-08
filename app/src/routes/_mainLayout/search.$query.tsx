import { createFileRoute } from "@tanstack/react-router";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import ServerError from "@/components/generic/server-error";
import { tryCatch } from "@/utils/try-catch";
import { getProductsFn } from "@/server/product.server";
import z from "zod";

const productSearchSchema = z.object({
    sort: z.enum(["min_variant_price:asc", "min_variant_price:desc", "id:desc", "created_at:desc"]).optional(),
    limit: z.number().optional(),
    skip: z.number().optional(),
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
        console.log("🚀 ~ file: index.tsx:24 ~ search:", search);
        return {
            search,
        };
    },
    loader: async ({ params: { query }, context }) => {
        const { data, error } = await tryCatch(getProductsFn({ data: { limit: 36, search: query, ...context.search } }));
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
    return (
        <div className="container mx-auto mt-4 py-4 px-1">
            <div className="flex flex-col items-start">
                <p className="text-sm">Search Results for</p>
                <h4 className="text-lg font-bold">“{decodeURI(query)}”</h4>
            </div>
            <InfiniteScrollClient initialData={data} searchTerm={query} />
        </div>
    );
}
