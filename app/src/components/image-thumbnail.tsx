import { useOverlayTriggerState } from "react-stately";
import { ConfirmDrawer } from "./generic/confirm-drawer";
import { cn } from "@/utils/cn";
import { GripVertical, X } from "lucide-react";
import { useState } from "react";

interface Image {
    id: number;
    image: string;
    order?: number;
}

export function GalleryThumbnail({
    image,
    images,
    index,
    isActive,
    productId,
    onSelect,
    onRemoveImage,
}: {
    image: Image;
    images: Image[];
    index: number;
    isActive: boolean;
    productId?: number;
    onSelect: () => void;
    onRemoveImage?: (id: number) => void;
}) {
    const [mediaLoaded, setMediaLoaded] = useState<boolean>(false);
    const state = useOverlayTriggerState({});
    const [draggedImageId, setDraggedImageId] = useState<number | null>(null);

    const handleReorderDrop = async (targetImageId: number) => {
        if (draggedImageId === null || draggedImageId === targetImageId || !productId) {
            setDraggedImageId(null);
            return;
        }

        const fromIdx = images.findIndex((img) => img.id === draggedImageId);
        const toIdx = images.findIndex((img) => img.id === targetImageId);
        if (fromIdx === -1 || toIdx === -1) return;

        const reordered = [...images];
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(toIdx, 0, moved);

        const withOrder = reordered.map((img, i) => ({ ...img, order: i + 1 }));
        setDraggedImageId(null);

        try {
            await fetch(`/api/products/${productId}/images/reorder`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    order: withOrder.map((img) => ({ id: img.id, order: img.order })),
                }),
            });
        } catch (err) {
            console.error("Reorder failed to persist:", err);
        }
    };

    return (
        <div
            draggable
            onDragStart={() => setDraggedImageId(image.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleReorderDrop(image.id)}
            className={cn(
                "group/thumb relative shrink-0 overflow-hidden rounded-md transition-all h-30 w-26",
                isActive ? "ring-2 ring-white/80" : "opacity-60 hover:opacity-100"
            )}
        >
            <button onClick={onSelect} aria-label={`Go to image ${index + 1}`} aria-current={isActive ? "true" : undefined} className="h-full w-full overflow-hidden">
                {!mediaLoaded && <img src="/placeholder.jpg" alt="placeholder" className="absolute inset-0 w-full h-full object-cover" />}
                <img
                    onLoad={() => setMediaLoaded(true)}
                    loading="lazy" decoding="async"
                    src={image.image} alt={image.image}
                    className={cn(
                        "w-full h-full object-cover transition-opacity duration-500",
                        mediaLoaded ? "opacity-100" : "opacity-0",
                    )}
                />
                <div className="absolute left-1.5 top-1.5 flex h-6 w-6 cursor-grab items-center justify-center rounded-md bg-background/80 text-muted-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    <GripVertical className="h-3.5 w-3.5" />
                </div>
            </button>
            {onRemoveImage && (
                <ConfirmDrawer
                    open={state.isOpen}
                    onOpenChange={state.setOpen}
                    trigger={
                        <button
                            className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white/80 md:opacity-0 transition-opacity hover:bg-black/90 hover:text-white focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50 group-hover/thumb:opacity-100"
                            aria-label={`Remove image ${index + 1}`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    }
                    onConfirm={() => {
                        onRemoveImage(image.id);
                        state.close();
                    }}
                    onClose={state.close}
                    title="Delete Image?"
                    description="This action cannot be reversed"
                />
            )}
        </div>
    );
}