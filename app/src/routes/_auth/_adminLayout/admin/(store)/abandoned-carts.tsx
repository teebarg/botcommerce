import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AbandonedCartCard } from "@/components/admin/abandoned-carts/card";
import { useAbandonedCarts, useSendCartReminders } from "@/hooks/useAbandonedCart";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";
import EmptyState from "@/components/generic/empty";
import { PageLoader } from "@/components/generic/page-loader";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { z } from "zod";
import { useDeferredValue, useMemo, useState } from "react";
import { AbandonedCart } from "@/schemas/abandoned-cart";

export const Route = createFileRoute("/_auth/_adminLayout/admin/(store)/abandoned-carts")({
    validateSearch: z.object({
        search: z.string().optional(),
        time: z.string().optional(),
    }),
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch();
    const { updateQuery } = useUpdateQuery(200);
    const { value: searchValue, onChange: onSearchChange } = useDebouncedSearch("search", params.search);

    // const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useInfiniteResource<PaginatedAbandonedCarts, Cart>({
    //     queryKey: ["abandoned-carts", "infinite", params],
    //     queryFn: (cursor) => api.get<PaginatedAbandonedCarts>("/cart/abandoned-carts", { params: { cursor, ...params } }),
    //     getItems: (page) => page.items,
    //     getNextCursor: (page) => page.next_cursor,
    // });

    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);
    const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } = useAbandonedCarts(deferredSearch);
    const { mutate: sendReminders, isPending: sendRemindersLoading } = useSendCartReminders();

    const carts = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
    const total = data?.pages[0]?.total ?? 0;

    return (
        <div className="bg-background">
            <div className="border-b bg-background sticky glass top-[calc(var(--sat)+var(--admin-nav-height))] z-10">
                <div className="max-w-5xl mx-auto px-2 py-4">
                    <div className="mb-4">
                        <h1 className="text-xl font-bold">Abandoned Carts</h1>
                        <p className="text-muted-foreground text-sm">Monitor and recover lost sales opportunities</p>
                        <p className="text-sm text-muted-foreground">
                            {total > 0
                                ? `${total} cart${total === 1 ? "" : "s"} left without checkout`
                                : "Carts that were left without completing checkout."}
                        </p>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 z-10 text-muted-foreground" />
                            <Input
                                className="pl-10 bg-card"
                                placeholder="Search by customer name or email..."
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-2">
                            <Select value={params.time || "24"} onValueChange={(value) => updateQuery([{ key: "time", value }])}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Time range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Last 1 hour</SelectItem>
                                    <SelectItem value="6">Last 6 hours</SelectItem>
                                    <SelectItem value="24">Last 24 hours</SelectItem>
                                    <SelectItem value="72">Last 3 days</SelectItem>
                                    <SelectItem value="168">Last 7 days</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                disabled={sendRemindersLoading}
                                isLoading={sendRemindersLoading}
                                onClick={() => sendReminders({ hours_threshold: 2 })}
                                className="w-full"
                            >
                                Send Reminders
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-5xl mx-auto px-2 py-2">
                <div className="mt-4 space-y-4">
                    {isPending ? (
                        <PageLoader variant="list" />
                    ) : carts.length > 0 ? (
                        <InfiniteResourceList
                            items={carts}
                            onLoadMore={fetchNextPage}
                            hasMore={hasNextPage}
                            isLoading={isFetchingNextPage}
                            renderItem={(item: AbandonedCart) => <AbandonedCartCard key={item.id} cart={item} />}
                        />
                    ) : (
                        <EmptyState title="No abandoned cart found" description="Please adjust the time range or search query" />
                    )}
                </div>
            </div>
        </div>
    );
}
