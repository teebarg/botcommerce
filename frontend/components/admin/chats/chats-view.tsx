"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import CustomerFilter from "./chats-filter";
import ChatsActions from "./chats-actions";
import ChatsCard from "./chats-card";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Conversation, ConversationStatus } from "@/types/models";
import { useConversations } from "@/lib/hooks/useApi";
import PaginationUI from "@/components/pagination";
import { formatDate } from "@/lib/util/util";

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

    const { conversations, ...pagination } = data ?? { page: 0, limit: 0, total_pages: 0, total_count: 0 };

    const getStatusBadge = (status?: ConversationStatus) => {
        const variants: Record<ConversationStatus, "default" | "destructive" | "success" | "warning"> = {
            ["ABANDONED"]: "destructive",
            ["ACTIVE"]: "success",
            ["COMPLETED"]: "warning",
        };

        return <Badge variant={variants[status ?? "ABANDONED"]}>{status}</Badge>;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Conversations view</CardTitle>
                <CardDescription>Manage your conversations.</CardDescription>
            </CardHeader>
            <CardContent>
                <AnimatePresence>
                    <div key="table" className="md:block hidden">
                        <CustomerFilter open={filterOpen} onOpenChange={setFilterOpen} />
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>S/N</TableHead>
                                    <TableHead>Conversation UUID</TableHead>
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
                                        <TableCell className="text-center" colSpan={6}>
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : conversations?.length === 0 ? (
                                    <TableRow key="no-orders">
                                        <TableCell className="text-center" colSpan={6}>
                                            No conversations found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    conversations?.map((conversation: Conversation, idx: number) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">{idx + 1}</TableCell>
                                            <TableCell>{conversation.conversation_uuid}</TableCell>
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
                                <div className="relative mb-2 py-4 flex justify-end">
                                    <button className="flex items-center bg-content1 rounded-md p-4" onClick={() => setFilterOpen(true)}>
                                        <SlidersHorizontal className="text-default-500" size={18} />
                                    </button>
                                </div>
                                <div>
                                    {conversations?.map((conversation: Conversation, idx: number) => (
                                        <ChatsCard key={idx} actions={<ChatsActions conversation={conversation} />} conversation={conversation} />
                                    ))}
                                </div>

                                {conversations?.length === 0 && (
                                    <div className="text-center py-10">
                                        <p className="text-default-500">No users found</p>
                                    </div>
                                )}
                            </div>

                            <CustomerFilter open={filterOpen} onOpenChange={setFilterOpen} />
                        </div>
                    </div>
                    {pagination?.total_pages > 1 && <PaginationUI key="pagination" pagination={pagination} />}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};

export default ChatsView;
