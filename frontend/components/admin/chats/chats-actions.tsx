"use client";

import React from "react";
import { Eye, Trash2 } from "lucide-react";
import Link from "next/link";

import { useDeleteConversation } from "@/lib/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/types/models";

interface CustomerActionsProps {
    conversation: Conversation;
}

const ChatsActions: React.FC<CustomerActionsProps> = ({ conversation }) => {
    const { mutate, isPending } = useDeleteConversation();

    const onDelete = () => {
        mutate(conversation.id);
    };

    return (
        <div className="flex gap-1">
            <Link className="flex items-center" href={`/admin/chats/${conversation.conversation_uuid}`}>
                <Eye className="h-6 w-6 text-default-500" />
            </Link>
            <Button
                disabled={isPending}
                isLoading={isPending}
                size="icon"
                variant="ghost"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
            >
                <Trash2 className="h-6 w-6 text-danger" />
            </Button>
        </div>
    );
};

export default ChatsActions;
