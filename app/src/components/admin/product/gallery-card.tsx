import { GalleryCardActions } from "./gallery-card-actions";
import { Badge } from "@/components/ui/badge";
import { cn, currency } from "@/utils";
import type { Collection, ProductImage, ProductVariantLite } from "@/schemas";
import MediaDisplay from "@/components/media-display";
import { IsNew } from "@/components/products/product-badges";
import { useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";
import { GalleryCampaign } from "./gallery-campaign";

interface GalleryCardProps {
    image: ProductImage;
    isSelected?: boolean;
    onSelectionChange?: (imageId: number, selected: boolean) => void;
    selectionMode?: boolean;
}

export function GalleryCard({ image, isSelected = false, onSelectionChange, selectionMode = false }: GalleryCardProps) {
    const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

    const isProductInactive =
        !image.product?.active || image.product?.variants?.length == 0 || image.product?.variants?.every((v) => v.inventory <= 0);

    if (!image) return;

    const handleSelectionChange = (checked: boolean) => {
        if (!selectionMode) {
            setLightboxOpen(true);
            return;
        }
        onSelectionChange?.(image.id, checked);
    };

    return (
        <>
            <div
                className={cn(
                    "relative group overflow-hidden bg-background animate-in fade-in cursor-pointer transition-all duration-150",
                    isProductInactive ? "ring-2 ring-red-500 opacity-50" : "",
                    isSelected
                        ? "ring-2 ring-green-600 ring-offset-2 scale-[0.97]"
                        : "hover:ring-2 hover:ring-green-300 hover:ring-offset-1"
                )}
            >
                <div
                    className="relative aspect-[3/4] overflow-hidden bg-secondary"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)" }}
                    onClick={() => handleSelectionChange(!isSelected)}
                >
                    <MediaDisplay url={image.image} alt={image.product?.name || ""} />
                    {isSelected && (
                        <div className="absolute inset-0 bg-green-500/20 pointer-events-none transition-opacity duration-150" />
                    )}

                    {selectionMode && (
                        <div className={cn(
                            "absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-150 z-10",
                            isSelected
                                ? "bg-green-600 border-green-600"
                                : "bg-white/80 border-gray-300"
                        )}>
                            {isSelected && (
                                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                    )}
                    {image.product && (
                        <div className={cn("absolute top-2 left-1/2 -translate-x-1/2", selectionMode && "hidden")}>
                            <Badge className="text-base font-bold">
                                {currency(image.product.variants?.[0]?.price || 0)}
                            </Badge>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        {!selectionMode && <GalleryCardActions image={image} />}
                    </div>
                    <div className={cn("absolute top-2 left-2 flex flex-wrap gap-1", selectionMode && "hidden")}>
                        {image.product?.collections?.slice(0, 2).map((item: Collection, idx: number) => (
                            <Badge key={idx} variant="warning">
                                {item.name}
                            </Badge>
                        ))}
                    </div>
                    <div className={cn("absolute top-2 right-2 flex flex-wrap gap-1", selectionMode && "hidden")}>
                        {image.product?.variants?.map((item: ProductVariantLite, idx: number) => (
                            <Badge key={idx} className={cn(item.size ? "" : "hidden")} variant="success-subtle">
                                UK: {item.size}
                            </Badge>
                        ))}
                    </div>
                    {image.product?.variants?.[0]?.age && (
                        <div className="absolute top-2 right-2 flex flex-wrap gap-1">
                            {image.product?.variants?.map((item: ProductVariantLite, idx: number) => (
                                <Badge key={idx} variant="success">
                                    {item.age}
                                </Badge>
                            ))}
                        </div>
                    )}
                    {image.product?.is_new && <IsNew className={cn("right-0 bottom-0 top-auto left-auto", selectionMode && "hidden")} />}
                    <div className={cn("absolute bottom-0 left-0", selectionMode && "hidden")} onClick={(e) => e.stopPropagation()}>
                        <GalleryCampaign image={image.image} />
                    </div>
                </div>
            </div>
            <ImageLightbox image={lightboxOpen ? image.image : null} onClose={() => setLightboxOpen(false)} />
        </>
    );
}
