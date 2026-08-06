import { useOverlayTriggerState } from "react-stately";
import { ConfirmDrawer } from "./generic/confirm-drawer";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";

interface Image {
    id: number;
    image: string;
    order?: number;
}

export function GalleryThumbnail({
    image,
    index,
    isActive,
    onSelect,
    onRemoveImage,
}: {
    image: Image;
    index: number;
    isActive: boolean;
    onSelect: () => void;
    onRemoveImage?: (id: number) => void;
}) {
    const state = useOverlayTriggerState({});

    return (
        <div
            className={cn(
                "group/thumb relative shrink-0 overflow-hidden rounded-md transition-all",
                isActive ? "ring-2 ring-white/80" : "opacity-60 hover:opacity-100"
            )}
        >
            <button onClick={onSelect} aria-label={`Go to image ${index + 1}`} aria-current={isActive ? "true" : undefined}>
                <img src={image.image} alt={image.image} className="h-26 w-20 object-cover" loading="lazy" />
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
                    title="Delete Image?"
                    description="This action cannot be reversed"
                />
            )}
        </div>
    );
}