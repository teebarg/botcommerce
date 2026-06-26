import type React from "react";
import { useOverlayTriggerState } from "react-stately";
import { Edit, Trash2, Eye } from "lucide-react";
import { CatalogForm } from "./catalog-form";
import { Button } from "@/components/ui/button";
import { useDeleteCatalog } from "@/hooks/useCollection";
import type { DBCatalog } from "@/schemas/product";
import { useNavigate } from "@tanstack/react-router";
import SheetDrawer from "@/components/sheet-drawer";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";

interface Props {
    item: DBCatalog;
}

const CatalogActions: React.FC<Props> = ({ item }) => {
    const deleteState = useOverlayTriggerState({});
    const editState = useOverlayTriggerState({});
    const navigate = useNavigate();
    const deleteMutation = useDeleteCatalog();

    const onConfirmDelete = async () => {
        deleteMutation.mutateAsync(item.id).then(() => deleteState.close());
    };

    return (
        <div className="flex items-center gap-1">
            <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                onClick={() => navigate({ to: `/catalog/${item.slug}` })}
            >
                <Eye className="h-4 w-4" />
            </Button>
            <SheetDrawer
                open={editState.isOpen}
                title="Edit catalog"
                trigger={
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                        onClick={editState.open}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <CatalogForm current={item} onClose={editState.close} />
            </SheetDrawer>
            <ConfirmDrawer
                open={deleteState.isOpen}
                onOpenChange={deleteState.setOpen}
                trigger={
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                }
                onClose={deleteState.close}
                onConfirm={onConfirmDelete}
                title={`Delete ${item.title}`}
                description="This action cannot be undone. This will permanently delete the catalog."
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
};

export { CatalogActions };