import { GalleryCardActions } from "./gallery-card-actions";
import { Badge } from "@/components/ui/badge";
import { cn, currency } from "@/utils";
import type { ProductImage } from "@/schemas";
import { IsNew } from "@/components/products/product-badges";
import { GalleryCampaign } from "./gallery-campaign";
import ImageLightbox from "@/components/image-lightbox";

interface GalleryCardProps {
    image: ProductImage;
    isSelected?: boolean;
    onSelectionChange?: (imageId: number, selected: boolean) => void;
    selectionMode?: boolean;
}

export function GalleryCard({ image, isSelected = false, onSelectionChange, selectionMode = false }: GalleryCardProps) {
    const isProductInactive =
        !image.product?.active || image.product?.variants?.length == 0 || image.product?.variants?.every((v) => v.inventory <= 0);

    if (!image) return null;

    const item = image?.product?.variants?.[0];

    const handleSelectionChange = (checked: boolean) => {
        if (!selectionMode) return;
        onSelectionChange?.(image.id, checked);
    };

    return (
        <div
            className={cn(
                "relative group overflow-hidden bg-background animate-in fade-in transition-all duration-150",
                selectionMode ? "cursor-pointer" : "cursor-default",
                isProductInactive ? "ring-2 ring-red-500 opacity-50" : "",
                isSelected
                    ? "ring-2 ring-green-600 ring-offset-2 scale-[0.97]"
                    : "hover:ring-2 hover:ring-green-300 hover:ring-offset-1"
            )}
            onClick={() => selectionMode && handleSelectionChange(!isSelected)}
        >
            <div
                className="relative aspect-[3/4] overflow-hidden bg-secondary"
                style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)" }}
            >
                <ImageLightbox
                    url={image?.image}
                    alt={image.product?.name || ""}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    disabled={selectionMode}
                />

                {isSelected && (
                    <div className="absolute inset-0 bg-green-500/20 pointer-events-none transition-opacity duration-150" />
                )}

                {item && (
                    <p className={cn("absolute top-2 right-2 text-xs pointer-events-none", selectionMode && "hidden")}>
                        {[
                            item.size && `Size: ${item.size}`,
                            item.color && `Color: ${item.color}`,
                            item.width && `Width: ${item.width}`,
                            item.length && `Length: ${item.length}`,
                            item.age && `Age: ${item.age}`,
                        ]
                            .filter(Boolean)
                            .join(" · ")}
                    </p>
                )}

                {selectionMode && (
                    <div className={cn(
                        "absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-150 z-10 pointer-events-none",
                        isSelected ? "bg-green-600 border-green-600" : "bg-white/80 border-gray-300"
                    )}>
                        {isSelected && (
                            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>
                )}

                {item && (
                    <div className={cn("absolute top-2 left-2 pointer-events-none", selectionMode && "hidden")}>
                        <Badge className="text-sm font-semibold">
                            {currency(item?.price || 0)}
                        </Badge>
                    </div>
                )}

                <div className={cn(
                    "absolute inset-0 bg-black/20 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none",
                    selectionMode && "hidden"
                )}>
                    <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                        <GalleryCardActions image={image} />
                    </div>
                </div>

                {image.product?.is_new && <IsNew className={cn("right-0 bottom-0 top-auto left-auto pointer-events-none", selectionMode && "hidden")} />}

                <div className={cn("absolute bottom-0 left-0 z-10", selectionMode && "hidden")} onClick={(e) => e.stopPropagation()}>
                    <GalleryCampaign image={image.image} />
                </div>
            </div>
        </div>
    );
}
