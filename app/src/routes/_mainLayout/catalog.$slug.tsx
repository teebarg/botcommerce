import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { seo } from "@/utils/seo";
import { CatalogVisitTracker } from "@/components/store/catalog/catalog-visit-tracker";
import CatalogInfinite from "@/components/store/catalog/catalog-infinite";

export const CatalogSearchSchema = z.object({
    sizes: z.string().optional(),
    width: z.number().optional(),
    length: z.number().optional(),
});

export const Route = createFileRoute("/_mainLayout/catalog/$slug")({
    validateSearch: CatalogSearchSchema,
    beforeLoad: ({ search }) => {
        return {
            search,
        };
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
        <>
            <CatalogVisitTracker slug={slug} />
            <CatalogInfinite slug={slug} />
        </>
    );
}
