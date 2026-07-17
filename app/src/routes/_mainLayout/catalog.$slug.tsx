import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/utils/seo";
import { CatalogQuerySchema } from "@/schemas";
import { catalogInfiniteQuery } from "@/queries/user.queries";

export const Route = createFileRoute("/_mainLayout/catalog/$slug")({
    validateSearch: CatalogQuerySchema,
    loader: async ({ params: { slug }, context: { queryClient } }) => {
        return queryClient.fetchInfiniteQuery(catalogInfiniteQuery(slug))
    },
    head: ({ params }) => {
        const title = `Catalog: ${params.slug}`;
        return {
            title,
            meta: [
                ...seo({
                    title,
                    description: `Products for catalog: ${params.slug}`,
                    url: `${import.meta.env.VITE_BASE_URL}/catalog/${params?.slug}`,
                    image: "/default-og.png",
                    name: title,
                }),
            ],
        };
    },
});
