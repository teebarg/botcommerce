"use client";

import { Edit2, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { ProductSheetForm } from "./product-form-sheet";

import { Button } from "@/components/ui/button";
import { Product, ProductImage } from "@/schemas";
import Overlay from "@/components/overlay";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Confirm } from "@/components/generic/confirm";
import { useDeleteGalleryImage } from "@/lib/hooks/useProduct";

type GalleryImage = ProductImage & {
    product: Product;
};

interface GalleryCardActionProps {
    image: GalleryImage;
}

export function GalleryCardActions({ image }: GalleryCardActionProps) {
    const { mutateAsync: deleteImage } = useDeleteGalleryImage();
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});

    const handleDelete = async () => {
        deleteImage({ id: image.id }).finally(() => {
            deleteState.close();
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Overlay
                open={editState.isOpen}
                sheetClassName="min-w-[40vw]"
                title="Create Metadata"
                trigger={
                    <Button className="bg-white/90 text-black hover:bg-white" size="sm" onClick={editState.open}>
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <ProductSheetForm currentProduct={image.product} imageId={image.id} onClose={editState.close} />
            </Overlay>
            <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                <DialogTrigger asChild>
                    <Button className="p-2 text-red-600 bg-red-50 hover:bg-red-100" size="icon">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader className="sr-only">
                        <DialogTitle>Delete</DialogTitle>
                    </DialogHeader>
                    <Confirm onClose={deleteState.close} onConfirm={handleDelete} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
