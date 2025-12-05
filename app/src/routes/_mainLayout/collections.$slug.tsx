import { createFileRoute } from "@tanstack/react-router";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import ServerError from "@/components/generic/server-error";
import { tryCatch } from "@/lib/try-catch";
import { getProductsFn } from "@/server/product.server";
import z from "zod";
import { getCollectionFn } from "@/server/collections.server";
import { getSiteConfig } from "@/lib/config";
import { seo } from "@/utils/seo";

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

export const Route = createFileRoute("/_mainLayout/collections/$slug")({
    validateSearch: productSearchSchema,
    beforeLoad: ({ search }) => {
        console.log("🚀 ~ file: index.tsx:24 ~ search:", search);
        return {
            search,
        };
    },
    loader: async ({ params: { slug }, context }) => {
        const { data: collection } = await tryCatch(getCollectionFn({ data: slug }));
        const siteConfig = getSiteConfig();

        const { data, error } = await tryCatch(getProductsFn({ data: { limit: 36, collections: collection?.slug, ...context.search } }));
        return {
            collection,
            data,
            error,
            siteConfig,
        };
    },
    head: ({ loaderData }) => {
        const collection = loaderData?.collection;
        const baseUrl = import.meta.env.VITE_BASE_URL;
        const name = collection?.name;
        const title = `${name} Collection`;
        const description = `Explore ${name} at ${loaderData?.siteConfig?.name}`;

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
    const { data, error, collection } = Route.useLoaderData();
    if (error) {
        return <ServerError error={error} scenario="server" stack="Collections" />;
    }

    return (
        <div className="max-w-9xl mx-auto w-full py-4 px-2">
            <InfiniteScrollClient initialData={data} collection={collection!} />
        </div>
    );
}
