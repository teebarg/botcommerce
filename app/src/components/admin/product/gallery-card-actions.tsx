import { Edit2 } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import { ProductSheetForm } from "./product-form-sheet";
import { Button } from "@/components/ui/button";
import type { ProductImage } from "@/schemas";
import Overlay from "@/components/overlay";

interface GalleryCardActionProps {
    image: ProductImage;
}

export function GalleryCardActions({ image }: GalleryCardActionProps) {
    const editState = useOverlayTriggerState({});

    return (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Overlay
                open={editState.isOpen}
                title="Update Metadata"
                trigger={
                    <Button className="bg-white/90 text-black hover:bg-white p-2" size="icon">
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
