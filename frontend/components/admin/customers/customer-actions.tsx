"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import CustomerForm from "./customer-form";

import { User } from "@/types/models";
import { useDeleteCustomer } from "@/lib/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import DrawerUI from "@/components/drawer";

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
                <DrawerUI open={editState.isOpen} title="Edit Customer" trigger={<Edit className="h-5 w-5" />} onOpenChange={editState.setOpen}>
                    <CustomerForm user={user} onClose={editState.close} />
                </DrawerUI>
                <Button
                    disabled={isPending}
                    isLoading={isPending}
                    size="icon"
                    variant="ghost"
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
