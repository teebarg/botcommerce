"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";

import CustomerFilter from "./chats-filter";
import ChatsActions from "./chats-actions";
import ChatsCard from "./chats-card";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Conversation, ConversationStatus } from "@/schemas";
import { useConversations } from "@/lib/hooks/useApi";
import { formatDate } from "@/lib/utils";
import ComponentLoader from "@/components/component-loader";
import PaginationUI from "@/components/pagination";

const LIMIT = 10;

const ChatsView: React.FC = () => {
    const [filterOpen, setFilterOpen] = useState<boolean>(false);

    const searchParams = useSearchParams();

    const page = Number(searchParams.get("page")) || 1;
    const status: ConversationStatus = searchParams.get("status") as ConversationStatus;

    const filters = {
        status,
    };

    const { data, isLoading } = useConversations({
        skip: (page - 1) * LIMIT,
        limit: LIMIT,
        ...filters,
    });

    const { conversations, ...pagination } = data ?? { skip: 0, limit: 0, total_pages: 0, total_count: 0 };

    const getStatusBadge = (status?: ConversationStatus) => {
        const variants: Record<ConversationStatus, "destructive" | "emerald" | "warning"> = {
            ["ABANDONED"]: "destructive",
            ["ACTIVE"]: "emerald",
            ["COMPLETED"]: "warning",
        };

        return <Badge variant={variants[status ?? "ABANDONED"]}>{status}</Badge>;
    };

    return (
        <div className="px-2 md:px-10 py-8">
            <h3 className="text-2xl font-medium">Conversations view</h3>
            <p className="text-default-500 text-sm mb-4">Manage your conversations.</p>
            <div key="table" className="md:block hidden">
                <CustomerFilter open={filterOpen} onOpenChange={setFilterOpen} />
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>S/N</TableHead>
                            <TableHead>Conversation UUID</TableHead>
                            <TableHead>No of Messages</TableHead>
                            <TableHead>User ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Started At</TableHead>
                            <TableHead>Last Active</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow key="loading">
                                <TableCell className="text-center" colSpan={8}>
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : conversations?.length === 0 ? (
                            <TableRow key="no-orders">
                                <TableCell className="text-center" colSpan={8}>
                                    No conversations found
                                </TableCell>
                            </TableRow>
                        ) : (
                            conversations?.map((conversation: Conversation, idx: number) => (
                                <TableRow key={idx} className="even:bg-content1">
                                    <TableCell className="font-medium">{idx + 1}</TableCell>
                                    <TableCell>{conversation.conversation_uuid}</TableCell>
                                    <TableCell>{conversation.messages?.length}</TableCell>
                                    <TableCell>{conversation.user_id}</TableCell>
                                    <TableCell>{getStatusBadge(conversation.status)}</TableCell>
                                    <TableCell>{formatDate(conversation.started_at)}</TableCell>
                                    <TableCell>{formatDate(conversation.last_active)}</TableCell>
                                    <TableCell>
                                        <ChatsActions conversation={conversation} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div key="mobile" className="md:hidden">
                <div className="pb-4">
                    <div>
                        {/* <div className="relative mb-2 py-4 flex justify-end">
                                <button className="flex items-center bg-content1 rounded-md p-4" onClick={() => setFilterOpen(true)}>
                                    <SlidersHorizontal className="text-default-500" size={18} />
                                </button>
                            </div> */}
                        <div>
                            {isLoading ? (
                                <ComponentLoader className="h-[calc(100vh-200px)]" />
                            ) : (
                                conversations?.map((conversation: Conversation, idx: number) => (
                                    <ChatsCard key={idx} actions={<ChatsActions conversation={conversation} />} conversation={conversation} />
                                ))
                            )}
                        </div>

                        {conversations?.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-default-500">No conversation found</p>
                            </div>
                        )}
                    </div>

                    <CustomerFilter open={filterOpen} onOpenChange={setFilterOpen} />
                </div>
            </div>
            {pagination?.total_pages > 1 && <PaginationUI key="pagination" pagination={pagination} />}
        </div>
    );
};

export default ChatsView;
