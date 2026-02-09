import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { seo } from "@/utils/seo";
import { getCatalogFn } from "@/server/catalog.server";
import { SharedCollectionVisitTracker } from "@/components/store/shared/shared-collection-visit-tracker";
import SharedInfinite from "@/components/store/shared/shared-infinite";

export const CatalogSearchSchema = z.object({
    sort: z.string().optional(),
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
    loader: async ({ params: { slug }, context: { search } }) => {
        const res = await getCatalogFn({ data: { ...search, slug } });
        return {
            catalog: res,
            slug,
        };
    },
    head: ({ loaderData }) => {
        const catalog = loaderData?.catalog;
        const name = catalog?.title || "";
        const title = name;
        const description = catalog?.description || `Curated product list: ${name}`;

        return {
            title,
            meta: [
                ...seo({
                    title,
                    description,
                    url: `${import.meta.env.VITE_BASE_URL}/shared/${loaderData?.slug}`,
                    image: "/default-og.png",
                    name,
                }),
            ],
        };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { catalog, slug } = Route.useLoaderData();
    return (
        <>
            <SharedCollectionVisitTracker slug={slug} />
            <SharedInfinite initialCatalog={catalog} slug={slug} />
        </>
    );
}
