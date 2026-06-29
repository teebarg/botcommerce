import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { OrderStatusSchema, type Order, type PaginatedOrders } from "@/schemas";
import { OrderCard } from "@/components/admin/orders/order-card";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";
import OrderFilters from "@/components/admin/orders/order-filters";
import z from "zod";
import { ordersQuery } from "@/queries/user.queries";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";
import { api } from "@/utils/api";
import EmptyState from "@/components/generic/empty";
import { PageLoader } from "@/components/generic/page-loader";

export const Route = createFileRoute("/_adminLayout/admin/(store)/orders")({
    validateSearch: z.object({
        search: z.string().optional(),
        status: OrderStatusSchema.optional(),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
    }),
    loaderDeps: ({ search }) => search,
    loader: async ({ context: { queryClient }, deps }) => {
        queryClient.prefetchQuery(ordersQuery(deps));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch();
    const { updateQuery } = useUpdateQuery(200);

    const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useInfiniteResource<PaginatedOrders, Order>({
        queryKey: ["orders", "infinite", params],
        queryFn: (cursor) => api.get<PaginatedOrders>("/order/", { params: { cursor, ...params } }),
        getItems: (page) => page.items,
        getNextCursor: (page) => page.next_cursor,
    });

    return (
        <div className="px-4 py-2">
            <div className="mb-6">
                <h1 className="text-xl font-medium">Order view</h1>
                <p className="text-muted-foreground text-sm">Manage your orders.</p>
            </div>
            <div>
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="text-gray-400" size={18} />
                    </div>
                    <input
                        className="pl-10 pr-4 py-2 w-full border border-input rounded-lg focus:outline-none"
                        placeholder="Search orders..."
                        type="text"
                        value={params.search ?? ""}
                        onChange={(e) => updateQuery([{ key: "search", value: e.target.value }])}
                    />
                </div>
                <OrderFilters />
                <div className="mt-4">
                    {isPending ? (
                        <PageLoader variant="list" />
                    ) : items.length > 0 ? (
                        <InfiniteResourceList
                            className="md:space-y-2"
                            items={items}
                            onLoadMore={fetchNextPage}
                            hasMore={hasNextPage}
                            isLoading={isFetchingNextPage}
                            renderItem={(item: Order) => <OrderCard key={item.id} order={item} />}
                        />
                    ) : (
                        <EmptyState title="No orders found" />
                    )}
                </div>
            </div>
        </div>
    );
}
