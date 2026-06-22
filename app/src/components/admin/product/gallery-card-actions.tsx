import { Edit2 } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import { ImageSheetForm } from "./image-form-sheet";
import { Button } from "@/components/ui/button";
import type { ProductImage } from "@/schemas";
import Overlay from "@/components/overlay";
import { GalleryCampaign } from "./gallery-campaign";

interface GalleryCardActionProps {
    image: ProductImage;
}

export function GalleryCardActions({ image }: GalleryCardActionProps) {
    const editState = useOverlayTriggerState({});

    return (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Overlay
                open={editState.isOpen}
                title="Update Metadata"
                trigger={
                    <Button className="w-8 h-8 bg-white/90 hover:bg-white text-black rounded-full shadow-sm" size="icon">
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <ImageSheetForm currentProduct={image.product} imageId={image.id} onClose={editState.close} />
            </Overlay>
            <GalleryCampaign image={image.image} />
        </div>
    );
}