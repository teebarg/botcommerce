import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { seo } from "@/utils/seo";
import { CatalogVisitTracker } from "@/components/store/catalog/catalog-visit-tracker";
import { catalogFeedQuery } from "@/queries/user.queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import CatalogInfinite from "@/components/store/catalog/catalog-infinite";

export const CatalogSearchSchema = z.object({
    sizes: z.number().optional(),
    colors: z.string().optional(),
});

export const Route = createFileRoute("/_mainLayout/catalog/$slug")({
    validateSearch: CatalogSearchSchema,
    beforeLoad: ({ search }) => {
        return {
            search,
        };
    },
    loader: async ({ params: { slug }, context: { search, queryClient } }) => {
        const catalog = await queryClient.ensureQueryData(catalogFeedQuery({ ...search, slug }));
        return {
            catalog,
            slug,
        };
    },
    head: ({ loaderData }) => {
        const catalog = loaderData?.catalog;
        const title = catalog?.title || "";
        const description = catalog?.description || `Curated product list: ${title}`;

        return {
            title,
            meta: [
                ...seo({
                    title,
                    description,
                    url: `${import.meta.env.VITE_BASE_URL}/catalog/${loaderData?.slug}`,
                    image: "/default-og.png",
                    name: title,
                }),
            ],
        };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const search = Route.useSearch();
    const { slug } = Route.useParams();
    const { data: catalog } = useSuspenseQuery(catalogFeedQuery({ ...search, slug }));
    return (
        <>
            <CatalogVisitTracker slug={slug} />
            <CatalogInfinite initialData={catalog} slug={slug} />
        </>
    );
}
