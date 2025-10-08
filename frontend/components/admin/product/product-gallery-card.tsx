import { useState } from "react";
import { Package } from "lucide-react";

import { GalleryCardActions } from "./gallery-card-actions";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Collection, GalleryImageItem, ProductVariant } from "@/schemas";

interface GalleryCardProps {
    image: GalleryImageItem;
    onClick?: () => void;
    isSelected?: boolean;
    onSelectionChange?: (imageId: number, selected: boolean) => void;
    selectionMode?: boolean;
}

export function GalleryCard({ image, onClick, isSelected = false, onSelectionChange, selectionMode = false }: GalleryCardProps) {
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);

    const handleSelectionChange = (checked: boolean) => {
        onSelectionChange?.(image.id, checked);
    };

    return (
        <Card
            className={cn(
                "group relative overflow-hidden border-0 bg-gradient-to-br from-card to-muted/20 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer",
                image.product?.active ? "opacity-100" : "opacity-50 ring-2 ring-red-500",
                isSelected && "ring-2 ring-primary/40 ring-offset-2"
            )}
            onClick={selectionMode ? undefined : onClick}
        >
            <CardContent className="p-0 md:p-0">
                <div className="relative aspect-product overflow-hidden">
                    {image.image ? (
                        <>
                            <img
                                alt="product image"
                                className={cn(
                                    "w-full h-full object-cover transition-all duration-500 group-hover:scale-110",
                                    imageLoaded ? "opacity-100" : "opacity-0"
                                )}
                                loading="lazy"
                                src={image.image}
                                onLoad={() => setImageLoaded(true)}
                            />
                            {!imageLoaded && (
                                <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 animate-pulse flex items-center justify-center">
                                    <Package className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                            <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                    )}

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
                        {image.product?.variants?.map((item: ProductVariant, idx: number) => (
                            <Badge key={idx} className={cn(item.size ? "" : "hidden")} variant="emerald">
                                UK: {item.size}
                            </Badge>
                        ))}
                    </div>

                    <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                        {image.product?.variants?.length == 0 ||
                            (image.product?.variants?.every((v) => v.inventory <= 0) && <Badge variant="destructive">Out of stock</Badge>)}
                    </div>

                    <div className="absolute bottom-2 right-2">
                        <p className="text-lg font-bold text-white">#{image.id}</p>
                    </div>

                    {/* {image.product?.images?.length > 0 && (
                        <Overlay
                            open={imgState.isOpen}
                            sheetClassName="min-w-[40vw]"
                            title="Create Metadata"
                            trigger={
                                <div
                                    className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium"
                                    onClick={imgState.open}
                                >
                                    {image.product?.images?.length} photos
                                </div>
                            }
                            onOpenChange={imgState.setOpen}
                        >
                            <div className="p-6 overflow-y-auto">
                                <ProductImagesManager
                                    initialImages={product?.images?.sort((a, b) => a.order - b.order) || []}
                                    productId={product.id}
                                />
                            </div>
                        </Overlay>
                    )} */}
                </div>
            </CardContent>
        </Card>
    );
}
