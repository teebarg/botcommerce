import type React from "react";
import { Eye, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";

import ChatViewer from "./chat-view";

import { useDeleteChat } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import type { Chat } from "@/schemas";
import Overlay from "@/components/overlay";

interface CustomerActionsProps {
    chat: Chat;
}

const ChatsActions: React.FC<CustomerActionsProps> = ({ chat }) => {
    const { mutate, isPending } = useDeleteChat();
    const state = useOverlayTriggerState({});

    const onDelete = () => {
        mutate(chat.id);
    };

    return (
        <div className="flex gap-1.5 mt-2">
            <Overlay
                open={state.isOpen}
                sheetClassName="min-w-[450px]"
                title="Chat"
                trigger={
                    <Button className="bg-primary/10 hover:bg-primary/20" size="icon" variant="ghost">
                        <Eye className="h-5 w-5 text-primary" />
                    </Button>
                }
                onOpenChange={state.setOpen}
            >
                <ChatViewer chat={chat} onClose={state.close} />
            </Overlay>

            <Button
                className="bg-destructive/10 hover:bg-destructive/20"
                disabled={isPending}
                isLoading={isPending}
                size="icon"
                variant="ghost"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
            >
                <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
        </div>
    );
};

export default ChatsActions;
