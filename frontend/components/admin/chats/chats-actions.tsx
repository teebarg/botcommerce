"use client";

import React from "react";
import { Eye, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import ConversationViewer from "./chat-view";

import { useDeleteConversation } from "@/lib/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/types/models";
import Overlay from "@/components/overlay";

interface CustomerActionsProps {
    conversation: Conversation;
}

const ChatsActions: React.FC<CustomerActionsProps> = ({ conversation }) => {
    const { mutate, isPending } = useDeleteConversation();
    const state = useOverlayTriggerState({});

    const onDelete = () => {
        mutate(conversation.id);
    };

    return (
        <div className="flex">
            <Overlay
                open={state.isOpen}
                sheetClassName="min-w-[450px]"
                title="Conversation"
                trigger={
                    <Button size="icon" variant="ghost">
                        <Eye className="h-5 w-5" />
                    </Button>
                }
                onOpenChange={state.setOpen}
            >
                <ConversationViewer conversation={conversation} onClose={state.close} />
            </Overlay>

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
                <Trash2 className="h-5 w-5 text-red-500" />
            </Button>
        </div>
    );
};

export default ChatsActions;
