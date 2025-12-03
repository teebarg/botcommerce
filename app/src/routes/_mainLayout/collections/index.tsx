import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { SortOptions } from "@/types/models";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import { CollectionTemplateSkeleton } from "@/components/store/collections/skeleton";
import ServerError from "@/components/generic/server-error";
import { tryCatch } from "@/lib/try-catch";
import { GetProductsFn } from "@/server/product.server";
import z from "zod";

const productSearchSchema = z.object({
    sort: z.enum(["min_variant_price:asc", "min_variant_price:desc", "id:desc"]).optional(),
    limit: z.number().optional(),
    skip: z.number().optional(),
    max_price: z.number().optional(),
    min_price: z.number().optional(),
    cat_ids: z.string().optional(),
    sizes: z.string().optional(),
    colors: z.string().optional(),
    ages: z.string().optional(),
});

type ProductSearch = z.infer<typeof productSearchSchema>;

export const Route = createFileRoute("/_mainLayout/collections/")({
    validateSearch: productSearchSchema,
    component: CollectionsPage,
    beforeLoad: ({ search }) => {
        console.log("🚀 ~ file: index.tsx:24 ~ search:", search);
        return {
            search,
        };
    },
    loader: async ({ context, params, location }) => {
        console.log("🚀 ~ file: index.tsx:30 ~ params:", params)
        // console.log("🚀 ~ file: index.tsx:30 ~ route:", route)
        console.log("🚀 ~ file: index.tsx:30 ~ location:", location)
        console.log("🚀 ~ file: index.tsx:12 ~ context:", context);

        const queryParams = {
            limit: 36,
            sort: context.search.sort,
            max_price: Number(context.search.max_price ?? 100000000),
            min_price: Number(context.search.min_price ?? 0),
            cat_ids: context.search.cat_ids ?? undefined,
            sizes: context.search.sizes ?? undefined,
            colors: context.search.colors ?? undefined,
            ages: context.search.ages ?? undefined,
            skip: 0,
        };

        const { data, error } = await tryCatch(GetProductsFn({ data: queryParams }));
        return {
            queryParams,
            data,
            error,
        };
    },
});

function CollectionsPage() {
    const { data, error, queryParams } = Route.useLoaderData();
    if (error) {
        return <ServerError error={error} scenario="server" stack="Collections" />;
    }

    return (
        <div className="max-w-9xl mx-auto w-full py-4 px-2">
            <InfiniteScrollClient initialData={data?.products} initialSearchParams={queryParams} />
        </div>
    );
}
