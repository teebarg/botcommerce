"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import CustomerForm from "./customer-form";

import { User } from "@/types/models";
import { useDeleteCustomer } from "@/lib/hooks/useApi";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";

interface CustomerActionsProps {
    user: User;
}

const CustomerActions: React.FC<CustomerActionsProps> = ({ user }) => {
    const { mutate, isPending } = useDeleteCustomer();
    const editState = useOverlayTriggerState({});

    const onDelete = (id: number) => {
        mutate(id);
    };

    return (
        <div>
            <div className="flex gap-2">
                <Overlay
                    trigger={
                        <Button size="iconOnly">
                            <Edit className="h-5 w-5" />
                        </Button>
                    }
                    open={editState.isOpen}
                    onOpenChange={editState.setOpen}
                    title="Edit Customer"
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
