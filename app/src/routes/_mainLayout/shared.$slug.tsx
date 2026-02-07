import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { seo } from "@/utils/seo";
import { getCatalogFn } from "@/server/catalog.server";
import { SharedCollectionVisitTracker } from "@/components/store/shared/shared-collection-visit-tracker";
import SharedInfinite from "@/components/store/shared/shared-infinite";
import { useSuspenseQuery } from "@tanstack/react-query";

export const CatalogSearchSchema = z.object({
    sort: z.string().optional(),
    sizes: z.number().optional(),
    colors: z.string().optional(),
});

const catalogQueryOptions = (slug: string, params: any) => ({
    queryKey: ["product", slug, JSON.stringify(params)],
    queryFn: () => getCatalogFn({ data: { ...params, slug } }),
});

export const Route = createFileRoute("/_mainLayout/shared/$slug")({
    validateSearch: CatalogSearchSchema,
    beforeLoad: ({ search }) => {
        return {
            search,
        };
    },
    loader: async ({ params: { slug }, context: { queryClient, search } }) => {
        const data = await queryClient.ensureQueryData(catalogQueryOptions(slug, { ...search }));

        return {
            data,
            slug,
        };
    },
    head: ({ loaderData }) => {
        const catalog = loaderData?.data;
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
    const { slug } = Route.useParams();
    const search = Route.useSearch();
    const { data: catalog } = useSuspenseQuery(catalogQueryOptions(slug, search));

    return (
        <div className="max-w-8xl mx-auto w-full py-4 px-1.5 lg:px-0">
            <SharedCollectionVisitTracker slug={slug} />
            <SharedInfinite initialCatalog={catalog} slug={slug} />
        </div>
    );
}
