import { GalleryCardActions } from "./gallery-card-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, currency } from "@/utils";
import type { Collection, ProductImage, ProductVariantLite } from "@/schemas";
import MediaDisplay from "@/components/media-display";
import { IsNew } from "@/components/products/product-badges";

interface GalleryCardProps {
    image: ProductImage;
    onClick?: () => void;
    isSelected?: boolean;
    onSelectionChange?: (imageId: number, selected: boolean) => void;
    selectionMode?: boolean;
}

export function GalleryCard({ image, onClick, isSelected = false, onSelectionChange, selectionMode = false }: GalleryCardProps) {
    const handleSelectionChange = (checked: boolean) => {
        onSelectionChange?.(image.id, checked);
    };

    return (
        <Card
            className={cn(
                "group relative overflow-hidden border-0 bg-linear-to-br from-card to-muted/20 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer",
                image.product?.active ? "opacity-100" : "opacity-50 ring-2 ring-red-500",
                isSelected && "ring-2 ring-primary/40 ring-offset-2"
            )}
            onClick={selectionMode ? undefined : onClick}
        >
            <CardContent className="p-0 md:p-0">
                <div className="relative overflow-hidden aspect-gallery">
                    <MediaDisplay url={image.image} alt={image.product?.name || ""} />
                    <div
                        className={cn(
                            "absolute top-2 left-2 z-10 opacity-0 lg:opacity-100 transition-opacity duration-300",
                            selectionMode ? "opacity-100" : ""
                        )}
                    >
                        <Checkbox checked={isSelected} onCheckedChange={handleSelectionChange} />
                    </div>

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

                    {image.product?.is_new && <IsNew className="bottom-0 right-1 top-auto left-auto" />}

                    <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                        {image.product?.variants?.length == 0 ||
                            (image.product?.variants?.every((v) => v.inventory <= 0) && <Badge variant="destructive">Out of stock</Badge>)}
                    </div>

                    {image.product && (
                        <div className="absolute top-2 left-1/2 -translate-x-1/2">
                            <Badge variant="indigo" className="text-base font-bold">{currency(image.product.variants?.[0]?.price || 0)}</Badge>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
