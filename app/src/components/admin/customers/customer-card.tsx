import { Card } from "@/components/ui/card";
import type { Status, User } from "@/schemas";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import { toast } from "sonner";
import CustomerForm from "./customer-form";
import { useDeleteUser, useInvalidateMe } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { useInvalidateCart } from "@/hooks/useCart";
import { updateAuthSession } from "@/utils/auth-client";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import SheetDrawer from "@/components/sheet-drawer";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";

interface CustomerCardProps {
    user: User;
}

const CustomerCard = ({ user }: CustomerCardProps) => {
    const fullName = `${user?.first_name} ${user?.last_name}`;
    const { session } = useRouteContext({
        strict: false,
    });
    const { mutateAsync, isPending } = useDeleteUser();
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

    const getStatusBadge = (status?: Status) => {
        const variants: Record<Status, "destructive" | "emerald" | "warning"> = {
            ["PENDING"]: "warning",
            ["ACTIVE"]: "emerald",
            ["INACTIVE"]: "destructive",
        };

        return <Badge variant={variants[status ?? "PENDING"]}>{status}</Badge>;
    };

    return (
        <Card className="mb-3 overflow-hidden hover:shadow-md transition-shadow bg-card p-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-medium text-lg">{fullName}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex">
                    {user.role !== "ADMIN" && (
                        <Button size="icon" title="Impersonate" variant="ghost" onClick={handleImpersonate}>
                            <Eye className="h-5 w-5" />
                        </Button>
                    )}
                    <SheetDrawer
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
                    </SheetDrawer>
                    <ConfirmDrawer
                        open={deleteState.isOpen}
                        onOpenChange={deleteState.setOpen}
                        trigger={
                            <Button size="icon" variant="ghost">
                                <Trash2 className="text-red-500 h-5 w-5 cursor-pointer" />
                            </Button>
                        }
                        onClose={deleteState.close}
                        onConfirm={onDelete}
                        title={`Delete ${user?.first_name}`}
                        description="This action cannot be undone. This will permanently delete the customer."
                        isLoading={isPending}
                    />
                </div>
            </div>
            <div className="flex gap-2 mt-4">
                {getStatusBadge(user.status as Status)}
                <Badge variant={user.role == "ADMIN" ? "contrast" : "default"}>{user.role}</Badge>
            </div>
        </Card>
    );
};

export default CustomerCard;
