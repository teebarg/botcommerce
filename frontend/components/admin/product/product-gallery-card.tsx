import { useState } from "react";
import { Edit2, Package } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { ProductSheetForm } from "./product-form-sheet";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/schemas";
import Overlay from "@/components/overlay";

interface GalleryCardProps {
    image: ProductImage;
    isSelected?: boolean;
    onClick?: () => void;
}

export function GalleryCard({ image, isSelected, onClick }: GalleryCardProps) {
    const editState = useOverlayTriggerState({});
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);
    const primaryImage = image;

    return (
        <Card
            className={cn(
                "group relative overflow-hidden border-0 bg-gradient-to-br from-card to-muted/20 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer",
                isSelected && "ring-2 ring-primary shadow-lg scale-[1.02]"
            )}
            onClick={onClick}
        >
            <CardContent className="p-0">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden">
                    {primaryImage ? (
                        <>
                            <img
                                alt="product image"
                                className={cn(
                                    "w-full h-full object-cover transition-all duration-500 group-hover:scale-110",
                                    imageLoaded ? "opacity-100" : "opacity-0"
                                )}
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

                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Overlay
                            open={editState.isOpen}
                            sheetClassName="min-w-[40vw]"
                            title="Create Metadata"
                            trigger={
                                <Button className="bg-white/90 text-black hover:bg-white" size="sm" onClick={editState.open}>
                                    <Edit2 className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                            }
                            onOpenChange={editState.setOpen}
                        >
                            <ProductSheetForm imageId={image.id} onClose={editState.close} />
                        </Overlay>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
