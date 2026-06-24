import { createFileRoute } from "@tanstack/react-router";
import ChatsCard from "@/components/admin/chats/chats-card";
import { ConversationStatusSchema, type Chat, type PaginatedChats } from "@/schemas";
import { useQuery } from "@tanstack/react-query";
import z from "zod";
import { chatsQuery } from "@/queries/admin.queries";
import { api } from "@/utils/api";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";
import { PageLoader } from "@/components/generic/page-loader";
import { MessageCircle } from "lucide-react";
import EmptyState from "@/components/generic/empty";

export const Route = createFileRoute("/_adminLayout/admin/(admin)/chats")({
    validateSearch: z.object({
        status: ConversationStatusSchema.optional(),
    }),
    loaderDeps: ({ search }) => search,
    loader: async ({ context, deps }) => {
        context.queryClient.prefetchQuery(chatsQuery(deps));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch();
    const { data, isPending } = useQuery(chatsQuery(params));

    const { items, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteResource<PaginatedChats, Chat>({
        queryKey: ["chats", "infinite", params],
        queryFn: (cursor) => api.get<PaginatedChats>("/chat/", { params: { cursor, ...params } }),
        getItems: (page) => page.items,
        getNextCursor: (page) => page.next_cursor,
        initialData: data,
    });

    return (
        <div className="px-2.5 mt-2">
            <h3 className="text-xl font-medium">Chats view</h3>
            <p className="text-muted-foreground text-sm mb-4">Manage your chats.</p>
            {isPending ? (
                <PageLoader variant="list" />
            ) : items?.length == 0 ? (
                <EmptyState
                    title="No chat found"
                    description="You currently don't have escalated conversations"
                    icon={MessageCircle}
                />
            ) : (
                <InfiniteResourceList
                    items={items}
                    onLoadMore={fetchNextPage}
                    hasMore={hasNextPage}
                    isLoading={isFetchingNextPage}
                    renderItem={(item: Chat) => <ChatsCard key={item.id} chat={item} />}
                />
            )}
        </div>
    );
}
