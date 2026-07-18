import { GalleryCardActions } from "./gallery-card-actions";
import { currency } from "@/utils";
import type { ProductImage } from "@/schemas";
import ImageLightbox from "@/components/image-lightbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";

interface GalleryCardProps {
    image: ProductImage;
    isSelected?: boolean;
    onSelectionChange?: (imageId: number, selected: boolean) => void;
    selectionMode?: boolean;
}

export function GalleryCard({ image, isSelected = false, onSelectionChange, selectionMode = false }: GalleryCardProps) {
    if (!image) return null;

    const product = image.product;
    const variants = product?.variants || [];
    const item = product?.variants?.[0];

    const attributes = [
        item?.size && `Size: ${item.size}`,
        item?.color && `Color: ${item.color}`,
        item?.width && `W: ${item.width}`,
        item?.length && `L: ${item.length}`,
        item?.age && `Age: ${item.age}`,
    ].filter(Boolean);

    const categories = product?.categories?.map((item) => item.name) || [];
    const combined = [...categories, ...attributes];

    const totalInventory = variants.reduce((acc, v) => acc + (v.inventory || 0), 0);
    const hasProduct = Boolean(product)
    const isInactive = hasProduct && !product?.active;
    const isOutOfStock = hasProduct && totalInventory <= 0;

    return (
        <div
            className={cn(
                "relative w-full aspect-gallery overflow-hidden bg-secondary border border-border rounded-1xl transition-all duration-200 shadow-xs hover:shadow-md",
                selectionMode ? "cursor-pointer" : "cursor-default",
                isSelected ? "ring-2 ring-primary ring-offset-1" : ""
            )}
            onClick={() => selectionMode && onSelectionChange?.(image.id, !isSelected)}
        >
            <ImageLightbox
                url={image?.image}
                alt={product?.name || ""}
                className="absolute inset-0 w-full h-full"
                imgClassName={cn(isInactive || isOutOfStock ? "grayscale opacity-60" : "")}
                disabled={selectionMode}
            />

            {/* Top status overlays */}
            <div className="absolute top-2 left-2 grid gap-1.5 z-10 pointer-events-none">
                {isOutOfStock && (
                    <Badge variant="destructive" type="sm">Out of stock</Badge>
                )}
                {isInactive && (
                    <Badge variant="ghost" type="sm">Not in store</Badge>
                )}
                {product?.is_new && (
                    <Badge variant="accent" className="w-fit uppercase tracking-wider" type="sm">New</Badge>
                )}
            </div>

            {selectionMode && (
                <div className={cn(
                    "absolute top-2 right-2 w-5 h-5 rounded-full border flex items-center justify-center z-10 shadow-sm pointer-events-none",
                    isSelected ? "bg-primary border-primary" : "bg-white/90 border-neutral-300"
                )}>
                    {isSelected && (
                        <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
            )}

            {!selectionMode && hasProduct && (
                <div className="absolute inset-0 flex items-start justify-end p-2 z-10 pointer-events-none">
                    <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                        <GalleryCardActions image={image} />
                    </div>
                </div>
            )}

            {(variants.length > 0 || combined.length > 0) && (
                <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none">
                    <div className="bg-gradient-to-t from-black/85 via-black/50 to-transparent pt-8 pb-2 px-2.5">
                        <div className="flex items-end justify-between gap-2">
                            {variants.length > 0 && (
                                <div className="flex gap-1">
                                    <span className="text-sm font-semibold text-white drop-shadow-sm">
                                        {currency(variants[0]?.price || 0)}
                                    </span>
                                    {variants[0]?.old_price > 0 && (
                                        <span className="text-xs text-white line-through">
                                            {currency(variants[0]?.old_price || 0)}
                                        </span>
                                    )}
                                </div>
                            )}
                            {combined.length > 0 && (
                                <div className="flex flex-wrap justify-end gap-1 max-w-[65%]">
                                    {combined.slice(0, 3).map((attr, i) => (
                                        <span
                                            key={i}
                                            className="text-[9px] font-medium text-white/90 bg-white/15 px-1.5 py-0.5 rounded-xs"
                                        >
                                            {attr}
                                        </span>
                                    ))}
                                    {combined.length > 3 && (
                                        <span className="text-[9px] font-medium text-white/70 px-1">
                                            +{combined.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
