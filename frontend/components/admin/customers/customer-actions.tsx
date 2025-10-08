"use client";

import React from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import CustomerForm from "./customer-form";

import { User } from "@/schemas";
import { useDeleteUser, useInvalidateMe } from "@/lib/hooks/useUser";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";
import { Confirm } from "@/components/generic/confirm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useInvalidateCart } from "@/lib/hooks/useCart";

interface CustomerActionsProps {
    user: User;
}

const CustomerActions: React.FC<CustomerActionsProps> = ({ user }) => {
    const { mutateAsync } = useDeleteUser();
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});
    const { data: session, update } = useSession();
    const invalidateMe = useInvalidateMe();
    const invalidateCart = useInvalidateCart();

    const onDelete = () => {
        mutateAsync(user.id).then(() => {
            deleteState.close();
        });
    };

    const handleUpdateName = async () => {
        await update({ impersonatedBy: session?.user?.email!, email: user.email, impersonated: true, mode: "impersonate" });
        invalidateMe();
        invalidateCart();
        toast.success("Exited impersonation");
        window.location.reload();
    };

    return (
        <div className="flex">
            {user.role !== "ADMIN" && (
                <Button size="icon" variant="ghost" title="Impersonate" onClick={handleUpdateName}>
                    <Eye className="h-5 w-5" />
                </Button>
            )}
            <Overlay
                open={editState.isOpen}
                title="Edit Customer"
                trigger={
                    <Button size="icon" variant="ghost">
                        <Edit className="h-5 w-5" />
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <CustomerForm user={user} onClose={editState.close} />
            </Overlay>
            <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                <DialogTrigger asChild>
                    <Button size="icon" variant="ghost">
                        <Trash2 className="text-red-500 h-5 w-5 cursor-pointer" />
                    </Button>
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
