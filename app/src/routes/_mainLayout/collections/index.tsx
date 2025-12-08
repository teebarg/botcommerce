import { createFileRoute } from "@tanstack/react-router";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import z from "zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { productQueryOptions } from "@/hooks/useProduct";

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

export const Route = createFileRoute("/_mainLayout/collections/")({
    validateSearch: productSearchSchema,
    component: CollectionsPage,
    beforeLoad: ({ search }) => {
        return {
            search,
        };
    },
    loader: async ({ context: { queryClient, search } }) => {
        await queryClient.ensureQueryData(productQueryOptions({ limit: 36, ...search }));
    },
});

function CollectionsPage() {
    const search = Route.useSearch();
    const { data } = useSuspenseQuery(productQueryOptions(search));

    return (
        <div className="max-w-9xl mx-auto w-full py-4 px-2">
            <InfiniteScrollClient initialData={data} />
        </div>
    );
}
