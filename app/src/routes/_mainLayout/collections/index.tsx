import { createFileRoute } from "@tanstack/react-router";
import { FeedQuerySchema } from "@/schemas";
import { PageLoader } from "@/components/generic/page-loader";
import { ProductFeed } from "@/components/store/collections/product-feed";
import { Suspense } from "react";
import { productFeedInfiniteQuery } from "@/queries/user.queries";

export const Route = createFileRoute("/_mainLayout/collections/")({
    validateSearch: FeedQuerySchema,
    component: RouteComponent,
    beforeLoad: ({ search }) => ({ search }),
    loader: ({ context: { queryClient, search } }) => {
        return queryClient.fetchInfiniteQuery(
            productFeedInfiniteQuery(search)
        )
    }
});

function RouteComponent() {
    const search = Route.useSearch();
    return (
        <Suspense fallback={<PageLoader variant="grid" />}>
            <ProductFeed params={{ ...search }} />
        </Suspense>
    );
}
