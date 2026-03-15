import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import type { PaginatedReview, Review } from "@/schemas";
import { Input } from "@/components/ui/input";
import ReviewItem from "@/components/admin/reviews/review-item";
import z from "zod";
import { reviewsQuery } from "@/queries/user.queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { clientApi } from "@/utils/api.client";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";

export const Route = createFileRoute("/_adminLayout/admin/(store)/reviews")({
    validateSearch: z.object({
        product_id: z.number().optional(),
        skip: z.number().optional(),
        sort: z.string().optional(),
    }),
    loaderDeps: ({ search }) => search,
    loader: async ({ context: { queryClient }, deps }) => {
        await queryClient.ensureQueryData(reviewsQuery(deps));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch();
    const { data: initialData } = useSuspenseQuery(reviewsQuery(params));
    const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteResource<PaginatedReview, Review>({
        queryKey: ["reviews", JSON.stringify(params)],
        queryFn: (cursor) => clientApi.get<PaginatedReview>("/order/", { params: { cursor, ...params } }),
        getItems: (page) => page.items,
        getNextCursor: (page) => page.next_cursor,
        initialData: initialData,
    });

    return (
        <div className="px-3 md:px-12 py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Reviews</h1>
                    <p className="text-muted-foreground text-sm">Manage your product reviews</p>
                </div>
                <div className="flex w-full items-center gap-2 md:w-auto mb-4">
                    <Input className="bg-card" placeholder="Search reviews..." startContent={<Search />} type="search" wrapperClass="flex-1" />
                </div>
            </div>
            <div className="mt-4">
                {!isLoading && items.length > 0 && (
                    <InfiniteResourceList
                        items={items}
                        onLoadMore={fetchNextPage}
                        hasMore={hasNextPage}
                        isLoading={isFetchingNextPage}
                        renderItem={(item: Review) => <ReviewItem key={item.id} review={item} />}
                    />
                )}
                {!isLoading && items.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No reviews found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
