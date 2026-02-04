import type React from "react";
import { useOverlayTriggerState } from "react-stately";
import { Edit, Trash2 } from "lucide-react";
import { Eye } from "lucide-react";
import { SharedForm } from "./shared-form";
import { Button } from "@/components/ui/button";
import { useDeleteCatalog } from "@/hooks/useCollection";
import type { DBCatalog } from "@/schemas/product";
import { useNavigate } from "@tanstack/react-router";
import SheetDrawer from "@/components/sheet-drawer";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";

interface Props {
    item: DBCatalog;
}

const SharedActions: React.FC<Props> = ({ item }) => {
    const deleteState = useOverlayTriggerState({});
    const editState = useOverlayTriggerState({});
    const navigate = useNavigate();
    const deleteMutation = useDeleteCatalog();

    const onConfirmDelete = async () => {
        deleteMutation.mutateAsync(item.id).then(() => {
            deleteState.close();
        });
    };

    return (
        <div className="relative flex items-center justify-end gap-2 mt-4">
            <Button className="bg-primary/10" size="icon" variant="ghost" onClick={() => navigate({ to: `/shared/${item.slug}` })}>
                <Eye className="h-5 w-5 text-primary" />
            </Button>
            <SheetDrawer
                open={editState.isOpen}
                title="Edit Shared Collection"
                trigger={
                    <Button className="bg-contrast/10" variant="ghost">
                        <Edit className="h-5 w-5 text-contrast" />
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <SharedForm current={item} onClose={editState.close} />
            </SheetDrawer>
            <ConfirmDrawer
                open={deleteState.isOpen}
                onOpenChange={deleteState.setOpen}
                trigger={
                    <Button variant="destructive">
                        <Trash2 className="h-5 w-5 mr-1" />
                        Delete
                    </Button>
                }
                onClose={deleteState.close}
                onConfirm={onConfirmDelete}
                title={`Delete ${item.title}`}
                confirmText="Delete"
                isLoading={deleteMutation.isPending}
                variant="destructive"
            />
        </div>
    );
};

export { SharedActions };
