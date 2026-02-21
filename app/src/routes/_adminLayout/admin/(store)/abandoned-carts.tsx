import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AbandonedCartCard } from "@/components/admin/abandoned-carts/card";
import type { Cart, PaginatedAbandonedCarts } from "@/schemas";
import { useSendCartReminders } from "@/hooks/useAbandonedCart";
import { AbandonedCartStats } from "@/components/admin/abandoned-carts/stat";
import { useSuspenseQuery } from "@tanstack/react-query";
import { abandonedCartsQuery, abandonedCartStatsQuery } from "@/queries/admin.queries";
import { clientApi } from "@/utils/api.client";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";
import { z } from "zod";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";

export const Route = createFileRoute("/_adminLayout/admin/(store)/abandoned-carts")({
    validateSearch: z.object({
        search: z.string().optional(),
        time: z.string().optional(),
    }),
    loaderDeps: ({ search }) => (search),
    loader: async ({ deps, context: { queryClient } }) => {
        await Promise.all([
            queryClient.ensureQueryData(abandonedCartStatsQuery(deps.time || "24")),
            queryClient.ensureQueryData(abandonedCartsQuery({ hours_threshold: deps.time || "24" })),
        ]);
    },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch()
    const [timeFilter, setTimeFilter] = useState<string>("24");
    const { data: stats } = useSuspenseQuery(abandonedCartStatsQuery(params.time || "24"));
    const { data } = useSuspenseQuery(abandonedCartsQuery({ hours_threshold: params.time }));
    const { updateQuery } = useUpdateQuery(200);
    const { mutate: sendReminders, isPending: sendRemindersLoading } = useSendCartReminders();

    const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteResource<PaginatedAbandonedCarts, Cart>({
        queryKey: ["abandoned-carts", "infinite"],
        queryFn: (cursor) => clientApi.get<PaginatedAbandonedCarts>("/cart/abandoned-carts", { params: { cursor, ...params } }),
        getItems: (page) => page.items,
        getNextCursor: (page) => page.next_cursor,
        initialData: data,
    });

    const handleSendReminders = () => {
        sendReminders({ hours_threshold: parseInt(timeFilter) });
    };

    return (
        <div className="bg-background">
            <div className="border-b bg-background sticky top-16 z-10">
                <div className="container mx-auto px-6 py-4">
                    <div className="mb-4">
                        <h1 className="text-3xl font-bold">Abandoned Carts</h1>
                        <p className="text-muted-foreground">Monitor and recover lost sales opportunities</p>
                    </div>

                    <div className="flex flex-col md:flex-row md:justify-between gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 z-10 text-muted-foreground" />
                            <Input
                                className="pl-10 bg-card"
                                placeholder="Search by customer name or email..."
                                value={params.search}
                                onChange={(e) => updateQuery([{ key: "search", value: e.target.value ?? "" }])}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={timeFilter} onValueChange={setTimeFilter}>
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
                            <Button disabled={sendRemindersLoading} isLoading={sendRemindersLoading} onClick={handleSendReminders}>
                                Send Reminders
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-6 py-8">
                {stats && <AbandonedCartStats stat={stats} />}

                <div className="mt-4 space-y-4">
                    {!isLoading && items.length > 0 && (
                        <InfiniteResourceList
                            items={items}
                            onLoadMore={fetchNextPage}
                            hasMore={hasNextPage}
                            isLoading={isFetchingNextPage}
                            renderItem={(item: Cart) => <AbandonedCartCard key={item.id} cart={item} />}
                        />
                    )}
                    {!isLoading && items?.length === 0 && (
                        <div className="text-center py-12 bg-secondary">
                            <p className="text-muted-foreground">No abandoned carts found, adjust the time range or search query</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
