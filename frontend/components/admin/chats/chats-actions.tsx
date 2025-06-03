"use client";

import React from "react";
import { Eye, Trash2 } from "lucide-react";
import Link from "next/link";

import { useDeleteConversation } from "@/lib/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/types/models";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import ConversationViewer from "./chat-view";
import { useOverlayTriggerState } from "@react-stately/overlays";

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
                <Dialog open={state.isOpen} onOpenChange={state.setOpen}>
                    <DialogTrigger>
                        <Eye className="h-5 w-5 text-default-500" />
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit profile</DialogTitle>
                            <DialogDescription>Make changes to your profile here. Click save when you&apos;re done.</DialogDescription>
                        </DialogHeader>
                        <ConversationViewer conversation={conversation} />
                    </DialogContent>
                </Dialog>
            ) : (
                <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
                    <DrawerTrigger>
                        <Eye className="h-5 w-5 text-default-500" />
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader className="text-left sr-only">
                            <DrawerTitle>Edit profile</DrawerTitle>
                            <DrawerDescription>Make changes to your profile here. Click save when you&apos;re done.</DrawerDescription>
                        </DrawerHeader>
                        <ConversationViewer conversation={conversation} />
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
