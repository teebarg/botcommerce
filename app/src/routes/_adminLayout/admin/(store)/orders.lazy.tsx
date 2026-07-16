import { createLazyFileRoute } from "@tanstack/react-router";
import { type Order, type PaginatedOrders } from "@/schemas";
import { OrderCard } from "@/components/admin/orders/order-card";
import OrderFilters from "@/components/admin/orders/order-filters";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";
import { api } from "@/utils/api";
import EmptyState from "@/components/generic/empty";
import { PageLoader } from "@/components/generic/page-loader";

export const Route = createLazyFileRoute("/_adminLayout/admin/(store)/orders")({
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch();
    const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useInfiniteResource<PaginatedOrders, Order>({
        queryKey: ["orders", "infinite", params],
        queryFn: (cursor) => api.get<PaginatedOrders>("/order/", { params: { cursor, ...params } }),
        getItems: (page) => page.items,
        getNextCursor: (page) => page.next_cursor,
    });

    return (
        <div className="px-2 py-2 max-w-5xl">
            <div className="mb-2">
                <h1 className="text-xl font-medium">Order view</h1>
                <p className="text-muted-foreground text-sm">Manage your orders.</p>
            </div>
            <div className="sticky glass top-[calc(var(--sat)+var(--admin-nav-height))] z-40 -mx-2 p-2">
                <OrderFilters />
            </div>
            <div className="mt-2">
                {isPending ? (
                    <PageLoader variant="list" />
                ) : items.length > 0 ? (
                    <InfiniteResourceList
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
    );
}
