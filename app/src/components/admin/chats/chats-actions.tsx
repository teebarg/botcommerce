import type React from "react";
import { Eye, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import ChatViewer from "./chat-view";
import { useDeleteChat } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import type { Chat } from "@/schemas";
import Overlay from "@/components/overlay";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";

interface CustomerActionsProps {
    chat: Chat;
}

const ChatsActions: React.FC<CustomerActionsProps> = ({ chat }) => {
    const { mutate, isPending } = useDeleteChat();
    const state = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});

    const onDelete = () => {
        mutate(chat.id);
    };

    return (
        <div className="flex gap-1.5 mt-2">
            <Overlay
                open={state.isOpen}
                title="Chat"
                trigger={
                    <Button className="bg-primary/10 hover:bg-primary/20" size="icon" variant="ghost">
                        <Eye className="h-5 w-5 text-primary" />
                    </Button>
                }
                onOpenChange={state.setOpen}
                showHeader={false}
            >
                <ChatViewer chat={chat} onClose={state.close} />
            </Overlay>
            <ConfirmDrawer
                open={deleteState.isOpen}
                onOpenChange={deleteState.setOpen}
                trigger={
                    <Button className="bg-destructive/10 hover:bg-destructive/20" size="icon" variant="ghost">
                        <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                }
                onClose={deleteState.close}
                onConfirm={onDelete}
                title="Delete"
                description="This action cannot be undone. This will permanently delete the chat."
                isLoading={isPending}
            />
        </div>
    );
};

export default ChatsActions;
