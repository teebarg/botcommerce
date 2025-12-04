import { createFileRoute } from "@tanstack/react-router";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import ServerError from "@/components/generic/server-error";
import { tryCatch } from "@/lib/try-catch";
import { GetProductsFn } from "@/server/product.server";
import z from "zod";
import { getCollectionFn } from "@/server/collections.server";
import { getSiteConfig } from "@/lib/config";
import { seo } from "@/utils/seo";
import { getCatalogFn } from "@/server/catalog.server";
import { SharedCollectionVisitTracker } from "@/components/store/shared/shared-collection-visit-tracker";
import ShareButton from "@/components/share";
import SharedInfinite from "@/components/store/shared/shared-infinite";
import { useSuspenseQuery } from "@tanstack/react-query";

export const CatalogSearchSchema = z.object({
    limit: z.number().optional(),
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
        console.log("🚀 ~ file: index.tsx:24 ~ search:", search);
        return {
            search,
        };
    },
    loader: async ({ params: { slug }, context: { queryClient, search } }) => {
        const data = await queryClient.ensureQueryData(catalogQueryOptions(slug, { ...search }));
        const siteConfig = getSiteConfig();

        return {
            data,
            slug,
            siteConfig,
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
        <div>
            <div className="max-w-8xl mx-auto w-full py-4 px-1.5 lg:px-0">
                <SharedCollectionVisitTracker slug={slug} />
                <div className="flex lg:flex-row flex-col lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{catalog.title}</h1>
                        {catalog.description && <p className="text-lg text-muted-foreground">{catalog.description}</p>}
                    </div>
                    <div className="flex justify-end">
                        <ShareButton />
                    </div>
                </div>
                <SharedInfinite initialCatalog={catalog} slug={slug} />
            </div>
        </div>
    );
}
