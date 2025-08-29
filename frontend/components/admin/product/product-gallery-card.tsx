import { useState } from "react";
import { Package } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import Image from "next/image";

import { GalleryCardActions } from "./gallery-card-actions";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Collection, Product, ProductImage } from "@/schemas";
import Overlay from "@/components/overlay";
import ProductImagesManager from "@/components/admin/product/product-images";
import { useProductVariant } from "@/lib/hooks/useProductVariant";

type GalleryImage = ProductImage & {
    product: Product;
};

interface GalleryCardProps {
    image: GalleryImage;
    onClick?: () => void;
}

export function GalleryCard({ image, onClick }: GalleryCardProps) {
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);
    const { product } = image;
    const imgState = useOverlayTriggerState({});
    const { outOfStock } = useProductVariant(product);

    return (
        <Card
            className={cn(
                "group relative overflow-hidden border-0 bg-gradient-to-br from-card to-muted/20 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
            )}
            onClick={onClick}
        >
            <CardContent className="p-0 md:p-0">
                <div className="relative aspect-product overflow-hidden">
                    {image.image ? (
                        <>
                            <Image
                                fill
                                alt="product image"
                                className={cn(
                                    "w-full h-full object-cover transition-all duration-500 group-hover:scale-110",
                                    imageLoaded ? "opacity-100" : "opacity-0"
                                )}
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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

                    <div className="absolute inset-0 bg-black/20 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <GalleryCardActions image={image} />
                    </div>

                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {image.product?.collections?.slice(0, 2).map((item: Collection, idx: number) => (
                            <Badge key={idx} variant="warning">
                                {item.name}
                            </Badge>
                        ))}
                    </div>

                    <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                        {outOfStock && <Badge variant="destructive">Out of stock</Badge>}
                    </div>

                    {image.product?.images?.length > 0 && (
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
                    )}
                </div>

                {/* {product && (
                    <div className="p-4 space-y-3">
                        <div>
                            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{product?.name}</h3>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {product?.brand && (
                                    <Badge className="text-xs" variant="outline">
                                        {product?.brand?.name}
                                    </Badge>
                                )}
                                {product?.variants?.length && (
                                    <span className="text-xs text-muted-foreground">
                                        {product?.variants?.length} variant{product?.variants?.length !== 1 ? "s" : ""}
                                    </span>
                                )}
                            </div>

                            {product?.variants?.length && (
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-primary">{currency(product?.variants?.[0].price)}</span>
                                    {product?.variants?.[0].old_price > 0 && (
                                        <span className="text-sm font-semibold line-through text-primary">
                                            {currency(product?.variants?.[0].old_price)}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                            {product?.categories?.slice(0, 3).map((category: Category, idx: number) => (
                                <Badge key={idx} className="text-xs" variant="secondary">
                                    {category?.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )} */}
            </CardContent>
        </Card>
    );
}
