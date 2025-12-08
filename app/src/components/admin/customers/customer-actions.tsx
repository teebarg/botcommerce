import type React from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import { toast } from "sonner";

import CustomerForm from "./customer-form";

import type { User } from "@/schemas";
import { useDeleteUser, useInvalidateMe } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";
import { Confirm } from "@/components/generic/confirm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useInvalidateCart } from "@/hooks/useCart";
import { updateAuthSession } from "@/utils/auth-client";
import { useRouteContext, useRouter } from "@tanstack/react-router";

interface CustomerActionsProps {
    user: User;
}

const CustomerActions: React.FC<CustomerActionsProps> = ({ user }) => {
    const { session } = useRouteContext({
        strict: false,
    });
    const { mutateAsync } = useDeleteUser();
    const router = useRouter();
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});
    const invalidateMe = useInvalidateMe();
    const invalidateCart = useInvalidateCart();

    const onDelete = () => {
        mutateAsync(user.id).then(() => {
            deleteState.close();
        });
    };

    const handleImpersonate = async () => {
        try {
            await updateAuthSession({
                email: user?.email!,
                mode: "impersonate",
                impersonated: true,
                impersonatedBy: session?.user?.email,
            });
            invalidateMe();
            invalidateCart();

            toast.success("Impersonated");
            await router.invalidate();
            await router.navigate({ to: "/" });
        } catch (err) {
            console.error("Impersonation failed", err);
        }
    };

    return (
        <div className="flex">
            {user.role !== "ADMIN" && (
                <Button size="icon" title="Impersonate" variant="ghost" onClick={handleImpersonate}>
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
