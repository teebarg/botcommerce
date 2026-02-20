import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { PaginatedUsers, User } from "@/schemas";
import CustomerCreateGuest from "@/components/admin/customers/customer-create-guest";
import CustomerFilter from "@/components/admin/customers/customer-filter";
import CustomerCard from "@/components/admin/customers/customer-card";
import z from "zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";
import { usersQuery } from "@/queries/admin.queries";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";
import { clientApi } from "@/utils/api.client";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";

export const Route = createFileRoute("/admin/(admin)/users")({
    validateSearch: z.object({
        sort: z.enum(["asc", "desc"]).optional(),
        query: z.string().optional(),
        role: z.enum(["ADMIN", "CUSTOMER"]).optional(),
        status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional(),
    }),
    loaderDeps: ({ search }) => search,
    loader: async ({ deps, context }) => {
        await context.queryClient.ensureQueryData(usersQuery(deps));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch();
    const { data: initialUsers } = useSuspenseQuery(usersQuery({ ...params }));
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filterOpen, setFilterOpen] = useState<boolean>(false);

    const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteResource<PaginatedUsers, User>({
        queryKey: ["users", "infinite", params],
        queryFn: (cursor) => clientApi.get<PaginatedUsers>("/users/", { params: { cursor, ...params } }),
        getItems: (page) => page.items,
        getNextCursor: (page) => page.next_cursor,
        initialData: initialUsers,
    });

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
                        {!isLoading && items.length > 0 && (
                            <InfiniteResourceList
                                items={items}
                                onLoadMore={fetchNextPage}
                                hasMore={hasNextPage}
                                isLoading={isFetchingNextPage}
                                renderItem={(item: User) => <CustomerCard key={item.id} user={item} />}
                            />
                        )}
                    </div>

                    {!isLoading && items?.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">No users found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
