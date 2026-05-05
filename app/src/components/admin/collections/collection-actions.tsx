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
        <div className="relative flex items-center gap-1.5">
            <SheetDrawer
                open={editState.isOpen}
                title="Edit Collection"
                trigger={
                    <Button size="icon" variant="warning">
                        <Pencil className="h-4 w-4" />
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
                    <Button size="icon" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                }
                onClose={deleteState.close}
                onConfirm={onConfirmDelete}
                title={`Delete ${collection.name}`}
                description="This action cannot be undone. This will permanently delete the collection and all its products."
                isLoading={deleteCollection.isPending}
            />
        </div>
    );
};

export { CollectionActions };
