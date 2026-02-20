import { createFileRoute } from "@tanstack/react-router";
import ChatsCard from "@/components/admin/chats/chats-card";
import { ConversationStatusSchema, type Chat, type PaginatedChats } from "@/schemas";
import { useSuspenseQuery } from "@tanstack/react-query";
import z from "zod";
import { chatsQuery } from "@/queries/admin.queries";
import { clientApi } from "@/utils/api.client";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";

export const Route = createFileRoute("/_adminLayout/admin/(admin)/chats")({
    validateSearch: z.object({
        status: ConversationStatusSchema.optional(),
    }),
    loaderDeps: ({ search }) => search,
    loader: async ({ context, deps }) => {
        await context.queryClient.ensureQueryData(chatsQuery(deps));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch();
    const { data } = useSuspenseQuery(chatsQuery(params));

    const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteResource<PaginatedChats, Chat>({
        queryKey: ["chats", "infinite", params],
        queryFn: (cursor) => clientApi.get<PaginatedChats>("/chat/", { params: { cursor, ...params } }),
        getItems: (page) => page.items,
        getNextCursor: (page) => page.next_cursor,
        initialData: data,
    });

    return (
        <div className="px-2 md:px-10 py-8">
            <h3 className="text-2xl font-medium">Chats view</h3>
            <p className="text-muted-foreground text-sm mb-4">Manage your chats.</p>
            {!isLoading && items.length > 0 && (
                <InfiniteResourceList
                    items={items}
                    onLoadMore={fetchNextPage}
                    hasMore={hasNextPage}
                    isLoading={isFetchingNextPage}
                    renderItem={(item: Chat) => <ChatsCard key={item.id} chat={item} />}
                />
            )}
            {!isLoading && items?.length === 0 && (
                <div className="text-center py-10 bg-card">
                    <p className="text-muted-foreground">No chat found</p>
                </div>
            )}
        </div>
    );
}
