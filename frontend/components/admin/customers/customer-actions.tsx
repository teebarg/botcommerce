"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import CustomerForm from "./customer-form";

import { User } from "@/schemas";
import { useDeleteUser } from "@/lib/hooks/useUser";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";

interface CustomerActionsProps {
    user: User;
}

const CustomerActions: React.FC<CustomerActionsProps> = ({ user }) => {
    const { mutate, isPending } = useDeleteUser();
    const editState = useOverlayTriggerState({});

    const onDelete = (id: number) => {
        mutate(id);
    };

    return (
        <div>
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
                <Button
                    disabled={isPending}
                    isLoading={isPending}
                    size="iconOnly"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(user.id);
                    }}
                >
                    <Trash2 className="h-5 w-5 text-danger" />
                </Button>
            </div>
        </div>
    );
};

export default CustomerActions;
