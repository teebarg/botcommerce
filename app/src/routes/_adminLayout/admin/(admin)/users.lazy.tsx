
import { createLazyFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal, UserCircle } from "lucide-react";
import type { PaginatedUsers, User } from "@/schemas";
import CustomerCreateGuest from "@/components/admin/customers/customer-create-guest";
import CustomerFilter from "@/components/admin/customers/customer-filter";
import CustomerCard from "@/components/admin/customers/customer-card";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";
import { api } from "@/utils/api";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";
import { useState } from "react";
import EmptyState from "@/components/generic/empty";
import { PageLoader } from "@/components/generic/page-loader";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

export const Route = createLazyFileRoute("/_adminLayout/admin/(admin)/users")({
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch();
    const [filterOpen, setFilterOpen] = useState<boolean>(false);
    const { value: searchValue, onChange: onSearchChange } = useDebouncedSearch("query", params.query);

    const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useInfiniteResource<PaginatedUsers, User>({
        queryKey: ["users", params],
        queryFn: (cursor) => api.get<PaginatedUsers>("/users/", { params: { cursor, ...params } }),
        getItems: (page) => page.items,
        getNextCursor: (page) => page.next_cursor,
    });

    return (
        <div className="px-2 py-4 max-w-5xl">
            <div>
                <h3 className="text-xl font-semibold">Customers view</h3>
                <p className="text-sm text-muted-foreground">Manage your customers.</p>
            </div>
            <div>
                <div className="sticky flex items-center justify-between glass top-[calc(var(--sat)+var(--admin-nav-height))] -mx-2 z-40 p-2">
                    <div className="relative rounded-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="text-muted-foreground" size={18} />
                        </div>
                        <input
                            className="pl-10 pr-12 py-2 w-full border border-input rounded-lg focus:outline-none"
                            placeholder="Search customers..."
                            type="text"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
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
                    <CustomerCreateGuest />
                </div>
                <div className="mt-2">
                    {isPending ? (
                        <PageLoader variant="list" />
                    ) : items?.length == 0 ? (
                        <EmptyState
                            title="No users found"
                            description="You currently don't have users in your system"
                            icon={UserCircle}
                        />
                    ) : items.length > 0 && (
                        <InfiniteResourceList
                            items={items}
                            onLoadMore={fetchNextPage}
                            hasMore={hasNextPage}
                            isLoading={isFetchingNextPage}
                            renderItem={(item: User) => <CustomerCard key={item.id} user={item} />}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
