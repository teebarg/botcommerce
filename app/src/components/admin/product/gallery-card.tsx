import { GalleryCardActions } from "./gallery-card-actions";
import type { GalleryImage } from "@/schemas";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { useMemo, useState } from "react";
import { getPriceInfo } from "@/lib/variant";
import { PriceLabel } from "@/components/store/price-label";

interface GalleryCardProps {
    image: GalleryImage;
    isSelected?: boolean;
    onSelectionChange?: (imageId: number, selected: boolean) => void;
    onClick?: (id: number) => void;
    selectionMode?: boolean;
}

type FitMode = "cover" | "contain";

export function GalleryCard({ image, isSelected = false, onSelectionChange, onClick, selectionMode = false }: GalleryCardProps) {
    if (!image) return null;

    const product = image.product;
    const variants = product?.variants || [];
    const priceInfo = useMemo(() => getPriceInfo({ variants }), [product]);

    const attributeLabels = useMemo(() => {
        const attributes = product?.variants?.flatMap(
            (variant) => Object.entries(variant.attributes ?? {})
        ) ?? [];

        const grouped = new Map<string, Set<string>>();

        for (const [key, value] of attributes) {
            if (value == null || value === "") continue;

            if (!grouped.has(key)) {
                grouped.set(key, new Set());
            }

            grouped.get(key)!.add(String(value));
        }

        return Array.from(grouped, ([key, values]) => ({
            name: key,
            values: Array.from(values),
        }));
    }, [product?.variants]);
    const attributes = attributeLabels.map(({ name, values }) => `${name}: ${values.join(", ")}`);

    const [mediaLoaded, setMediaLoaded] = useState<boolean>(false);
    const [fitMode, setFitMode] = useState<FitMode>("cover");
    const categories = product?.categories?.map((item) => item.name) || [];
    const combined = [...categories, ...attributes];

    const totalInventory = variants.reduce((acc, v) => acc + (v.inventory || 0), 0);
    const hasProduct = Boolean(product);
    const isInactive = hasProduct && !product?.active;
    const isOutOfStock = hasProduct && totalInventory <= 0;

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        if (naturalWidth && naturalHeight) {
            const isLandscape = naturalWidth > naturalHeight;
            setFitMode(isLandscape ? "contain" : "cover");
        }
        setMediaLoaded(true);
    };

    return (
        <div
            className={cn(
                "relative w-full aspect-gallery overflow-hidden bg-secondary transition-all duration-200 shadow-xs hover:shadow-md",
                selectionMode ? "cursor-pointer" : "cursor-default",
            )}
            onClick={() => (selectionMode ? onSelectionChange?.(image.id, !isSelected) : onClick?.(image.id))}
        >
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-muted">
                {!mediaLoaded && <img src="/placeholder.jpg" alt="placeholder" className="absolute inset-0 w-full h-full object-cover" />}
                <img
                    alt={product?.name || ""}
                    src={image?.image}
                    onLoad={handleImageLoad}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                        "w-full h-full transition-opacity duration-500",
                        fitMode === "cover" ? "object-cover" : "object-contain",
                        mediaLoaded ? "opacity-100" : "opacity-0",
                        isInactive || isOutOfStock ? "grayscale opacity-60" : ""
                    )}
                />
            </div>

            {/* Top status overlays */}
            <div className="absolute top-2 left-2 grid gap-1.5 z-10 pointer-events-none">
                {isOutOfStock && (
                    <Badge variant="destructive" type="sm">
                        Out of stock
                    </Badge>
                )}
                {isInactive && (
                    <Badge variant="ghost" type="sm">
                        Not in store
                    </Badge>
                )}
                {product?.is_new && (
                    <Badge variant="accent" className="w-fit uppercase tracking-wider" type="sm">
                        New
                    </Badge>
                )}
            </div>

            {selectionMode && (
                <div
                    className={cn(
                        "absolute top-2 right-2 w-5 h-5 rounded-full border flex items-center justify-center z-10 shadow-sm pointer-events-none",
                        isSelected ? "bg-primary border-primary" : "bg-white/90 border-neutral-300"
                    )}
                >
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
                        <div>
                            {variants && variants.length > 0 && (
                                <PriceLabel info={priceInfo} tone="light" size="lg" />
                            )}
                            {combined.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {combined.slice(0, 3).map((attr, i) => (
                                        <span key={i} className="text-[9px] font-medium text-white/90 bg-white/15 px-1.5 py-0.5 rounded-xs">
                                            {attr}
                                        </span>
                                    ))}
                                    {combined.length > 3 && <span className="text-[9px] font-medium text-white/70 px-1">+{combined.length - 3}</span>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
