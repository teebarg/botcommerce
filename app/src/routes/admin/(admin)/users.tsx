import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader, Search, SlidersHorizontal } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Order, PaginatedUsers, Status, User } from "@/schemas";
import { currency } from "@/utils";
import PaginationUI from "@/components/pagination";
import CustomerCreateGuest from "@/components/admin/customers/customer-create-guest";
import CustomerFilter from "@/components/admin/customers/customer-filter";
import CustomerActions from "@/components/admin/customers/customer-actions";
import CustomerCard from "@/components/admin/customers/customer-card";
import z from "zod";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getUsersFn } from "@/server/users.server";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";
import { usersQuery } from "@/queries/admin.queries";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";
import { clientApi } from "@/utils/api.client";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";

// interface UsersParams {
//     query?: string;
//     role?: "ADMIN" | "CUSTOMER";
//     status?: "ACTIVE" | "INACTIVE" | "PENDING";
//     sort?: string;
// }

// export const useUsers = (searchParams: UsersParams) =>
//     queryOptions({
//         queryKey: ["users", JSON.stringify(searchParams)],
//         queryFn: () => getUsersFn({ data: { ...searchParams } }),
//     });

export const Route = createFileRoute("/admin/(admin)/users")({
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(usersQuery({}));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch();
    console.log("🚀 ~ file: users.tsx:43 ~ params:", params);
    const params2 = Route.useParams();
    console.log("🚀 ~ file: users.tsx:43 ~ params:", params2);
    const { data: initialUsers } = useSuspenseQuery(usersQuery({}));
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filterOpen, setFilterOpen] = useState<boolean>(false);

    const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteResource<PaginatedUsers, User>({
        queryKey: ["users", "infinite", params],
        queryFn: (cursor) => clientApi.get<PaginatedUsers>("/users/", { params: { cursor } }),
        getItems: (page) => page.items,
        getNextCursor: (page) => page.next_cursor,
        initialData: initialUsers,
    });

    const getStatusBadge = (status?: Status) => {
        const variants: Record<Status, "destructive" | "emerald" | "warning"> = {
            ["PENDING"]: "warning",
            ["ACTIVE"]: "emerald",
            ["INACTIVE"]: "destructive",
        };

        return <Badge variant={variants[status ?? "PENDING"]}>{status}</Badge>;
    };

    return (
        <div className="px-3 md:px-10 py-8">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-xl font-semibold">Customers view</h3>
                    <p className="text-sm text-muted-foreground">Manage your customers.</p>
                </div>
                <CustomerCreateGuest />
            </div>
            <div className="pb-4">
                <div>
                    <div className="relative mb-4 rounded-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="text-muted-foreground" size={18} />
                        </div>
                        <input
                            className="pl-10 pr-12 py-2 w-full border border-input rounded-lg focus:outline-none"
                            placeholder="Search customers..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <ConfirmDrawer
                            open={filterOpen}
                            onOpenChange={setFilterOpen}
                            trigger={
                                <button className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setFilterOpen(true)}>
                                    <SlidersHorizontal className="text-muted-foreground" size={18} />
                                </button>
                            }
                            content={<CustomerFilter open={filterOpen} onOpenChange={setFilterOpen} />}
                            onClose={() => setFilterOpen(false)}
                            title="Filter Customers"
                            description=""
                            hideActionBtn
                        />
                    </div>
                    <div className="mt-4 py-2">
                        {/* {users?.map((user: User, idx: number) => (
                            <CustomerCard key={idx} actions={<CustomerActions user={user} />} user={user} />
                        ))} */}
                        {!isLoading && items.length > 0 && (
                            <InfiniteResourceList
                                items={items}
                                onLoadMore={fetchNextPage}
                                hasMore={hasNextPage}
                                isLoading={isFetchingNextPage}
                                loader={
                                    <div className="flex flex-col items-center justify-center text-blue-600">
                                        <Loader className="h-8 w-8 animate-spin mb-2" />
                                        <p className="text-sm font-medium text-muted-foreground">Loading more transactions...</p>
                                    </div>
                                }
                                renderItem={(item: User) => <CustomerCard key={item.id} actions={<CustomerActions user={item} />} user={item} />}
                            />
                        )}
                    </div>

                    {items?.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">No users found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
