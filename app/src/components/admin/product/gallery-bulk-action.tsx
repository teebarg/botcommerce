import { Trash2, Edit3, X, Boxes } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import { BulkImageSheetForm } from "./bulk-image-form-sheet";
import { CatalogBulkProductUpdate } from "./bulk-product-catalog-update";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";

interface ProductBulkActionsProps {
    selectedCount: number;
    selectedImageIds: number[];
    selectedProductIds?: number[];
    onDelete?: () => void;
    onClearSelection: () => void;
    isLoading?: boolean;
}

export const ProductBulkActions = ({
    selectedCount,
    selectedImageIds,
    selectedProductIds = [],
    onDelete,
    onClearSelection,
    isLoading,
}: ProductBulkActionsProps) => {
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});
    const addToSharedState = useOverlayTriggerState({});

    if (selectedCount === 0) return null;

    return (
        <div
            className="z-50 animate-slide-up fixed left-1/2 -translate-x-1/2 bg-card border border-border rounded-full px-4 py-2.5 flex items-center gap-1.5 shadow-md"
            style={{ bottom: `calc(var(--sab) + 1rem)` }}
        >
            <span className="text-xs text-muted-foreground px-2 mr-1 whitespace-nowrap">
                {selectedCount} selected
            </span>

            <div className="w-px h-4 bg-border" />

            <Overlay
                open={editState.isOpen}
                title="Bulk Products Update"
                trigger={
                    <Button size="sm" variant="ghost" onClick={editState.open}>
                        <Edit3 className="h-4 w-4 sm:mr-1.5" />
                        <span className="hidden sm:inline text-xs">Edit</span>
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                {editState.isOpen && (
                    <BulkImageSheetForm imageIds={selectedImageIds} onClose={editState.close} />
                )}
            </Overlay>

            <Overlay
                open={addToSharedState.isOpen}
                title="Update Catalog"
                trigger={
                    <Button size="sm" variant="ghost" disabled={isLoading} onClick={addToSharedState.open}>
                        <Boxes className="h-4 w-4 sm:mr-1.5" />
                        <span className="hidden sm:inline text-xs">Catalog</span>
                    </Button>
                }
                onOpenChange={addToSharedState.setOpen}
            >
                {addToSharedState.isOpen && (
                    <CatalogBulkProductUpdate
                        selectedCount={selectedCount}
                        selectedImageIds={selectedImageIds}
                        selectedProductIds={selectedProductIds}
                        onClose={addToSharedState.close}
                    />
                )}
            </Overlay>

            <ConfirmDrawer
                open={deleteState.isOpen}
                onOpenChange={deleteState.setOpen}
                trigger={
                    <Button
                        className="text-destructive hover:bg-destructive/10"
                        size="sm"
                        variant="ghost"
                        disabled={isLoading}
                    >
                        <Trash2 className="h-4 w-4 sm:mr-1.5" />
                        <span className="hidden sm:inline text-xs">Delete</span>
                    </Button>
                }
                onClose={deleteState.close}
                onConfirm={onDelete}
                title="Delete Products"
                description="Are you sure you want to delete these products?"
                isLoading={isLoading}
            />

            <div className="w-px h-4 bg-border" />

            <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
                disabled={isLoading}
                onClick={onClearSelection}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
};
