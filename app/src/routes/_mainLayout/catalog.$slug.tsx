import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/utils/seo";
import { CatalogVisitTracker } from "@/components/store/catalog/catalog-visit-tracker";
import { CatalogQuerySchema } from "@/schemas";
import { PageLoader } from "@/components/generic/page-loader";
import { catalogInfiniteQuery } from "@/queries/user.queries";
import { Suspense } from "react";
import { CatalogFeed } from "@/components/store/catalog/catalog-feed";

export const Route = createFileRoute("/_mainLayout/catalog/$slug")({
    validateSearch: CatalogQuerySchema,
    loader: async ({ params: { slug }, context: { queryClient } }) => {
        queryClient.fetchInfiniteQuery(
            catalogInfiniteQuery(slug)
        )
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
    component: RouteComponent,
});

function RouteComponent() {
    const { slug } = Route.useParams();
    return (
        <main className="max-w-sxl mx-auto w-full px-2 py-4">
            <CatalogVisitTracker slug={slug} />
            <Suspense fallback={<PageLoader variant="grid" />}>
                <CatalogFeed slug={slug} />
            </Suspense>
        </main>
    );
}
