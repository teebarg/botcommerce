import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { seo } from "@/utils/seo";
import { SharedCollectionVisitTracker } from "@/components/store/shared/shared-collection-visit-tracker";
import SharedInfinite from "@/components/store/shared/shared-infinite";
import { catalogFeedQuery } from "@/queries/user.queries";
import { useSuspenseQuery } from "@tanstack/react-query";

export const CatalogSearchSchema = z.object({
    sizes: z.number().optional(),
    colors: z.string().optional(),
});

export const Route = createFileRoute("/_mainLayout/shared/$slug")({
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
                    url: `${import.meta.env.VITE_BASE_URL}/shared/${loaderData?.slug}`,
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
            <SharedCollectionVisitTracker slug={slug} />
            <SharedInfinite initialCatalog={catalog} slug={slug} />
        </>
    );
}
