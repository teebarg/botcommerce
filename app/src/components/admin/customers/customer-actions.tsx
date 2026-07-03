import type { User } from "@/schemas";
import { Edit, Eye, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import { toast } from "sonner";
import CustomerEditForm from "./customer-form";
import { useDeleteUser, useImpersonateUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import SheetDrawer from "@/components/sheet-drawer";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";

interface CustomerActionsProps {
    user: User;
}

const CustomerActions = ({ user }: CustomerActionsProps) => {
    const { mutateAsync, isPending } = useDeleteUser();
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});
    const impersonateUser = useImpersonateUser();

    const onDelete = () => {
        mutateAsync(user.id).then(() => {
            deleteState.close();
        });
    };

    const handleImpersonate = async () => {
        try {
            await impersonateUser.mutateAsync(user.id);
            toast.loading("Impersonating.........");
            window.location.reload();
        } catch (err) {}
    };

    return (
        <div className="flex justify-end gap-1.5">
            {user.role !== "ADMIN" && (
                <Button size="icon" variant="outline" onClick={handleImpersonate}>
                    <Eye className="h-4 w-4" />
                </Button>
            )}
            <SheetDrawer
                open={editState.isOpen}
                title="Edit Customer"
                trigger={
                    <Button size="icon" variant="outline">
                        <Edit className="h-4 w-4" />
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <CustomerEditForm user={user} onClose={editState.close} />
            </SheetDrawer>
            <ConfirmDrawer
                open={deleteState.isOpen}
                onOpenChange={deleteState.setOpen}
                trigger={
                    <Button className="border-destructive/30" size="icon" variant="outline">
                        <Trash2 className="text-destructive/70 h-4 w-4" />
                    </Button>
                }
                onClose={deleteState.close}
                onConfirm={onDelete}
                title={`Delete ${user?.first_name}`}
                description="This action cannot be undone. This will permanently delete the customer."
                isLoading={isPending}
            />
        </div>
    );
};

export default CustomerActions;
