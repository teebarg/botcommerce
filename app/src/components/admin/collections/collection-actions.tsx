import type React from "react";
import { useOverlayTriggerState } from "react-stately";
import { Pencil, Trash2 } from "lucide-react";
import { CollectionForm } from "@/components/admin/collections/collection-form";
import type { Collection } from "@/schemas/product";
import { Button } from "@/components/ui/button";
import { useDeleteCollection } from "@/hooks/useCollection";
import SheetDrawer from "@/components/sheet-drawer";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";

interface Props {
    collection: Collection;
}

const CollectionActions: React.FC<Props> = ({ collection }) => {
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});
    const deleteCollection = useDeleteCollection();

    const onConfirmDelete = async () => {
        deleteCollection.mutateAsync(collection.id).then(() => {
            deleteState.close();
        });
    };

    return (
        <div className="relative flex items-center">
            <SheetDrawer
                open={editState.isOpen}
                title="Edit Collection"
                trigger={
                    <Button size="icon" variant="ghost">
                        <Pencil className="h-5 w-5" />
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <CollectionForm collection={collection} type="update" onClose={editState.close} />
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
                onConfirm={onConfirmDelete}
                title={`Delete ${collection.name}`}
                confirmText="Delete"
                isLoading={deleteCollection.isPending}
            />
        </div>
    );
};

export { CollectionActions };
