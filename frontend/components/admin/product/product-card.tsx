import { useState } from "react";
import { Edit2, Star, Package } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Category, Collection, Product } from "@/schemas";

interface ProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    isSelected?: boolean;
    onClick?: () => void;
}

export function ProductCard({ product, onEdit, isSelected, onClick }: ProductCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const primaryImage = product.images[0];

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
                                src={primaryImage.image}
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

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                            className="bg-white/90 text-black hover:bg-white"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(product);
                            }}
                        >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {product?.collections?.slice(0, 2).map((item: Collection, idx: number) => (
                            <Badge key={idx} className="text-xs bg-black/70 text-white border-0" variant="secondary">
                                {item.name}
                            </Badge>
                        ))}
                    </div>

                    {/* Favorite */}
                    {/* <div className="absolute top-2 right-2">
                        <Button
                            className="h-8 w-8 bg-black/20 hover:bg-black/40 text-white"
                            size="icon"
                            variant="ghost"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Heart className={cn("h-4 w-4", product?.favorites?.length && "fill-red-500 text-red-500")} />
                        </Button>
                    </div> */}

                    {/* Image Count */}
                    {product.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {product.images.length} photos
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-mono">{product.sku}</span>
                            {product.ratings && (
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs text-muted-foreground">{product.ratings}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {product.brand && (
                                <Badge className="text-xs" variant="outline">
                                    {product.brand.name}
                                </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                                {product?.variants?.length} variant{product?.variants?.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        {product?.variants?.length && <span className="text-sm font-semibold text-primary">${product?.variants?.[0].price}</span>}
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1">
                        {product?.categories?.slice(0, 3).map((category: Category, idx: number) => (
                            <Badge key={idx} className="text-xs" variant="secondary">
                                {category.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
