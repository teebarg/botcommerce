import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import type { Order, PaginatedOrders } from "@/schemas";
import OrderCard from "@/components/admin/orders/order-card";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";
import OrderFilters from "@/components/admin/orders/order-filters";
import z from "zod";
import { ordersQuery } from "@/queries/user.queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";
import { clientApi } from "@/utils/api.client";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";

export const Route = createFileRoute("/admin/(store)/orders")({
    validateSearch: z.object({
        search: z.string().optional(),
        status: z.enum(["ACTIVE", "COMPLETED", "ABANDONED", "DELIVERED"]).optional(),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
    }),
    loaderDeps: ({ search }) => search,
    loader: async ({ context: { queryClient }, deps }) => {
        await queryClient.ensureQueryData(ordersQuery(deps));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch();
    const { data: initialData } = useSuspenseQuery(ordersQuery(params));
    const { updateQuery } = useUpdateQuery(200);

    const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteResource<PaginatedOrders, Order>({
        queryKey: ["coupons", "infinite", params],
        queryFn: (cursor) => clientApi.get<PaginatedOrders>("/order/", { params: { cursor, ...params } }),
        getItems: (page) => page.items,
        getNextCursor: (page) => page.next_cursor,
        initialData: initialData,
    });

    return (
        <div className="px-4 md:px-10 py-8">
            <div className="mb-6 flex flex-col">
                <h1 className="text-2xl font-medium">Order view</h1>
                <p className="text-muted-foreground text-sm">Manage your orders.</p>
            </div>
            <div className="pb-4">
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
                    {!isLoading && items.length > 0 && (
                        <InfiniteResourceList
                            items={items}
                            onLoadMore={fetchNextPage}
                            hasMore={hasNextPage}
                            isLoading={isFetchingNextPage}
                            renderItem={(item: Order) => <OrderCard key={item.id} order={item} />}
                        />
                    )}
                    {!isLoading && items.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No orders found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
