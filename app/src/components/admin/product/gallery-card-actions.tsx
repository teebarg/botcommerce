import { Edit2 } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import { ProductSheetForm } from "./product-form-sheet";
import { Button } from "@/components/ui/button";
import type { GalleryImageItem } from "@/schemas";
import Overlay from "@/components/overlay";
import { useDeleteGalleryImage } from "@/hooks/useGallery";

interface GalleryCardActionProps {
    image: GalleryImageItem;
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
                title="Create Metadata"
                trigger={
                    <Button className="bg-white/90 text-black hover:bg-white p-2" size="icon" onClick={editState.open}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <ProductSheetForm currentProduct={image.product} imageId={image.id} onClose={editState.close} />
            </Overlay>
        </div>
    );
}
