import { GalleryCardActions } from "./gallery-card-actions";
import { Badge } from "@/components/ui/badge";
import { cn, currency } from "@/utils";
import type { Collection, ProductImage, ProductVariantLite } from "@/schemas";
import MediaDisplay from "@/components/media-display";
import { IsNew } from "@/components/products/product-badges";
import { useState } from "react";
import { motion } from "framer-motion";
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
            <motion.div
                className={cn(
                    "relative group overflow-hidden bg-background",
                    isProductInactive ? "ring-2 ring-red-500 opacity-50" : "",
                    isSelected && "ring-2 ring-indigo-900 ring-offset-2"
                )}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.3 }}
                viewport={{ once: true }}
            >
                <div
                    className="relative aspect-[3/4] overflow-hidden bg-secondary"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)" }}
                    onClick={() => handleSelectionChange(!isSelected)}
                >
                    <MediaDisplay url={image.image} alt={image.product?.name || ""} />
                    {image.product && (
                        <div className="absolute top-2 left-1/2 -translate-x-1/2">
                            <Badge variant="indigo" className="text-base font-bold">
                                {currency(image.product.variants?.[0]?.price || 0)}
                            </Badge>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        {!selectionMode && <GalleryCardActions image={image} />}
                    </div>
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {image.product?.collections?.slice(0, 2).map((item: Collection, idx: number) => (
                            <Badge key={idx} variant="warning">
                                {item.name}
                            </Badge>
                        ))}
                    </div>
                    <div className="absolute top-2 right-2 flex flex-wrap gap-1">
                        {image.product?.variants?.map((item: ProductVariantLite, idx: number) => (
                            <Badge key={idx} className={cn(item.size ? "" : "hidden")} variant="emerald">
                                UK: {item.size}
                            </Badge>
                        ))}
                    </div>
                    {image.product?.variants?.[0]?.age && (
                        <div className="absolute top-2 right-2 flex flex-wrap gap-1">
                            {image.product?.variants?.map((item: ProductVariantLite, idx: number) => (
                                <Badge key={idx} variant="emerald">
                                    {item.age}
                                </Badge>
                            ))}
                        </div>
                    )}
                    {image.product?.is_new && <IsNew className="right-0 bottom-0 top-auto left-auto" />}
                    <div className="absolute bottom-0 left-0" onClick={(e) => e.stopPropagation()}>
                        <GalleryCampaign image={image.image} />
                    </div>
                </div>
            </motion.div>
            <ImageLightbox image={lightboxOpen ? image.image : null} onClose={() => setLightboxOpen(false)} />
        </>
    );
}
