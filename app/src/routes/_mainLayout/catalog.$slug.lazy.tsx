import { createLazyFileRoute } from "@tanstack/react-router";
import { CatalogVisitTracker } from "@/components/store/catalog/catalog-visit-tracker";
import { PageLoader } from "@/components/generic/page-loader";
import { Suspense } from "react";
import { CatalogFeed } from "@/components/store/catalog/catalog-feed";

export const Route = createLazyFileRoute("/_mainLayout/catalog/$slug")({
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
