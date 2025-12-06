import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";

import CustomerFilter from "@/components/admin/chats/chats-filter";
import ChatsActions from "@/components/admin/chats/chats-actions";
import ChatsCard from "@/components/admin/chats/chats-card";

import { Chat, ConversationStatus } from "@/schemas";
import PaginationUI from "@/components/pagination";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getChatsFn } from "@/server/generic.server";
import z from "zod";

const LIMIT = 20;

interface ConversationParams {
    user_id?: number;
    status?: ConversationStatus;
    skip?: number;
    limit?: number;
}

const useChatsQuery = (searchParams: ConversationParams) =>
    queryOptions({
        queryKey: ["chats"],
        queryFn: () => getChatsFn({ data: searchParams }),
    });

export const Route = createFileRoute("/admin/(admin)/chats")({
    validateSearch: z.object({
        skip: z.number().optional(),
        status: z.enum(["ACTIVE", "COMPLETED", "ABANDONED"]).optional(),
    }),
    loaderDeps: ({ search: { skip, status } }) => ({ skip, status }),
    loader: async ({ context, deps: { skip, status } }) => {
        await context.queryClient.ensureQueryData(useChatsQuery({ skip, status, limit: LIMIT }));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const [filterOpen, setFilterOpen] = useState<boolean>(false);
    const search = Route.useSearch();
    const { data } = useSuspenseQuery(useChatsQuery({ ...search }));

    const { chats, ...pagination } = data ?? { skip: 0, limit: 0, total_pages: 0, total_count: 0 };

    return (
        <div className="px-2 md:px-10 py-8">
            <h3 className="text-2xl font-medium">Chats view</h3>
            <p className="text-muted-foreground text-sm mb-4">Manage your chats.</p>
            <div className="">
                <div className="pb-4">
                    <div>
                        <div>
                            {chats?.map((chat: Chat, idx: number) => (
                                <ChatsCard key={idx} actions={<ChatsActions chat={chat} />} chat={chat} />
                            ))}
                        </div>

                        {chats?.length === 0 && (
                            <div className="text-center py-10 bg-card">
                                <p className="text-muted-foreground">No chat found</p>
                            </div>
                        )}
                    </div>

                    <CustomerFilter open={filterOpen} onOpenChange={setFilterOpen} />
                </div>
            </div>
            {pagination?.total_pages > 1 && <PaginationUI key="pagination" pagination={pagination} />}
        </div>
    );
}
