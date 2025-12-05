import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";

import CustomerFilter from "@/components/admin/chats/chats-filter";
import ChatsActions from "@/components/admin/chats/chats-actions";
import ChatsCard from "@/components/admin/chats/chats-card";

import { Chat, ConversationStatus } from "@/schemas";
import { useChats } from "@/hooks/useApi";
import ComponentLoader from "@/components/component-loader";
import PaginationUI from "@/components/pagination";

const LIMIT = 20;

export const Route = createFileRoute("/admin/(admin)/chats")({
    component: RouteComponent,
});

function RouteComponent() {
    const [filterOpen, setFilterOpen] = useState<boolean>(false);

    const searchParams: any = null;

    const page = Number(searchParams.get("page")) || 1;
    const status: ConversationStatus = searchParams.get("status") as ConversationStatus;

    const filters = {
        status,
    };

    const { data, isLoading } = useChats({
        skip: (page - 1) * LIMIT,
        limit: LIMIT,
        ...filters,
    });

    const { chats, ...pagination } = data ?? { skip: 0, limit: 0, total_pages: 0, total_count: 0 };

    return (
        <div className="px-2 md:px-10 py-8">
            <h3 className="text-2xl font-medium">Chats view</h3>
            <p className="text-muted-foreground text-sm mb-4">Manage your chats.</p>
            <div className="">
                <div className="pb-4">
                    <div>
                        <div>
                            {isLoading ? (
                                <ComponentLoader className="h-[calc(100vh-200px)]" />
                            ) : (
                                chats?.map((chat: Chat, idx: number) => <ChatsCard key={idx} actions={<ChatsActions chat={chat} />} chat={chat} />)
                            )}
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
