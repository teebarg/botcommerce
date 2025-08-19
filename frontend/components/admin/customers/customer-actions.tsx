"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import CustomerForm from "./customer-form";

import { User } from "@/schemas";
import { useDeleteUser } from "@/lib/hooks/useUser";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";
import { Confirm } from "@/components/generic/confirm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CustomerActionsProps {
    user: User;
}

const CustomerActions: React.FC<CustomerActionsProps> = ({ user }) => {
    const { mutate } = useDeleteUser();
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});

    const onDelete = () => {
        mutate(user.id);
    };

    return (
        <div className="flex gap-2">
            <Overlay
                open={editState.isOpen}
                title="Edit Customer"
                trigger={
                    <Button size="iconOnly">
                        <Edit className="h-5 w-5" />
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <CustomerForm user={user} onClose={editState.close} />
            </Overlay>
            <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                <DialogTrigger>
                    <Trash2 className="text-red-500 h-5 w-5 cursor-pointer" />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader className="sr-only">
                        <DialogTitle>Delete {user?.first_name}</DialogTitle>
                    </DialogHeader>
                    <Confirm onClose={deleteState.close} onConfirm={onDelete} />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CustomerActions;
