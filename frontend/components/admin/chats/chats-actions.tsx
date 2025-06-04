"use client";

import React from "react";
import { Eye, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import ConversationViewer from "./chat-view";

import { useDeleteConversation } from "@/lib/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/types/models";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface CustomerActionsProps {
    conversation: Conversation;
}

const ChatsActions: React.FC<CustomerActionsProps> = ({ conversation }) => {
    const { mutate, isPending } = useDeleteConversation();
    const { isDesktop } = useMediaQuery();
    const state = useOverlayTriggerState({});

    const onDelete = () => {
        mutate(conversation.id);
    };

    return (
        <div className="flex gap-1">
            {/* <Link className="flex items-center" href={`/admin/chats/${conversation.conversation_uuid}`}>
                <Eye className="h-5 w-5 text-default-500" />
            </Link> */}
            {isDesktop ? (
                <>
                    <Sheet open={state.isOpen} onOpenChange={state.setOpen}>
                        <SheetTrigger>
                            <Eye className="h-5 w-5 text-default-500" />
                        </SheetTrigger>
                        <SheetContent className="min-w-[450px] w-auto">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Conversation</SheetTitle>
                            </SheetHeader>
                            <ConversationViewer conversation={conversation} onClose={state.close} />
                        </SheetContent>
                    </Sheet>
                </>
            ) : (
                <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
                    <DrawerTrigger>
                        <Eye className="h-5 w-5 text-default-500" />
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader className="text-left sr-only">
                            <DrawerTitle>Conversation</DrawerTitle>
                        </DrawerHeader>
                        <ConversationViewer conversation={conversation} onClose={state.close} />
                        {/* <DrawerFooter className="pt-2">
                            <DrawerClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter> */}
                    </DrawerContent>
                </Drawer>
            )}

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
                <Trash2 className="h-5 w-5 text-danger" />
            </Button>
        </div>
    );
};

export default ChatsActions;
