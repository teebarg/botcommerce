import { Badge } from "@/components/ui/badge";
import { useDeleteCollection } from "@/hooks/useCollection";
import type { Collection } from "@/schemas/product";
import { useOverlayTriggerState } from "react-stately";
import { Edit3, Trash2 } from "lucide-react";
import { CollectionForm } from "@/components/admin/collections/collection-form";
import { Button } from "@/components/ui/button";
import SheetDrawer from "@/components/sheet-drawer";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";
import { timeAgo } from "@/utils";

interface CollectionItemProps {
    collection: Collection;
}

const CollectionItem = ({ collection }: CollectionItemProps) => {
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});
    const deleteCollection = useDeleteCollection();

    const onConfirmDelete = async () => {
        deleteCollection.mutateAsync(collection.id).then(() => {
            deleteState.close();
        });
    };

    return (
        <div className="rounded-2xl border overflow-hidden bg-card border-border">
            <div className="px-5 pt-5 pb-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="font-mono bg-muted px-2 py-1 rounded text-sm text-muted-foreground w-auto">/collections/{collection.slug}</p>
                    <Badge variant={collection.is_active ? "success-subtle" : "destructive"}>{collection.is_active ? "Active" : "Inactive"}</Badge>
                </div>
                <h3 className="text-sm font-medium mb-1.5">
                    {collection?.name}
                </h3>
            </div>

            <div className="flex items-center justify-between px-5 py-2 border-t border-border bg-muted/40">
                <div className="text-xs text-muted-foreground">
                    {timeAgo(collection?.created_at)}
                </div>
                <div className="flex items-center gap-1.5">
                    <SheetDrawer
                        open={editState.isOpen}
                        title="Edit address"
                        trigger={
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                                onClick={editState.open}
                            >
                                <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                        }
                        onOpenChange={editState.setOpen}
                        showHeader={true}
                    >
                        <CollectionForm collection={collection} type="update" onClose={editState.close} />
                    </SheetDrawer>
                    <ConfirmDrawer
                        open={deleteState.isOpen}
                        onOpenChange={deleteState.setOpen}
                        trigger={
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        }
                        onClose={deleteState.close}
                        onConfirm={onConfirmDelete}
                        title={`Delete ${collection.name}`}
                        description="This action cannot be undone. This will permanently delete the collection and all its products."
                        isLoading={deleteCollection.isPending}
                    />
                </div>
            </div>
        </div>
    );
};

export default CollectionItem;
