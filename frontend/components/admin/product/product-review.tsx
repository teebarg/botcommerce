import type { FormProduct } from "./product-creator";

import { Package, Image as ImageIcon, Palette } from "lucide-react";
import Image from "next/image";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { currency } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface ProductReviewProps {
    product: FormProduct;
}

export function ProductReview({ product }: ProductReviewProps) {
    const { images, variants } = product;

    const calculateTotalVariants = () => {
        return variants.reduce((total, variant) => total + variant.inventory, 0);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-2 text-card-foreground">Review Your Product</h2>
                <p className="text-muted-foreground">Double-check all information before creating your product. You can always edit it later.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6 bg-gradient-card shadow-medium">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold text-card-foreground">Product Preview</h3>
                        </div>

                        {images.length > 0 && (
                            <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
                                <Image
                                    fill
                                    alt="Main product image"
                                    className="w-full h-full object-cover"
                                    sizes="(max-width: 1024px) 50vw, 33vw"
                                    src={images[0].url}
                                />
                            </div>
                        )}
                    </div>
                </Card>

                <div className="space-y-4">
                    <Card className="p-4 bg-gradient-card shadow-soft">
                        <div className="flex items-center gap-2 mb-3">
                            <ImageIcon className="w-4 h-4 text-primary" />
                            <h4 className="font-medium text-card-foreground">Images</h4>
                            <Badge variant="outline">{images.length}</Badge>
                        </div>
                        {images.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2">
                                {images.slice(0, 4).map((image, index) => (
                                    <div key={image.id} className="aspect-square rounded overflow-hidden bg-muted relative">
                                        <Image
                                            fill
                                            alt={`Product image ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            sizes="25vw"
                                            src={image.url}
                                        />
                                        {index === 0 && <div className="absolute top-1 left-1 bg-primary text-white text-xs px-1 rounded">Main</div>}
                                    </div>
                                ))}
                                {images.length > 4 && (
                                    <div className="aspect-square rounded bg-muted flex items-center justify-center">
                                        <span className="text-xs text-muted-foreground">+{images.length - 4}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No images uploaded</p>
                        )}
                    </Card>
                    <Card className="p-4 bg-accent/30 border border-primary/20">
                        <h4 className="font-medium text-card-foreground mb-4">Product Details</h4>
                        <div>
                            {product.name && (
                                <div className="mb-4">
                                    <Label className="text-xs font-medium text-muted-foreground">Name</Label>
                                    <p className="text-sm text-primary">{product.name}</p>
                                </div>
                            )}
                            <Label className="text-xs font-medium text-muted-foreground">Categories</Label>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {product.categories.map((category, idx: number) => (
                                    <Badge key={idx} className="text-xs" variant="primary">
                                        {category.label}
                                    </Badge>
                                ))}
                            </div>
                            <Label className="text-xs font-medium text-muted-foreground">Collections</Label>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {product.collections.map((collection, idx: number) => (
                                    <Badge key={idx} className="text-xs" variant="warning">
                                        {collection.label}
                                    </Badge>
                                ))}
                            </div>
                            <Label className="text-xs font-medium text-muted-foreground">Description</Label>
                            {product.description && <p className="text-sm text-primary line-clamp-2">{product.description}</p>}
                        </div>
                    </Card>

                    <Card className="p-4 bg-gradient-card shadow-soft">
                        <div className="flex items-center gap-2 mb-3">
                            <Package className="w-4 h-4 text-primary" />
                            <h4 className="font-medium text-card-foreground">Variants</h4>
                            <Badge variant="outline">{variants.length}</Badge>
                        </div>
                        {variants.length > 0 ? (
                            <div className="space-y-2">
                                <div className="text-xs text-muted-foreground mb-2">Total stock: {calculateTotalVariants()} units</div>
                                {variants.slice(0, 3).map((variant) => {
                                    return (
                                        <div key={variant.id} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <Palette className="w-3 h-3 text-muted-foreground" />
                                                <Badge className="text-xs" variant="secondary">
                                                    {variant.size}
                                                </Badge>
                                                <Badge className="text-xs" variant="secondary">
                                                    {variant.color}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{currency(variant.price)}</span>
                                                {variant.old_price !== 0 && (
                                                    <span className={variant.old_price > variant.price ? "text-success" : "text-warning"}>
                                                        {variant.old_price > variant.price ? "+" : ""}
                                                        {currency(variant.old_price)}
                                                    </span>
                                                )}
                                                <span>Stock: {variant.inventory}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {variants.length > 3 && <p className="text-xs text-muted-foreground">+{variants.length - 3} more variants</p>}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No variants created</p>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
