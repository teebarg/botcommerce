import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Search } from "lucide-react";
import type { PaginatedReview, Review } from "@/schemas";
import { Input } from "@/components/ui/input";
import ReviewItem from "@/components/admin/reviews/review-item";
import z from "zod";
import { api } from "@/utils/api";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";
import { reviewsQuery } from "@/queries/user.queries";
import EmptyState from "@/components/generic/empty";
import { PageLoader } from "@/components/generic/page-loader";

export const Route = createFileRoute("/_adminLayout/admin/(store)/reviews")({
    validateSearch: z.object({
        search: z.string().optional(),
        product_id: z.number().optional(),
        sort: z.string().optional(),
    }),
    loaderDeps: ({ search }) => search,
    loader: async ({ context: { queryClient }, deps }) => {
        queryClient.prefetchQuery(reviewsQuery(deps));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch();
    const { updateQuery } = useUpdateQuery(200);

    const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useInfiniteResource<PaginatedReview, Review>({
        queryKey: ["reviews", "infinite", params],
        queryFn: (cursor) => api.get<PaginatedReview>("/reviews/", { params: { cursor, ...params } }),
        getItems: (page) => page.items,
        getNextCursor: (page) => page.next_cursor,
    });

    return (
        <div className="px-3 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Reviews</h1>
                    <p className="text-muted-foreground text-sm">Manage your product reviews</p>
                </div>
                <div className="flex w-full items-center gap-2 md:w-auto mb-4">
                    <Input
                        className="bg-card"
                        placeholder="Search reviews..."
                        startContent={<Search />}
                        type="search"
                        wrapperClass="flex-1"
                        value={params.search ?? ""}
                        onChange={(e) => updateQuery([{ key: "search", value: e.target.value }])}
                    />
                </div>
            </div>
            <div className="mt-4">
                {isPending ? (
                    <PageLoader variant="list" />
                ) : items?.length == 0 ? (
                    <EmptyState
                        title="No reviews found"
                        description="Please adjust the time range or search query"
                        icon={MessageCircle}
                    />
                ) : (
                    <InfiniteResourceList
                        items={items}
                        onLoadMore={fetchNextPage}
                        hasMore={hasNextPage}
                        isLoading={isFetchingNextPage}
                        renderItem={(item: Review) => <ReviewItem key={item.id} review={item} />}
                    />
                )}
            </div>
        </div>
    );
}
