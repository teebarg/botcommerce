import { Trash2, Edit3, X, Boxes } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";

import { BulkProductSheetForm } from "./bulk-product-form-sheet";
import { CatalogBulkProductUpdate } from "./bulk-product-catalog-update";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Overlay from "@/components/overlay";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Confirm } from "@/components/generic/confirm";

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
        <div className="animate-slide-up fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-full px-6 py-3 flex items-center gap-2 transition-all duration-300 max-w-90vw w-auto">
            <Badge className="mr-2 text-sm whitespace-nowrap" variant="indigo">
                {selectedCount} selected
            </Badge>

            <div className="flex items-center gap-1 sm:gap-2">
                <Overlay
                    open={editState.isOpen}
                    sheetClassName="min-w-[40vw]"
                    title="Create Metadata"
                    trigger={
                        <Button className="h-8 px-2 sm:px-3" size="sm" variant="ghost" onClick={editState.open}>
                            <Edit3 className="h-5 w-5 sm:mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                        </Button>
                    }
                    onOpenChange={editState.setOpen}
                >
                    <BulkProductSheetForm imageIds={selectedImageIds} onClose={editState.close} />
                </Overlay>

                <Overlay
                    open={addToSharedState.isOpen}
                    sheetClassName="min-w-[40vw]"
                    title="Add to Shared Collection"
                    trigger={
                        <Button className="h-8 px-2 sm:px-3" disabled={isLoading} size="sm" variant="ghost" onClick={addToSharedState.open}>
                            <Boxes className="h-5 w-5 sm:mr-1" />
                            <span className="hidden sm:inline">Catalog</span>
                        </Button>
                    }
                    onOpenChange={addToSharedState.setOpen}
                >
                    <CatalogBulkProductUpdate
                        selectedCount={selectedCount}
                        selectedImageIds={selectedImageIds}
                        selectedProductIds={selectedProductIds}
                    />
                </Overlay>

                <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="h-8 px-2 sm:px-3 text-destructive hover:text-destructive-foreground"
                            disabled={isLoading}
                            size="sm"
                            variant="ghost"
                        >
                            <Trash2 className="h-5 w-5 sm:mr-1" />
                            <span className="hidden sm:inline">Delete</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader className="sr-only">
                            <DialogTitle>Delete</DialogTitle>
                        </DialogHeader>
                        <Confirm onClose={deleteState.close} onConfirm={onDelete} />
                    </DialogContent>
                </Dialog>

                <div className="w-px h-4 bg-border mx-1" />

                <Button disabled={isLoading} size="icon" variant="destructive" onClick={onClearSelection}>
                    <X className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};
