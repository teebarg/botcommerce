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

export const Route = createFileRoute("/_mainLayout/collections")({
    validateSearch: productSearchSchema,
    component: CollectionsPage,
    beforeLoad: ({ search }) => {
        return {
            search,
        };
    },
    loader: async ({ context, params, location }) => {
        // console.log("🚀 ~ file: index.tsx:30 ~ params:", params)
        // console.log("🚀 ~ file: index.tsx:30 ~ route:", route)
        // console.log("🚀 ~ file: index.tsx:30 ~ location:", location)
        // console.log("🚀 ~ file: index.tsx:12 ~ context:", context);

        const { data, error } = await tryCatch(getProductsFn({ data: { limit: 36, ...context.search } }));
        return {
            data,
            error,
        };
    },
});

function CollectionsPage() {
    const { data, error } = Route.useLoaderData();
    if (error) {
        return <ServerError error={error} scenario="server" stack="Collections" />;
    }

    return (
        <div className="max-w-9xl mx-auto w-full py-4 px-2">
            <InfiniteScrollClient initialData={data} />
        </div>
    );
}
